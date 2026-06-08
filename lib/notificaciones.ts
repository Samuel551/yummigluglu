import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// ─── Handler global ───────────────────────────────────────────────────────────
// Se ejecuta cuando llega una notificación con la app abierta. Mostramos banner
// + sonido + lista para que el usuario la vea aunque esté usando la app.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// ─── Channel IDs ──────────────────────────────────────────────────────────────
const CHANNEL_NOTIFICACION = 'default';
const CHANNEL_ALARMA = 'alarma';

/** Cuántas notifs seguidas programar para simular "loop" en modo alarma. */
const ALARMA_REPS = 6;
/** Segundos entre cada notif del loop de alarma. */
const ALARMA_INTERVALO_SEG = 12;

// ─── Permisos ─────────────────────────────────────────────────────────────────

async function configurarChannelsAndroid() {
  if (Platform.OS !== 'android') return;

  // Channel normal — sonido corto, banner heads-up
  await Notifications.setNotificationChannelAsync(CHANNEL_NOTIFICACION, {
    name: 'Recordatorios',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#2D9B5A',
    enableLights: true,
    enableVibrate: true,
  });

  // Channel alarma — bypass DND, vibración larga, suena con stream ALARM del sistema
  await Notifications.setNotificationChannelAsync(CHANNEL_ALARMA, {
    name: 'Alarmas',
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [
      0, 500, 250, 500, 250, 500, 250, 500, 250, 500, 250, 500, 250, 500,
    ],
    lightColor: '#FF0000',
    enableLights: true,
    enableVibrate: true,
    bypassDnd: true,
    audioAttributes: {
      usage: Notifications.AndroidAudioUsage.ALARM,
      contentType: Notifications.AndroidAudioContentType.SONIFICATION,
    },
    showBadge: true,
  });
}

/**
 * Solicita permisos de notificaciones al usuario. Devuelve `true` si concedidos.
 * En Android 13+ esto dispara el prompt del SO (`POST_NOTIFICATIONS`).
 */
export async function solicitarPermisosNotificaciones(): Promise<boolean> {
  const { status: actual } = await Notifications.getPermissionsAsync();
  if (actual === 'granted') {
    await configurarChannelsAndroid();
    return true;
  }

  const { status: pedido } = await Notifications.requestPermissionsAsync();
  if (pedido === 'granted') {
    await configurarChannelsAndroid();
  }
  return pedido === 'granted';
}

/** Chequeo sincrónico sin pedir — útil para mostrar UI condicional. */
export async function tienePermisosNotificaciones(): Promise<boolean> {
  const { status } = await Notifications.getPermissionsAsync();
  return status === 'granted';
}

// ─── Schedulers ───────────────────────────────────────────────────────────────

export type ModoNotificacion = 'notificacion' | 'alarma';

interface NotificacionData {
  recordatorio_id?: string;
  perfil_hijo_id?: string;
  tipo?: string;
}

function channelParaModo(modo: ModoNotificacion): string {
  return modo === 'alarma' ? CHANNEL_ALARMA : CHANNEL_NOTIFICACION;
}

/**
 * Programa una notificación one-shot para una fecha futura específica.
 * En modo alarma: programa ALARMA_REPS notificaciones seguidas con ALARMA_INTERVALO_SEG
 * de diferencia para simular sonido continuo. Devuelve JSON array de IDs.
 * En modo notificacion: programa 1 sola. Devuelve string con un ID.
 */
