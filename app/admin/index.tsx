import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAdminStore } from '@/store/useAdminStore';

interface StatsAdmin {
  total_usuarios: number;
  total_recetas: number;
  recetas_activas: number;
  recetas_premium: number;
  recetas_sin_video: number;
  total_favoritos: number;
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

  const registrarComoAdmin = async () => {
    Alert.alert(
      'Registrarse como admin',
      '¿Confirmar? Solo funciona si no hay admins registrados aún.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            const { data, error } = await supabase.rpc('registrar_primer_admin');
            if (error) {
              Alert.alert('Error', error.message);
            } else if (!data) {
              Alert.alert(
                'Error',
                'La función devolvió false. Ya puede haber un admin registrado.'
              );
            } else {
              Alert.alert('¡Listo!', 'Registrado como admin correctamente.');
              verificarYCargar();
            }
          },
        },
      ]
    );
  };

  const tarjeta = (emoji: string, titulo: string, valor: number, color: string) => (
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
            <Text style={{ fontSize: 12, color: '#78716C', marginTop: 2 }}>Baby Bites</Text>
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
              <Text style={{ fontSize: 12, color: '#92400E', marginBottom: 10 }}>
                Las stats y acciones de edición requieren estar en la tabla admins.
              </Text>
              <TouchableOpacity
                onPress={registrarComoAdmin}
                style={{
                  backgroundColor: '#F59E0B',
                  borderRadius: 8,
                  paddingVertical: 8,
                  paddingHorizontal: 14,
                  alignSelf: 'flex-start',
                }}
              >
                <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13 }}>
                  Registrarme como admin
                </Text>
              </TouchableOpacity>
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
