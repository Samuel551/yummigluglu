# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Context

**Yummi Glu Glu** — App móvil Android de alimentación infantil con IA integrada (NutriBot). Dirigida a padres de niños 6m–5 años en Chile y LATAM hispanohablante. Producto real pensado para escalar, no solo MVP.

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

| Fase | Descripción                                                  | Estado      |
| ---- | ------------------------------------------------------------ | ----------- |
| 0    | Setup: Expo Router + NativeWind + Supabase + Zustand + Husky | ✅ Completa |
| 1    | Onboarding: flujo de 3 pasos para crear perfil de hijo       | ✅ Completa |
| 2    | Catálogo de recetas con filtros + pantalla de detalle        | ✅ Completa |
| 3    | Favoritos con optimistic updates                             | ✅ Completa |
| 4    | Edición de cuenta (email/password) y perfiles de hijos       | ✅ Completa |
| 5    | Plan semanal + Lista de compras + Diario de alimentos        | ✅ Completa |
| 6    | NutriBot IA (`asistente.tsx`)                                | ✅ Completa |
| 7a   | Videos Premium (embed YouTube por receta)                    | ✅ Completa |
| 7b   | Integración RevenueCat (suscripciones)                       | ✅ Completa |
| 8    | Panel de administración del developer                        | ✅ Completa |
| 9    | Anuncios AdMob (banner + intersticial + rewarded desbloqueo) | ✅ Completa |

> **Fase 9 — Anuncios**: código completo y backend desplegado. Falta trabajo del owner para verlos en el dispositivo: rebuild del dev client + crear los ad units en AdMob. Ver sección "Anuncios (AdMob)".

## Estado al 2026-08-19 — qué falta y qué NO hay que tocar

**Del lado del código no queda deuda**: 0 errores de `tsc`, 0 `style` como función (hay regla de ESLint que lo impide), 0 agujeros de seguridad conocidos.

**Prueba cerrada COMPLETA** (2026-08-19): los 3 requisitos tachados en Play Console — versión publicada, 12+ verificadores, 14 días corridos. **Solicitud de acceso a producción enviada**, Google revisa en 7 días o menos. Producción sigue figurando **"Inactivo"** hasta que aprueben.

### ⏰ Deadlines de Google — con fecha, no negociables

| Fecha           | Qué                                            | Estado                                   |
| --------------- | ---------------------------------------------- | ---------------------------------------- |
| **31 ago 2026** | **Play Billing Library ≥ 8**                   | 🔴 Aviso rojo activo desde el 2026-08-04 |
| **30 sep 2026** | **Verificación de desarrolladores de Android** | 🟡 Confirmar en el Home de Play Console  |

**Play Billing 8** — el código ya cumple: `react-native-purchases@^10.6.0` (commit `f8534cd`). ⚠️ **El aviso NO se apaga al arreglar `package.json`: se apaga al subir un AAB compilado con esa librería.** Como producción está "Inactivo", el AAB va a la **pista de prueba cerrada**, que no requiere aprobación previa y alcanza para apagar el aviso. **No atar este deadline al trámite de acceso a producción.**

**Verificación de desarrolladores** — requisito nuevo, notificación del 2026-08-06. Google registró **automáticamente el 99% de las apps de Play**: la acción real es **entrar al Home de Play Console y confirmar el estado**, y registrar a mano solo si Yummi quedó fuera de ese 99%. Enforcement inicial en Brasil, Indonesia, Singapur y Tailandia; expansión global en 2027. Las apps sin registrar quedan **no instalables en dispositivos certificados de los países afectados**.

### 🔒 Las 4 tareas bloqueadas hasta PRODUCCIÓN

Todas dependen de que la app esté **publicada públicamente**. Verificado el 2026-08-05 — **no insistir antes**:

| Tarea                                   | Por qué no se puede antes                                                                             |
| --------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Vincular AdMob ↔ ficha de Play          | El buscador de AdMob solo ve el **catálogo público** de Play; una app en prueba cerrada no aparece.   |
| Validar **`app-ads.txt`**               | AdMob lo rastrea desde el sitio del desarrollador **de la ficha vinculada** → depende de la anterior. |
| Productos de suscripción → entitlements | Requiere acceso a producción en Play Console.                                                         |
| Service Account de Play → RevenueCat    | Decisión del owner: se hace al pasar a producción, junto con el resto del cobro.                      |

**Qué falta** → `docs/checklist-produccion.md` § "Bloqueado hasta PRODUCCIÓN".
**Cómo se hace** → 📕 **`docs/runbook-produccion.md`** — runbook del día D, con los valores ya
verificados (package, publisher de AdMob, dominio, dependencias). Se ejecuta de arriba hacia abajo.

> ✅ **El paso 0 del runbook NO está bloqueado**: `yummigluglu.com` ya está registrado en Cloudflare,
> así que publicar las 4 páginas de `web/` en el dominio propio se puede hacer **hoy**, sin esperar a
> Google. Hoy `index.html` y `app-ads.txt` siguen sin publicar.

> 🔴 **El paso 5 (QA de compras) no se saltea**: `react-native-purchases` saltó de `^8.9.0` a
> `^10.6.0` y **ese flujo nunca se reprobó en dispositivo**.

> ⚠️ Mientras tanto AdMob muestra **"Estado de aprobación: Debe revisarse"** y sirve pocos anuncios (_limited ad serving_). **Es la consecuencia esperada de no tener la ficha vinculada, no un bug.**

### 🔴 Advertencias que NO se resuelven — son intencionales

El linter de seguridad de Supabase marca cosas que **están así a propósito**. Antes de "arreglar" una, leer esto:

| Advertencia                                                                             | Por qué se deja                                                                                                            |
| --------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `security_definer_view` en **`recetas_teaser`**                                         | 🔴 **NO tocar.** Es lo que gatea `video_url`. Cambiarla **rompe el desbloqueo de videos**. Ver abajo.                      |
| `rls_enabled_no_policy` en `webhook_events_procesados` y `ssv_transacciones_procesadas` | RLS activo sin policies = solo `service_role`. Es el diseño buscado.                                                       |
| `anon_security_definer_function_executable` (varias)                                    | `stats_admin()` valida `es_admin()` adentro; las demás son funciones de **trigger**, que Postgres no deja invocar por RPC. |
| `auth_leaked_password_protection`                                                       | Requiere **plan Pro**. El proyecto está en Free.                                                                           |

**Sobre `recetas_teaser` en particular**: la vista necesita leer `suscripciones` y `desbloqueos_temporales` para decidir si muestra el video. Con `security_invoker` correría con los permisos del usuario y **las RLS de esas tablas la bloquearían** — la vista dejaría de poder decidir. Con `security_definer` corre con permisos del creador, **pero `auth.uid()` sigue siendo el del usuario que consulta**, así que el gateo sigue siendo por-usuario. El `grant` es solo para `authenticated`. El linter ve el patrón y avisa; no puede saber que el gateo está dentro de la vista.

### Fase 6 — NutriBot IA (implementada)

Chat de alimentación infantil sobre el Anthropic API (`claude-sonnet-5`). **El API key NUNCA sale del servidor**: vive en los secrets de Supabase (`ANTHROPIC_API_KEY`) y solo lo usa la Edge Function.

Piezas:

