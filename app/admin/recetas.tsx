import { useEffect, useState } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Receta } from '@/types';
import { Colors } from '@/constants/Colors';

export default function AdminRecetas() {
  const [recetas, setRecetas] = useState<Receta[]>([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [recetaEditando, setRecetaEditando] = useState<Receta | null>(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    cargarRecetas();
  }, []);

  const cargarRecetas = async () => {
    setCargando(true);
    const { data, error } = await supabase
      .from('recetas')
      .select(
        'id, slug, nombre, activa, es_premium, video_url, etapas_compatibles, tiempo_preparacion'
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

  const abrirEditorVideo = (receta: Receta) => {
    setRecetaEditando(receta);
    setVideoUrl(receta.video_url ?? '');
  };

  const guardarVideo = async () => {
    if (!recetaEditando) return;
    setGuardando(true);
    const url = videoUrl.trim() || null;
    const { error } = await supabase
      .from('recetas')
      .update({ video_url: url })
      .eq('id', recetaEditando.id);

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      setRecetas((prev) =>
        prev.map((r) => (r.id === recetaEditando.id ? { ...r, video_url: url ?? undefined } : r))
      );
      setRecetaEditando(null);
    }
    setGuardando(false);
  };

  const recetasFiltradas = busqueda.trim()
    ? recetas.filter((r) => r.nombre.toLowerCase().includes(busqueda.toLowerCase()))
    : recetas;

  const renderItem = ({ item }: { item: Receta }) => (
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
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 }}>
        <View style={{ flex: 1 }}>
          <Text
            style={{ fontSize: 14, fontWeight: '700', color: '#1C1917', marginBottom: 4 }}
            numberOfLines={1}
          >
            {item.nombre}
          </Text>
          <View style={{ flexDirection: 'row', gap: 6 }}>
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
          </View>
        </View>
      </View>

      {/* Controles */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
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

        {/* Video URL */}
        <TouchableOpacity
          onPress={() => abrirEditorVideo(item)}
          style={{
            backgroundColor: item.video_url ? '#F0FDF4' : '#F5F3F1',
            borderRadius: 8,
            paddingHorizontal: 12,
            paddingVertical: 7,
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
            🎬 {item.video_url ? 'Editar URL' : 'Agregar URL'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FAF8F5' }}>
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
        <Text style={{ fontSize: 20, fontWeight: '800', color: '#1C1917', flex: 1 }}>Recetas</Text>
        <Text style={{ fontSize: 13, color: '#78716C' }}>{recetas.length} total</Text>
      </View>

      {/* Buscador */}
      <View style={{ paddingHorizontal: 20, marginBottom: 12 }}>
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

      {cargando ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={Colors.verde} />
        </View>
      ) : (
        <FlatList
          data={recetasFiltradas}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
          ListEmptyComponent={
            <Text style={{ textAlign: 'center', color: '#78716C', paddingTop: 40 }}>
              No se encontraron recetas.
            </Text>
          }
        />
      )}

      {/* Modal editar video URL */}
      <Modal
        visible={!!recetaEditando}
        transparent
        animationType="slide"
        onRequestClose={() => setRecetaEditando(null)}
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
              URL del video
            </Text>
            {recetaEditando && (
              <Text style={{ fontSize: 13, color: '#78716C', marginBottom: 16 }} numberOfLines={1}>
                {recetaEditando.nombre}
              </Text>
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
              placeholder="https://youtube.com/..."
              placeholderTextColor="#A8A29E"
              value={videoUrl}
              onChangeText={setVideoUrl}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
            />

            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity
                onPress={() => setRecetaEditando(null)}
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
                onPress={guardarVideo}
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
