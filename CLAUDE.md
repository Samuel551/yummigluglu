# CLAUDE.md

Guía para Claude Code en este repo. **Solo lo esencial.** El detalle histórico (diagnósticos,
mediciones, runbooks ya ejecutados, el porqué de cada decisión) vive en
📕 **`docs/bitacora-proyecto.md`**, citado acá como `§ Título de la sección`. Antes de tocar un área
sensible (pagos, webhooks, vista `recetas_teaser`, anuncios), leer su sección en la bitácora.

## Project Context

**Yummi Glu Glu** — app Android de alimentación infantil con IA (NutriBot), para padres de niños de
6 meses a 5 años en Chile y LATAM. **Publicada en Google Play** (`com.yummigluglu.app`, versión viva
`5 (1.1.0)`). El repo es **PÚBLICO** (`github.com/Samuel551/yummigluglu`).

- Supabase project: `uoqzkbbnesmvmgbjikrn` (São Paulo) · Target: solo Android
- Código y comentarios en **español**

## 🔴 Regla vigente del owner (2026-09-04)

> **NO hacer migraciones nuevas. NO publicar nada. NO desplegar Edge Functions.**
>
> Todo se acumula en el árbol hasta juntar **un solo build**: el owner baja una APK, prueba la app
> entera y recién ahí publica. No proponerlo hasta que él lo diga. El servidor se despliega en segundos
> y el cliente tarda días: arreglar de a pedazos genera desfase.

## Pendientes (al 2026-10-04)

- **Fase 11 (BLW)**: ✅ código completo y **commiteado** (sin push); migración `039` ya aplicada; las
  **18 recetas de trocitos están vivas**, con video y foto (catálogo 207 → 225). Falta el build único.
  Detalle: `§ 1. Fase 11 (BLW)`.
