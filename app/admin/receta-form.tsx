import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Switch,
  Image,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Receta, Ingrediente, PasoReceta, EtapaAlimentaria, MomentoDia } from '@/types';
import { Colors } from '@/constants/Colors';
import { ETAPAS } from '@/constants/Etapas';
import { ALERGENOS } from '@/constants/Alergias';
import { MOMENTOS_DIA, MOMENTO_LABEL, MOMENTO_EMOJI } from '@/constants/Semana';
import { PAISES } from '@/constants/Paises';

// ─── Helpers ─────────────────────────────────────────────────────

const PAISES_SIN_TODOS = PAISES.filter((p) => p.id !== 'todos');
const PAIS_IDS = PAISES_SIN_TODOS.map((p) => p.id);

type ModoPais = 'universal' | (typeof PAISES_SIN_TODOS)[number]['id'];

function generarSlug(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function detectarModoPais(tags: string[]): ModoPais {
  const tieneTodos = PAIS_IDS.every((id) => tags.includes(id));
  if (tieneTodos) return 'universal';
  const pais = PAISES_SIN_TODOS.find((p) => tags.includes(p.id));
  return (pais?.id ?? 'universal') as ModoPais;
}

function extraerTagsExtras(tags: string[]): string {
  const reservados = new Set<string>(['latam', ...PAIS_IDS]);
  return tags.filter((t) => !reservados.has(t)).join(', ');
}

function construirTags(modoPais: ModoPais, extras: string): string[] {
  const extrasArr = extras
    .split(',')
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);
  if (modoPais === 'universal') {
    return ['latam', ...PAIS_IDS, ...extrasArr];
  }
  return [modoPais, ...extrasArr];
}

const INPUT_BASE = {
  backgroundColor: '#fff',
  borderRadius: 10,
  paddingHorizontal: 12,
  paddingVertical: 10,
  fontSize: 14,
  borderWidth: 1,
  borderColor: '#EEEBE6',
  color: '#1C1917',
} as const;

// ─── Componente principal ────────────────────────────────────────

