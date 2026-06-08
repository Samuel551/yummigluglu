import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import {
  PlanSemanal,
  DiasPlan,
  DiaSemana,
  MomentoDia,
  ListaCompras,
  ItemCompras,
  Receta,
  EtapaAlimentaria,
} from '@/types';
import { DIAS_SEMANA, MOMENTOS_DIA } from '@/constants/Semana';

// ─── Categorización de ingredientes ──────────────────────────────────────────

function categorizarIngrediente(nombre: string): string {
  const n = nombre.toLowerCase();
  if (
    /zapallo|zanahoria|papa|camote|brócoli|brocoli|espinaca|acelga|puerro|calabaza|batata|tomate|chaucha|arveja|choclo|remolacha|poroto|lenteja|garbanzo|morrón|morron/.test(
      n
    )
  )
    return 'Verduras y legumbres';
  if (
    /manzana|pera|banana|durazno|ciruela|damasco|arándano|arandano|frutilla|frambuesa|mango|papaya|melón|melon|sandia|sandía|kiwi|mandarina|naranja|limón|limon/.test(
      n
    )
  )
    return 'Frutas';
  if (/leche|queso|yogur|manteca|crema|fórmula|formula/.test(n)) return 'Lácteos';
  if (/avena|arroz|pasta|fideos|pan|harina|quinoa|polenta|maíz|maiz|sémola|semola|cous/.test(n))
    return 'Cereales';
  if (/pollo|carne|pescado|huevo|pavo|atún|atun|salmón|salmon/.test(n)) return 'Proteínas';
  if (/aceite|sal|azúcar|azucar|canela|vainilla|jengibre|cúrcuma|curcuma|comino/.test(n))
    return 'Condimentos';
  return 'Otros';
}

function generarItemsLista(recetas: Receta[]): ItemCompras[] {
  const acum: Record<
    string,
    { totalMl: number; totalG: number; unidad: string; categoria: string }
  > = {};

  for (const receta of recetas) {
    for (const ing of receta.ingredientes) {
      if (!acum[ing.nombre]) {
        acum[ing.nombre] = {
          totalMl: 0,
          totalG: 0,
          unidad: ing.unidad,
          categoria: categorizarIngrediente(ing.nombre),
        };
      }
      if (ing.unidad === 'ml') {
        acum[ing.nombre].totalMl += ing.cantidad;
      } else {
        acum[ing.nombre].totalG += ing.cantidad;
      }
    }
  }

  return Object.entries(acum)
    .map(([nombre, { totalMl, totalG, unidad, categoria }]) => ({
      nombre,
      cantidad: unidad === 'ml' ? `${Math.round(totalMl)}ml` : `${Math.round(totalG)}g`,
      categoria,
      comprado: false,
    }))
    .sort((a, b) => a.categoria.localeCompare(b.categoria) || a.nombre.localeCompare(b.nombre));
}

// ─── Generación del plan ──────────────────────────────────────────────────────

function generarDias(recetas: Receta[]): DiasPlan {
  const porMomento: Record<MomentoDia, Receta[]> = {
    desayuno: [],
    almuerzo: [],
    cena: [],
    snack: [],
  };

  for (const r of recetas) {
    for (const m of r.momento_dia as string[]) {
      // La DB puede traer momentos legacy fuera del enum (ej. 'merienda').
      // Skipeamos para no crashear; igual entran al pool por sus otros momentos.
      if (m in porMomento) porMomento[m as MomentoDia].push(r);
    }
  }

  const usados = new Set<string>();
  const dias = {} as DiasPlan;

  for (const dia of DIAS_SEMANA) {
    dias[dia] = {} as Record<MomentoDia, string | null>;
    for (const momento of MOMENTOS_DIA) {
      const pool = porMomento[momento];
      if (pool.length === 0) {
        dias[dia][momento] = null;
        continue;
      }
      const disponibles = pool.filter((r) => !usados.has(r.id));
      const origen = disponibles.length > 0 ? disponibles : pool;
      const receta = origen[Math.floor(Math.random() * origen.length)];
      dias[dia][momento] = receta.id;
      usados.add(receta.id);
    }
  }

  return dias;
}

// ─── Cache de recetas referenciadas por el plan ──────────────────────────────

type RecetasCache = Record<string, Pick<Receta, 'id' | 'nombre' | 'tiempo_preparacion'>>;

