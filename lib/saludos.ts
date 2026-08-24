// ============================================================
// Yummi Glu Glu — Saludos de cumpleaños y cumplemés
//
// Notificaciones LOCALES derivadas de `perfiles_hijos.fecha_nacimiento`.
// Costo cero: no hay push, ni FCM, ni tokens, ni backend.
//
// 🔴 DECISIÓN DE ARQUITECTURA: estos saludos NO se guardan en la tabla
// `recordatorios`. Se DERIVAN de la fecha de nacimiento, que ya es la fuente de
// verdad. Meterlos como filas significaría:
//   - crear recordatorios que el usuario nunca creó, mezclados con los suyos;
//   - una segunda copia de la fecha, que hay que resincronizar cada vez que el
//     padre corrige el cumpleaños en `editar-perfil`.
// Derivarlos es cero migración y cero desincronización posible.
//
// Estrategia de programación: VENTANA MÓVIL. No se programan los 24 cumplemés
// de una; se programan los próximos `VENTANA_MESES` y se reprograma todo cada
// vez que la app arranca. Motivos:
//   - iOS tiene un tope duro de 64 notificaciones pendientes por app, y con
//     varios hijos se revienta enseguida;
//   - si el padre corrige la fecha o borra un perfil, la ventana chica se
//     recompone sola en el próximo arranque.
// ============================================================

import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  programarNotificacionUnaVez,
  cancelarNotificacion,
  listarNotificacionesProgramadas,
  tienePermisosNotificaciones,
} from './notificaciones';

/** Marca en `data.tipo` que identifica a NUESTRAS notificaciones de saludo. */
const MARCA_SALUDO = 'saludo_cumple';

/** Hasta qué edad se manda el saludo mensual. Después, solo el cumpleaños. */
export const MESES_CUMPLEMES_MAX = 24;

/** Cuántos meses hacia adelante se programan en cada pasada. */
const VENTANA_MESES = 12;

/** Hora local del saludo. Temprano, pero no tanto como para despertar a nadie. */
const HORA_SALUDO = 9;

const CLAVE_ACTIVOS = 'yummigluglu-saludos-activos';

export interface PerfilParaSaludo {
  id: string;
  nombre: string;
  avatar_emoji?: string | null;
  fecha_nacimiento: string; // 'YYYY-MM-DD'
}

export type TipoSaludo = 'cumpleanos' | 'cumplemes';

export interface EventoSaludo {
  fecha: Date;
  tipo: TipoSaludo;
  /** Meses cumplidos ese día. Para cumpleaños siempre es múltiplo de 12. */
  mesesEdad: number;
}

// ─── Fechas ───────────────────────────────────────────────────────────────────

/**
 * Parsea 'YYYY-MM-DD' como fecha LOCAL.
 *
 * 🔴 NO usar `new Date('2025-03-03')`. El constructor interpreta ese formato
 * como **UTC**, así que en Chile (UTC-3/-4) devuelve el 2 de marzo a las 21:00.
 * El saludo saldría **un día antes** — justo el error que arruina un cumpleaños.
 */
function parsearFechaLocal(iso: string): Date | null {
  const partes = iso.split('-');
  if (partes.length !== 3) return null;
  const [anio, mes, dia] = partes.map(Number);
  if (!anio || !mes || !dia) return null;
  const d = new Date(anio, mes - 1, dia, 0, 0, 0, 0);
  return Number.isNaN(d.getTime()) ? null : d;
}

/**
 * Construye una fecha recortando el día al último día real del mes.
 *
 * ⚠️ Sin esto, un bebé nacido un 31 no tendría cumplemés en los meses de 30
 * días: `new Date(2026, 3, 31)` **se desborda a mayo**, y el saludo saldría el
 * día equivocado. Lo mismo con un cumpleaños del 29 de febrero en año no
 * bisiesto. Se recorta al 30 / al 28, que es lo que hace todo el mundo.
 */
function fechaRecortada(anio: number, mes: number, dia: number): Date {
  const ultimoDiaDelMes = new Date(anio, mes + 1, 0).getDate();
  return new Date(anio, mes, Math.min(dia, ultimoDiaDelMes), HORA_SALUDO, 0, 0, 0);
}

