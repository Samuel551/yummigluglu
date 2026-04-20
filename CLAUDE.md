# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Context

**Baby Bites** — App móvil Android de alimentación infantil con IA integrada (NutriBot). Dirigida a padres de niños 6m–5 años en Chile y LATAM hispanohablante. Producto real pensado para escalar, no solo MVP.

- Supabase project: `uoqzkbbnesmvmgbjikrn` (región: São Paulo)
- Target: Android only (por ahora)
- Código y comentarios en **español**

## Commands

```bash
# Desarrollo
npm start              # Expo dev server (localhost)
npm run android        # Lanzar en Android (requiere emulador o dispositivo)
npm run web            # Expo en navegador — útil para revisar UI sin dispositivo
npm run tunnel         # Expo con tunnel (ngrok) — para testing en dispositivo real vía datos móviles

# Calidad de código
npm run lint           # ESLint
npm run lint:fix       # ESLint con autofix
npm run format         # Prettier en todo el proyecto

# Build APK para instalar en dispositivo real (requiere EAS CLI: npm i -g eas-cli)
eas build -p android --profile development  # Dev client APK (soporta tunnel + hot reload)
eas build -p android --profile preview      # APK de prueba standalone
eas build -p android --profile production   # AAB para Google Play
```

El pre-commit hook corre `lint-staged` automáticamente (ESLint + Prettier sobre los archivos en stage).

### Testing en dispositivo real

El proyecto usa `expo-dev-client` para hot reload en dispositivo físico:

1. Instalar el APK del perfil `development` (ya buildeado e instalado)
2. Correr `npm run tunnel -- --clear` para iniciar Metro con tunnel limpio
3. Abrir la app en el cel — se conecta automáticamente via ngrok

## Development Workflow

El proyecto se desarrolla por **fases**. Al completar cada fase:

1. Probar en `npm run web` para revisión rápida de UI
2. Buildear APK con EAS para testing en dispositivo real antes de avanzar a la siguiente fase

## Estado de Fases

| Fase | Descripción                                                  | Estado       |
| ---- | ------------------------------------------------------------ | ------------ |
| 0    | Setup: Expo Router + NativeWind + Supabase + Zustand + Husky | ✅ Completa  |
| 1    | Onboarding: flujo de 3 pasos para crear perfil de hijo       | ✅ Completa  |
| 2    | Catálogo de recetas con filtros + pantalla de detalle        | ✅ Completa  |
| 3    | Favoritos con optimistic updates                             | ✅ Completa  |
| 4    | Edición de cuenta (email/password) y perfiles de hijos       | ✅ Completa  |
| 5    | Plan semanal + Lista de compras + Diario de alimentos        | ✅ Completa  |
| 6    | NutriBot IA (`asistente.tsx`)                                | 🔲 Pendiente |
| 7a   | Videos Premium (contenido real)                              | 🔲 Pendiente |
| 7b   | Integración RevenueCat (suscripciones)                       | ✅ Completa  |
| 8    | Panel de administración del developer                        | ✅ Completa  |

### Fase 6 — NutriBot IA (pendiente)

Qué falta:

- Crear `app/asistente.tsx` (presentación `modal`) — la ruta ya está mencionada en navegación pero el archivo no existe todavía.
- Edge Function `supabase/functions/nutribot/` que proxea al Anthropic API. **El API key NO va en el cliente** — vive en env vars de Supabase (`ANTHROPIC_API_KEY`). El cliente solo manda el mensaje + `profileId` y la Edge Function responde con el stream.
- Store `useAsistenteStore` con historial en memoria + persistencia en tabla `conversaciones_ia` (ya existe en el schema inicial).
- Rate limiting server-side (tokens por día por usuario) — premium ilimitado, free N mensajes/día.
- Contexto del niño auto-inyectado al prompt: edad, etapa, alergias (desde `perfiles_hijos`).