- **`supabase/functions/nutribot/index.ts`** — el único que habla con Anthropic. Identidad por JWT (no confía en ningún id del body), cupo mensual consumido atómicamente ANTES de gastar un token, topes duros de tamaño sobre todo lo que manda el cliente, y el perfil del niño leído de la DB verificando propiedad.
- **`app/asistente.tsx`** (presentación `modal`) + **`store/useAsistenteStore.ts`**.
- Migraciones `028` (cupo), `029` (devolución de crédito), `030` (historial de conversaciones).
- **`constants/Nutribot.ts`** — cupos para pintar la UI. Se sincronizan A MANO con los del servidor; si cambiás uno, cambiá el otro.

**Cupos mensuales: free 20, premium 250.** Los valores que rigen son los **defaults del código** en `nutribot/index.ts` — las env vars `NUTRIBOT_LIMITE_*` **no están seteadas** en Supabase (verificado con `supabase secrets list`), así que para cambiar un cupo alcanza con editar el archivo y redesplegar. Si algún día se setean esas env vars, pasan a ganar ellas.

**Costos (medidos el 2026-08-02):** ~**$0.0083 por mensaje** a precio estándar. Peor caso mensual por usuario que agote su cupo: **$0.17 free**, **$2.08 premium**. Ojo con el razonamiento: **el cupo es un TECHO, no un consumo** — un usuario promedio manda 3-5 mensajes y cuesta lo mismo con cupo de 20 que de 15. Bajar el cupo free no ahorra plata real; solo baja el techo del peor caso, y contra un abusador 20 protege igual que 15.

> 🔴 **Claude Sonnet 5 está en precio introductorio hasta el 2026-08-31** ($2/$10 por millón de tokens). Desde el **1 de septiembre de 2026** pasa a $3/$15 — **los costos de NutriBot suben ~50% solos, sin tocar una línea.** No asustarse con la factura de septiembre.

> ⚠️ **El prompt caching tiene poco margen.** El `SYSTEM_ESTABLE` mide ~**1.618 tokens** y el mínimo cacheable de Sonnet 5 son **1.024**. Si se recorta ese prompt, **deja de cachear EN SILENCIO** (sin error) y el input pasa a costar 10x. Antes de acortarlo, medir; verificar con `usage.cache_read_input_tokens > 0` en el segundo turno.

**Historial de conversaciones — UNA FILA DE `conversaciones_ia` = UNA CONVERSACIÓN.**

`conversaciones_ia.id` ES el id de la conversación; la Edge Function le hace APPEND a `mensajes` en cada turno. El cliente solo LEE (panel de historial) y BORRA; escribir es exclusivo de la Edge Function con `service_role`.

> ⚠️ **El contexto que se le manda a Anthropic sale de la DB, NO del array del cliente.** Si viene `conversacionId`, la función lee `mensajes` de la fila filtrando por `user_id` y usa eso. Es una defensa de seguridad, no una optimización: si el contexto viniera del cliente, un cliente modificado podría inventarle turnos que nunca ocurrieron ("me dijiste que la miel es segura a los 6 meses"). En una app de alimentación infantil eso es riesgo de daño real. El `historial` que manda el cliente quedó SOLO como fallback si la DB no responde.

> ⚠️ **Nunca escribir `historial` en la persistencia.** Viene recortado a `MAX_TURNOS_HISTORIAL` (10): guardarlo truncaría la conversación a 10 mensajes en cada turno. El append va sobre lo leído de la DB. Este fue exactamente el bug de la versión original (hacía `insert` por mensaje con el historial completo → crecimiento cuadrático y ninguna fila con la charla entera); lo arregló la migración `030`.

El **título** se deriva de las primeras palabras del primer mensaje del usuario (`derivarTitulo`), sin llamar a la IA: costo cero y sin latencia. El historial es para **todos**, sin distinción free/premium.

**Formato de las respuestas**: la app las pinta con `<Text>` plano, que **no interpreta markdown**. El system prompt le prohíbe explícitamente `**negrita**`, `#` y backticks (permite guiones para listas). Si aparecen asteriscos en pantalla, el fix va en el prompt, no en un renderizador.

### Fase 7a — Videos Premium (implementada)

**Arquitectura elegida: NO hay tabla `videos` separada.** Cada video vive como campo `video_url` **dentro de la receta** (embed de YouTube). Modelo (a) "por receta". El contenido se carga desde el panel admin — no requiere código, es data entry.

Piezas ya construidas:

- **`app/(tabs)/videos.tsx`** — vista dual: `VistaPremium` (lista todas las recetas activas con `video_url`, filtradas por etapa del perfil activo, con thumbnail de YouTube) y `VistaPaywall` (upsell para usuarios free). Ya NO es placeholder.
- **`app/receta/[id].tsx`** — reproductor embebido con `react-native-youtube-iframe` en un `Modal`. El modal respeta proporción **9:16 vertical** (pensado para YouTube **Shorts**). Tiene gate premium: receta `es_premium && !esPremium` → muestra card 🔒 que lleva a `/premium`; si es premium o la receta es gratis → botón ▶ que abre el video.
- **`app/admin/receta-form.tsx`** — el admin carga **URL de imagen** (`imagen_url`) y **Video URL** (`video_url`) por receta, más el toggle `es_premium`. Este es el flujo de carga de contenido.
- **`lib/youtube.ts`** — `extraerVideoId(url)` (soporta `watch?v=`, `youtu.be/`, `/embed/`, `/shorts/`) y `urlThumbnail(videoId)` (hqdefault).

**Gotcha de YouTube no listado (LEER antes de cargar videos en masa):** los videos en "no listado" se embeben OK, pero solo si tienen **"Permitir insertar" (Allow embedding)** activado. Si el video se marca como **"Contenido para niños" (Made for Kids)**, YouTube restringe funciones de embed. Siendo app de comida para bebés, es tentador marcarlos así — **NO hacerlo**. Probar un video embebido en el dispositivo real antes de cargar el lote completo.

Lo único que "queda" de la Fase 7a es carga de datos (links + imágenes por receta), que es trabajo del owner en el panel admin, no de código.

## Environment Variables

Crear `.env.local` en la raíz con:

```
EXPO_PUBLIC_SUPABASE_URL=https://uoqzkbbnesmvmgbjikrn.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<anon_key>
EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID=<revenuecat_android_key>
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=<google_web_client_id>.apps.googleusercontent.com
EXPO_PUBLIC_ADMOB_BANNER_ANDROID=ca-app-pub-XXX/YYY
EXPO_PUBLIC_ADMOB_INTERSTITIAL_ANDROID=ca-app-pub-XXX/YYY
EXPO_PUBLIC_ADMOB_REWARDED_ANDROID=ca-app-pub-XXX/YYY
```

Sin `SUPABASE_URL` y `SUPABASE_ANON_KEY` la app lanza una excepción al arrancar (`lib/supabase.ts`). Sin `REVENUECAT_API_KEY_ANDROID` la pantalla premium carga pero sin paquetes disponibles.

`EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` — el **Web Client ID** de Google Cloud (público, no secreto). Lo usa `GoogleSignin.configure()` en `useAuthStore.ts`. Sin él, el botón "Continuar con Google" no funciona (la config se saltea por el guard). Ver sección "Google Sign In".

`EXPO_PUBLIC_ADMIN_PASSWORD_HASH` — hash SHA-256 de la contraseña del panel admin (requerido para acceder a `/admin`). Calcular con `crypto.subtle.digest('SHA-256', ...)` en browser.