/**
 * Los saludos que caen dentro de la ventana, ordenados por fecha.
 *
 * Exportada para poder probarla sin tocar el sistema de notificaciones: es toda
 * la aritmética delicada de esta feature.
 */
export function eventosSaludo(
  fechaNacimientoISO: string,
  desde: Date = new Date(),
  ventanaMeses: number = VENTANA_MESES
): EventoSaludo[] {
  const nacimiento = parsearFechaLocal(fechaNacimientoISO);
  if (!nacimiento) return [];

  const eventos: EventoSaludo[] = [];

  // Meses transcurridos entre el nacimiento y el mes de `desde`. Se recorre esa
  // cuenta hacia adelante en vez de sumar meses a un Date, porque sumar meses a
  // un Date arrastra el desborde de días que `fechaRecortada` justamente evita.
  const mesesHastaHoy =
    (desde.getFullYear() - nacimiento.getFullYear()) * 12 +
    (desde.getMonth() - nacimiento.getMonth());

  for (let m = Math.max(mesesHastaHoy, 0); m <= mesesHastaHoy + ventanaMeses; m++) {
    if (m === 0) continue; // el día que nació no es un cumplemés

    const anio = nacimiento.getFullYear() + Math.floor((nacimiento.getMonth() + m) / 12);
    const mes = (nacimiento.getMonth() + m) % 12;
    const fecha = fechaRecortada(anio, mes, nacimiento.getDate());

    if (fecha.getTime() <= desde.getTime()) continue;

    const esCumpleanos = m % 12 === 0;

    // El cumpleaños va SIEMPRE, a cualquier edad. El cumplemés se corta a los
    // 24 meses: pasada esa edad nadie cuenta en meses y la notificación pasa de
    // emotiva a molesta — y un padre molesto apaga las notificaciones, con lo
    // que perdemos también el cumpleaños.
    if (!esCumpleanos && m > MESES_CUMPLEMES_MAX) continue;

    eventos.push({ fecha, tipo: esCumpleanos ? 'cumpleanos' : 'cumplemes', mesesEdad: m });
  }

  return eventos.sort((a, b) => a.fecha.getTime() - b.fecha.getTime());
}

// ─── Textos ───────────────────────────────────────────────────────────────────

// ⚠️ Español NEUTRAL con "tú" — es texto que ve el usuario final. Nada de
// voseo acá, el público es todo LATAM. Ver CLAUDE.md § Code Conventions.

/** Varias versiones para que el saludo mensual no llegue idéntico cada mes. */
const CUERPOS_CUMPLEMES = [
  (n: string, m: number) =>
    `Hoy ${n} cumple ${m} ${m === 1 ? 'mes' : 'meses'}. Gracias por dejarnos acompañarlos en cada comida. ¡Un abrazo enorme para ${n} y para ustedes, del equipo de Yummi Glu Glu!`,
  (n: string, m: number) =>
    `¡${m} ${m === 1 ? 'mes' : 'meses'} de ${n}! Cada cucharada fue un logro, y ustedes estuvieron ahí en todas. Con mucho cariño, el equipo de Yummi Glu Glu.`,
  (n: string, m: number) =>
    `${n} cumple ${m} ${m === 1 ? 'mes' : 'meses'} hoy. Qué lindo verlos crecer juntos. ¡Felicidades a ${n} y a sus papás, del equipo de Yummi Glu Glu!`,
];

function textoAnios(anios: number): string {
  return anios === 1 ? '1 año' : `${anios} años`;
}