// Trae las recetas que aparecen en `dias` y devuelve el cache. Función pura:
// no toca el store. El caller hace UN solo set() con plan + cache juntos,
// evitando estados intermedios donde el plan está pero el cache queda {}.
async function fetchRecetasCacheDePlan(dias: DiasPlan): Promise<RecetasCache> {
  const ids = new Set<string>();
  for (const dia of DIAS_SEMANA) {
    for (const momento of MOMENTOS_DIA) {
      const id = dias[dia]?.[momento];
      if (id) ids.add(id);
    }
  }
  if (ids.size === 0) return {};

  const { data } = await supabase
    .from('recetas')
    .select('id, nombre, tiempo_preparacion')
    .in('id', Array.from(ids));

  const cache: RecetasCache = {};
  for (const r of data ?? []) cache[r.id] = r;
  return cache;
}

// ─── Store ────────────────────────────────────────────────────────────────────

interface PlanState {
  plan: PlanSemanal | null;
  lista: ListaCompras | null;
  recetasCache: RecetasCache;
  cargando: boolean;
  cargandoLista: boolean;
  error: string | null;

  cargarPlan: (perfilId: string, semanaInicio: string) => Promise<void>;
  generarPlan: (
    perfilId: string,
    etapa: EtapaAlimentaria,
    alergias: string[],
    semanaInicio: string,
    pais?: string
  ) => Promise<void>;
  actualizarSlot: (dia: DiaSemana, momento: MomentoDia, recetaId: string | null) => Promise<void>;
  cargarLista: (planId: string) => Promise<void>;
  generarLista: () => Promise<void>;
  toggleComprado: (nombre: string) => Promise<void>;
  limpiarComprados: () => Promise<void>;
  limpiarPlan: () => void;
}