### Fase 7a — Videos Premium (pendiente)

Qué falta:

- `app/(tabs)/videos.tsx` ya existe pero solo es **upsell** — muestra un placeholder cuando el usuario es premium ("Estamos preparando el contenido"). Falta el contenido real.
- Tabla `videos` en Supabase con RLS premium (`es_premium = true` → acceso solo con suscripción activa, igual patrón que `recetas`).
- Campo `video_url` en recetas ya existe (el admin lo puede agregar desde el panel). Definir si los videos son (a) por receta, (b) standalone, o (c) ambos.
- Reproductor — evaluar `expo-video` (nuevo, reemplaza `expo-av`) vs embed YouTube. YouTube es más barato pero expone el video público; `expo-video` requiere hosting (Mux, Bunny, Cloudflare Stream).
- Store `useVideosStore` con filtros por etapa.

## Environment Variables

Crear `.env.local` en la raíz con:

```
EXPO_PUBLIC_SUPABASE_URL=https://uoqzkbbnesmvmgbjikrn.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<anon_key>
EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID=<revenuecat_android_key>
```

Sin `SUPABASE_URL` y `SUPABASE_ANON_KEY` la app lanza una excepción al arrancar (`lib/supabase.ts`). Sin `REVENUECAT_API_KEY_ANDROID` la pantalla premium carga pero sin paquetes disponibles.

`EXPO_PUBLIC_ADMIN_PASSWORD_HASH` — hash SHA-256 de la contraseña del panel admin (requerido para acceder a `/admin`). Calcular con `crypto.subtle.digest('SHA-256', ...)` en browser.

## Architecture

### Navigation — Expo Router (file-based)

```
app/
  index.tsx           # Guard: redirige a (auth)/login o (tabs) según sesión
  _layout.tsx         # Root layout: inicializa sesión Supabase, registra listeners
  onboarding.tsx      # Flujo de 3 pasos para crear el primer perfil de hijo
  (auth)/             # Stack sin sesión: login, register
  (tabs)/             # Tabs con sesión
    _layout.tsx       # Guard triple: sin sesión → login, sin perfiles → onboarding, ok → tabs
    index.tsx         # Pantalla Inicio
    recetas.tsx       # Catálogo de recetas con filtros (etapa, momento, alergenos)
    favoritos.tsx     # Favoritos del usuario
    plan.tsx          # Tab Plan semanal — genera plan 7 días + acceso a lista de compras
    videos.tsx        # Pantalla de upsell Videos Premium (ya no es tab, accesible como screen)
    perfil.tsx        # Perfiles de hijos + cuenta
  receta/[id].tsx     # Detalle de receta (presentation: card)
  lista-compras.tsx   # Lista de compras derivada del plan semanal (presentation: card)
  diario/[id].tsx     # Diario de introducción de alimentos por perfil (presentation: card)
  editar-cuenta.tsx   # Editar email + reset contraseña (accesible desde perfil)
  editar-perfil/
    [id].tsx          # Editar perfil de hijo: nombre, avatar, fecha, alergias + eliminar
  premium.tsx         # Pantalla de compra premium — RevenueCat + polling Supabase post-compra
  asistente.tsx       # NutriBot IA (presentation: modal) — pendiente de implementar
  admin/
    _layout.tsx       # Guard de password (SHA-256 contra EXPO_PUBLIC_ADMIN_PASSWORD_HASH)
    index.tsx         # Dashboard admin: lista de recetas con toggles activo/premium
    recetas.tsx       # Gestión de recetas: activar/desactivar, toggle premium, agregar video_url
```

Los íconos de tabs usan un componente `TabIcon` con emojis (definido en `(tabs)/_layout.tsx`) — Lucide u otra librería de íconos aún no está integrada.