export function textoSaludo(
  perfil: PerfilParaSaludo,
  evento: EventoSaludo
): { titulo: string; cuerpo: string } {
  const nombre = perfil.nombre.trim();
  const emoji = perfil.avatar_emoji ?? '';

  if (evento.tipo === 'cumpleanos') {
    const anios = evento.mesesEdad / 12;
    return {
      titulo: `🎉 ¡Feliz cumpleaños, ${nombre}! ${emoji}`.trim(),
      cuerpo: `Hoy ${nombre} cumple ${textoAnios(anios)}. Que sea un día lleno de abrazos, risas y de su comida favorita. ¡Felicidades a ${nombre} y a sus papás, de parte de todo el equipo de Yummi Glu Glu!`,
    };
  }

  // Índice determinístico: el mismo mes siempre da el mismo texto, así que
  // reprogramar la ventana no cambia el mensaje que el padre ya vio anunciado.
  const cuerpo = CUERPOS_CUMPLEMES[evento.mesesEdad % CUERPOS_CUMPLEMES.length];
  return {
    titulo:
      `🎂 ¡${nombre} cumple ${evento.mesesEdad} ${evento.mesesEdad === 1 ? 'mes' : 'meses'}! ${emoji}`.trim(),
    cuerpo: cuerpo(nombre, evento.mesesEdad),
  };
}

// ─── Preferencia del usuario ──────────────────────────────────────────────────

/**
 * Los saludos se guardan por DISPOSITIVO, no en la base.
 *
 * Son notificaciones locales: viven en el teléfono que las programó. Guardar la
 * preferencia en el servidor prometería una sincronización que el mecanismo no
 * puede cumplir — apagarlas en un teléfono no las apagaría en el otro.
 *
 * Por defecto ACTIVOS: si el usuario concedió el permiso de notificaciones, ya
 * dijo que sí. Volver a preguntarle sería preguntarle dos veces lo mismo.
 */
export async function saludosActivos(): Promise<boolean> {
  try {
    const valor = await AsyncStorage.getItem(CLAVE_ACTIVOS);
    return valor === null ? true : valor === '1';
  } catch {
    return true;
  }
}

export async function setSaludosActivos(activos: boolean): Promise<void> {
  try {
    await AsyncStorage.setItem(CLAVE_ACTIVOS, activos ? '1' : '0');
  } catch {
    // Una preferencia que no se pudo persistir no justifica romper la pantalla.
  }
}

// ─── Programación ─────────────────────────────────────────────────────────────

/** Cancela TODAS las notificaciones de saludo, sin tocar las de la agenda. */
export async function cancelarSaludos(): Promise<void> {
  if (Platform.OS === 'web') return;

  const programadas = await listarNotificacionesProgramadas();
  const mias = programadas.filter((n) => n.content?.data?.tipo === MARCA_SALUDO);
  await Promise.all(mias.map((n) => cancelarNotificacion(n.identifier)));
}

/**
 * Deja programada la ventana de saludos de TODOS los perfiles.
 *
 * ⚠️ Es IDEMPOTENTE a propósito: primero cancela lo que ya había y después
 * reprograma desde cero. Llamarla dos veces seguidas no duplica nada, que es lo
 * que permite invocarla sin miedo en cada arranque y cada vez que cambian los
 * perfiles.
 *
 * ⚠️ NO pide permisos. Si el usuario no los dio, no hay nada que programar y no
 * es el momento de interrumpirlo con un diálogo del sistema: el permiso se pide
 * en el onboarding, en contexto. Ver `app/onboarding.tsx`.
 *
 * @returns cuántas notificaciones quedaron programadas.
 */
export async function reprogramarSaludos(perfiles: PerfilParaSaludo[]): Promise<number> {
  if (Platform.OS === 'web') return 0;

  await cancelarSaludos();

  if (!(await saludosActivos())) return 0;
  if (!(await tienePermisosNotificaciones())) return 0;

  const ahora = new Date();
  let programadas = 0;

  for (const perfil of perfiles) {
    if (!perfil.fecha_nacimiento) continue;

    for (const evento of eventosSaludo(perfil.fecha_nacimiento, ahora)) {
      const { titulo, cuerpo } = textoSaludo(perfil, evento);
      const id = await programarNotificacionUnaVez(titulo, cuerpo, evento.fecha, {
        tipo: MARCA_SALUDO,
        perfil_hijo_id: perfil.id,
      });
      if (id) programadas++;
    }
  }

  return programadas;
}