export async function programarNotificacionUnaVez(
  titulo: string,
  cuerpo: string,
  fecha: Date,
  data: NotificacionData = {},
  modo: ModoNotificacion = 'notificacion'
): Promise<string | null> {
  if (fecha.getTime() <= Date.now()) {
    console.warn('Notificación descartada — fecha en el pasado:', fecha.toISOString());
    return null;
  }

  if (modo === 'alarma') {
    const ids: string[] = [];
    for (let i = 0; i < ALARMA_REPS; i++) {
      const fechaRep = new Date(fecha.getTime() + i * ALARMA_INTERVALO_SEG * 1000);
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: i === 0 ? `🔔 ${titulo}` : titulo,
          body: cuerpo,
          data,
          sound: 'default',
          sticky: true,
          ...(Platform.OS === 'ios' && { interruptionLevel: 'critical' as const }),
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: fechaRep,
          channelId: CHANNEL_ALARMA,
        },
      });
      ids.push(id);
    }
    return JSON.stringify(ids);
  }

  return Notifications.scheduleNotificationAsync({
    content: {
      title: titulo,
      body: cuerpo,
      data,
      sound: 'default',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: fecha,
      channelId: channelParaModo(modo),
    },
  });
}

/**
 * Programa una notificación que se repite todos los días a la misma hora.
 * En modo alarma: usa el channel reforzado (bypass DND + vibración larga + audio ALARM).
 * No multiplica por ALARMA_REPS para evitar saturar al sistema en uso diario.
 */
export async function programarNotificacionDiaria(
  titulo: string,
  cuerpo: string,
  hora: number,
  minuto: number,
  data: NotificacionData = {},
  modo: ModoNotificacion = 'notificacion'
): Promise<string> {
  return Notifications.scheduleNotificationAsync({
    content: {
      title: modo === 'alarma' ? `🔔 ${titulo}` : titulo,
      body: cuerpo,
      data,
      sound: 'default',
      sticky: modo === 'alarma',
      ...(Platform.OS === 'ios' &&
        modo === 'alarma' && { interruptionLevel: 'critical' as const }),
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: hora,
      minute: minuto,
      channelId: channelParaModo(modo),
    },
  });
}

/**
 * Programa N notificaciones semanales — una por cada día seleccionado.
 * Devuelve el array de IDs (para almacenar como JSON en notification_id).
 * Premium feature.
 */
export async function programarNotificacionSemanal(
  titulo: string,
  cuerpo: string,
  diasSemana: number[], // 0=domingo, 6=sábado (formato JS Date.getDay())
  hora: number,
  minuto: number,
  data: NotificacionData = {},
  modo: ModoNotificacion = 'notificacion'
): Promise<string[]> {
  const ids: string[] = [];

  for (const dia of diasSemana) {
    // expo-notifications WEEKLY usa weekday 1-7 (1=domingo, 7=sábado)
    const weekday = dia + 1;
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: modo === 'alarma' ? `🔔 ${titulo}` : titulo,
        body: cuerpo,
        data,
        sound: 'default',
        sticky: modo === 'alarma',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
        weekday,
        hour: hora,
        minute: minuto,
        channelId: channelParaModo(modo),
      },
    });
    ids.push(id);
  }

  return ids;
}

// ─── Cancel ───────────────────────────────────────────────────────────────────

/**
 * Cancela una notificación programada. Acepta tanto un ID único como un
 * array serializado en JSON (cuando vienen de programarNotificacionSemanal o
 * de modo alarma).
 */
export async function cancelarNotificacion(notificationId: string | null): Promise<void> {
  if (!notificationId) return;

  // Si es JSON array (de semanal o alarma), parsear y cancelar cada una
  if (notificationId.startsWith('[')) {
    try {
      const ids = JSON.parse(notificationId) as string[];
      await Promise.all(ids.map((id) => Notifications.cancelScheduledNotificationAsync(id)));
      return;
    } catch {
      // Si el parse falla, tratar como ID único
    }
  }

  await Notifications.cancelScheduledNotificationAsync(notificationId);
}

/** Limpia TODAS las notificaciones programadas — usar con cuidado. */
export async function cancelarTodasLasNotificaciones(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

/** Lista las notificaciones programadas — útil para debug. */
export async function listarNotificacionesProgramadas() {
  return Notifications.getAllScheduledNotificationsAsync();
}
