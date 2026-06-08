import { useCallback, useMemo, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert,
  Switch,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '@/lib/supabase';
import { subirImagenReceta } from '@/lib/storage';
import { EtapaAlimentaria, Receta } from '@/types';
import { Colors } from '@/constants/Colors';
import { PAISES } from '@/constants/Paises';
import { ETAPAS } from '@/constants/Etapas';

const PAISES_SIN_TODOS = PAISES.filter((p) => p.id !== 'todos');

function detectarPais(tags: string[]) {
  // Universal: tiene latam + todos los países → mostrar todas las banderas
  if (tags.includes('latam') && PAISES_SIN_TODOS.every((p) => tags.includes(p.id))) return null;
  // País específico (con o sin latam)
  return PAISES_SIN_TODOS.find((p) => tags.includes(p.id)) ?? null;
}

function contarPorPais(recetas: Receta[]) {
  const counts: Record<string, number> = { latam: 0 };
  for (const p of PAISES_SIN_TODOS) counts[p.id] = 0;
  for (const r of recetas) {
    const pais = detectarPais(r.tags ?? []);
    if (pais) counts[pais.id]++;
    else counts['latam']++;
  }
  return counts;
}

export default function AdminRecetas() {
  const [recetas, setRecetas] = useState<Receta[]>([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  // Modal genérico para editar URL de video o imagen
  const [editando, setEditando] = useState<{
    receta: Receta;
    campo: 'video_url' | 'imagen_url';
    valor: string;
  } | null>(null);
  const [subiendoImagen, setSubiendoImagen] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEtapa, setFiltroEtapa] = useState<EtapaAlimentaria | null>(null);
  const [filtroPais, setFiltroPais] = useState<string | null>(null);
  const [filtroSinVideo, setFiltroSinVideo] = useState(false);
  const [filtroSinImagen, setFiltroSinImagen] = useState(false);
  const [filtroPremium, setFiltroPremium] = useState(false);

  const hayFiltros =
    !!filtroEtapa ||
    !!filtroPais ||
    filtroSinVideo ||
    filtroSinImagen ||
    filtroPremium ||
    !!busqueda.trim();

  const limpiarFiltros = () => {
    setFiltroEtapa(null);
    setFiltroPais(null);
    setFiltroSinVideo(false);
    setFiltroSinImagen(false);
    setFiltroPremium(false);
    setBusqueda('');
  };

  useFocusEffect(
    useCallback(() => {
      cargarRecetas();
    }, [])
  );

  const cargarRecetas = async () => {
    setCargando(true);
    const { data, error } = await supabase
      .from('recetas')
      .select(
        'id, slug, nombre, activa, es_premium, video_url, imagen_url, etapas_compatibles, tiempo_preparacion, tags'
      )
      .order('nombre', { ascending: true });

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      setRecetas((data ?? []) as Receta[]);
    }
    setCargando(false);
  };

  const toggleActiva = async (receta: Receta) => {
    const nuevoValor = !receta.activa;
    setRecetas((prev) => prev.map((r) => (r.id === receta.id ? { ...r, activa: nuevoValor } : r)));
    const { error } = await supabase
      .from('recetas')
      .update({ activa: nuevoValor })
      .eq('id', receta.id);
    if (error) {
      setRecetas((prev) =>
        prev.map((r) => (r.id === receta.id ? { ...r, activa: receta.activa } : r))
      );
      Alert.alert('Error', error.message);
    }
  };

  const togglePremium = async (receta: Receta) => {
    const nuevoValor = !receta.es_premium;
    setRecetas((prev) =>
      prev.map((r) => (r.id === receta.id ? { ...r, es_premium: nuevoValor } : r))
    );
    const { error } = await supabase
      .from('recetas')
      .update({ es_premium: nuevoValor })
      .eq('id', receta.id);
    if (error) {
      setRecetas((prev) =>
        prev.map((r) => (r.id === receta.id ? { ...r, es_premium: receta.es_premium } : r))
      );
      Alert.alert('Error', error.message);
    }
  };

  const abrirEditor = (receta: Receta, campo: 'video_url' | 'imagen_url') => {
    setEditando({
      receta,
      campo,
      valor: (campo === 'video_url' ? receta.video_url : receta.imagen_url) ?? '',
    });
  };

  const guardarUrl = async () => {
    if (!editando) return;
    setGuardando(true);
    const url = editando.valor.trim() || null;
    const { error } = await supabase
      .from('recetas')
      .update({ [editando.campo]: url })
      .eq('id', editando.receta.id);

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      setRecetas((prev) =>
        prev.map((r) =>
          r.id === editando.receta.id ? { ...r, [editando.campo]: url ?? undefined } : r
        )
      );
      setEditando(null);
    }
    setGuardando(false);
  };

  const seleccionarYSubirImagen = async () => {
    if (!editando || editando.campo !== 'imagen_url') return;

    // Pedir permisos de galería
    const permiso = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permiso.granted) {
      Alert.alert(
        'Permisos necesarios',
        'Tienes que dar permiso de acceso a la galería para subir imágenes.'
      );
      return;
    }

    // Abrir selector
    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.85,
      allowsEditing: false,
      exif: false,
    });

    if (resultado.canceled || !resultado.assets?.[0]) return;

    setSubiendoImagen(true);
    try {
      const url = await subirImagenReceta(resultado.assets[0].uri, editando.receta.id);
      setEditando((prev) => (prev ? { ...prev, valor: url } : prev));
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'No se pudo subir la imagen.';
      Alert.alert('Error al subir', msg);
    } finally {
      setSubiendoImagen(false);
    }
  };

  // Recetas que pasan TODOS los filtros menos el de país — sirve para los counters dinámicos por país
  const recetasParaConteoPais = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return recetas.filter((r) => {
      if (q && !r.nombre.toLowerCase().includes(q)) return false;
      if (filtroEtapa && !(r.etapas_compatibles ?? []).includes(filtroEtapa)) return false;
      if (filtroSinVideo && r.video_url) return false;
      if (filtroSinImagen && r.imagen_url) return false;
      if (filtroPremium && !r.es_premium) return false;
      return true;
    });
  }, [recetas, busqueda, filtroEtapa, filtroSinVideo, filtroSinImagen, filtroPremium]);

  const recetasFiltradas = useMemo(() => {
    return recetasParaConteoPais.filter((r) => {
      if (!filtroPais) return true;
      const tags = r.tags ?? [];
      const paisDetectado = detectarPais(tags);
      if (filtroPais === 'latam') return !paisDetectado && tags.includes('latam');
      return paisDetectado?.id === filtroPais;
    });
  }, [recetasParaConteoPais, filtroPais]);

  const renderItem = ({ item }: { item: Receta }) => {
    const tags = item.tags ?? [];
    const paisInfo = detectarPais(tags);
    const esUniversal = !paisInfo && tags.includes('latam');
    return (
    <View
      style={{
        backgroundColor: '#fff',
        borderRadius: 14,
        padding: 14,
        marginBottom: 10,
        opacity: item.activa ? 1 : 0.5,
      }}
    >
      {/* Fila nombre + badges */}
      <TouchableOpacity
        style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 }}
        onPress={() => router.push(`/receta/${item.id}`)}
        activeOpacity={0.7}
      >
        <View style={{ flex: 1 }}>
          <Text
            style={{ fontSize: 14, fontWeight: '700', color: '#1C1917', marginBottom: 4 }}
            numberOfLines={1}
          >
            {item.nombre}
          </Text>
          <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
            {/* Badge país */}
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F3F1', borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2, gap: 4 }}>
              {paisInfo?.imagen ? (
                <Image source={{ uri: paisInfo.imagen }} style={{ width: 16, height: 11, borderRadius: 2 }} resizeMode="cover" />
              ) : esUniversal ? (
                <View style={{ flexDirection: 'row', gap: 2 }}>
                  {PAISES_SIN_TODOS.map((p) =>
                    p.imagen ? (
                      <Image key={p.id} source={{ uri: p.imagen }} style={{ width: 12, height: 8, borderRadius: 1 }} resizeMode="cover" />
                    ) : null
                  )}
                </View>
              ) : (
                <Text style={{ fontSize: 11 }}>🌎</Text>
              )}
              <Text style={{ fontSize: 11, color: '#78716C', fontWeight: '600' }}>
                {paisInfo?.nombre ?? 'LATAM'}
              </Text>
            </View>
            {item.es_premium && (
              <View
                style={{
                  backgroundColor: '#FFF4EC',
                  borderRadius: 6,
                  paddingHorizontal: 7,
                  paddingVertical: 2,
                }}
              >
                <Text style={{ fontSize: 11, color: Colors.naranja, fontWeight: '600' }}>
                  👑 PREMIUM
                </Text>
              </View>
            )}
            {item.video_url ? (
              <View
                style={{
                  backgroundColor: '#F0FDF4',
                  borderRadius: 6,
                  paddingHorizontal: 7,
                  paddingVertical: 2,
                }}
              >
                <Text style={{ fontSize: 11, color: Colors.verde, fontWeight: '600' }}>
                  🎬 VIDEO
                </Text>
              </View>
            ) : (
              <View
                style={{
                  backgroundColor: '#FEF2F2',
                  borderRadius: 6,
                  paddingHorizontal: 7,
                  paddingVertical: 2,
                }}
              >
                <Text style={{ fontSize: 11, color: '#DC2626', fontWeight: '600' }}>SIN VIDEO</Text>
              </View>
            )}
            {item.imagen_url ? (
              <View
                style={{
                  backgroundColor: '#F0FDF4',
                  borderRadius: 6,
                  paddingHorizontal: 7,
                  paddingVertical: 2,
                }}
              >
                <Text style={{ fontSize: 11, color: Colors.verde, fontWeight: '600' }}>
                  🖼 IMAGEN
                </Text>
              </View>
            ) : (
              <View
                style={{
                  backgroundColor: '#FEF2F2',
                  borderRadius: 6,
                  paddingHorizontal: 7,
                  paddingVertical: 2,
                }}
              >
                <Text style={{ fontSize: 11, color: '#DC2626', fontWeight: '600' }}>
                  SIN IMAGEN
                </Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>

      {/* Controles — Fila 1: switches */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 }}>
        {/* Activa */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 }}>
          <Switch
            value={item.activa}
            onValueChange={() => toggleActiva(item)}
            trackColor={{ false: '#EEEBE6', true: '#86EFAC' }}
            thumbColor={item.activa ? Colors.verde : '#A8A29E'}
          />
          <Text style={{ fontSize: 12, color: '#78716C' }}>Activa</Text>
        </View>

        {/* Premium */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 }}>
          <Switch
            value={item.es_premium}
            onValueChange={() => togglePremium(item)}
            trackColor={{ false: '#EEEBE6', true: '#FDE68A' }}
            thumbColor={item.es_premium ? '#F59E0B' : '#A8A29E'}
          />
          <Text style={{ fontSize: 12, color: '#78716C' }}>Premium</Text>
        </View>
      </View>

      {/* Controles — Fila 2: multimedia URLs */}
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {/* Video URL */}
        <TouchableOpacity
          onPress={() => abrirEditor(item, 'video_url')}
          style={{
            flex: 1,
            backgroundColor: item.video_url ? '#F0FDF4' : '#F5F3F1',
            borderRadius: 8,
            paddingHorizontal: 12,
            paddingVertical: 8,
            alignItems: 'center',
          }}
          activeOpacity={0.7}
        >
          <Text
            style={{
              fontSize: 12,
              fontWeight: '600',
              color: item.video_url ? Colors.verde : '#78716C',
            }}
          >
            🎬 {item.video_url ? 'Editar video' : 'Agregar video'}
          </Text>
        </TouchableOpacity>

        {/* Imagen URL */}
        <TouchableOpacity
          onPress={() => abrirEditor(item, 'imagen_url')}
          style={{
            flex: 1,
            backgroundColor: item.imagen_url ? '#F0FDF4' : '#F5F3F1',
            borderRadius: 8,
            paddingHorizontal: 12,
            paddingVertical: 8,
            alignItems: 'center',
          }}
          activeOpacity={0.7}
        >
          <Text
            style={{
              fontSize: 12,
              fontWeight: '600',
              color: item.imagen_url ? Colors.verde : '#78716C',
            }}
          >
            🖼 {item.imagen_url ? 'Editar imagen' : 'Agregar imagen'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Acciones admin */}
      <View
        style={{
          flexDirection: 'row',
          gap: 8,
          marginTop: 10,
          paddingTop: 10,
          borderTopWidth: 1,
          borderTopColor: '#F5F3F1',
        }}
      >
        <TouchableOpacity
          onPress={() => router.push(`/admin/receta-form?id=${item.id}`)}
          style={{
            flex: 1,
            backgroundColor: '#EFF6FF',
            borderRadius: 8,
            paddingVertical: 8,
            alignItems: 'center',
          }}
          activeOpacity={0.7}
          accessibilityLabel="Editar receta"
        >
          <Text style={{ fontSize: 12, color: '#1D4ED8', fontWeight: '700' }}>✏️ Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.push(`/admin/receta-form?duplicarId=${item.id}`)}
          style={{
            flex: 1,
            backgroundColor: '#F5F3F1',
            borderRadius: 8,
            paddingVertical: 8,
            alignItems: 'center',
          }}
          activeOpacity={0.7}
          accessibilityLabel="Duplicar receta"
        >
          <Text style={{ fontSize: 12, color: '#78716C', fontWeight: '700' }}>📋 Duplicar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
  };

  const countsPais = contarPorPais(recetasParaConteoPais);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FAF8F5' }}>
      {/* ─── Bloque fijo: header + buscador + pills ─── */}
      <View>
        {/* Header */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 20,
            paddingTop: 16,
            marginBottom: 12,
          }}
        >
          <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
            <Text style={{ fontSize: 22, color: '#78716C' }}>‹</Text>
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 20, fontWeight: '800', color: '#1C1917' }}>Recetas</Text>
            {!cargando && (
              <Text style={{ fontSize: 12, color: '#78716C', marginTop: 2 }}>
                {hayFiltros
                  ? `${recetasFiltradas.length} de ${recetas.length} recetas`
                  : `${recetas.length} recetas`}
              </Text>
            )}
          </View>
          {hayFiltros && (
            <TouchableOpacity
              onPress={limpiarFiltros}
              style={{
                backgroundColor: '#FEF2F2',
                borderRadius: 8,
                paddingHorizontal: 10,
                paddingVertical: 6,
                marginRight: 8,
              }}
              activeOpacity={0.7}
            >
              <Text style={{ fontSize: 12, color: '#DC2626', fontWeight: '700' }}>Limpiar</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={() => router.push('/admin/receta-form')}
            style={{
              backgroundColor: Colors.verde,
              borderRadius: 8,
              paddingHorizontal: 12,
              paddingVertical: 7,
            }}
            activeOpacity={0.8}
            accessibilityLabel="Nueva receta"
          >
            <Text style={{ fontSize: 12, color: '#fff', fontWeight: '700' }}>+ Nueva</Text>
          </TouchableOpacity>
        </View>

        {/* Buscador */}
        <View style={{ paddingHorizontal: 20, marginBottom: 10 }}>
          <TextInput
            style={{
              backgroundColor: '#fff',
              borderRadius: 10,
              paddingHorizontal: 14,
              paddingVertical: 10,
              fontSize: 14,
              borderWidth: 1,
              borderColor: '#EEEBE6',
              color: '#1C1917',
            }}
            placeholder="Buscar receta..."
            placeholderTextColor="#A8A29E"
            value={busqueda}
            onChangeText={setBusqueda}
          />
        </View>

        {/* Filtros por país (clickeables) */}
        {!cargando && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginBottom: 8, height: 36 }}
            contentContainerStyle={{ paddingHorizontal: 20, gap: 8, alignItems: 'center' }}
          >
            {PAISES_SIN_TODOS.filter((p) => countsPais[p.id] > 0).map((p) => {
              const activo = filtroPais === p.id;
              return (
                <TouchableOpacity
                  key={p.id}
                  onPress={() => setFiltroPais(activo ? null : p.id)}
                  activeOpacity={0.7}
                  style={{
                    backgroundColor: activo ? '#1C1917' : '#fff',
                    borderRadius: 20,
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 6,
                    borderWidth: 1,
                    borderColor: activo ? '#1C1917' : '#EEEBE6',
                  }}
                >
                  {p.imagen ? (
                    <Image
                      source={{ uri: p.imagen }}
                      style={{ width: 18, height: 13, borderRadius: 2 }}
                      resizeMode="cover"
                    />
                  ) : null}
                  <Text
                    style={{
                      fontSize: 11,
                      color: activo ? '#fff' : '#1C1917',
                      fontWeight: '600',
                    }}
                  >
                    {p.nombre}
                  </Text>
                  <View
                    style={{
                      backgroundColor: activo ? '#3F3F3F' : '#F5F3F1',
                      borderRadius: 10,
                      paddingHorizontal: 6,
                      paddingVertical: 1,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 11,
                        color: activo ? '#fff' : '#78716C',
                        fontWeight: '700',
                      }}
                    >
                      {countsPais[p.id]}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
            {countsPais['latam'] > 0 ? (
              <TouchableOpacity
                key="latam"
                onPress={() => setFiltroPais(filtroPais === 'latam' ? null : 'latam')}
                activeOpacity={0.7}
                style={{
                  backgroundColor: filtroPais === 'latam' ? '#1C1917' : '#fff',
                  borderRadius: 20,
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                  borderWidth: 1,
                  borderColor: filtroPais === 'latam' ? '#1C1917' : '#EEEBE6',
                }}
              >
                <Text style={{ fontSize: 13 }}>🌎</Text>
                <Text
                  style={{
                    fontSize: 11,
                    color: filtroPais === 'latam' ? '#fff' : '#1C1917',
                    fontWeight: '600',
                  }}
                >
                  LATAM
                </Text>
                <View
                  style={{
                    backgroundColor: filtroPais === 'latam' ? '#3F3F3F' : '#F5F3F1',
                    borderRadius: 10,
                    paddingHorizontal: 6,
                    paddingVertical: 1,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 11,
                      color: filtroPais === 'latam' ? '#fff' : '#78716C',
                      fontWeight: '700',
                    }}
                  >
                    {countsPais['latam']}
                  </Text>
                </View>
              </TouchableOpacity>
            ) : null}
          </ScrollView>
        )}

        {/* Filtros por etapa + atributos */}
        {!cargando && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginBottom: 12, height: 36 }}
            contentContainerStyle={{ paddingHorizontal: 20, gap: 8, alignItems: 'center' }}
          >
            {ETAPAS.map((e) => {
              const activo = filtroEtapa === e.id;
              return (
                <TouchableOpacity
                  key={e.id}
                  onPress={() => setFiltroEtapa(activo ? null : e.id)}
                  activeOpacity={0.7}
                  style={{
                    backgroundColor: activo ? '#1C1917' : '#fff',
                    borderRadius: 20,
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 6,
                    borderWidth: 1,
                    borderColor: activo ? '#1C1917' : '#EEEBE6',
                  }}
                >
                  <Text style={{ fontSize: 13 }}>{e.emoji}</Text>
                  <Text
                    style={{
                      fontSize: 11,
                      color: activo ? '#fff' : '#1C1917',
                      fontWeight: '600',
                    }}
                  >
                    {e.nombre}
                  </Text>
                </TouchableOpacity>
              );
            })}
            <View style={{ width: 1, height: 18, backgroundColor: '#EEEBE6', marginHorizontal: 2 }} />
            <TouchableOpacity
              onPress={() => setFiltroSinVideo(!filtroSinVideo)}
              activeOpacity={0.7}
              style={{
                backgroundColor: filtroSinVideo ? '#DC2626' : '#fff',
                borderRadius: 20,
                paddingHorizontal: 12,
                paddingVertical: 6,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                borderWidth: 1,
                borderColor: filtroSinVideo ? '#DC2626' : '#EEEBE6',
              }}
            >
              <Text style={{ fontSize: 13 }}>📹</Text>
              <Text
                style={{
                  fontSize: 11,
                  color: filtroSinVideo ? '#fff' : '#1C1917',
                  fontWeight: '600',
                }}
              >
                Sin video
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setFiltroSinImagen(!filtroSinImagen)}
              activeOpacity={0.7}
              style={{
                backgroundColor: filtroSinImagen ? '#DC2626' : '#fff',
                borderRadius: 20,
                paddingHorizontal: 12,
                paddingVertical: 6,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                borderWidth: 1,
                borderColor: filtroSinImagen ? '#DC2626' : '#EEEBE6',
              }}
            >
              <Text style={{ fontSize: 13 }}>🖼</Text>
              <Text
                style={{
                  fontSize: 11,
                  color: filtroSinImagen ? '#fff' : '#1C1917',
                  fontWeight: '600',
                }}
              >
                Sin imagen
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setFiltroPremium(!filtroPremium)}
              activeOpacity={0.7}
              style={{
                backgroundColor: filtroPremium ? Colors.naranja : '#fff',
                borderRadius: 20,
                paddingHorizontal: 12,
                paddingVertical: 6,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                borderWidth: 1,
                borderColor: filtroPremium ? Colors.naranja : '#EEEBE6',
              }}
            >
              <Text style={{ fontSize: 13 }}>👑</Text>
              <Text
                style={{
                  fontSize: 11,
                  color: filtroPremium ? '#fff' : '#1C1917',
                  fontWeight: '600',
                }}
              >
                Premium
              </Text>
            </TouchableOpacity>
          </ScrollView>
        )}
      </View>

      {/* ─── Contenido: toma el espacio restante ─── */}
      {cargando ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={Colors.verde} />
        </View>
      ) : (
        <FlatList
          data={recetasFiltradas}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
          ListEmptyComponent={
            <Text style={{ textAlign: 'center', color: '#78716C', paddingTop: 40 }}>
              No se encontraron recetas.
            </Text>
          }
        />
      )}

      {/* Modal editar URL (video o imagen) */}
      <Modal
        visible={!!editando}
        transparent
        animationType="slide"
        onRequestClose={() => setEditando(null)}
      >
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' }}>
          <View
            style={{
              backgroundColor: '#FAF8F5',
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              padding: 24,
            }}
          >
            <Text style={{ fontSize: 17, fontWeight: '800', color: '#1C1917', marginBottom: 4 }}>
              {editando?.campo === 'imagen_url' ? 'Imagen de la receta' : 'URL del video'}
            </Text>
            {editando && (
              <Text style={{ fontSize: 13, color: '#78716C', marginBottom: 16 }} numberOfLines={1}>
                {editando.receta.nombre}
              </Text>
            )}

            {/* Botón subir desde galería — solo para imagen */}
            {editando?.campo === 'imagen_url' && (
              <>
                <TouchableOpacity
                  onPress={seleccionarYSubirImagen}
                  disabled={subiendoImagen}
                  style={{
                    backgroundColor: Colors.verde,
                    borderRadius: 12,
                    paddingVertical: 14,
                    alignItems: 'center',
                    flexDirection: 'row',
                    justifyContent: 'center',
                    gap: 8,
                    marginBottom: 12,
                    opacity: subiendoImagen ? 0.6 : 1,
                  }}
                  activeOpacity={0.85}
                >
                  {subiendoImagen ? (
                    <>
                      <ActivityIndicator color="#fff" size="small" />
                      <Text style={{ fontSize: 14, fontWeight: '700', color: '#fff' }}>
                        Subiendo...
                      </Text>
                    </>
                  ) : (
                    <Text style={{ fontSize: 14, fontWeight: '700', color: '#fff' }}>
                      📸 Subir desde galería
                    </Text>
                  )}
                </TouchableOpacity>
                <Text
                  style={{
                    fontSize: 11,
                    color: '#A8A29E',
                    textAlign: 'center',
                    marginBottom: 10,
                  }}
                >
                  o pegá una URL pública abajo
                </Text>
              </>
            )}

            <TextInput
              style={{
                backgroundColor: '#fff',
                borderRadius: 12,
                paddingHorizontal: 14,
                paddingVertical: 12,
                fontSize: 14,
                borderWidth: 1.5,
                borderColor: '#EEEBE6',
                color: '#1C1917',
                marginBottom: 16,
              }}
              placeholder={
                editando?.campo === 'imagen_url'
                  ? 'https://... (jpg, png, webp)'
                  : 'https://youtube.com/...'
              }
              placeholderTextColor="#A8A29E"
              value={editando?.valor ?? ''}
              onChangeText={(v) => setEditando((prev) => (prev ? { ...prev, valor: v } : prev))}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
              autoFocus={editando?.campo !== 'imagen_url'}
              editable={!subiendoImagen}
            />

            {/* Preview de imagen */}
            {editando?.campo === 'imagen_url' && editando.valor.trim() ? (
              <Image
                source={{ uri: editando.valor.trim() }}
                style={{
                  width: '100%',
                  height: 160,
                  borderRadius: 10,
                  marginBottom: 16,
                  backgroundColor: '#EEEBE6',
                }}
                resizeMode="cover"
              />
            ) : null}

            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity
                onPress={() => setEditando(null)}
                style={{
                  flex: 1,
                  backgroundColor: '#EEEBE6',
                  borderRadius: 12,
                  paddingVertical: 14,
                  alignItems: 'center',
                }}
                activeOpacity={0.7}
              >
                <Text style={{ fontSize: 15, fontWeight: '600', color: '#78716C' }}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={guardarUrl}
                disabled={guardando}
                style={{
                  flex: 1,
                  backgroundColor: Colors.verde,
                  borderRadius: 12,
                  paddingVertical: 14,
                  alignItems: 'center',
                }}
                activeOpacity={0.8}
              >
                {guardando ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={{ fontSize: 15, fontWeight: '700', color: '#fff' }}>Guardar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
