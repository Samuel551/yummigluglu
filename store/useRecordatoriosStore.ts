import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { Recordatorio, RecordatorioInput, PlanSemanal, DiaSemana, MomentoDia } from '@/types';
import {
  cancelarNotificacion,
  programarNotificacionDiaria,
  programarNotificacionSemanal,
  programarNotificacionUnaVez,
  solicitarPermisosNotificaciones,
} from '@/lib/notificaciones';
import { DIAS_SEMANA, MOMENTOS_DIA } from '@/constants/Semana';
import { HITOS, fechaHito } from '@/constants/Hitos';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const HORAS_POR_MOMENTO: Record<MomentoDia, { hora: number; minuto: number }> = {
  desayuno: { hora: 8, minuto: 0 },
  almuerzo: { hora: 12, minuto: 30 },
  snack: { hora: 16, minuto: 0 },
  cena: { hora: 19, minuto: 30 },
};

// DIAS_SEMANA del proyecto: lunes=0..domingo=6
// JS Date.getDay(): domingo=0..sábado=6
// Mapping del plan semanal a Date.getDay()
const DIA_PLAN_A_JS: Record<DiaSemana, number> = {
  lunes: 1,
  martes: 2,
  miercoles: 3,
  jueves: 4,
  viernes: 5,
  sabado: 6,
  domingo: 0,
};

function parsearHoraDiaria(hora: string): { hora: number; minuto: number } {
  const [h, m] = hora.split(':').map(Number);
  return { hora: h ?? 0, minuto: m ?? 0 };
}

async function programarSegunInput(input: RecordatorioInput): Promise<string | null> {
  const data = { tipo: input.tipo, perfil_hijo_id: input.perfil_hijo_id };
  const modo = input.modo_notificacion ?? 'notificacion';

  // One-shot
  if (input.fecha_hora) {
    return programarNotificacionUnaVez(
      input.titulo,
      input.descripcion ?? '',
      new Date(input.fecha_hora),
      data,
      modo
    );
  }

  // Semanal con días específicos (premium)
  if (input.hora_diaria && input.dias_semana && input.dias_semana.length > 0) {
    const { hora, minuto } = parsearHoraDiaria(input.hora_diaria);
    const ids = await programarNotificacionSemanal(
      input.titulo,
      input.descripcion ?? '',
      input.dias_semana,
      hora,
      minuto,
      data,
      modo
    );
    return JSON.stringify(ids);
  }

  // Diaria
  if (input.hora_diaria) {
    const { hora, minuto } = parsearHoraDiaria(input.hora_diaria);
    return programarNotificacionDiaria(
      input.titulo,
      input.descripcion ?? '',
      hora,
      minuto,
      data,
      modo
    );
  }

  return null;
}

// ─── Store ────────────────────────────────────────────────────────────────────

interface RecordatoriosState {
  recordatorios: Recordatorio[];
  cargando: boolean;
  error: string | null;
  /** True si el último error fue por límite free/feature premium (sirve para abrir paywall) */
  errorEsPremium: boolean;

  cargarRecordatorios: (perfilHijoId?: string) => Promise<void>;
  crearRecordatorio: (input: RecordatorioInput) => Promise<Recordatorio | null>;
  actualizarRecordatorio: (id: string, input: Partial<RecordatorioInput>) => Promise<void>;
  eliminarRecordatorio: (id: string) => Promise<void>;
  toggleActivo: (id: string) => Promise<void>;
  activarSemanaPlan: (plan: PlanSemanal, recetasNombres: Record<string, string>) => Promise<number>;
  limpiarError: () => void;
}