La protección de rutas se hace **dentro de cada layout**, no con middleware. El guard en `(tabs)/_layout.tsx` tiene 3 niveles: sin sesión → `(auth)/login`, con sesión pero sin perfiles → `onboarding`, con perfiles → renderiza tabs. Mientras carga perfiles muestra un spinner para evitar flashes.

### Onboarding

`app/onboarding.tsx` — flujo obligatorio para usuarios nuevos (sin perfiles). 3 pasos:

1. Nombre + avatar emoji
2. Fecha de nacimiento → calcula `EtapaAlimentaria` automáticamente (rango válido: 4 meses a 6 años)
3. Selección de alergias (opcional)

Al crear el perfil exitosamente, hace `router.replace('/(tabs)')`. El campo `fecha_nacimiento` se guarda en ISO format (`YYYY-MM-DD`).

### State Management — Zustand

Stores independientes en `store/`:

| Store                 | Responsabilidad                                                                                                                              |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `useAuthStore`        | Sesión Supabase, login/register/logout/magic link, actualizarEmail, enviarResetContrasena                                                    |
| `usePerfilStore`      | CRUD de perfiles de hijos (crear, actualizar, eliminar), perfil activo                                                                       |
| `useRecetasStore`     | Catálogo de recetas con filtros por etapa, momento y alergenos                                                                               |
| `useFavoritosStore`   | Favoritos con **optimistic updates** — join SELECT con recetas                                                                               |
| `usePlanStore`        | Plan semanal generado por etapa/alergias, lista de compras derivada del plan                                                                 |
| `useDiarioStore`      | Diario de introducción de alimentos por perfil con optimistic delete                                                                         |
| `useSuscripcionStore` | Suscripción premium vía RevenueCat: `inicializarRevenueCat`, `comprarPremium`, `restaurarCompras`, polling post-compra                       |
| `useAdminStore`       | Gestión de recetas para el panel admin: listar, toggle activo/premium, agregar video_url                                                     |
| `useTemaStore`        | Dark mode: `tema` ('light' \| 'dark'), `setTema`, `alternar`, `hidratar`. Fuente de verdad del tema — sincroniza a nativewind y AsyncStorage |

Los stores llaman directo a Supabase — no hay capa de servicios separada todavía.

### Dark Mode

Implementado con NativeWind (`darkMode: 'class'`). El toggle vive dentro de la pantalla de perfil — NO hay botón flotante global.

- **Fuente de verdad**: `store/useTemaStore.ts` (Zustand). Expone `tema`, `setTema(t)`, `alternar()`, `hidratar()`. Cada cambio de tema sincroniza a nativewind vía `colorScheme.set()` (para que las clases `dark:` sigan funcionando) Y persiste a AsyncStorage (`baby-bites-tema`). **No leer `useColorScheme()` de nativewind directamente** — siempre pasar por el store.
- **Paleta dual** en `constants/Colors.ts` — `Colors.light` y `Colors.dark`.
- **Hook `useColoresTema()`** en `hooks/useColoresTema.ts` — suscribe a `useTemaStore` y retorna la paleta activa + `isDark`. Usar en pantallas con inline `style`.
- **Clases `dark:`** — funcionan para pantallas con `className` (auth, onboarding) porque el store llama `colorScheme.set()` en cada cambio.
- **Control de tema** — sección "APARIENCIA" dentro de `app/(tabs)/perfil.tsx` con un `Switch` que llama `setTema('dark' | 'light')` del store.
- **Hidratación** — `app/_layout.tsx` llama `hidratar()` del store una vez al montar; lee AsyncStorage y aplica el tema guardado (o `light` por default).
- **StatusBar** en `_layout.tsx` cambia entre `light`/`dark` según el tema.

**Por qué Zustand y no `useColorScheme` de nativewind**: en v4.2.3 el hook `useColorScheme` no propagaba re-renders consistentes a los componentes que derivan colores del hook (`useColoresTema` lo llamaba internamente). Resultado: el `setColorScheme` cambiaba el valor pero la UI no se actualizaba. Zustand garantiza el re-render de todos los suscriptores.