- **Convertibles**: ✅ hecho el 2026-10-04. De las 68 recetas `inicio` viejas, **40** quedaron con
  `metodo = {papilla, blw}` (cada una con su propio texto; `forma_servido` empieza con "Versión
  trocitos:"). Las otras 28 (cereales, atoles, choclo, frutas con semillas duras) siguen solo como papilla.
- **5 recetas `inicio` sin azúcar ni alcohol**: ✅ 2026-10-04. Panela → plátano maduro (y se retira la
  canela en rama) en _Atol de yuca_; esencia/extracto de vainilla → vaina opcional cocinada y retirada en
  las otras 4. Además, las 3 **bebidas** de `inicio` (2 atoles y el mate de leche) pasaron de leche
  entera a leche materna o de fórmula, agregada al final y sin hervir. Cocinar con leche de vaca está
  bien; darla como bebida antes del año, no. Los videos todavía muestran el ingrediente viejo. SQL en
  `D:\Proyectos\recetas\sql\`.
- **Desplegar NutriBot** (`supabase functions deploy nutribot`): el repo va adelante de lo
  desplegado. ⏸️ Esperando orden del owner.
- **3 archivos en `videos\_revisar-duplicados\`** (de la 102/103, de la 179 y de la 208): el owner
  decidió **dejarlos así** (2026-10-04). No tocarlos.
- **Versión 1.2.0 (Fase 11)**: el owner autorizó el build único el 2026-10-04. `app.json` ya está en
  1.2.0. Flujo: deploy NutriBot → `eas build --profile production` → prueba interna → QA → promover al 100%.
- **Deadlines de Google**: **feb 2027** memoria + DEX/R8 (hoy **no se cumple**: falta
  `expo-build-properties` con `enableMinifyInReleaseBuilds`; degrada en silencio. **Va en su propia
  versión, DESPUÉS de publicar la Fase 11** — decisión del 2026-10-04) y **abr 2027** Zero-Tap Sign-In (Restore
  Credentials API). Ver `§ Requisitos de calidad de Play`.
- **Idea para la 1.3.0** (no urgente): una línea debajo de los chips de método del catálogo, tipo
  _"Abre en Trocitos según el perfil de {nombre}"_. En el QA de la 1.2.0 el owner esperaba que el
  perfil ESCONDIERA los otros métodos; es a propósito que no lo haga (la mayoría mezcla papilla y
  trocitos), pero conviene explicarlo en pantalla. Los perfiles nuevos ya nacen en `ambos`.
- **Marketing**: solo se promocionan en redes videos de `rotacion_grupo = 0` (nunca se bloquean).

## Commands

```bash
npm start / npm run android / npm run web
npm run tunnel -- --clear   # Metro con ngrok para el dev client en dispositivo real
npm run lint / lint:fix / format
eas build -p android --profile development | preview | production
```

Pre-commit: `lint-staged` (ESLint + Prettier). Probar en dispositivo con el **dev client**, nunca Expo
Go. Un crash por minificación (R8) **solo** aparece en builds `preview`/`production`.

## Architecture

- **Expo Router** (`app/`): guards **dentro de cada layout**. `(tabs)/_layout.tsx` = sin sesión →
  login · sin perfiles → `onboarding` · ok → tabs. Pantallas: `(auth)`, `(tabs)` (inicio, recetas,
  favoritos, plan, videos, perfil), `receta/[id]`, `premium`, `asistente` (NutriBot, modal), `admin/`,
  `editar-perfil/[id]`, `editar-cuenta`, `diario/[id]`, `lista-compras`.
- **Zustand** en `store/` (`useAuthStore`, `usePerfilStore`, `useRecetasStore`, `useSuscripcionStore`,
  `useTemaStore`, …). Los stores llaman directo a Supabase, sin capa de servicios.
- **Tipos** en `types/index.ts` · alias `@/` = raíz · dominio en `constants/` (`Etapas`, `Alergias`,
  `Metodos`, `Colors`, `Semana`, `Nutribot`).
- **Etapas**: `inicio` (6–8m), `transicion` (9–12m), `preescolar` (13m+).
- **Errores user-facing**: siempre por `lib/errores.ts` → `mensajeError()`. No inventar mensajes por store.
- **Dark mode**: fuente de verdad `useTemaStore` (no `useColorScheme` de nativewind). Inline styles →
  `useColoresTema()`; `className` → prefijo `dark:`.

### Supabase y seguridad

- RLS en todas las tablas. **La autorización real es RLS** (`es_admin()`, tabla `admins`).
  `useEsAdmin()` y el hash de password del admin son **solo UI**. Toda `EXPO_PUBLIC_*` es extraíble del APK.
- **El cliente lee recetas de la VISTA `recetas_teaser`, no de `recetas`.** 🔴 Es `security_definer`
  **a propósito** (gatea `video_url` por usuario). **No pasarla a `security_invoker`.** Tras recrearla,
  verificar que el único grant sea `authenticated | SELECT` (recrear resetea grants; ya hubo un agujero
  que dejaba borrar el catálogo como `anon` → migración `038`). Ver `§ Advertencias que NO se resuelven`.
- **Modelo freemium**: las recetas son siempre free; `es_premium` = **el VIDEO** es premium.
  Desbloqueo 24h con rewarded (SSV con créditos). `es_premium` lo recalcula el cron
  `rotar_videos_premium()` el día 1 de cada mes; para sacar una receta de la rotación → `rotacion_grupo = 0`.
- **Migraciones nuevas** (cuando se permitan): toda tabla en `public` lleva RLS, **GRANTs explícitos**
  y policies en el mismo archivo (Supabase deja de auto-exponer tablas desde el 30-oct-2026). Toda FK a
  `auth.users` con `on delete cascade` (lo exige el borrado de cuenta).

### Edge Functions — el flag `verify_jwt`

**¿Quién llama?** Cliente con `functions.invoke` → `verify_jwt` ON. Tercero servidor a servidor →
`--no-verify-jwt` + autenticación propia.

| Función                                                                                         | Deploy                                                                   |
| ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| `revenuecat-webhook`, `ssv-recompensa`                                                          | 🔴 **`--no-verify-jwt` SIEMPRE** (sin él, ninguna compra activa premium) |
| `nutribot`, `canjear-desbloqueo`, `sincronizar-suscripcion`, `eliminar-cuenta`, `welcome-email` | verify_jwt ON                                                            |

No usar el MCP `deploy_edge_function` para el webhook (no expone `verify_jwt`). Verificar el webhook con
RevenueCat → _Send test event_ → debe responder `{"ok":true,"ignorado":"TEST"}`.
Detalle: `§ Edge Functions (Supabase)` y `§ RevenueCat — TRANSFER`.

- **NutriBot**: el API key de Anthropic nunca sale del servidor. El contexto se lee de la DB, no del
  cliente. Cupos free 20 / premium 250 (en `nutribot/index.ts`; sincronizar a mano con
  `constants/Nutribot.ts`). ⚠️ El `SYSTEM_ESTABLE` debe quedar ≥ 1.024 tokens o el caché se apaga en
  silencio. Respuestas sin markdown (se pintan con `<Text>`).
- **`sincronizar-suscripcion` solo SUBE de plan, nunca baja.** No cambiarlo.
- **`premium.tsx` no expulsa al suscriptor**: "Restaurar compras" debe seguir alcanzable.

### Anuncios (AdMob)

- **Solo para free**: todo formato es no-op si `esPremium`. Un premium que ve un ad es bug crítico.
- `react-native-google-mobile-ads` **pineado a 15.7.0** — la 16.x rompe por Kotlin 2.3. No subir.
- `lib/ads.ts` tiene fork `lib/ads.web.ts`: si cambia la API exportada, replicarla.
- En `__DEV__` siempre IDs de prueba. Detalle: `§ Anuncios (AdMob)`.

### Fase 11 — BLW / BLISS

- `recetas.metodo text[]` (`papilla`/`blw`), `forma_servido`, `nota_seguridad` (obligatorios si hay
  `blw`, constraint en la base). `perfiles_hijos.preferencia_metodo` (`papilla`|`blw`|`ambos`).
- En el detalle, el bloque de seguridad va **antes de los ingredientes y sin acordeón**.
- Filtro de método solo en `inicio` y `transicion`. Badge solo para trocitos.

## Known Gotchas (los que muerden al tocar código)

- 🔴 **`style` como función en `Pressable` NO aplica estilos** (css-interop de NativeWind). Patrón:
  `TouchableOpacity` + `View` interno con el layout. Hay regla ESLint: **no desactivarla**.
- **`KeyboardAvoidingView` se importa de `react-native-keyboard-controller`**, no de `react-native`
  (`KeyboardProvider` en `_layout.tsx`). `behavior="padding"` en ambas plataformas. El safe-area inset
  lo paga **un solo** elemento, el del borde.
- `newArchEnabled: true` obligatorio (Reanimated 4). `edgeToEdgeEnabled: true`.
- Emojis ≥ 48px en Android: `lineHeight ≈ fontSize * 1.5`. No usar `includeFontPadding: false`.
- **Deep link scheme `yummigluglu`** en `app.json`, `useAuthStore.ts` y Supabase (Site URL + Redirect
  URLs `yummigluglu://**`). En mobile la sesión del link se setea a mano en `_layout.tsx`.
- **Fechas**: `new Date('YYYY-MM-DD')` es UTC → usar `parsearFechaLocal` (`lib/saludos.ts`).
- **Builds**: `appVersionSource: remote` + `autoIncrement: true` en `production` (Play rechaza
  versionCode repetido).
- Módulos nativos nuevos → rebuild del dev client. Instalar con `npx expo install`, no `npm install`.
- `.env.local`: una variable duplicada **gana la primera**, sin error. Reemplazar la línea, no agregar.
- Fallo de emails → mirar primero los **Auth Logs** (SMTP vía Resend, dominio `yummigluglu.com`).
- **Secretos**: el JSON del Service Account vive en `C:\Users\Samuel\secretos\`, **nunca** en el repo.
  Nada de valores en `eas.json` (las env de builds viven en EAS Environment Variables).

## Videos locales (para scripts)

`D:\Proyectos\recetas\videos\` = 225 carpetas `N — Nombre` (guion largo `—`, **sin** ceros) con un mp4
igual a la carpeta. `clips\` numera **con** ceros (`001`). Comparar por valor numérico, nunca por string.
Receta BLW _n_ = carpeta `207 + n`; **la 215 está descartada y el hueco es a propósito.** Scripts en
`scripts/` (Node puro): `auditar-videos.mjs` solo reporta; ninguno borra. Detalle:
`§ Los videos locales` y `§ Las descripciones de YouTube`.

## Environment Variables (`.env.local`)

`EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`, `EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID`
(`goog_…`), `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`, `EXPO_PUBLIC_ADMIN_PASSWORD_HASH`,
`EXPO_PUBLIC_ADMOB_BANNER|INTERSTITIAL|REWARDED_ANDROID`. Sincronizar a EAS con
`eas env:push production --force`.

## Code Conventions

- `no-explicit-any` y `no-unused-vars` en `error` (prefijo `_` para ignorar). Solo `console.warn`/`error`.
- Estilos con **NativeWind** (`className`); colores desde `constants/Colors.ts`.
- **Dos registros de español**:
  - Código y comentarios: rioplatense (voseo) OK.
  - **Todo lo que ve el usuario: español NEUTRO con "tú"** (Prueba, Toca, Revisa). Nunca voseo en UI.