export default function RecetaForm() {
  const params = useLocalSearchParams<{ id?: string; duplicarId?: string }>();
  const id = typeof params.id === 'string' ? params.id : undefined;
  const duplicarId = typeof params.duplicarId === 'string' ? params.duplicarId : undefined;
  const modoEditar = !!id;
  const idOriginal = id ?? duplicarId;

  const [cargando, setCargando] = useState(!!idOriginal);
  const [guardando, setGuardando] = useState(false);

  const [nombre, setNombre] = useState('');
  const [slug, setSlug] = useState('');
  const [slugManual, setSlugManual] = useState(false);
  const [descripcion, setDescripcion] = useState('');
  const [imagenUrl, setImagenUrl] = useState('');
  const [imagenError, setImagenError] = useState(false);
  const [modoPais, setModoPais] = useState<ModoPais>('universal');
  const [tagsExtras, setTagsExtras] = useState('');
  const [tiempoPrep, setTiempoPrep] = useState('15');
  const [porciones, setPorciones] = useState('2');
  const [etapas, setEtapas] = useState<EtapaAlimentaria[]>([]);
  const [momentos, setMomentos] = useState<MomentoDia[]>([]);
  const [alergenos, setAlergenos] = useState<string[]>([]);
  const [calorias, setCalorias] = useState('');
  const [proteinas, setProteinas] = useState('');
  const [carbohidratos, setCarbohidratos] = useState('');
  const [grasas, setGrasas] = useState('');
  const [hierro, setHierro] = useState('');
  const [ingredientes, setIngredientes] = useState<Ingrediente[]>([
    { id: 1, nombre: '', cantidad: 0, unidad: 'g', calorias_por_100g: 0 },
  ]);
  const [pasos, setPasos] = useState<PasoReceta[]>([
    { orden: 1, descripcion: '', duracion_min: 0 },
  ]);
  const [videoUrl, setVideoUrl] = useState('');
  const [esPremium, setEsPremium] = useState(false);
  const [activa, setActiva] = useState(true);

  // Cargar receta existente
  useEffect(() => {
    if (!idOriginal) return;
    (async () => {
      const { data, error } = await supabase
        .from('recetas')
        .select('*')
        .eq('id', idOriginal)
        .single();

      if (error || !data) {
        Alert.alert('Error', error?.message ?? 'No se pudo cargar la receta');
        router.back();
        return;
      }

      const r = data as Receta;
      const nombreFinal = duplicarId ? `${r.nombre} (copia)` : r.nombre;
      setNombre(nombreFinal);
      setSlug(duplicarId ? generarSlug(nombreFinal) : r.slug);
      setSlugManual(!duplicarId);
      setDescripcion(r.descripcion ?? '');
      setImagenUrl(r.imagen_url ?? '');
      setModoPais(detectarModoPais(r.tags ?? []));
      setTagsExtras(extraerTagsExtras(r.tags ?? []));
      setTiempoPrep(String(r.tiempo_preparacion ?? 15));
      setPorciones(String(r.porciones_base ?? 2));
      setEtapas(r.etapas_compatibles ?? []);
      setMomentos(r.momento_dia ?? []);
      setAlergenos(r.alergenos ?? []);
      setCalorias(r.calorias != null ? String(r.calorias) : '');
      setProteinas(r.proteinas != null ? String(r.proteinas) : '');
      setCarbohidratos(r.carbohidratos != null ? String(r.carbohidratos) : '');
      setGrasas(r.grasas != null ? String(r.grasas) : '');
      setHierro(r.hierro != null ? String(r.hierro) : '');
      setIngredientes(
        r.ingredientes?.length
          ? r.ingredientes
          : [{ id: 1, nombre: '', cantidad: 0, unidad: 'g', calorias_por_100g: 0 }]
      );
      setPasos(
        r.pasos?.length ? r.pasos : [{ orden: 1, descripcion: '', duracion_min: 0 }]
      );
      setVideoUrl(r.video_url ?? '');
      setEsPremium(r.es_premium ?? false);
      setActiva(r.activa ?? true);
      setCargando(false);
    })();
  }, [idOriginal, duplicarId]);

  // Auto-slug mientras se escribe el nombre (solo en crear)
  useEffect(() => {
    if (!slugManual && !modoEditar) {
      setSlug(generarSlug(nombre));
    }
  }, [nombre, slugManual, modoEditar]);

  // ─── Handlers ─────────────────────────────────────────────────

  const toggleEtapa = (e: EtapaAlimentaria) =>
    setEtapas((prev) => (prev.includes(e) ? prev.filter((x) => x !== e) : [...prev, e]));
  const toggleMomento = (m: MomentoDia) =>
    setMomentos((prev) => (prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]));
  const toggleAlergeno = (a: string) =>
    setAlergenos((prev) => (prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]));

  const agregarIngrediente = () => {
    const nextId = Math.max(0, ...ingredientes.map((i) => i.id)) + 1;
    setIngredientes((prev) => [
      ...prev,
      { id: nextId, nombre: '', cantidad: 0, unidad: 'g', calorias_por_100g: 0 },
    ]);
  };
  const quitarIngrediente = (idIng: number) =>
    setIngredientes((prev) => prev.filter((i) => i.id !== idIng));
  const actualizarIngrediente = (
    idIng: number,
    campo: keyof Ingrediente,
    valor: string | number
  ) =>
    setIngredientes((prev) =>
      prev.map((i) => (i.id === idIng ? { ...i, [campo]: valor } : i))
    );

  const agregarPaso = () =>
    setPasos((prev) => [
      ...prev,
      { orden: prev.length + 1, descripcion: '', duracion_min: 0 },
    ]);
  const quitarPaso = (orden: number) =>
    setPasos((prev) =>
      prev.filter((p) => p.orden !== orden).map((p, idx) => ({ ...p, orden: idx + 1 }))
    );
  const actualizarPaso = (
    orden: number,
    campo: keyof PasoReceta,
    valor: string | number
  ) =>
    setPasos((prev) => prev.map((p) => (p.orden === orden ? { ...p, [campo]: valor } : p)));

  const guardar = async () => {
    if (!nombre.trim()) return Alert.alert('Falta nombre', 'El nombre es obligatorio.');
    if (!slug.trim()) return Alert.alert('Falta slug', 'El slug es obligatorio.');
    if (etapas.length === 0)
      return Alert.alert('Falta etapa', 'Selecciona al menos una etapa compatible.');
    if (momentos.length === 0)
      return Alert.alert('Falta momento', 'Selecciona al menos un momento del día.');
    const ingredientesValidos = ingredientes.filter((i) => i.nombre.trim());
    if (ingredientesValidos.length === 0)
      return Alert.alert('Falta ingredientes', 'Agrega al menos un ingrediente con nombre.');
    const pasosValidos = pasos.filter((p) => p.descripcion.trim());
    if (pasosValidos.length === 0)
      return Alert.alert('Falta pasos', 'Agrega al menos un paso con descripción.');

    setGuardando(true);

    const payload = {
      slug: slug.trim(),
      nombre: nombre.trim(),
      descripcion: descripcion.trim(),
      imagen_url: imagenUrl.trim() || null,
      momento_dia: momentos,
      etapas_compatibles: etapas,
      tiempo_preparacion: parseInt(tiempoPrep) || 15,
      porciones_base: parseInt(porciones) || 2,
      alergenos,
      calorias: calorias ? parseFloat(calorias) : null,
      proteinas: proteinas ? parseFloat(proteinas) : null,
      carbohidratos: carbohidratos ? parseFloat(carbohidratos) : null,
      grasas: grasas ? parseFloat(grasas) : null,
      hierro: hierro ? parseFloat(hierro) : null,
      ingredientes: ingredientesValidos.map((i, idx) => ({ ...i, id: idx + 1 })),
      pasos: pasosValidos.map((p, idx) => ({ ...p, orden: idx + 1 })),
      tags: construirTags(modoPais, tagsExtras),
      video_url: videoUrl.trim() || null,
      es_premium: esPremium,
      activa,
    };

    const { error } = modoEditar
      ? await supabase.from('recetas').update(payload).eq('id', id)
      : await supabase.from('recetas').insert(payload);

    setGuardando(false);

    if (error) {
      Alert.alert('Error al guardar', error.message);
      return;
    }
    router.back();
  };

  // ─── Render ───────────────────────────────────────────────────

  if (cargando) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: '#FAF8F5',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ActivityIndicator size="large" color={Colors.verde} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FAF8F5' }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
        keyboardVerticalOffset={24}
      >
        {/* Header */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 20,
            paddingTop: 16,
            paddingBottom: 12,
          }}
        >
          <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
            <Text style={{ fontSize: 22, color: '#78716C' }}>‹</Text>
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 20, fontWeight: '800', color: '#1C1917' }}>
              {modoEditar ? 'Editar receta' : duplicarId ? 'Duplicar receta' : 'Nueva receta'}
            </Text>
            <Text style={{ fontSize: 12, color: '#78716C', marginTop: 2 }} numberOfLines={1}>
              {nombre || 'Sin nombre'}
            </Text>
          </View>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Básico ── */}
          <Seccion titulo="📝 Básico">
            <Campo label="Nombre *">
              <TextInput
                value={nombre}
                onChangeText={setNombre}
                placeholder="Ej: Crema de zapallo"
                placeholderTextColor="#A8A29E"
                style={INPUT_BASE}
              />
            </Campo>

            <Campo label="Slug (URL)" hint="Se genera automático desde el nombre">
              <TextInput
                value={slug}
                onChangeText={(v) => {
                  setSlug(v);
                  setSlugManual(true);
                }}
                placeholder="crema-de-zapallo"
                placeholderTextColor="#A8A29E"
                autoCapitalize="none"
                style={INPUT_BASE}
              />
            </Campo>

            <Campo label="Descripción">
              <TextInput
                value={descripcion}
                onChangeText={setDescripcion}
                placeholder="Una crema suave y nutritiva..."
                placeholderTextColor="#A8A29E"
                multiline
                style={[INPUT_BASE, { minHeight: 80, textAlignVertical: 'top' }]}
              />
            </Campo>

            <Campo label="URL de imagen">
              <TextInput
                value={imagenUrl}
                onChangeText={(v) => {
                  setImagenUrl(v);
                  setImagenError(false);
                }}
                placeholder="https://..."
                placeholderTextColor="#A8A29E"
                autoCapitalize="none"
                keyboardType="url"
                style={INPUT_BASE}
              />
              {imagenUrl.trim() ? (
                imagenError ? (
                  <View
                    style={{
                      marginTop: 8,
                      padding: 16,
                      backgroundColor: '#FEF2F2',
                      borderRadius: 10,
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{ fontSize: 13, color: '#DC2626' }}>
                      ❌ No se pudo cargar la imagen
                    </Text>
                  </View>
                ) : (
                  <Image
                    source={{ uri: imagenUrl.trim() }}
                    style={{
                      marginTop: 8,
                      width: '100%',
                      height: 180,
                      borderRadius: 10,
                      backgroundColor: '#EEEBE6',
                    }}
                    resizeMode="cover"
                    onError={() => setImagenError(true)}
                  />
                )
              ) : null}
            </Campo>

            <Campo label="País">
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                <Chip
                  activo={modoPais === 'universal'}
                  onPress={() => setModoPais('universal')}
                  label="🌎 Universal (LATAM)"
                />
                {PAISES_SIN_TODOS.map((p) => (
                  <Chip
                    key={p.id}
                    activo={modoPais === p.id}
                    onPress={() => setModoPais(p.id as ModoPais)}
                    label={`${p.bandera} ${p.nombre}`}
                  />
                ))}
              </View>
            </Campo>

            <Campo label="Tags adicionales" hint="Separados por coma. Ej: vegetariana, rapida">
              <TextInput
                value={tagsExtras}
                onChangeText={setTagsExtras}
                placeholder="vegetariana, rapida"
                placeholderTextColor="#A8A29E"
                autoCapitalize="none"
                style={INPUT_BASE}
              />
            </Campo>

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={{ flex: 1 }}>
                <Campo label="Tiempo prep. (min)">
                  <TextInput
                    value={tiempoPrep}
                    onChangeText={setTiempoPrep}
                    keyboardType="numeric"
                    style={INPUT_BASE}
                  />
                </Campo>
              </View>
              <View style={{ flex: 1 }}>
                <Campo label="Porciones base">
                  <TextInput
                    value={porciones}
                    onChangeText={setPorciones}
                    keyboardType="numeric"
                    style={INPUT_BASE}
                  />
                </Campo>
              </View>
            </View>
          </Seccion>

          {/* ── Clasificación ── */}
          <Seccion titulo="🏷️ Clasificación">
            <Campo label="Etapas compatibles *">
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {ETAPAS.map((e) => (
                  <Chip
                    key={e.id}
                    activo={etapas.includes(e.id)}
                    onPress={() => toggleEtapa(e.id)}
                    label={`${e.emoji} ${e.nombre}`}
                  />
                ))}
              </View>
            </Campo>

            <Campo label="Momentos del día *">
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {MOMENTOS_DIA.map((m) => (
                  <Chip
                    key={m}
                    activo={momentos.includes(m)}
                    onPress={() => toggleMomento(m)}
                    label={`${MOMENTO_EMOJI[m]} ${MOMENTO_LABEL[m]}`}
                  />
                ))}
              </View>
            </Campo>

            <Campo label="Alérgenos">
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {ALERGENOS.map((a) => (
                  <Chip
                    key={a.id}
                    activo={alergenos.includes(a.id)}
                    onPress={() => toggleAlergeno(a.id)}
                    label={`${a.emoji} ${a.nombre}`}
                  />
                ))}
              </View>
            </Campo>
          </Seccion>

          {/* ── Nutrición ── */}
          <Seccion titulo="🍎 Nutrición (por porción, opcional)">
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={{ flex: 1 }}>
                <Campo label="Calorías">
                  <TextInput
                    value={calorias}
                    onChangeText={setCalorias}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor="#A8A29E"
                    style={INPUT_BASE}
                  />
                </Campo>
              </View>
              <View style={{ flex: 1 }}>
                <Campo label="Proteínas (g)">
                  <TextInput
                    value={proteinas}
                    onChangeText={setProteinas}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor="#A8A29E"
                    style={INPUT_BASE}
                  />
                </Campo>
              </View>
            </View>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={{ flex: 1 }}>
                <Campo label="Carbohidratos (g)">
                  <TextInput
                    value={carbohidratos}
                    onChangeText={setCarbohidratos}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor="#A8A29E"
                    style={INPUT_BASE}
                  />
                </Campo>
              </View>
              <View style={{ flex: 1 }}>
                <Campo label="Grasas (g)">
                  <TextInput
                    value={grasas}
                    onChangeText={setGrasas}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor="#A8A29E"
                    style={INPUT_BASE}
                  />
                </Campo>
              </View>
            </View>
            <Campo label="Hierro (mg)">
              <TextInput
                value={hierro}
                onChangeText={setHierro}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor="#A8A29E"
                style={INPUT_BASE}
              />
            </Campo>
          </Seccion>

          {/* ── Ingredientes ── */}
          <Seccion titulo={`🥕 Ingredientes (${ingredientes.length})`}>
            {ingredientes.map((ing, idx) => (
              <View
                key={ing.id}
                style={{
                  backgroundColor: '#F9F7F4',
                  borderRadius: 10,
                  padding: 10,
                  marginBottom: 8,
                }}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 8,
                  }}
                >
                  <Text style={{ fontSize: 12, fontWeight: '700', color: '#78716C' }}>
                    Ingrediente #{idx + 1}
                  </Text>
                  {ingredientes.length > 1 && (
                    <TouchableOpacity
                      onPress={() => quitarIngrediente(ing.id)}
                      accessibilityLabel={`Quitar ingrediente ${idx + 1}`}
                    >
                      <Text style={{ fontSize: 18 }}>🗑️</Text>
                    </TouchableOpacity>
                  )}
                </View>
                <TextInput
                  value={ing.nombre}
                  onChangeText={(v) => actualizarIngrediente(ing.id, 'nombre', v)}
                  placeholder="Nombre (ej: zapallo)"
                  placeholderTextColor="#A8A29E"
                  style={[INPUT_BASE, { marginBottom: 6 }]}
                />
                <View style={{ flexDirection: 'row', gap: 6 }}>
                  <TextInput
                    value={ing.cantidad ? String(ing.cantidad) : ''}
                    onChangeText={(v) =>
                      actualizarIngrediente(ing.id, 'cantidad', parseFloat(v) || 0)
                    }
                    placeholder="Cant."
                    placeholderTextColor="#A8A29E"
                    keyboardType="numeric"
                    style={[INPUT_BASE, { flex: 1 }]}
                  />
                  <TextInput
                    value={ing.unidad}
                    onChangeText={(v) => actualizarIngrediente(ing.id, 'unidad', v)}
                    placeholder="g, ml..."
                    placeholderTextColor="#A8A29E"
                    style={[INPUT_BASE, { flex: 1 }]}
                  />
                  <TextInput
                    value={ing.calorias_por_100g ? String(ing.calorias_por_100g) : ''}
                    onChangeText={(v) =>
                      actualizarIngrediente(ing.id, 'calorias_por_100g', parseFloat(v) || 0)
                    }
                    placeholder="Cal/100g"
                    placeholderTextColor="#A8A29E"
                    keyboardType="numeric"
                    style={[INPUT_BASE, { flex: 1 }]}
                  />
                </View>
              </View>
            ))}
            <TouchableOpacity
              onPress={agregarIngrediente}
              style={{
                backgroundColor: Colors.verdeClaro,
                borderRadius: 10,
                paddingVertical: 10,
                alignItems: 'center',
                marginTop: 4,
              }}
              activeOpacity={0.7}
            >
              <Text style={{ fontSize: 13, color: Colors.verde, fontWeight: '700' }}>
                + Agregar ingrediente
              </Text>
            </TouchableOpacity>
          </Seccion>

          {/* ── Pasos ── */}
          <Seccion titulo={`📋 Pasos (${pasos.length})`}>
            {pasos.map((paso, idx) => (
              <View
                key={paso.orden}
                style={{
                  backgroundColor: '#F9F7F4',
                  borderRadius: 10,
                  padding: 10,
                  marginBottom: 8,
                }}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 8,
                  }}
                >
                  <Text style={{ fontSize: 12, fontWeight: '700', color: '#78716C' }}>
                    Paso {idx + 1}
                  </Text>
                  {pasos.length > 1 && (
                    <TouchableOpacity
                      onPress={() => quitarPaso(paso.orden)}
                      accessibilityLabel={`Quitar paso ${idx + 1}`}
                    >
                      <Text style={{ fontSize: 18 }}>🗑️</Text>
                    </TouchableOpacity>
                  )}
                </View>
                <TextInput
                  value={paso.descripcion}
                  onChangeText={(v) => actualizarPaso(paso.orden, 'descripcion', v)}
                  placeholder="Describe el paso..."
                  placeholderTextColor="#A8A29E"
                  multiline
                  style={[INPUT_BASE, { minHeight: 60, textAlignVertical: 'top', marginBottom: 6 }]}
                />
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={{ fontSize: 12, color: '#78716C' }}>Duración:</Text>
                  <TextInput
                    value={paso.duracion_min ? String(paso.duracion_min) : ''}
                    onChangeText={(v) =>
                      actualizarPaso(paso.orden, 'duracion_min', parseInt(v) || 0)
                    }
                    placeholder="0"
                    placeholderTextColor="#A8A29E"
                    keyboardType="numeric"
                    style={[INPUT_BASE, { flex: 0, width: 80 }]}
                  />
                  <Text style={{ fontSize: 12, color: '#78716C' }}>min</Text>
                </View>
              </View>
            ))}
            <TouchableOpacity
              onPress={agregarPaso}
              style={{
                backgroundColor: Colors.verdeClaro,
                borderRadius: 10,
                paddingVertical: 10,
                alignItems: 'center',
                marginTop: 4,
              }}
              activeOpacity={0.7}
            >
              <Text style={{ fontSize: 13, color: Colors.verde, fontWeight: '700' }}>
                + Agregar paso
              </Text>
            </TouchableOpacity>
          </Seccion>

          {/* ── Multimedia & flags ── */}
          <Seccion titulo="🎬 Multimedia & estado">
            <Campo label="Video URL (opcional)">
              <TextInput
                value={videoUrl}
                onChangeText={setVideoUrl}
                placeholder="https://youtube.com/..."
                placeholderTextColor="#A8A29E"
                autoCapitalize="none"
                keyboardType="url"
                style={INPUT_BASE}
              />
            </Campo>

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingVertical: 8,
              }}
            >
              <View style={{ flex: 1, marginRight: 12 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#1C1917' }}>Premium</Text>
                <Text style={{ fontSize: 12, color: '#78716C' }}>
                  Solo visible con suscripción
                </Text>
              </View>
              <Switch
                value={esPremium}
                onValueChange={setEsPremium}
                trackColor={{ false: '#EEEBE6', true: '#FDE68A' }}
                thumbColor={esPremium ? '#F59E0B' : '#A8A29E'}
              />
            </View>

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingVertical: 8,
              }}
            >
              <View style={{ flex: 1, marginRight: 12 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#1C1917' }}>Activa</Text>
                <Text style={{ fontSize: 12, color: '#78716C' }}>
                  Si está apagada, no aparece en la app
                </Text>
              </View>
              <Switch
                value={activa}
                onValueChange={setActiva}
                trackColor={{ false: '#EEEBE6', true: '#86EFAC' }}
                thumbColor={activa ? Colors.verde : '#A8A29E'}
              />
            </View>
          </Seccion>
        </ScrollView>

        {/* Footer fijo */}
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: '#FAF8F5',
            borderTopWidth: 1,
            borderTopColor: '#EEEBE6',
            paddingHorizontal: 20,
            paddingTop: 12,
            paddingBottom: 20,
            flexDirection: 'row',
            gap: 10,
          }}
        >
          <TouchableOpacity
            onPress={() => router.back()}
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
            onPress={guardar}
            disabled={guardando}
            style={{
              flex: 2,
              backgroundColor: Colors.verde,
              borderRadius: 12,
              paddingVertical: 14,
              alignItems: 'center',
              opacity: guardando ? 0.6 : 1,
            }}
            activeOpacity={0.8}
          >
            {guardando ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={{ fontSize: 15, fontWeight: '700', color: '#fff' }}>
                {modoEditar ? 'Guardar cambios' : 'Crear receta'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Subcomponentes ─────────────────────────────────────────────

function Seccion({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <View style={{ marginBottom: 24 }}>
      <Text
        style={{
          fontSize: 13,
          fontWeight: '800',
          color: '#78716C',
          marginBottom: 12,
          textTransform: 'uppercase',
          letterSpacing: 0.5,
        }}
      >
        {titulo}
      </Text>
      {children}
    </View>
  );
}

function Campo({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={{ fontSize: 13, fontWeight: '600', color: '#1C1917', marginBottom: 6 }}>
        {label}
      </Text>
      {hint ? (
        <Text style={{ fontSize: 11, color: '#A8A29E', marginBottom: 6 }}>{hint}</Text>
      ) : null}
      {children}
    </View>
  );
}

function Chip({
  activo,
  onPress,
  label,
}: {
  activo: boolean;
  onPress: () => void;
  label: string;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={{
        backgroundColor: activo ? '#1C1917' : '#fff',
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: activo ? '#1C1917' : '#EEEBE6',
      }}
    >
      <Text style={{ fontSize: 12, color: activo ? '#fff' : '#1C1917', fontWeight: '600' }}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}