### Components

```
components/
  RecetaCard.tsx   # Card reutilizable de receta — botón ❤️/🤍 para favoritos, badge de etapa y alergenos
  BotonTema.tsx    # Toggle flotante dark/light mode (🌙/☀️)
```

### Hooks

```
hooks/
  useColoresTema.ts  # Retorna la paleta activa (Colors.light | Colors.dark) + flag `isDark`. Usar en pantallas con inline `style`.
```

Los hooks viven en `hooks/`. Cuando una pantalla ya resuelve colores vía NativeWind `className` con prefijo `dark:`, no necesita el hook. El hook existe para pantallas con inline `style` donde no se puede expresar dark mode con clases.

### Supabase

- Cliente singleton en `lib/supabase.ts`, usando `AsyncStorage` para persistir sesión
- RLS habilitado en todas las tablas — las políticas garantizan que cada usuario solo ve sus datos
- **El acceso a recetas premium es enforced por RLS** (`supabase/migrations/002_recetas_rls_premium.sql`), no solo en cliente. La verificación en `useSuscripcionStore.esPremium` es solo para UI.
- `useSuscripcionStore.calcularEsPremium()` es local/optimista — la fuente de verdad es la tabla `suscripciones` actualizada por el webhook de RevenueCat

### Edge Functions (Supabase)

`supabase/functions/revenuecat-webhook/` — recibe eventos de RevenueCat (INITIAL_PURCHASE, RENEWAL, CANCELLATION, etc.) y actualiza la tabla `suscripciones` usando `service_role` (el cliente nunca escribe directamente en esa tabla). Deploy: `supabase functions deploy revenuecat-webhook`. Requiere vars de entorno en Supabase: `REVENUECAT_WEBHOOK_SECRET`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`.

**Hardening del webhook (4 defensas — manejan datos de pago, no romper):**

1. **Comparación timing-safe del secret** — `timingSafeEqual()` en lugar de `===`. RevenueCat NO ofrece firma HMAC (verificado en doc oficial), solo shared secret en `Authorization`. El compare manual es la única defensa contra timing attacks sobre el secret.
2. **Validación + verificación del `app_user_id`** — regex de UUID antes de tocar DB, luego `supabase.auth.admin.getUserById(userId)`. Si el user no existe, devolver 404 (RC no reintenta 4xx). Aunque la FK de `suscripciones.user_id → auth.users` ya bloquea inserts inválidos, el chequeo explícito evita el round-trip y devuelve un código limpio.
3. **Idempotencia via `webhook_events_procesados`** — tabla con `event_id` como PK. Antes de procesar, query si ya existe → si sí, retornar `{ ok: true, ignorado: 'duplicado' }`. Después del upsert exitoso, INSERT del event_id (PK race-safe — código `23505` es esperado en concurrencia y se ignora). Migración en `006_webhook_security_hardening.sql`. RLS habilitado sin policies → solo `service_role` accede.
4. **Operacional — secret rotado y largo** — `REVENUECAT_WEBHOOK_SECRET` debe ser ≥ 32 chars random. Vive solo en Supabase Edge Function secrets (`supabase secrets set REVENUECAT_WEBHOOK_SECRET=...`) y en RevenueCat Dashboard → Integrations → Webhooks. **NUNCA en el repo, ni en `.env.local`, ni en logs.** Si hay sospecha de filtración: rotar inmediatamente en ambos lados (Supabase + RC dashboard).

**Lo que estas defensas NO previenen** (limitaciones de RC): si el secret se filtra, un atacante puede activar/desactivar premium para users **existentes** (no inventar IDs). El daño máximo es regalar premium o bloquear suscripciones legítimas — no exfiltrar datos de tarjetas (esos viven en RC/Stripe, nunca en nuestra DB).

### Libraries (`lib/`)

```
lib/
  supabase.ts   # Cliente singleton con AsyncStorage — explota si faltan EXPO_PUBLIC_SUPABASE_URL/ANON_KEY
  errores.ts    # mensajeError(error) → string user-facing en español neutro