export const useRecordatoriosStore = create<RecordatoriosState>((set, get) => ({
  recordatorios: [],
  cargando: false,
  error: null,
  errorEsPremium: false,

  limpiarError: () => set({ error: null, errorEsPremium: false }),

  cargarRecordatorios: async (perfilHijoId) => {
    set({ cargando: true, error: null });
    try {
      let query = supabase
        .from('recordatorios')
        .select('*')
        .order('created_at', { ascending: false });

      if (perfilHijoId) {
        query = query.eq('perfil_hijo_id', perfilHijoId);
      }

      const { data, error } = await query;
      if (error) throw error;

      set({ recordatorios: (data ?? []) as Recordatorio[] });
    } catch (e) {
      set({ error: (e as Error).message });
    } finally {
      set({ cargando: false });
    }
  },

  crearRecordatorio: async (input) => {
    set({ cargando: true, error: null, errorEsPremium: false });

    // Pedir permisos antes de programar
    const permisosOk = await solicitarPermisosNotificaciones();
    if (!permisosOk) {
      set({
        error:
          'Necesitamos permiso para enviarte notificaciones. Activa las notificaciones de Yummi Glu Glu en los ajustes del dispositivo.',
        cargando: false,
      });
      return null;
    }

    // Programar la notificación local
    let notificationId: string | null = null;
    try {
      notificationId = await programarSegunInput(input);
    } catch (e) {
      console.warn('Error programando notificación:', e);
    }

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Sin sesión activa');

      const { data, error } = await supabase
        .from('recordatorios')
        .insert({
          user_id: user.id,
          ...input,
          notification_id: notificationId,
          activo: true,
        })
        .select()
        .single();

      if (error) {
        // El trigger SQL rechazó — cancelar la notification local
        if (notificationId) await cancelarNotificacion(notificationId);

        // Detectar errores de límite/feature premium (P0001) para abrir paywall
        const esPremium = error.code === 'P0001' || /premium|máximo|gratuito/i.test(error.message);

        set({
          error: error.message,
          errorEsPremium: esPremium,
        });
        return null;
      }

      const nuevo = data as Recordatorio;
      set((state) => ({ recordatorios: [nuevo, ...state.recordatorios] }));
      return nuevo;
    } catch (e) {
      if (notificationId) await cancelarNotificacion(notificationId);
      set({ error: (e as Error).message });
      return null;
    } finally {
      set({ cargando: false });
    }
  },

  actualizarRecordatorio: async (id, input) => {
    const actual = get().recordatorios.find((r) => r.id === id);
    if (!actual) return;

    set({ cargando: true, error: null });

    // Si cambió la recurrencia, re-programamos la notificación
    const cambioRecurrencia =
      input.fecha_hora !== undefined ||
      input.hora_diaria !== undefined ||
      input.dias_semana !== undefined ||
      input.titulo !== undefined ||
      input.descripcion !== undefined;

    let nuevoNotificationId = actual.notification_id;

    if (cambioRecurrencia && actual.activo) {
      // Cancelar la vieja
      await cancelarNotificacion(actual.notification_id ?? null);

      // Programar la nueva con el merge de campos
      const merged: RecordatorioInput = {
        perfil_hijo_id: actual.perfil_hijo_id,
        tipo: actual.tipo,
        titulo: input.titulo ?? actual.titulo,
        descripcion: input.descripcion ?? actual.descripcion,
        fecha_hora: input.fecha_hora ?? actual.fecha_hora,
        hora_diaria: input.hora_diaria ?? actual.hora_diaria,
        dias_semana: input.dias_semana ?? actual.dias_semana,
        modo_notificacion: input.modo_notificacion ?? actual.modo_notificacion,
      };
      try {
        nuevoNotificationId = (await programarSegunInput(merged)) ?? undefined;
      } catch (e) {
        console.warn('Error re-programando notificación:', e);
      }
    }

    try {
      const { data, error } = await supabase
        .from('recordatorios')
        .update({ ...input, notification_id: nuevoNotificationId })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const actualizado = data as Recordatorio;
      set((state) => ({
        recordatorios: state.recordatorios.map((r) => (r.id === id ? actualizado : r)),
      }));
    } catch (e) {
      set({ error: (e as Error).message });
    } finally {
      set({ cargando: false });
    }
  },

  eliminarRecordatorio: async (id) => {
    const actual = get().recordatorios.find((r) => r.id === id);
    if (!actual) return;

    // Optimistic delete
    set((state) => ({
      recordatorios: state.recordatorios.filter((r) => r.id !== id),
    }));

    // Cancelar notificación local
    await cancelarNotificacion(actual.notification_id ?? null);

    const { error } = await supabase.from('recordatorios').delete().eq('id', id);
    if (error) {
      // Rollback
      set((state) => ({
        recordatorios: [actual, ...state.recordatorios],
        error: error.message,
      }));
    }
  },

  toggleActivo: async (id) => {
    const actual = get().recordatorios.find((r) => r.id === id);
    if (!actual) return;

    const nuevoActivo = !actual.activo;

    if (nuevoActivo) {
      // Reactivar: pedir permisos + programar
      const permisosOk = await solicitarPermisosNotificaciones();
      if (!permisosOk) {
        set({ error: 'Necesitamos permiso para activar notificaciones.' });
        return;
      }

      let nuevoNotificationId: string | null = null;
      try {
        nuevoNotificationId = await programarSegunInput({
          perfil_hijo_id: actual.perfil_hijo_id,
          tipo: actual.tipo,
          titulo: actual.titulo,
          descripcion: actual.descripcion,
          fecha_hora: actual.fecha_hora,
          hora_diaria: actual.hora_diaria,
          dias_semana: actual.dias_semana,
          modo_notificacion: actual.modo_notificacion,
        });
      } catch (e) {
        console.warn('Error re-programando:', e);
      }

      const { data, error } = await supabase
        .from('recordatorios')
        .update({ activo: true, notification_id: nuevoNotificationId })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        if (nuevoNotificationId) await cancelarNotificacion(nuevoNotificationId);
        const esPremium = error.code === 'P0001' || /premium|máximo|gratuito/i.test(error.message);
        set({ error: error.message, errorEsPremium: esPremium });
        return;
      }

      const actualizado = data as Recordatorio;
      set((state) => ({
        recordatorios: state.recordatorios.map((r) => (r.id === id ? actualizado : r)),
      }));
    } else {
      // Desactivar: cancelar notification + update DB
      await cancelarNotificacion(actual.notification_id ?? null);
      const { data, error } = await supabase
        .from('recordatorios')
        .update({ activo: false, notification_id: null })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        set({ error: error.message });
        return;
      }
      const actualizado = data as Recordatorio;
      set((state) => ({
        recordatorios: state.recordatorios.map((r) => (r.id === id ? actualizado : r)),
      }));
    }
  },

  // ─── Premium: activar la semana completa de un plan ──────────────────────
  // Crea hasta 21 recordatorios semanales (7 días × 3-4 momentos del plan).
  // Si el user no es premium, el trigger SQL rechaza el primer insert con
  // P0001 → set errorEsPremium=true para que el caller abra el paywall.
  activarSemanaPlan: async (plan, recetasNombres) => {
    set({ cargando: true, error: null, errorEsPremium: false });

    const permisosOk = await solicitarPermisosNotificaciones();
    if (!permisosOk) {
      set({
        error: 'Necesitamos permiso para enviarte notificaciones.',
        cargando: false,
      });
      return 0;
    }

    let creados = 0;
    try {
      for (const dia of DIAS_SEMANA) {
        for (const momento of MOMENTOS_DIA) {
          const recetaId = plan.dias[dia]?.[momento];
          if (!recetaId) continue;

          const nombre = recetasNombres[recetaId] ?? 'Comida';
          const { hora, minuto } = HORAS_POR_MOMENTO[momento];
          const diaJs = DIA_PLAN_A_JS[dia];

          const input: RecordatorioInput = {
            perfil_hijo_id: plan.perfil_id,
            tipo: 'comida',
            titulo: nombre,
            descripcion: `Es hora del ${momento}`,
            hora_diaria: `${String(hora).padStart(2, '0')}:${String(minuto).padStart(2, '0')}:00`,
            dias_semana: [diaJs],
          };

          const creado = await get().crearRecordatorio(input);
          if (!creado) {
            // Si falló por premium, abortamos toda la operación
            if (get().errorEsPremium) {
              return creados;
            }
            // Otros errores: seguimos con los siguientes
            continue;
          }
          creados++;
        }
      }
    } finally {
      set({ cargando: false });
    }

    return creados;
  },
}));

