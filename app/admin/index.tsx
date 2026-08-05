import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAdminStore } from '@/store/useAdminStore';

// Nota: el auto-registro de admin (`registrar_primer_admin` RPC) fue removido en
// la migracion 007. Para agregar admins nuevos, hacerlo manualmente en Supabase
// Studio con: INSERT INTO admins (user_id) SELECT id FROM auth.users WHERE email='...';

interface StatsAdmin {
  total_usuarios: number;
  total_recetas: number;
  recetas_activas: number;
  recetas_premium: number;
  recetas_sin_video: number;
  total_favoritos: number;
  // NutriBot — SOLO agregados. El contenido de las conversaciones no se expone
  // nunca acá: son consultas de salud sobre menores. Ver migración 035.
  nutribot_usuarios_mes: number;
  nutribot_mensajes_mes: number;
  nutribot_mensajes_total: number;
  nutribot_costo_mes: number;
}

export default function AdminDashboard() {
  const { cerrarAdmin } = useAdminStore();
  const [stats, setStats] = useState<StatsAdmin | null>(null);
  const [cargando, setCargando] = useState(true);
  const [esAdmin, setEsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    verificarYCargar();
  }, []);

  const verificarYCargar = async () => {
    setCargando(true);
    try {
      // Verificar si este user está registrado en la tabla admins
      const { data: adminData } = await supabase.rpc('es_admin');
      setEsAdmin(!!adminData);

      if (adminData) {
        const { data, error } = await supabase.rpc('stats_admin');
        if (error) throw error;
        setStats(data as StatsAdmin);
      }
    } catch {
      // stats no disponibles aún
    } finally {
      setCargando(false);
    }
  };

  const tarjeta = (emoji: string, titulo: string, valor: number | string, color: string) => (
    <View
      key={titulo}
      style={{
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        minWidth: '45%',
      }}
    >
      <Text style={{ fontSize: 28, marginBottom: 4 }}>{emoji}</Text>
      <Text style={{ fontSize: 26, fontWeight: '800', color }}>{valor}</Text>
      <Text style={{ fontSize: 11, color: '#78716C', textAlign: 'center', marginTop: 2 }}>
        {titulo}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FAF8F5' }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        {/* Header */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 24,
          }}
        >
          <View>
            <Text style={{ fontSize: 22, fontWeight: '800', color: '#1C1917' }}>Panel Admin</Text>
            <Text style={{ fontSize: 12, color: '#78716C', marginTop: 2 }}>Yummi Glu Glu</Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              cerrarAdmin();
              router.back();
            }}
            style={{
              backgroundColor: '#fff',
              borderRadius: 20,
              paddingHorizontal: 14,
              paddingVertical: 7,
              borderWidth: 1,
              borderColor: '#EEEBE6',
            }}
            activeOpacity={0.7}
          >
            <Text style={{ fontSize: 13, color: '#78716C', fontWeight: '600' }}>Salir</Text>
          </TouchableOpacity>
        </View>

        {/* Estado de admin DB */}
        {!cargando && esAdmin === false && (
          <View
            style={{
              backgroundColor: '#FFF4EC',
              borderRadius: 12,
              padding: 16,
              marginBottom: 20,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <Text style={{ fontSize: 22 }}>⚠️</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: '700', color: '#92400E', marginBottom: 4 }}>
                Tu usuario no está registrado como admin
              </Text>
              <Text style={{ fontSize: 12, color: '#92400E' }}>
                Las stats y acciones de edición requieren estar en la tabla admins. Solicita acceso
                al equipo de Yummi Glu Glu.
              </Text>
            </View>
          </View>
        )}

        {/* Stats */}
        {cargando ? (
          <View style={{ alignItems: 'center', paddingVertical: 40 }}>
            <ActivityIndicator size="large" color="#2D9B5A" />
          </View>
        ) : stats ? (
          <>
            <Text
              style={{
                fontSize: 11,
                fontWeight: '700',
                color: '#78716C',
                letterSpacing: 0.8,
                marginBottom: 12,
              }}
            >
              ESTADÍSTICAS
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 }}>
              {tarjeta('👥', 'Usuarios', stats.total_usuarios, '#1C1917')}
              {tarjeta('🍽️', 'Recetas', stats.total_recetas, '#1C1917')}
              {tarjeta('✅', 'Activas', stats.recetas_activas, '#2D9B5A')}
              {tarjeta('👑', 'Premium', stats.recetas_premium, '#F59E0B')}
              {tarjeta('🎬', 'Sin video', stats.recetas_sin_video, '#DC2626')}
              {tarjeta('❤️', 'Favoritos', stats.total_favoritos, '#EF4444')}
            </View>

            {/* ── NUTRIBOT ── */}
            <Text
              style={{
                fontSize: 11,
                fontWeight: '700',
                color: '#78716C',
                letterSpacing: 0.8,
                marginBottom: 12,
              }}
            >
              NUTRIBOT · ESTE MES
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 8 }}>
              {tarjeta('🥑', 'Lo usaron', stats.nutribot_usuarios_mes, '#2D9B5A')}
              {tarjeta('💬', 'Mensajes', stats.nutribot_mensajes_mes, '#1C1917')}
              {tarjeta(
                '📊',
                'Promedio por usuario',
                stats.nutribot_usuarios_mes > 0
                  ? (stats.nutribot_mensajes_mes / stats.nutribot_usuarios_mes).toFixed(1)
                  : '—',
                '#1C1917'
              )}
              {/* El costo es lo que decide si el cupo gratis es sostenible. Tenerlo
                  acá evita entrar a la consola de Anthropic para saberlo. */}
              {tarjeta('💵', 'Gasto estimado', `$${stats.nutribot_costo_mes ?? 0}`, '#F59E0B')}
            </View>
            <Text style={{ fontSize: 11, color: '#78716C', lineHeight: 16, marginBottom: 24 }}>
              Histórico: {stats.nutribot_mensajes_total} mensajes. El gasto es una estimación a
              ~US$0,0083 por mensaje — sube ~50% desde el 1 de septiembre de 2026, cuando termina el
              precio introductorio de Claude Sonnet 5.
            </Text>
          </>
        ) : null}

        {/* Acciones */}
        <Text
          style={{
            fontSize: 11,
            fontWeight: '700',
            color: '#78716C',
            letterSpacing: 0.8,
            marginBottom: 12,
          }}
        >
          ACCIONES
        </Text>
        <View style={{ backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden' }}>
          <TouchableOpacity
            onPress={() => router.push('/admin/recetas')}
            activeOpacity={0.7}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              padding: 16,
              borderBottomWidth: 1,
              borderBottomColor: '#F5F3F1',
            }}
          >
            <Text style={{ fontSize: 22, marginRight: 14 }}>🍽️</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, fontWeight: '600', color: '#1C1917' }}>
                Gestionar recetas
              </Text>
              <Text style={{ fontSize: 12, color: '#78716C', marginTop: 1 }}>
                Activar/desactivar, agregar videos, toggle premium
              </Text>
            </View>
            <Text style={{ fontSize: 18, color: '#C7C4C0' }}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() =>
              Alert.alert(
                'Próximamente',
                'La gestión de suscripciones estará disponible con RevenueCat.'
              )
            }
            activeOpacity={0.7}
            style={{ flexDirection: 'row', alignItems: 'center', padding: 16 }}
          >
            <Text style={{ fontSize: 22, marginRight: 14 }}>💳</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, fontWeight: '600', color: '#A8A29E' }}>
                Suscripciones
              </Text>
              <Text style={{ fontSize: 12, color: '#A8A29E', marginTop: 1 }}>
                Próximamente — requiere RevenueCat
              </Text>
            </View>
            <Text style={{ fontSize: 18, color: '#C7C4C0' }}>›</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