```

`lib/errores.ts` es la fuente única para traducir errores de Supabase a mensajes user-facing. Tiene dos mapas: `MENSAJES_POR_CODE` (match exacto contra `error.code` — códigos modernos de Supabase auth como `over_email_send_rate_limit`, `weak_password`, `user_already_exists`) y `MENSAJES_POR_TEXTO` (match por substring contra `error.message` — para errores legacy o de red). Siempre loguea el error original vía `console.warn` antes de traducir, para no perder el detalle al debuggear. Cuando aparezca un error nuevo que no matchea ningún patrón, agregarlo acá — NO hacer try/catch con mensajes custom en cada store.

### Typing

Todos los tipos de dominio en `types/index.ts`. Los tipos de Supabase Auth (`Session`, `User`) vienen de `@supabase/supabase-js` directamente.

Path alias `@/` apunta a la raíz del proyecto (configurado en `tsconfig.json`).

### Constants / Domain Data

```
constants/
  Etapas.ts    # ETAPAS[], calcularEtapaPorEdad(), getEtapaInfo()
  Alergias.ts  # ALERGENOS[], ALERGENO_IDS, getAlergenoById()
  Colors.ts    # Paleta de colores de la app
  Semana.ts    # DIAS_SEMANA, MOMENTOS_DIA, getLunesDeSemana(), formatearRangoSemana(), helpers de navegación semanal
```

Las etapas alimentarias son: `inicio` (6–8m), `transicion` (9–12m), `preescolar` (13m+).

### Database Schema

Tablas principales (`supabase/migrations/001_initial_schema.sql`):

- `perfiles_hijos` — hijos del usuario (etapa, alergias, avatar_emoji)
- `recetas` — catálogo, con `ingredientes` y `pasos` en JSONB, e `es_premium` flag
- `favoritos` — relación user ↔ receta ↔ perfil_hijo (UNIQUE por user+receta)
- `conversaciones_ia` — historial de NutriBot (mensajes en JSONB)
- `suscripciones` — plan free/premium/premium_anual, actualizada por webhook de RevenueCat (Edge Function)

Índices GIN en arrays (`etapas_compatibles`, `alergenos`, `momento_dia`, `tags`) para filtros eficientes.

## Known Gotchas

### NativeWind en Android — historial de problemas (RESUELTO)

NativeWind v4.0.36 + css-interop v0.1.21 tenían 5 bugs encadenados en Windows que impedían que los estilos se aplicaran en Android. Se intentó parchar manualmente pero no fue suficiente. **La solución fue actualizar a NativeWind v4.2.3 + css-interop v0.2.3** — los patches manuales fueron eliminados.

**IMPORTANTE**: Usar **dev client** (no Expo Go) para testing en dispositivo. NativeWind v4 depende de un transformer custom de Metro que puede tener problemas en Expo Go. Siempre probar con el APK del perfil `development`.

### `newArchEnabled` en app.json

**DEBE estar en `true`**. `react-native-reanimated` v4.x lo requiere obligatoriamente para Android — si está en `false`, el build de Gradle falla con `assertNewArchitectureEnabledTask`. Estuvo temporalmente en `false` durante diagnóstico de NativeWind pero ya se reactivó.

### `edgeToEdgeEnabled` en app.json

`android.edgeToEdgeEnabled` está en `true`. En Expo SDK 54 puede requerir `expo-edge-to-edge` como dependencia. Si el build de Android falla en Gradle sin error claro, este es un sospechoso — probar con `false` o instalar el paquete.

### Supabase Auth — flujo completo de deep links (LEER si tocás auth)

El flujo de confirmación de email / magic link / reset password en mobile tiene **3 piezas** que TIENEN que estar bien o el usuario termina en `localhost:3000` (o el deep link no se procesa):

**1) Código (`store/useAuthStore.ts`) — ya OK**
Los métodos `signUp`, `signInWithOtp` y `resetPasswordForEmail` pasan `emailRedirectTo: Linking.createURL('/', { scheme: 'babybites' })`. En web usa `window.location.origin`.

**2) Supabase Dashboard → Authentication → URL Configuration — CRÍTICO**

- **Site URL**: `babybites://` (NO dejar el default `http://localhost:3000`).
- **Redirect URLs (whitelist)**: agregar `babybites://**` y `babybites://*`.