`EXPO_PUBLIC_ADMOB_*` — IDs de las unidades de anuncio de AdMob (banner, intersticial, rewarded) para Android. **Solo se usan en producción**: en `__DEV__` el código usa SIEMPRE los IDs de prueba de Google (evita clicks inválidos). Si faltan en prod, hace fallback a los IDs de test (inofensivo). Ver sección "Anuncios (AdMob)". El **App ID** de AdMob (el que empieza con `~`) NO va acá — va en `app.json` (plugin `react-native-google-mobile-ads`, se hornea al buildear).

> **Dev client vs producción** (RESUELTO el 2026-08-02): el build `development` usa Metro local, que lee `.env.local` y hornea las `EXPO_PUBLIC_*` al bundlear. Los builds `preview`/`production` no tienen Metro, así que sus variables viven en **EAS Environment Variables** (`eas env:list --environment production`), y `eas.json` ata cada perfil al suyo con `"environment": "preview" | "production"`. Las 8 variables ya están cargadas en ambos environments.
>
> Para sincronizar tras cambiar `.env.local`: `eas env:push production --force` (lee `.env.local` por defecto). **NO** usar un bloque `env` con valores dentro de `eas.json`: ese archivo se commitea y **el repo es público**.
>
> ⚠️ **Toda `EXPO_PUBLIC_*` se hornea en el bundle JS y es extraíble de cualquier APK** — no son secretos, ni en EAS ni en ningún lado. Por eso el gate del panel admin (`EXPO_PUBLIC_ADMIN_PASSWORD_HASH`) es **solo cosmético**: la autorización real la hace RLS con `es_admin()`, que verifica `user_id` contra la tabla `admins`. Nunca mover una decisión de autorización al cliente.

> ✅ **Key de RevenueCat de producción (resuelto el 2026-08-02).** `EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID` empieza con `goog_`, sincronizada en `.env.local` y en los environments `production` y `preview` de EAS. Antes era una `test_` (sandbox): las compras **no se procesan de verdad** con esa, y el síntoma **no aparece en desarrollo**. La key `goog_` se genera **sola** al crear la app de Google Play Store en RevenueCat (Apps & providers) — no hay botón para crearla, y **no confundirla con el "REST API Identifier"** (`app…`) ni con una "Secret API key" (esa NUNCA va en el cliente).
>
> 🔴 **Sigue faltando para cobrar: el Service Account de Google Play.** La app de Play Store en RevenueCat existe pero sin `Service Account Credentials JSON`, así que **RevenueCat todavía no puede validar las compras contra Google**. Ese JSON sale de Google Cloud (proyecto `yummi-glu-glu`, el mismo del login con Google) + Play Console → _Users and permissions_, así que **está atado a abrir la Play Console**. Mismo requisito para conectar las _Google developer notifications_ (que RevenueCat se entere de renovaciones y cancelaciones al instante en vez de por sondeo).

> ⚠️ **En un `.env` una variable duplicada NO da error y gana la PRIMERA.** Costó una vuelta: al reemplazar la key de RevenueCat quedó la vieja arriba y la nueva abajo, y el parser seguía tomando la de sandbox en silencio. Al editar `.env.local`, **reemplazar la línea, no agregar otra**, y verificar con:
>
> ```bash
> node -e "const d=require('fs').readFileSync('.env.local','utf8'),k=[...d.matchAll(/^\s*([A-Z0-9_]+)\s*=/gm)].map(m=>m[1]);console.log('duplicados:',k.length-new Set(k).size)"
> ```

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
    videos.tsx        # Videos Premium — VistaPremium (lista recetas con video_url) o VistaPaywall (free). Ver Fase 7a
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

- **Fuente de verdad**: `store/useTemaStore.ts` (Zustand). Expone `tema`, `setTema(t)`, `alternar()`, `hidratar()`. Cada cambio de tema sincroniza a nativewind vía `colorScheme.set()` (para que las clases `dark:` sigan funcionando) Y persiste a AsyncStorage (`yummigluglu-tema`). **No leer `useColorScheme()` de nativewind directamente** — siempre pasar por el store.
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

`supabase/functions/canjear-desbloqueo/` — concede un desbloqueo temporal de 24h de una receta premium tras un anuncio recompensado (rewarded). Identifica al usuario por su JWT (no confía en ids del body), valida que la receta sea premium, y hace upsert en `desbloqueos_temporales` con `service_role` (el cliente NO puede escribir esa tabla). Deploy: `supabase functions deploy canjear-desbloqueo` (verify_jwt ON). Ver sección "Anuncios (AdMob)".

`supabase/functions/eliminar-cuenta/` — borra la cuenta del usuario. **Requisito de Google Play**: toda app con registro debe ofrecer eliminación de cuenta dentro de la app, no solo por correo. Deploy: `supabase functions deploy eliminar-cuenta` (verify_jwt ON).

Existe como Edge Function porque tocar `auth.users` requiere `service_role`. Dos defensas: identidad **solo por JWT** (nunca acepta un id del body — si no, cualquiera con sesión borraría la cuenta ajena) y `confirmar: true` explícito en el body, para que un reintento de red no borre una cuenta.

> ✅ **Un solo `deleteUser` alcanza: las 12 tablas de `public` referencian `auth.users(id) ON DELETE CASCADE`** (verificado contra el catálogo). Borrar tabla por tabla sería más frágil y dejaría huérfanos el día que se agregue una tabla nueva y alguien olvide sumarla a la función. **Si creás una tabla con `user_id`, la FK va con `on delete cascade`** — es lo que sostiene el borrado de cuenta.

> ⚠️ **Tras borrar, el `signOut` del cliente va con `scope: 'local'`** (`useAuthStore.eliminarCuenta`). El usuario ya no existe en el servidor: un signOut global responde 401 y puede dejar la sesión viva en AsyncStorage. El scope local igual emite `SIGNED_OUT`, que es lo que dispara la limpieza de RevenueCat y desbloqueos en `_layout.tsx`.

> ⚠️ **`supabase.functions.invoke` NO propaga el cuerpo del error**: ante un 4xx/5xx devuelve un `FunctionsHttpError` con el mensaje genérico _"non-2xx status code"_. Por eso el store loguea el original y muestra un mensaje propio en español — no encadenar `mensajeError(error)` esperando el detalle real.

**UI**: `app/editar-cuenta.tsx`, sección "ELIMINAR CUENTA", con doble `Alert` de confirmación. Tiene fila propia en `perfil.tsx` → CUENTA → "Eliminar cuenta" aunque lleve a la misma pantalla que Email/Contraseña: **Google exige que la eliminación sea fácil de encontrar**, y escondida detrás de "Email" no lo es. La página pública `web/eliminar-cuenta.html` describe este flujo como método principal y deja el correo como alternativa para quien desinstaló la app.

> ⚠️ **Eliminar la cuenta NO cancela la suscripción de Google Play** — eso se hace solo desde Play. Está avisado en la pantalla, en el segundo `Alert` y en la página pública. No sacarlo: es la confusión más cara que puede tener un usuario que cree haber cancelado el cobro.

### Anuncios (AdMob)

Monetización de usuarios **free** con `react-native-google-mobile-ads`. Set "lean" (banner + intersticial capeado + rewarded opt-in). **Público declarado en Play: adultos/padres** — NO dirigido a niños (evita las restricciones de la política de familias de AdMob). Rating de ads limitado a **PG** (brand-safe para app de bebés).