export const usePlanStore = create<PlanState>((set, get) => ({
  plan: null,
  lista: null,
  recetasCache: {},
  cargando: false,
  cargandoLista: false,
  error: null,

  limpiarPlan: () => set({ plan: null, lista: null, recetasCache: {}, error: null }),

  cargarPlan: async (perfilId, semanaInicio) => {
    set({ cargando: true, error: null });
    try {
      const { data, error } = await supabase
        .from('planes_semanales')
        .select('*')
        .eq('perfil_id', perfilId)
        .eq('semana_inicio', semanaInicio)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        const plan = data as PlanSemanal;
        const recetasCache = await fetchRecetasCacheDePlan(plan.dias);
        set({ plan, recetasCache });
      } else {
        set({ plan: null, recetasCache: {} });
      }
    } catch (e) {
      set({ error: (e as Error).message });
    } finally {
      set({ cargando: false });
    }
  },

  generarPlan: async (perfilId, etapa, alergias, semanaInicio, pais) => {
    set({ cargando: true, error: null });
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Sin sesión activa');

      const { data: recetas, error: rError } = await supabase
        .from('recetas')
        .select(
          'id, nombre, momento_dia, etapas_compatibles, alergenos, ingredientes, tiempo_preparacion, tags'
        )
        .eq('activa', true)
        .contains('etapas_compatibles', [etapa]);

      if (rError) throw rError;

      const compatibles = (recetas ?? []).filter((r) => {
        if (r.alergenos.some((a: string) => alergias.includes(a))) return false;
        if (pais && pais !== 'todos') {
          const TODOS_LOS_PAISES = ['chile', 'peru', 'colombia', 'venezuela', 'argentina', 'mexico'];
          return r.tags.includes(pais) || TODOS_LOS_PAISES.every((id) => r.tags.includes(id));
        }
        return true;
      }) as Receta[];

      const dias = generarDias(compatibles);

      const { data, error } = await supabase
        .from('planes_semanales')
        .upsert(
          {
            user_id: user.id,
            perfil_id: perfilId,
            semana_inicio: semanaInicio,
            dias,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id,perfil_id,semana_inicio' }
        )
        .select()
        .single();

      if (error) throw error;

      const cache: RecetasCache = {};
      for (const r of compatibles) {
        cache[r.id] = { id: r.id, nombre: r.nombre, tiempo_preparacion: r.tiempo_preparacion };
      }

      set({ plan: data as PlanSemanal, recetasCache: cache });

      // Auto-generar lista de compras con las recetas que ya tenemos en memoria.
      // Evita re-query a Supabase — reusamos `compatibles` y el `dias` recién generado.
      // IMPORTANTE: iteramos por slot (no por id único) para respetar la multiplicidad —
      // una receta que aparece 3 veces en la semana debe sumar 3× sus ingredientes.
      const compatiblesPorId = new Map(compatibles.map((r) => [r.id, r]));
      const recetasPorSlot: Receta[] = [];
      for (const dia of DIAS_SEMANA) {
        for (const momento of MOMENTOS_DIA) {
          const rid = dias[dia]?.[momento];
          if (!rid) continue;
          const r = compatiblesPorId.get(rid);
          if (r) recetasPorSlot.push(r);
        }
      }
      const items = generarItemsLista(recetasPorSlot);

      const { data: listaData, error: listaErr } = await supabase
        .from('listas_compras')
        .upsert(
          {
            user_id: user.id,
            perfil_id: perfilId,
            plan_id: (data as PlanSemanal).id,
            items,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'plan_id' }
        )
        .select()
        .single();

      if (listaErr) {
        // El plan quedó guardado aunque la lista falle — no bloqueamos al user.
        console.warn('No se pudo generar la lista de compras:', listaErr.message);
        set({ lista: null });
      } else {
        set({ lista: listaData as ListaCompras });
      }
    } catch (e) {
      set({ error: (e as Error).message });
    } finally {
      set({ cargando: false });
    }
  },

  actualizarSlot: async (dia, momento, recetaId) => {
    const { plan } = get();
    if (!plan) return;

    const diasOriginales = plan.dias;
    const nuevosDias: DiasPlan = {
      ...plan.dias,
      [dia]: { ...plan.dias[dia], [momento]: recetaId },
    };

    set({ plan: { ...plan, dias: nuevosDias } });

    const { error } = await supabase
      .from('planes_semanales')
      .update({ dias: nuevosDias, updated_at: new Date().toISOString() })
      .eq('id', plan.id);

    if (error) {
      set({ plan: { ...plan, dias: diasOriginales }, error: error.message });
    }
  },

  cargarLista: async (planId) => {
    set({ cargandoLista: true, error: null });
    try {
      const { data, error } = await supabase
        .from('listas_compras')
        .select('*')
        .eq('plan_id', planId)
        .maybeSingle();

      if (error) throw error;
      set({ lista: data as ListaCompras | null });
    } catch (e) {
      set({ error: (e as Error).message });
    } finally {
      set({ cargandoLista: false });
    }
  },

  generarLista: async () => {
    const { plan } = get();
    if (!plan) return;

    set({ cargandoLista: true, error: null });
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Sin sesión activa');

      // Contamos cuántas veces aparece cada receta en el plan — respetamos multiplicidad
      // para que una receta que sale en varios slots sume sus ingredientes varias veces.
      const conteoPorId: Record<string, number> = {};
      for (const dia of DIAS_SEMANA) {
        for (const momento of MOMENTOS_DIA) {
          const id = plan.dias[dia]?.[momento];
          if (id) conteoPorId[id] = (conteoPorId[id] ?? 0) + 1;
        }
      }

      const { data: recetas, error: rError } = await supabase
        .from('recetas')
        .select('id, nombre, ingredientes, tiempo_preparacion')
        .in('id', Object.keys(conteoPorId));

      if (rError) throw rError;

      // Expandimos: cada receta aparece en el array tantas veces como esté usada en el plan.
      const recetasPorSlot: Receta[] = [];
      for (const r of (recetas ?? []) as Receta[]) {
        const n = conteoPorId[r.id] ?? 0;
        for (let i = 0; i < n; i++) recetasPorSlot.push(r);
      }

      const items = generarItemsLista(recetasPorSlot);

      const { data, error } = await supabase
        .from('listas_compras')
        .upsert(
          {
            user_id: user.id,
            perfil_id: plan.perfil_id,
            plan_id: plan.id,
            items,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'plan_id' }
        )
        .select()
        .single();

      if (error) throw error;
      set({ lista: data as ListaCompras });
    } catch (e) {
      set({ error: (e as Error).message });
    } finally {
      set({ cargandoLista: false });
    }
  },

  toggleComprado: async (nombre) => {
    const { lista } = get();
    if (!lista) return;

    const itemsOriginales = lista.items;
    const nuevosItems = lista.items.map((item) =>
      item.nombre === nombre ? { ...item, comprado: !item.comprado } : item
    );
    set({ lista: { ...lista, items: nuevosItems } });

    const { error } = await supabase
      .from('listas_compras')
      .update({ items: nuevosItems, updated_at: new Date().toISOString() })
      .eq('id', lista.id);

    if (error) {
      set({ lista: { ...lista, items: itemsOriginales }, error: error.message });
    }
  },

  limpiarComprados: async () => {
    const { lista } = get();
    if (!lista) return;

    const itemsOriginales = lista.items;
    const nuevosItems = lista.items.map((item) => ({ ...item, comprado: false }));
    set({ lista: { ...lista, items: nuevosItems } });

    const { error } = await supabase
      .from('listas_compras')
      .update({ items: nuevosItems, updated_at: new Date().toISOString() })
      .eq('id', lista.id);

    if (error) {
      set({ lista: { ...lista, items: itemsOriginales }, error: error.message });
    }
  },
}));
