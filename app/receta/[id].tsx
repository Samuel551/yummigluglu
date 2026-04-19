import { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '@/lib/supabase';
import { Receta } from '@/types';
import { getAlergenoById } from '@/constants/Alergias';
import { COLOR_ETAPA, ETAPA_LABEL } from '@/constants/Etapas';
import { useColoresTema } from '@/hooks/useColoresTema';

const MOMENTO_LABEL: Record<string, string> = {
  desayuno: '🌅 Desayuno',
  almuerzo: '☀️ Almuerzo',
  cena: '🌙 Cena',
  snack: '🍪 Snack',
};

export default function DetalleRecetaScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const c = useColoresTema();
  const [receta, setReceta] = useState<Receta | null>(null);
  const [cargando, setCargando] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setErrorMsg('ID de receta inválido.');
      setCargando(false);
      return;
    }
    const cargar = async () => {
      const { data, error } = await supabase.from('recetas').select('*').eq('id', id).single();

      if (error) {
        setErrorMsg('No se pudo cargar la receta. Intentá de nuevo.');
      } else if (data) {
        setReceta(data as Receta);
      }
      setCargando(false);
    };
    cargar();
  }, [id]);

  if (cargando) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: c.fondoApp,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ActivityIndicator size="large" color={c.verde} />
      </SafeAreaView>
    );
  }

  if (errorMsg || !receta) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: c.fondoApp,
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
        }}
      >
        <Text style={{ fontSize: 32, marginBottom: 12 }}>⚠️</Text>
        <Text style={{ fontSize: 16, color: c.grisTexto, textAlign: 'center' }}>
          {errorMsg ?? 'Receta no encontrada.'}
        </Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 16 }}>
          <Text style={{ color: c.verde, fontWeight: '600' }}>Volver</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const etapaPrimaria = receta.etapas_compatibles[0] ?? 'inicio';
  const colorEtapa = COLOR_ETAPA[etapaPrimaria] ?? COLOR_ETAPA.inicio;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.fondoApp }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Encabezado */}
        <View
          style={{
            backgroundColor: colorEtapa.bg,
            paddingTop: 16,
            paddingHorizontal: 20,
            paddingBottom: 24,
          }}
        >
          <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 14, color: colorEtapa.text, fontWeight: '600' }}>
              ← Volver
            </Text>
          </TouchableOpacity>

          {receta.es_premium && (
            <View
              style={{
                backgroundColor: '#F59E0B',
                borderRadius: 8,
                paddingHorizontal: 10,
                paddingVertical: 4,
                alignSelf: 'flex-start',
                marginBottom: 10,
                flexDirection: 'row',
                gap: 4,
                alignItems: 'center',
              }}
            >
              <Text style={{ fontSize: 12 }}>👑</Text>
              <Text style={{ fontSize: 12, color: '#fff', fontWeight: '700' }}>PREMIUM</Text>
            </View>
          )}

          <Text
            style={{
              fontSize: 24,
              fontWeight: '800',
              color: c.negro,
              marginBottom: 8,
              lineHeight: 30,
            }}
          >
            {receta.nombre}
          </Text>
          <Text style={{ fontSize: 14, color: c.grisTexto, lineHeight: 20 }}>
            {receta.descripcion}
          </Text>
        </View>

        <View style={{ padding: 20, gap: 24 }}>
          {/* Info rápida */}
          <View style={{ flexDirection: 'row', gap: 12 }}>
            {[
              { emoji: '⏱', valor: `${receta.tiempo_preparacion} min`, label: 'Preparación' },
              { emoji: '🍽️', valor: `${receta.porciones_base} porc.`, label: 'Porciones' },
              {
                emoji: '🔥',
                valor: receta.calorias ? `${receta.calorias} kcal` : '—',
                label: 'Calorías',
              },
            ].map(({ emoji, valor, label }) => (
              <View
                key={label}
                style={{
                  flex: 1,
                  backgroundColor: c.card,
                  borderRadius: 12,
                  padding: 12,
                  alignItems: 'center',
                  shadowColor: '#000',
                  shadowOpacity: 0.04,
                  shadowRadius: 6,
                  elevation: 2,
                }}
              >
                <Text style={{ fontSize: 20, marginBottom: 4 }}>{emoji}</Text>
                <Text style={{ fontSize: 13, fontWeight: '700', color: c.negro }}>{valor}</Text>
                <Text style={{ fontSize: 10, color: c.grisTexto }}>{label}</Text>
              </View>
            ))}
          </View>

          {/* Etapas y momentos */}
          <View style={{ gap: 10 }}>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {receta.etapas_compatibles.map((etapa) => (
                <View
                  key={etapa}
                  style={{
                    backgroundColor: COLOR_ETAPA[etapa]?.bg,
                    borderRadius: 8,
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                  }}
                >
                  <Text
                    style={{ fontSize: 12, color: COLOR_ETAPA[etapa]?.text, fontWeight: '600' }}
                  >
                    {ETAPA_LABEL[etapa]}
                  </Text>
                </View>
              ))}
              {receta.momento_dia.map((momento) => (
                <View
                  key={momento}
                  style={{
                    backgroundColor: c.grisClaro,
                    borderRadius: 8,
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                  }}
                >
                  <Text style={{ fontSize: 12, color: c.grisTexto, fontWeight: '500' }}>
                    {MOMENTO_LABEL[momento] ?? momento}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Alérgenos */}
          {receta.alergenos.length > 0 && (
            <View style={{ backgroundColor: '#FFF7ED', borderRadius: 12, padding: 14 }}>
              <Text style={{ fontSize: 13, fontWeight: '700', color: '#C2410C', marginBottom: 8 }}>
                ⚠️ Contiene alérgenos
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                {receta.alergenos.map((id) => {
                  const info = getAlergenoById(id);
                  return (
                    <Text key={id} style={{ fontSize: 12, color: '#78350F' }}>
                      {info ? `${info.emoji} ${info.nombre}` : id}
                    </Text>
                  );
                })}
              </View>
            </View>
          )}

          {/* Ingredientes */}
          <View>
            <Text style={{ fontSize: 17, fontWeight: '700', color: c.negro, marginBottom: 12 }}>
              Ingredientes
            </Text>
            <View style={{ gap: 8 }}>
              {receta.ingredientes.map((ing) => (
                <View
                  key={ing.id}
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: c.card,
                    borderRadius: 10,
                    paddingHorizontal: 14,
                    paddingVertical: 10,
                    shadowColor: '#000',
                    shadowOpacity: 0.03,
                    shadowRadius: 4,
                    elevation: 1,
                  }}
                >
                  <Text style={{ fontSize: 14, color: c.negro, flex: 1 }}>{ing.nombre}</Text>
                  <Text style={{ fontSize: 13, color: c.grisTexto, fontWeight: '500' }}>
                    {ing.cantidad} {ing.unidad}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Pasos */}
          <View>
            <Text style={{ fontSize: 17, fontWeight: '700', color: c.negro, marginBottom: 12 }}>
              Preparación
            </Text>
            <View style={{ gap: 12 }}>
              {receta.pasos.map((paso) => (
                <View key={paso.orden} style={{ flexDirection: 'row', gap: 14 }}>
                  <View
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 14,
                      backgroundColor: c.verde,
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginTop: 2,
                      flexShrink: 0,
                    }}
                  >
                    <Text style={{ fontSize: 13, color: c.blanco, fontWeight: '700' }}>
                      {paso.orden}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, color: c.negro, lineHeight: 20 }}>
                      {paso.descripcion}
                    </Text>
                    {paso.duracion_min > 0 && (
                      <Text style={{ fontSize: 11, color: c.grisTexto, marginTop: 4 }}>
                        ⏱ {paso.duracion_min} min
                      </Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Info nutricional */}
          {receta.calorias && (
            <View>
              <Text style={{ fontSize: 17, fontWeight: '700', color: c.negro, marginBottom: 12 }}>
                Info nutricional por porción
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {[
                  { label: 'Calorías', valor: receta.calorias, unidad: 'kcal' },
                  { label: 'Proteínas', valor: receta.proteinas, unidad: 'g' },
                  { label: 'Carbohidratos', valor: receta.carbohidratos, unidad: 'g' },
                  { label: 'Grasas', valor: receta.grasas, unidad: 'g' },
                  { label: 'Hierro', valor: receta.hierro, unidad: 'mg' },
                ]
                  .filter(({ valor }) => valor != null)
                  .map(({ label, valor, unidad }) => (
                    <View
                      key={label}
                      style={{
                        backgroundColor: c.card,
                        borderRadius: 10,
                        padding: 12,
                        minWidth: '45%',
                        flex: 1,
                        shadowColor: '#000',
                        shadowOpacity: 0.03,
                        shadowRadius: 4,
                        elevation: 1,
                      }}
                    >
                      <Text style={{ fontSize: 16, fontWeight: '700', color: c.negro }}>
                        {valor}
                        <Text style={{ fontSize: 11, fontWeight: '400', color: c.grisTexto }}>
                          {' '}
                          {unidad}
                        </Text>
                      </Text>
                      <Text style={{ fontSize: 11, color: c.grisTexto, marginTop: 2 }}>
                        {label}
                      </Text>
                    </View>
                  ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