**Regla de oro innegociable**: los anuncios van SOLO para free. Todo formato hace `null`/no-op si `useSuscripcionStore.esPremium`. Un premium que ve un ad es un bug crítico.

**Módulo NATIVO** → no existe en web ni en dev client sin recompilar. Todo se carga perezosamente con guard de plataforma (`lib/ads.ts` → `cargarModuloAds()`), patrón defensivo idéntico a RevenueCat: si no está disponible, no-op silencioso (no crashea). **Agregar los ads requiere rebuild del dev client** (`eas build -p android --profile development`).

> ⚠️ **Web se salva con un fork por plataforma, NO con el guard de runtime.** Metro arma el grafo de dependencias por análisis estático: el `require('react-native-google-mobile-ads')` literal de `ads.ts` entra al bundle web aunque esté detrás de `Platform.OS === 'web'` (el guard protege runtime, no bundleo) → `Web Bundling failed: Importing native-only module`. Por eso existe `lib/ads.web.ts` (no-op, misma API) — Metro prefiere `.web.ts` al bundlear web y `ads.ts` queda fuera del grafo. **Si cambiás la API exportada de `ads.ts`, replicala en `ads.web.ts`.** Mismo patrón si algún día otro módulo nativo se importa con string literal fuera de componentes native-only.

> ⚠️ **Versión PINEADA a `react-native-google-mobile-ads@15.7.0` (exacta) — NO subir a 16.x.** La 16.x trae `play-services-ads` ≥ 24.6.0 compilado con **Kotlin 2.3.0**, y Expo SDK 54 usa **Kotlin 2.1.20** (con KSP `2.1.20-2.0.1` atado). El build de Gradle falla en `:react-native-google-mobile-ads:compileDebugKotlin` con `Module was compiled with an incompatible version of Kotlin. The binary version of its metadata is 2.3.0, expected version is 2.1.0`. La 15.7.0 usa `play-services-ads 24.5.0` (sin metadata Kotlin → sin conflicto). Por eso está en `expo.install.exclude` del `package.json` (para que `expo install` no la bumpee). NO subir Kotlin del proyecto a 2.3 como "fix" — rompería KSP y otros módulos Expo.

**IDs de unidad**: en `__DEV__` se usan SIEMPRE los IDs de prueba de Google (constantes en `lib/ads.ts`). En producción, las env `EXPO_PUBLIC_ADMOB_*`; si faltan, fallback a test (inofensivo). El **App ID** (`~...`) va en `app.json` → plugin `react-native-google-mobile-ads` (`androidAppId`), se hornea al buildear → cambiarlo requiere rebuild.

Piezas:

- `lib/ads.ts` — carga perezosa del módulo, `inicializarSdkAds()` (rating PG, no-niños), resolvers de IDs.
- `store/useAnunciosStore.ts` — `{ listo, inicializar }`. `inicializar()` se llama una vez en `app/_layout.tsx`; arranca la precarga de intersticial + rewarded.
- `components/AnuncioBanner.tsx` — banner adaptativo. Devuelve `null` si premium / SDK no listo / sin módulo. Colocar en zonas NO invasivas (ej. `ListFooterComponent` de la lista de recetas).
- `lib/intersticial.ts` — manager singleton con **doble tope anti-molestia**: recién al 3er "momento natural" (`TRIGGERS_POR_AD`) Y máximo 1 cada 4 min (`MIN_MS_ENTRE_ADS`). Se registra el momento con `registrarMomentoIntersticial()` (ej. al abrir el detalle de una receta).
- `lib/recompensado.ts` — manager del rewarded (opt-in, sin tope). `mostrarRecompensado()` resuelve `true` SOLO si el usuario vio el ad completo (`EARNED_REWARD`).
- `components/ModalRecompensa.tsx` — bottom sheet de elección de recompensa. Opciones no disponibles se muestran "Próximamente" (ej. mensajes extra de NutriBot hasta la Fase 6).

**Modelo premium: a nivel VIDEO, no receta** (migración `024`):

⚠️ **IMPORTANTE — `es_premium` significa "el VIDEO de esta receta es premium".** Las RECETAS son SIEMPRE free (ingredientes, pasos, nutrición, imagen — todo visible sin login premium). Solo se gatea el `video_url`. Modelo freemium: recetas gratis como imán de marketing, videos premium como monetización.

### Rotación mensual de videos free/premium (migraciones `032` y `033`)

**`es_premium` ya NO se administra a mano: lo recalcula un job de `pg_cron` el día 1 de cada mes.**

Columna `recetas.rotacion_grupo`:

| Grupo | Recetas | Comportamiento                                         |
| ----- | ------- | ------------------------------------------------------ |
| `0`   | 53      | **Siempre free.** Imán de marketing, nunca se bloquea. |
| `1`   | 52      | Rotativo — free 1 de cada 3 meses                      |
| `2`   | 51      | Rotativo                                               |
| `3`   | 51      | Rotativo                                               |

Free en cualquier momento: **grupo 0 + el grupo activo del mes ≈ 104 de 207 (~50%)**. El grupo activo es `(mes % 3) + 1`, así que el ciclo cierra en 3 meses.

La asignación de grupos se hizo con `ntile(4)` sobre `md5(id::text)` particionado por etapa primaria. Un solo criterio equilibra las tres dimensiones a la vez — **verificado**: etapa 45.7–50.0%, momento 41.6–54.9%, país 43.5–56.7%. Es determinístico: recalcularlo da el mismo reparto.

- **Función**: `public.rotar_videos_premium()` — `SECURITY DEFINER`, `search_path` fijo, **idempotente** (segunda corrida en el mismo mes → 0 filas). Sin `EXECUTE` para `anon`/`authenticated`.
- **Job**: `select * from cron.job;` → `rotar-videos-premium`, `0 3 1 * *` (03:00 UTC ≈ medianoche en Chile). Historial en `cron.job_run_details`.

> ⚠️ **El toggle "Video Premium" del panel admin quedó subordinado al cron.** Un cambio manual sobre una receta de grupo 1–3 **se pierde el día 1 del mes siguiente**. Las del grupo 0 no las toca el job, así que ahí el toggle sí persiste. Para sacar una receta de la rotación, moverla a `rotacion_grupo = 0`.

> El badge del tab Videos dice **"GRATIS ESTE MES"** (no solo "GRATIS") justamente porque la selección rota — avisa la temporalidad de entrada en vez de sorprender al mes siguiente. Se muestra en todas las libres, incluidas las fijas: distinguirlas exigiría exponer `rotacion_grupo` en `recetas_teaser`, y recrear esa vista por un badge no compensa el riesgo.

**Desbloqueo del VIDEO con rewarded** (arquitectura completa):