// ─── Auto-scheduler de hitos alimentarios (Premium) ──────────────────────────
// Programa notificaciones one-shot 1 semana antes de que el bebé cumpla
// cada hito futuro. Llamar al iniciar la app cuando user es premium.
export async function programarHitosFuturos(
  perfilHijoId: string,
  fechaNacimiento: string
): Promise<{ programados: number; ya_existentes: number }> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { programados: 0, ya_existentes: 0 };

  // Cargar hitos ya programados para evitar duplicados
  const { data: existentes } = await supabase
    .from('recordatorios')
    .select('titulo')
    .eq('perfil_hijo_id', perfilHijoId)
    .eq('tipo', 'hito');

  const titulosExistentes = new Set((existentes ?? []).map((r) => r.titulo));

  const permisosOk = await solicitarPermisosNotificaciones();
  if (!permisosOk) return { programados: 0, ya_existentes: titulosExistentes.size };

  const ahora = new Date();
  let programados = 0;

  for (const hito of HITOS) {
    if (titulosExistentes.has(hito.titulo)) continue;

    const fechaCumple = fechaHito(fechaNacimiento, hito);
    const fechaAviso = new Date(fechaCumple);
    fechaAviso.setDate(fechaAviso.getDate() - 7); // aviso 1 semana antes

    if (fechaAviso.getTime() <= ahora.getTime()) continue;

    const notificationId = await programarNotificacionUnaVez(
      hito.titulo,
      hito.descripcion,
      fechaAviso,
      { perfil_hijo_id: perfilHijoId, tipo: 'hito' }
    );

    const { error } = await supabase.from('recordatorios').insert({
      user_id: user.id,
      perfil_hijo_id: perfilHijoId,
      tipo: 'hito',
      titulo: hito.titulo,
      descripcion: hito.descripcion,
      fecha_hora: fechaAviso.toISOString(),
      notification_id: notificationId,
      activo: true,
    });

    if (error) {
      if (notificationId) await cancelarNotificacion(notificationId);
      // P0001 = no es premium → abortar el batch
      if (error.code === 'P0001') break;
      continue;
    }
    programados++;
  }

  return { programados, ya_existentes: titulosExistentes.size };
}