> ⚠️ Si la URL que manda el código (`emailRedirectTo`) **no matchea ninguna entry de la whitelist**, Supabase la **ignora silenciosamente** y usa el Site URL como fallback. Por eso aunque el código esté perfecto, si la whitelist no tiene `babybites://**`, el email termina mandando al user a `localhost:3000` con `ERR_CONNECTION_REFUSED`.

**3) Handler de deep link (`app/_layout.tsx`) — ya OK**
En React Native, `detectSessionInUrl` del cliente Supabase **solo funciona en web**. En mobile hay que parsear manualmente el fragment de la URL (`babybites://#access_token=XXX&refresh_token=YYY&type=signup`) y llamar `supabase.auth.setSession({ access_token, refresh_token })`. El handler ya está montado en `_layout.tsx` con `Linking.getInitialURL` (cold start) + `Linking.addEventListener('url', ...)` (warm).

**Para debuggear**: si el usuario hace click en el link y NO queda logueado, mirar consola para `Error procesando deep link de auth:` que loguea el handler. Causas comunes: token expirado (Supabase los hace expirar en 1h), URL sin fragment (chequear que Site URL en dashboard sea el deep link y no una URL https), `verifyOtp` requerido en vez de `setSession` (algunos flujos legacy).

### RevenueCat — polling post-compra

Después de `comprarPremium()` o `restaurarCompras()`, el store hace polling a Supabase hasta 10 veces con intervalos de 1 segundo esperando que el webhook de RevenueCat actualice la tabla `suscripciones`. En producción el webhook tarda < 5 segundos. Si `esPremium` no cambia en 10s, la compra se completa igualmente en RC pero la UI no lo reflejará hasta el próximo `cargarSuscripcion()`.

### `cli.appVersionSource` en eas.json

EAS CLI ya advierte que `cli.appVersionSource` será requerido. Agregar `"appVersionSource": "remote"` (o `"local"`) dentro de `"cli"` en `eas.json` para evitar el warning y futuros errores.

### UI de auth — patrón canónico de formularios

**Patrón unificado (ya aplicado en login y register)**: `KeyboardAvoidingView` (behavior `padding` en ambas plataformas, `keyboardVerticalOffset={24}` en Android) → `ScrollView` con `ref`, `keyboardShouldPersistTaps="handled"` y `contentContainerClassName="flex-grow justify-center px-6 py-10"` → contenido. Cada `TextInput` dispara `setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100)` en su `onFocus`.

- **Por qué `setTimeout(..., 100)`**: el teclado se abre asíncrono — sin el delay el `scrollToEnd` corre antes de que el layout se ajuste y queda corto.
- **Por qué `behavior: 'padding'` en Android** (no el default `'height'`): con `'height'` el `ScrollView` se recortaba y el header quedaba cortado arriba en pantallas chicas tipo Galaxy S20 (ver captura `s20-login.png` en la raíz).
- **Por qué `keyboardShouldPersistTaps="handled"`**: para que tocar fuera de un input cierre el teclado pero los `TouchableOpacity` (toggle 🙈/👁️, botones de modo) sigan respondiendo al primer tap.
- **Replicar este patrón** en cualquier form nuevo con 2+ inputs (`editar-cuenta.tsx`, `editar-perfil/[id].tsx`, etc.).