1. **RLS `recetas`** (migración `024`) — todas las recetas activas visibles para `authenticated` (sin gate por `es_premium` en la fila). El contenido de receta es free.
2. **Vista `recetas_teaser`** (`security_invoker = false` **INTENCIONAL**) — fuente de lectura user-facing del catálogo Y el detalle. Devuelve TODO el contenido de receta libre, pero **gatea SOLO `video_url`** con `CASE`: se muestra si `es_premium = false` OR premium activo OR desbloqueo vigente. El linter marca ERROR `security_definer_view` → **esperado y seguro**: grant solo a `authenticated`, el `auth.uid()` per-request gatea el video. NO cambiar a `security_invoker`.
3. **Tabla `desbloqueos_temporales`** (migración `023`) — un desbloqueo por (user, receta) con `expires_at`; desbloquea el VIDEO 24h. El usuario solo LEE los suyos (RLS); escribe solo la Edge Function con `service_role`.
4. **Edge Function `canjear-desbloqueo`** — la única que escribe desbloqueos, tras verificar el usuario por JWT.
5. **Cliente**: `store/useRecetasStore.ts` y `app/receta/[id].tsx` leen de `recetas_teaser` (NO de `recetas`). `store/useDesbloqueosStore.ts` cachea desbloqueos y llama la edge function. `RecetaCard` muestra un badge "VIDEO" (sin candado — la receta es free); el detalle muestra la receta completa siempre, y solo la sección de video muestra `UnlockCTA` (ver anuncio 24h / hazte premium) cuando `es_premium && videoBloqueado`. Refetch tras ganar el rewarded.

> ⚠️ **Gotcha crítico**: el cliente YA lee de `recetas_teaser`. Si las migraciones `023`+`024` NO están aplicadas, el catálogo se rompe (la vista no existe). La vista es requisito para que la app cargue recetas.

> ⚠️ **`video_url` en la tabla base `recetas` es legible por `authenticated` vía query directa** (RLS es row-level, no column-level). El gateo del video es solo para el flujo normal de la app (vía la vista). Aceptable: los videos son de YouTube **no listado** (ya son "seguridad por oscuridad"); un user técnico que saca la URL igual podría verla. El gate es para la UX, no DRM real.

**Server-Side Verification (SSV) — cerrado el 2026-08-05.** Antes `canjear-desbloqueo` le creía al cliente cuando decía "vi el anuncio". Ahora la única prueba válida es el callback FIRMADO que Google manda servidor a servidor.

**Modelo de CRÉDITOS, y el porqué es así:** `serverSideVerificationOptions` solo se puede pasar al **crear** el anuncio, y el rewarded se precarga al abrir la app — cuando todavía no se sabe qué receta va a querer el usuario. Crearlo recién al pedirlo cerraría el problema pero le mete 3-5 s de espera al único camino de monetización. Por eso el callback **no concede una receta: concede un crédito** al usuario, y él elige después qué desbloquear. Que elija QUÉ no es un problema —ya se ganó el desbloqueo—; lo que no puede es **fabricar** el crédito.

Flujo completo:

1. `lib/recompensado.ts` crea el ad con `serverSideVerificationOptions: { userId }`. **Sin sesión no se crea el anuncio**: un callback sin `user_id` no se puede atribuir y el crédito se perdería.
2. El usuario ve el ad completo → Google llama a **`ssv-recompensa`** (`verify_jwt` **OFF**, la autenticación ES la firma).
3. Esa función verifica firma + frescura + idempotencia e inserta una fila en `ssv_transacciones_procesadas`. Esa fila **es** el crédito (migraciones `036` y `037`).
4. El cliente llama a `canjear-desbloqueo`, que **busca y consume** un crédito libre y recién ahí concede las 24h.

> ⚠️ **Falta un paso de owner: cargar la URL del callback en AdMob.** Sin eso Google nunca llama y **ningún desbloqueo funciona**. AdMob → Apps → Yummi Glu Glu → Bloques de anuncios → el rewarded → Editar → _Verificación del lado del servidor_ → `https://uoqzkbbnesmvmgbjikrn.supabase.co/functions/v1/ssv-recompensa`

> ⚠️ **El canje REINTENTA (5 × 1,5 s) a propósito.** El callback de Google llega unos segundos después de que el ad termina, así que un `409 sin_credito` en el primer intento es **lo normal**, no un fallo. Si se sacan los reintentos, el usuario ve el anuncio y no recibe nada.

> ⚠️ **`node:crypto` y NO Web Crypto para verificar la firma.** Google firma en formato **DER** y `crypto.subtle.verify` con ECDSA espera el formato crudo (r‖s) — habría que convertir a mano. `createVerify` entiende DER directo. Las claves son **P-256** (verificado contra `verifier-keys.json`); si fueran secp256k1 el Edge Runtime no las soportaría.

> ⚠️ **El contenido firmado se toma de la query string CRUDA**, no reconstruida con `URLSearchParams`: reconstruirla cambia encoding y orden, y la firma deja de validar. Es todo lo que hay antes de `&signature=`.

> ✅ **Dos defensas para el replay**: ventana de frescura de 10 min sobre `timestamp` (barata, no toca la base) + `transaction_id` como PK (cierra el caso del todo). La firma por sí sola no caduca, así que reenviar una URL capturada sería válido sin esto.

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

### Migraciones — GRANTs obligatorios en tablas nuevas (Data API change)

A partir del **30 de octubre de 2026** Supabase deja de exponer automáticamente al Data API (PostgREST / GraphQL / `supabase-js`) las tablas creadas en el schema `public`. Las **tablas existentes mantienen sus grants actuales** — no se rompen. El cambio aplica solo a tablas creadas en o después de esa fecha.

**Regla obligatoria**: toda migración nueva que cree una tabla en `public` (ej. `videos` de Fase 7a, futuras tablas) debe incluir **GRANTs explícitos + RLS + policies** en el mismo archivo de migración. No depender del comportamiento legacy de auto-exposición.

**Template mínimo a copiar en cada migración nueva:**

```sql
create table public.nombre_tabla (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- 1. Habilitar RLS SIEMPRE antes de los grants
alter table public.nombre_tabla enable row level security;

-- 2. GRANTs por rol — ajustar según necesidad
grant select on public.nombre_tabla to anon;                              -- solo si la tabla es pública (ej. recetas)
grant select, insert, update, delete on public.nombre_tabla to authenticated;
grant select, insert, update, delete on public.nombre_tabla to service_role;

-- 3. Policies — RLS sin policies bloquea todo, ojo
create policy "users select propios"
  on public.nombre_tabla for select to authenticated
  using (auth.uid() = user_id);
```

**Síntoma si falta un GRANT**: PostgREST devuelve error `42501` con el `GRANT` exacto que falta en el mensaje. Si una tabla nueva "no aparece" desde `supabase-js`, este es el primer sospechoso después del 30 oct 2026.

**Patrón ya aplicado** en `002_recetas_rls_premium.sql` y `006_webhook_security_hardening.sql` — usar esos como referencia. La tabla `webhook_events_procesados` (006) es el ejemplo limpio de tabla **solo accesible por `service_role`** (sin policies para `anon`/`authenticated`).

## Known Gotchas

### NativeWind en Android — historial de problemas (RESUELTO)

NativeWind v4.0.36 + css-interop v0.1.21 tenían 5 bugs encadenados en Windows que impedían que los estilos se aplicaran en Android. Se intentó parchar manualmente pero no fue suficiente. **La solución fue actualizar a NativeWind v4.2.3 + css-interop v0.2.3** — los patches manuales fueron eliminados.

**IMPORTANTE**: Usar **dev client** (no Expo Go) para testing en dispositivo. NativeWind v4 depende de un transformer custom de Metro que puede tener problemas en Expo Go. Siempre probar con el APK del perfil `development`.

### `style` como función en Pressable — NO aplica los estilos (usar View interno)

