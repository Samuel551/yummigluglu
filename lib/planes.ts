import { PACKAGE_TYPE, PurchasesPackage } from 'react-native-purchases';

/**
 * Traduce los paquetes que devuelve RevenueCat a algo que la pantalla premium
 * pueda pintar sin saber nada de planes.
 *
 * 🔴 **Por qué existe este archivo.** La pantalla premium compraba `paquetes[0]`
 * —el primero que viniera en el offering— mientras mostraba los textos
 * `PLAN MENSUAL` y `por mes` **hardcodeados**. Con un solo producto en Play eso
 * funcionaba de casualidad. Al agregar el plan anual, si el offering devolvía el
 * anual primero, la app anunciaba un precio "por mes" y **cobraba un año**:
 * publicidad engañosa, reembolso y política de Play violada.
 *
 * La regla que sale de ahí, y que no hay que romper nunca:
 * **el periodo, el precio y la etiqueta salen SIEMPRE del paquete**, jamás de un
 * texto fijo en la UI.
 */
export interface PlanPresentado {
  paquete: PurchasesPackage;
  /** "Mensual", "Anual"… — el nombre del plan en el selector */
  etiqueta: string;
  /** "por mes", "por año"… — acompaña al precio */
  periodo: string;
  /** Precio ya formateado por la tienda, en la moneda local del usuario */
  precio: string;
  /** "≈ $X al mes" en planes de más de un mes. `null` si la tienda no lo informa */
  desglose: string | null;
  /** % de ahorro contra el plan más caro por mes. `null` si no aplica o hay un solo plan */
  ahorroPct: number | null;
}

/**
 * Orden de menor a mayor duración — define el orden del selector.
 * Los tipos sin periodo conocido (`UNKNOWN`, `CUSTOM`) caen al final vía
 * `RANGO_DESCONOCIDO`: no sabemos cada cuánto cobran, así que no se los
 * puede intercalar entre los demás.
 */
const RANGO: Partial<Record<PACKAGE_TYPE, number>> = {
  [PACKAGE_TYPE.WEEKLY]: 0,
  [PACKAGE_TYPE.MONTHLY]: 1,
  [PACKAGE_TYPE.TWO_MONTH]: 2,
  [PACKAGE_TYPE.THREE_MONTH]: 3,
  [PACKAGE_TYPE.SIX_MONTH]: 4,
  [PACKAGE_TYPE.ANNUAL]: 5,
  [PACKAGE_TYPE.LIFETIME]: 6,
};

const RANGO_DESCONOCIDO = 99;

/** Textos user-facing: español NEUTRAL con "tú", nunca voseo. Ver CLAUDE.md. */
const ETIQUETAS: Partial<Record<PACKAGE_TYPE, { etiqueta: string; periodo: string }>> = {
  [PACKAGE_TYPE.WEEKLY]: { etiqueta: 'Semanal', periodo: 'por semana' },
  [PACKAGE_TYPE.MONTHLY]: { etiqueta: 'Mensual', periodo: 'por mes' },
  [PACKAGE_TYPE.TWO_MONTH]: { etiqueta: 'Bimestral', periodo: 'cada 2 meses' },
  [PACKAGE_TYPE.THREE_MONTH]: { etiqueta: 'Trimestral', periodo: 'cada 3 meses' },
  [PACKAGE_TYPE.SIX_MONTH]: { etiqueta: 'Semestral', periodo: 'cada 6 meses' },
  [PACKAGE_TYPE.ANNUAL]: { etiqueta: 'Anual', periodo: 'por año' },
  [PACKAGE_TYPE.LIFETIME]: { etiqueta: 'De por vida', periodo: 'pago único' },
};

/**
 * Arma la lista de planes lista para pintar, ordenada de menor a mayor duración.
 *
 * Con **un solo** plan devuelve un array de uno y `ahorroPct` en `null`: sin un
 * segundo plan no hay contra qué comparar, e inventar un "ahorras X%" contra un
 * precio que no existe sería exactamente el tipo de mentira que este archivo vino
 * a eliminar.
 */
export function construirPlanes(paquetes: PurchasesPackage[]): PlanPresentado[] {
  if (paquetes.length === 0) return [];

  const ordenados = [...paquetes].sort(
    (a, b) =>
      (RANGO[a.packageType] ?? RANGO_DESCONOCIDO) - (RANGO[b.packageType] ?? RANGO_DESCONOCIDO)
  );

  // Referencia del ahorro: el costo mensual equivalente MÁS CARO de la oferta
  // (normalmente el plan mensual). `pricePerMonth` lo calcula la tienda; es `null`
  // en pagos únicos y puede serlo si Google no lo informa, así que se filtra.
  const costosMensuales = ordenados
    .map((p) => p.product.pricePerMonth)
    .filter((v): v is number => typeof v === 'number' && v > 0);
  const referencia = costosMensuales.length > 1 ? Math.max(...costosMensuales) : null;

  return ordenados.map((paquete) => {
    const info = ETIQUETAS[paquete.packageType];
    const costoMensual = paquete.product.pricePerMonth;

    let ahorroPct: number | null = null;
    if (referencia !== null && typeof costoMensual === 'number' && costoMensual > 0) {
      const pct = Math.round((1 - costoMensual / referencia) * 100);
      // Por debajo del 1% no se muestra: un "ahorras 0%" es ruido.
      ahorroPct = pct >= 1 ? pct : null;
    }

    return {
      paquete,
      // Sin etiqueta conocida se cae al título del producto de la tienda, que el
      // owner controla desde Play Console. Nunca queda un plan sin nombre.
      etiqueta: info?.etiqueta ?? paquete.product.title,
      periodo: info?.periodo ?? '',
      precio: paquete.product.priceString,
      // El desglose "≈ $X al mes" solo tiene sentido si el ciclo NO es mensual.
      desglose:
        paquete.packageType === PACKAGE_TYPE.MONTHLY ? null : paquete.product.pricePerMonthString,
      ahorroPct,
    };
  });
}