### Emojis grandes en Android — `lineHeight` > `fontSize`

Algunos emojis tienen glifos que sobresalen del bounding box vertical de la fuente (ej. 🍼 tiene la tetina arriba, 🍦 el helado, 🎂 las velas). En Android, React Native recorta el `Text` al `lineHeight` calculado a partir del `fontSize` — y esos glifos quedan **cortados arriba**. iOS no tiene este bug.

**Regla**: para emojis con `text-5xl` o más grandes (≥ 48px), pasar `style={{ lineHeight: <fontSize * 1.5> }}` para darle aire vertical. Ejemplo: `text-6xl` (60px) → `lineHeight: 90`. Aplicado en `app/(auth)/login.tsx` para el 🍼. Si aparecen otros emojis grandes (header de onboarding, premium, etc.) y se ven cortados, aplicar lo mismo.

NO usar `includeFontPadding: false` para "compactar" — hace lo opuesto: quita el padding interno de la fuente Android y empeora el recorte.

### Supabase Auth — límite de emails en el plan free

El plan free de Supabase incluye un sender SMTP de cortesía con un rate limit muy bajo (~3-4 emails/hora por proyecto). Durante testing de registro / magic link / reset password es fácil chocar el límite y los nuevos usuarios **dejan de recibir el email de confirmación**, lo que bloquea la creación de cuentas (la llamada `registrarse` en `useAuthStore` no falla — Supabase responde 200 — pero el usuario nunca se confirma porque el correo nunca llega).

**Recomendación pendiente de aplicar (NO está hecho todavía)**: configurar [Resend](https://resend.com) como SMTP custom en Supabase Dashboard → Project Settings → Auth → SMTP Settings.

- Resend free: 3.000 emails/mes y 100/día — más que suficiente para dev y producción temprana.
- Requiere verificar dominio en Resend (DNS: SPF + DKIM) o usar el sandbox `onboarding@resend.dev` para pruebas iniciales.
- Una vez configurado el SMTP custom, Supabase deja de aplicar su rate limit interno y los emails los firma tu dominio.

Mientras esto no esté hecho, **evitar tandas de tests de auth seguidos** y avisar al usuario si pide crear varias cuentas — es muy probable que el correo de confirmación no llegue por rate limit y no por un bug en el código.

## Code Conventions

- `no-explicit-any` está en `error` — nunca usar `any`
- `no-unused-vars` en `error` — prefix `_` para ignorar args
- `no-console` en `warn` — solo `console.warn` y `console.error` permitidos
- Estilos con **NativeWind** (Tailwind para React Native) — clases CSS en `className`
- **Dark mode** habilitado (`darkMode: 'class'` en `tailwind.config.js`). Toggle flotante 🌙/☀️ en esquina superior derecha (componente `BotonTema`). Para pantallas con `className`, usar prefijo `dark:`. Para pantallas con inline `style`, usar el hook `useColoresTema()` de `hooks/useColoresTema.ts` que devuelve la paleta activa.
- Colores de UI desde `constants/Colors.ts` — tiene paleta `light` y `dark`. Hook `useColoresTema()` retorna la paleta correcta según el tema activo.
- **Español — dos registros distintos**:
  - **Código, nombres de variables/funciones y comentarios**: español rioplatense (voseo) está OK — es el estilo del proyecto.
  - **Textos user-facing (UI, copy, mensajes de error, placeholders, labels, notificaciones)**: español **NEUTRAL** con "tú" (Prueba, Intenta, Toca, Ve, Revisa). **NO** usar voseo/rioplatense en nada que vea el usuario final (nada de "Probá", "Revisá", "Tocá", "Andá"). Esto aplica a toda la app — auth, onboarding, recetas, errores en `lib/errores.ts`, etc. El público objetivo es LATAM hispanohablante, no solo Argentina.