Un `Pressable` con `style={({ pressed }) => ({ ... })}` **no aplica esos estilos** en este proyecto. Verificado en dispositivo el 2026-08-02: una card con `flexDirection: 'row'`, `backgroundColor`, `padding` y `borderRadius` dentro del callback salió como texto plano apilado en vertical, sin fondo y sin padding — **ni uno solo de los estilos llegó**. Sin error, sin warning: simplemente no se aplica.

El sospechoso es **css-interop de NativeWind**, que envuelve los componentes de React Native (misma familia de problemas que la sección anterior).

**Patrón obligatorio — separar interacción de layout:**

```tsx
// ❌ NO: el layout se pierde entero
<Pressable style={({ pressed }) => ({ flexDirection: 'row', backgroundColor: c.verdeClaro })}>
  <Text>...</Text>
</Pressable>

// ✅ SÍ: el touchable solo maneja el toque, el View interno lleva el layout
<TouchableOpacity onPress={...} activeOpacity={0.7}>
  <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: c.verdeClaro }}>
    <Text>...</Text>
  </View>
</TouchableOpacity>
```

**Este es el patrón que el resto del proyecto ya usaba**: touchable con estilos mínimos + `View` interno con el layout. Si ves ese envoltorio "de más" en el código, **no lo simplifiques** — es cicatriz, no descuido.

> ✅ **Hay una regla de ESLint que lo impide (2026-08-05).** `no-restricted-syntax` en `eslint.config.js` falla ante cualquier `style` como función en JSX, con el mensaje explicando por qué. **No la desactives con un `eslint-disable`**: si el lint se queja, el estilo NO se iba a aplicar de todos modos.
>
> Se agregó porque el bug **reapareció tres veces**, siempre detectado a ojo mirando capturas de usuarios. Un bug que no falla en ningún lado vuelve para siempre; la única defensa real es que rompa el lint.

> 🔎 **Cómo reconocerlo a ojo, si algún día se cuela igual:** un layout que sale **en COLUMNA cuando pediste `row`**. Es la firma del bug — el `flexDirection` se descartó y quedó el default. Así se encontró el de los botones "Volver": la flecha arriba y el texto abajo.

**Barrido completo del 2026-08-05** — se convirtieron los 14 casos que quedaban. Lo que estaba perdiendo cada uno:

| Dónde                     | Qué se perdía                                                                                                   |
| ------------------------- | --------------------------------------------------------------------------------------------------------------- |
| 5 botones "Volver"        | `paddingHorizontal`, `flexDirection`, `gap`                                                                     |
| `(tabs)/index.tsx` ⚙️     | El círculo de 40×40 y el centrado del ícono                                                                     |
| `(tabs)/index.tsx` Agenda | El `paddingHorizontal: 24` (fila pegada al borde)                                                               |
| `RecetaCard`              | El `marginBottom: 28` (cards pegadas entre sí)                                                                  |
| `UpsellPremium` CTA       | **Fondo naranja, padding, borde redondeado y la fila** ← el peor: el botón de premium se veía como texto suelto |
| `agenda.tsx` (7 casos)    | Paddings de los chevrons, `marginTop` y filas de los links                                                      |

### `newArchEnabled` en app.json

**DEBE estar en `true`**. `react-native-reanimated` v4.x lo requiere obligatoriamente para Android — si está en `false`, el build de Gradle falla con `assertNewArchitectureEnabledTask`. Estuvo temporalmente en `false` durante diagnóstico de NativeWind pero ya se reactivó.

### `edgeToEdgeEnabled` en app.json

`android.edgeToEdgeEnabled` está en `true`. En Expo SDK 54 puede requerir `expo-edge-to-edge` como dependencia. Si el build de Android falla en Gradle sin error claro, este es un sospechoso — probar con `false` o instalar el paquete.

### Supabase Auth — flujo completo de deep links (LEER si tocás auth)

El flujo de confirmación de email / magic link / reset password en mobile tiene **3 piezas** que TIENEN que estar bien o el usuario termina en `localhost:3000` (o el deep link no se procesa):

**1) Código (`store/useAuthStore.ts`) — ya OK**
Los métodos `signUp`, `signInWithOtp` y `resetPasswordForEmail` pasan `emailRedirectTo: Linking.createURL('/', { scheme: 'yummigluglu' })`. En web usa `window.location.origin`.

**2) Supabase Dashboard → Authentication → URL Configuration — CRÍTICO**

- **Site URL**: `yummigluglu://` (NO dejar el default `http://localhost:3000`).
- **Redirect URLs (whitelist)**: agregar `yummigluglu://**` y `yummigluglu://*`.

> ⚠️ Si la URL que manda el código (`emailRedirectTo`) **no matchea ninguna entry de la whitelist**, Supabase la **ignora silenciosamente** y usa el Site URL como fallback. Por eso aunque el código esté perfecto, si la whitelist no tiene `yummigluglu://**`, el email termina mandando al user a `localhost:3000` con `ERR_CONNECTION_REFUSED`.

**3) Handler de deep link (`app/_layout.tsx`) — ya OK**
En React Native, `detectSessionInUrl` del cliente Supabase **solo funciona en web**. En mobile hay que parsear manualmente el fragment de la URL (`yummigluglu://#access_token=XXX&refresh_token=YYY&type=signup`) y llamar `supabase.auth.setSession({ access_token, refresh_token })`. El handler ya está montado en `_layout.tsx` con `Linking.getInitialURL` (cold start) + `Linking.addEventListener('url', ...)` (warm).

**Para debuggear**: si el usuario hace click en el link y NO queda logueado, mirar consola para `Error procesando deep link de auth:` que loguea el handler. Causas comunes: token expirado (Supabase los hace expirar en 1h), URL sin fragment (chequear que Site URL en dashboard sea el deep link y no una URL https), `verifyOtp` requerido en vez de `setSession` (algunos flujos legacy).

### RevenueCat — polling post-compra

Después de `comprarPremium()` o `restaurarCompras()`, el store hace polling a Supabase hasta 10 veces con intervalos de 1 segundo esperando que el webhook de RevenueCat actualice la tabla `suscripciones`. En producción el webhook tarda < 5 segundos. Si `esPremium` no cambia en 10s, la compra se completa igualmente en RC pero la UI no lo reflejará hasta el próximo `cargarSuscripcion()`.

### RevenueCat — versión del SDK y la Play Billing Library

**`react-native-purchases` está en `^10.6.0` porque Google exige Play Billing Library ≥ 8.0.0 desde el 2026-08-30.** Antes de esa fecha, cualquier actualización de la app con una versión anterior **se rechaza**.

**La Billing Library no se declara en el proyecto: viene DENTRO de RevenueCat.** La cadena real (verificada contra los POM de Maven Central, no de memoria):

```
react-native-purchases 10.6.0
  └─ purchases-hybrid-common 18.28.0
      └─ purchases (Android) 10.16.0
          └─ com.android.billingclient:billing 8.3.0   ✅
```

Antes estaba en `^8.9.0` → `billing 7.1.1` ❌. Para verificar la versión efectiva después de cualquier bump:

```bash
hc=$(grep -oE "purchases-hybrid-common:[0-9.]+" node_modules/react-native-purchases/android/build.gradle | head -1 | cut -d: -f2)
pv=$(curl -s "https://repo1.maven.org/maven2/com/revenuecat/purchases/purchases-hybrid-common/$hc/purchases-hybrid-common-$hc.pom" | grep -A2 "<artifactId>purchases</artifactId>" | grep "<version>" | head -1 | sed -E 's/.*<version>(.*)<\/version>.*/\1/')
curl -s "https://repo1.maven.org/maven2/com/revenuecat/purchases/purchases/$pv/purchases-$pv.pom" | grep -A3 "com.android.billingclient" | grep "<version>"
```

> ⚠️ **Es un módulo NATIVO: subirlo obliga a rebuild del dev client y del binario de producción.** Y el flujo de compra hay que reprobarlo entero — es el SDK que maneja el dinero.

> ✅ **Kotlin: acá estamos del lado seguro, al revés que AdMob.** `purchases` pide `kotlin-stdlib 2.0.21` (mínimo Kotlin 1.8.0+) y el proyecto usa **2.1.20**. Kotlin es compatible **hacia atrás**: un compilador nuevo lee metadata vieja sin problema. El caso de `react-native-google-mobile-ads` 16.x es el inverso —librería compilada con 2.3.0 sobre un proyecto en 2.1.20— y por eso **ese sí rompe**. Antes de asustarse por un choque de Kotlin, mirar **en qué dirección va**.

> ✅ **`minSdk`**: la 10.0.0 lo sube de 21 a **23** (Android 6). Expo SDK 54 ya exige **Android 7 (API 24)**, así que no afecta.

> ✅ **La advertencia en rojo del changelog NO aplica a esta app.** Habla de _productos de compra única_ mal configurados como consumibles, que dejan de poder restaurarse. Yummi Glu Glu vende **suscripciones**, no compras únicas.

> ⚠️ **Lo que sí cambia Billing 8**: se elimina la posibilidad de consultar **suscripciones expiradas** y compras únicas ya consumidas. Para esta app significa que RevenueCat no puede reportar histórico de suscripciones vencidas que no tenga ya importado. Sin impacto en el modelo actual (el estado premium sale de la tabla `suscripciones`, que llena el webhook).

**Superficie usada del SDK: 6 métodos, todos en `store/useSuscripcionStore.ts`** — `configure`, `logIn`, `logOut`, `getOfferings`, `purchasePackage`, `restorePurchases`. Ninguno cambió de firma entre la v8 y la v10. Esa superficie chica es lo que hace barato el salto de dos versiones mayores; si crece, el próximo bump deja de ser trivial.

### Versionado del build — `appVersionSource` + `autoIncrement` (LEER ANTES DE BUILDEAR)

`eas.json` usa `"appVersionSource": "remote"` en `cli`: el `versionCode` de Android lo lleva **EAS en el servidor**, no `app.json`.

⚠️ **`"remote"` significa "leé el número del servidor", NO "subilo".** Para que EAS lo incremente hace falta además `"autoIncrement": true` **en el perfil de build**. Sin eso, EAS reusa el mismo `versionCode` en cada build y **Google Play rechaza el AAB**:

> _"Ya se usó el código de la versión 1. Prueba con otro código."_

Pasó el 2026-08-19: se buildeó producción sin `autoIncrement`, salió con `versionCode 1` (el mismo de la prueba cerrada) y Play lo rechazó al subirlo. **Un build entero perdido**, porque el `versionCode` va firmado dentro del AAB y no se puede editar después: hay que rebuildear sí o sí.

Ya está corregido — el perfil `production` lleva `"autoIncrement": true`.

```bash
npx eas-cli build:version:get -p android   # ver el versionCode remoto actual
npx eas-cli build:version:set -p android   # fijarlo a mano si se desincroniza
```

Play exige que cada AAB tenga un `versionCode` **estrictamente mayor** que todos los ya subidos, en cualquier pista.

### UI de auth — patrón canónico de formularios

**Patrón unificado (ya aplicado en login y register)**: `KeyboardAvoidingView` (behavior `padding` en ambas plataformas, `keyboardVerticalOffset={24}` en Android) → `ScrollView` con `ref`, `keyboardShouldPersistTaps="handled"` y `contentContainerClassName="flex-grow justify-center px-6 py-10"` → contenido. Cada `TextInput` dispara `setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100)` en su `onFocus`.

- **Por qué `setTimeout(..., 100)`**: el teclado se abre asíncrono — sin el delay el `scrollToEnd` corre antes de que el layout se ajuste y queda corto.
- **Por qué `behavior: 'padding'` en Android** (no el default `'height'`): con `'height'` el `ScrollView` se recortaba y el header quedaba cortado arriba en pantallas chicas tipo Galaxy S20 (ver captura `s20-login.png` en la raíz).
- **Por qué `keyboardShouldPersistTaps="handled"`**: para que tocar fuera de un input cierre el teclado pero los `TouchableOpacity` (toggle 🙈/👁️, botones de modo) sigan respondiendo al primer tap.
- **Replicar este patrón** en cualquier form nuevo con 2+ inputs (`editar-cuenta.tsx`, `editar-perfil/[id].tsx`, etc.).

### Teclado + `edgeToEdgeEnabled` en Android — se usa `react-native-keyboard-controller`

> 🔴 **El `KeyboardAvoidingView` que se importa NO es el de `react-native`, es el de `react-native-keyboard-controller`.** Si escribís `import { KeyboardAvoidingView } from 'react-native'` volvés a introducir el bug. Las 7 pantallas con teclado ya usan el correcto.
>
> **`KeyboardProvider` envuelve toda la app en `app/_layout.tsx`.** Sin ese provider el componente no recibe eventos y **no hace nada** — sin error, la pantalla simplemente no reacciona al teclado. Si aparece un `KeyboardAvoidingView` que "no funciona", este es el primer sospechoso.

**Por qué se cambió (2026-08-04).** El `KeyboardAvoidingView` de `react-native` compensa a mano y queda **desfasado al cerrar el teclado**: dejaba espacio muerto abajo. Lo reportaron testers en varias pantallas (login y NutriBot entre ellas). El de keyboard-controller lee la posición real del teclado cuadro a cuadro, así que entra y sale sincronizado.

Antes se había descartado esa librería porque "es un módulo nativo y obliga a otro rebuild". **Esa razón caducó** cuando el rebuild pasó a ser obligatorio por Play Billing 8. Cuando el motivo para rechazar algo es un costo que ya vas a pagar por otra razón, la decisión hay que revisarla.

> ✅ **Kotlin: esta librería es segura por construcción.** Su `build.gradle` usa `rootProject.ext.kotlinVersion`, o sea que **se compila con el Kotlin del proyecto** (2.1.20) en vez de venir precompilada con uno fijo. Por eso no puede haber choque de metadata como el de `react-native-google-mobile-ads` 16.x (ese sí es un AAR de Maven con Kotlin fijo).

> ✅ **No hay que tocar `babel.config.js`**: keyboard-controller usa worklets de Reanimated, y `babel-preset-expo` 54 agrega `react-native-worklets/plugin` **automáticamente** cuando detecta el paquete instalado (lo trae Reanimated 4).

> ⚠️ Instalar con **`npx expo install`**, nunca `npm install` a secas: Expo resuelve la versión compatible con el SDK (eligió **1.18.5**, no la 1.22.2 que es la última de npm).

**El problema de fondo que sigue vigente:** con `android.edgeToEdgeEnabled: true` + New Architecture, Expo SDK 54 llama `setDecorFitsSystemWindows(false)` y **el teclado deja de redimensionar la ventana: se dibuja ENCIMA del contenido**. `adjustResize` no actúa. Todo lo de abajo sigue aplicando.

**NO asumir que `edgeToEdgeEnabled` implica `adjustResize` funcionando** — pasa exactamente lo contrario. Se probó sacar el `behavior` del `KeyboardAvoidingView` en Android (asumiendo que el sistema haría el trabajo) y **el input quedó completamente tapado por el teclado**, verificado en dispositivo. `behavior="padding"` va en AMBAS plataformas.

**Cómo distinguir el síntoma antes de tocar nada:**

- **Sobra** espacio sobre el teclado → el problema NO es el `KeyboardAvoidingView`. Buscá un padding duplicado (ver punto siguiente).
- El input queda **tapado** → falta el `KeyboardAvoidingView` o está mal configurado.

**El safe area inset lo paga UN SOLO elemento — el último, el que toca el borde de la pantalla.** Este fue el bug real de `app/asistente.tsx`: el input tenía `paddingBottom: Math.max(insets.bottom, 12)` Y el disclaimer que va debajo tenía otro `Math.max(insets.bottom, 8)`. Con nav bar de 3 botones (~48dp) daba ~92dp de aire muerto. Si hay algo debajo de tu componente, ese algo es el que paga el inset.

**`insets.bottom` NO se pone en 0 cuando el teclado tapa la barra de navegación.** Sigue reportando ~48dp, así que el elemento del borde queda flotando sobre el teclado. Se resuelve con listeners `keyboardDidShow` / `keyboardDidHide` y aplicando el inset solo con el teclado cerrado (patrón aplicado en `app/asistente.tsx`). **Ese patrón se mantiene aunque ahora esté keyboard-controller**: es sobre el _safe area_, no sobre el desplazamiento del teclado — resuelven cosas distintas.

> Esto **no contradice** el patrón de formularios de auth de más abajo: aquel usa `ScrollView` + `scrollToEnd` con `keyboardVerticalOffset={24}`. Acá, con lista de chat + input fijo al borde, el offset sobra (son 24dp de aire sin justificación).

### Emojis grandes en Android — `lineHeight` > `fontSize`

Algunos emojis tienen glifos que sobresalen del bounding box vertical de la fuente (ej. 🍼 tiene la tetina arriba, 🍦 el helado, 🎂 las velas). En Android, React Native recorta el `Text` al `lineHeight` calculado a partir del `fontSize` — y esos glifos quedan **cortados arriba**. iOS no tiene este bug.

**Regla**: para emojis con `text-5xl` o más grandes (≥ 48px), pasar `style={{ lineHeight: <fontSize * 1.5> }}` para darle aire vertical. Ejemplo: `text-6xl` (60px) → `lineHeight: 90`. Aplicado en `app/(auth)/login.tsx` para el 🍼. Si aparecen otros emojis grandes (header de onboarding, premium, etc.) y se ven cortados, aplicar lo mismo.

NO usar `includeFontPadding: false` para "compactar" — hace lo opuesto: quita el padding interno de la fuente Android y empeora el recorte.

### Supabase Auth — envío de emails vía Resend (CONFIGURADO)

Los emails de auth (confirmación de registro, magic link, reset password) se mandan por **Resend** como SMTP custom (Supabase Dashboard → Project Settings → Auth → SMTP Settings). Configurado el 2026-06-07.

- **Dominio verificado**: `yummigluglu.com` (registrado en Cloudflare, DNS gestionado ahí). Verificado en Resend con DKIM + SPF (Resend agregó los registros vía la integración automática de Cloudflare). Sender: `noreply@yummigluglu.com`, nombre "Yummi Glu Glu".
- **Credenciales SMTP en Supabase**: host `smtp.resend.com`, port `465`, user `resend`, password = API key de Resend (encriptada en Supabase).

**Gotcha que costó semanas de confusión (LEER):** antes de verificar el dominio, Resend estaba en **modo sandbox** y solo dejaba enviar a la dirección dueña de la cuenta. Cualquier OTRO destinatario fallaba con el error 550 de Resend (`You can only send testing emails to your own email address... verify a domain at resend.com/domains`). El síntoma en la app era genérico ("No pudimos enviarte el correo de confirmación", mapeado en `lib/errores.ts`) — **el motivo real solo aparece en los Auth Logs** (vía MCP de Supabase: `get_logs` service `auth`, o Dashboard → Logs → Auth). Moraleja: **ante un fallo de email, mirar SIEMPRE los Auth Logs antes de teorizar** (la hipótesis del "rate limit del pool default de Supabase" era falsa).

**Producción / rate limits**: Resend free da 3.000 emails/mes y 100/día — suficiente para dev y producción temprana. Si el dominio se despublica o caen los registros DNS, los emails vuelven a fallar — primer sospechoso si "de golpe" dejan de llegar.

### Google Sign In (nativo)

Login con Google vía `@react-native-google-signin/google-signin` (v16+) + `supabase.auth.signInWithIdToken`. Implementado 2026-06-07. **Requiere dev client** (módulo nativo — no anda en Expo Go).

**Flujo**: `GoogleSignin.hasPlayServices()` → `GoogleSignin.signIn()` → si `isSuccessResponse`, se toma el `idToken` → `supabase.auth.signInWithIdToken({ provider: 'google', token })`. La cancelación del selector se trata en silencio (no es error). Todo en `useAuthStore.ts` → acción `iniciarSesionConGoogle`. Botón "Continuar con Google" en `login.tsx` y `register.tsx` (icono AntDesign `google`).

**Config externa (no reconstruir a ciegas):**

- **Google Cloud Console** — proyecto `Yummi Glu Glu` (id `yummi-glu-glu`), consent screen **External** (modo Testing → solo cuentas agregadas como testers pueden loguear hasta publicar). Dos OAuth clients:
  - **Web Client** → su Client ID va en `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` (es el que se pasa a `GoogleSignin.configure({ webClientId })` Y el que se carga en Supabase). Redirect URI autorizado: `https://uoqzkbbnesmvmgbjikrn.supabase.co/auth/v1/callback`.
  - **Android Client** → package `com.yummigluglu.app` + **SHA-1 del keystore de EAS**. NO se usa en código, pero debe existir o Google tira `DEVELOPER_ERROR`. El SHA-1 se saca de expo.dev → proyecto → Credentials (NO por `eas credentials` interactivo). **Si rotás el keystore, hay que actualizar el SHA-1 en este client.**
- **Supabase** → Dashboard → Authentication → Providers → Google habilitado con el Web Client ID + Secret.

### Deep link scheme — DEBE ser `yummigluglu` en las 3 piezas

El scheme de deep link (`app.json` → `scheme`) estuvo históricamente como `babybites` (legacy del rename Baby Bites → Yummi Glu Glu) mientras el código (`useAuthStore.ts`) generaba el redirect con `yummigluglu` → mismatch → la confirmación de email no volvía a la app (pantalla en blanco en el navegador). **Unificado en `yummigluglu` el 2026-06-07.** Las 3 piezas tienen que coincidir SIEMPRE:

1. `app.json` → `"scheme": "yummigluglu"` (se hornea en el manifest nativo → cambiarlo REQUIERE rebuild).
2. `store/useAuthStore.ts` → `Linking.createURL('/', { scheme: 'yummigluglu' })`.
3. Supabase → Auth → URL Configuration → Site URL `yummigluglu://` + Redirect URLs `yummigluglu://**` y `yummigluglu://*`.

> El **EAS slug sigue siendo `baby-bites`** a propósito (atado al `projectId`, invisible al usuario). NO cambiarlo.

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
