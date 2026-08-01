# Checklist de producción — Yummi Glu Glu

> Documento operativo para llevar la app a Google Play.
> Fecha de armado: 2026-07-31. Actualizar a medida que se completan bloques.

## Cómo leer este documento

El orden importa. Los bloques están ordenados por **dependencia externa**, no por dificultad:

- **Bloque A** — dispara colas de terceros. Arrancar PRIMERO aunque el código no esté listo.
- **Bloque B** — configuración que se hornea en el binario. Todo esto va ANTES del build de producción, porque cambiarlo después = build nuevo.
- **Bloque C** — código y QA. Se puede hacer en paralelo al A.
- **Bloque D** — build, subida y publicación.

Marcador `🔁 REBUILD` = cambiar esto obliga a recompilar el binario.

---

## Estado verificado del backend (2026-07-31)

Chequeado contra el proyecto Supabase `uoqzkbbnesmvmgbjikrn`:

| Pieza                                  | Estado                                   |
| -------------------------------------- | ---------------------------------------- |
| Migración `023_desbloqueos_temporales` | ✅ Aplicada                              |
| Migración `024_premium_a_nivel_video`  | ✅ Aplicada (`premium_a_nivel_video_v2`) |
| Vista `recetas_teaser`                 | ✅ Existe (el catálogo depende de ella)  |
| Edge Function `revenuecat-webhook`     | ✅ ACTIVE                                |
| Edge Function `canjear-desbloqueo`     | ✅ ACTIVE (verify_jwt ON)                |
| Edge Function `welcome-email`          | ✅ ACTIVE                                |

El backend NO es el cuello de botella. Lo que falta es config externa + el binario.

---

## Bloque A — Colas externas (arrancar en paralelo, cuanto antes)

### A1. Ficha en Google Play Console

- [ ] Crear la app nueva en Play Console (package `com.yummigluglu.app`)
- [ ] **Verificar si aplica el requisito de 12 testers / 14 días.** Ese requisito es para cuentas de desarrollador _personales_ y se cumple **una vez por cuenta**, no por app. Si el Himnario ya está en producción, la cuenta ya tiene acceso a producción concedido y **este paso no se repite**. Confirmalo en Play Console antes de asumir cualquiera de los dos escenarios — es la diferencia entre publicar esta semana o dentro de tres.
- [ ] Ficha de tienda: título, descripción corta/larga, capturas, icono, gráfico destacado
- [ ] Política de privacidad publicada en URL accesible (el dominio `yummigluglu.com` ya está registrado y con DNS en Cloudflare — usarlo)
- [ ] Cuestionario de clasificación de contenido
- [ ] **Declaración de público objetivo → adultos / padres. NO dirigida a niños.** Esta decisión ya está tomada en el proyecto y el código la refleja (`lib/ads.ts:87` → `tagForChildDirectedTreatment: false`). Si acá declarás "niños", entra la política de familias de AdMob y te restringe formatos. Que la app sea _sobre_ bebés no la hace _para_ bebés — la usa el padre.
- [ ] Formulario de Data Safety. Ojo acá: se recolecta **nombre del hijo, fecha de nacimiento y alergias**. Eso es data personal de un menor y hay que declararlo con precisión. Es el formulario más delicado de esta app.
- [ ] Subir un primer AAB a **testing interno** (aunque sea con config incompleta) — desbloquea probar compras reales

### A2. AdMob — app nueva y ad units

La cuenta de AdMob ya está aprobada y con pagos verificados por el Himnario. Eso NO se repite. Lo que sí es nuevo:

- [ ] Crear la **app nueva** en AdMob (entrada aparte del Himnario, App ID propio)
- [ ] Crear 3 ad units para Android:
  - [ ] Banner → valor para `EXPO_PUBLIC_ADMOB_BANNER_ANDROID`
  - [ ] Intersticial → valor para `EXPO_PUBLIC_ADMOB_INTERSTITIAL_ANDROID`
  - [ ] Recompensado (rewarded) → valor para `EXPO_PUBLIC_ADMOB_REWARDED_ANDROID`
- [ ] Vincular la app de AdMob con la ficha de Play cuando exista
- [ ] Anotar el **App ID** (el que empieza con `~`) → va a `app.json` 🔁 **REBUILD**

> **Esperable, no es bug**: una app nueva en AdMob que todavía no está vinculada a su ficha de tienda arranca con _limited ad serving_ — sirve poco o nada. Se normaliza al vincularla y publicarla. No pierdas la noche debuggeando eso.

### A3. RevenueCat + Play Billing

Acá está el reuso que te mencionaba. El Himnario ya tenía suscripción, así que:

- [ ] **La service account de Google Cloud probablemente se REUSA.** Esa credencial está atada a la _cuenta de desarrollador de Play_, no a una app. Si ya la creaste para el Himnario, no hacés una nueva: solo tenés que **darle permisos sobre la app nueva** en Play Console → Usuarios y permisos. Si no encontrás la original, se crea de cero (Google Cloud → IAM → Service Accounts → clave JSON → subirla a RevenueCat).
- [ ] Crear el **proyecto nuevo** en RevenueCat (proyecto aparte del Himnario) y agregar la app Android
- [ ] Crear los productos de suscripción en Play Console (mensual / anual, según el modelo)
- [ ] Mapear esos productos a **entitlements** en RevenueCat
- [ ] Copiar la **Android API key** de RevenueCat → `EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID`
- [ ] Configurar el webhook de RevenueCat apuntando a la Edge Function `revenuecat-webhook`
- [ ] Generar `REVENUECAT_WEBHOOK_SECRET` (≥ 32 chars random) y cargarlo en **los dos lados**: `supabase secrets set` y RC Dashboard → Integrations → Webhooks. **Nunca en el repo, ni en `.env.local`, ni en logs.**
- [ ] Agregar cuentas de **license testers** en Play Console para probar compras sin pagar

> **Huevo y gallina**: no podés validar el flujo de compra de punta a punta hasta que haya un build en un track de testing de Play. Por eso A1 arranca primero.

### A4. Google OAuth — publicar el consent screen

- [ ] Google Cloud Console → proyecto `yummi-glu-glu` → OAuth consent screen → **Publish app** (pasar de Testing a Production)

> **Buena noticia**: la app usa solo scopes básicos (`email`, `profile`, `openid`), que son _no sensibles_. Eso significa que publicar es **un click, sin cola de verificación de Google**. Yo antes te lo pinté como si tuviera espera — no la tiene, mientras no agregues scopes sensibles. Lo que sí es real: mientras esté en Testing, **solo loguean las cuentas cargadas como testers**. Un usuario real de Play no podría entrar con Google.

- [ ] Verificar que el **SHA-1 del keystore de producción de EAS** esté cargado en el OAuth Client de Android. Si el keystore de producción es distinto al que usaste para el dev client, Google tira `DEVELOPER_ERROR` y el login con Google muere en producción. El SHA-1 se saca de expo.dev → proyecto → Credentials.

---

## Bloque B — Config que se hornea en el binario 🔁

Todo este bloque va ANTES del build de producción. Cambiar cualquier cosa de acá después obliga a recompilar.

### B1. Variables de entorno en EAS — BLOQUEANTE CRÍTICO

**Estado actual: `eas.json` no tiene bloque `env` en ningún perfil.** Consecuencia concreta: un build `preview` o `production` no tiene NINGUNA `EXPO_PUBLIC_*`, y `lib/supabase.ts` **lanza excepción si falta la URL o la anon key**.

Traducción: **la app de producción crashea al abrir.** No es degradación, es pantalla negra.

En dev no se nota porque Metro corre local y lee `.env.local`. Los builds standalone no tienen Metro.

- [ ] Cargar las variables en **EAS Environment Variables** (recomendado — dashboard de expo.dev, o `eas env:create`). Preferir esto antes que escribirlas en `eas.json`, porque `eas.json` está versionado en git.

Variables requeridas para `production`:

```
EXPO_PUBLIC_SUPABASE_URL
EXPO_PUBLIC_SUPABASE_ANON_KEY
EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID
EXPO_PUBLIC_ADMOB_BANNER_ANDROID
EXPO_PUBLIC_ADMOB_INTERSTITIAL_ANDROID
EXPO_PUBLIC_ADMOB_REWARDED_ANDROID
EXPO_PUBLIC_ADMIN_PASSWORD_HASH
```

- [ ] Repetir para el perfil `preview` (si vas a usarlo para QA real)
- [ ] Verificar en el build log de EAS que las variables se resolvieron

> Las `EXPO_PUBLIC_*` quedan visibles en el bundle — son públicas por diseño. La anon key de Supabase está pensada para eso (RLS es lo que protege). Lo que NUNCA va acá: `SUPABASE_SERVICE_ROLE_KEY`, `ANTHROPIC_API_KEY`, `REVENUECAT_WEBHOOK_SECRET`.

### B2. App ID real de AdMob en `app.json` 🔁

**Estado actual (`app.json:45`)**: `ca-app-pub-3940256099942544~3347511713` — ese es el **App ID de PRUEBA de Google**, no el tuyo.

- [ ] Reemplazar `androidAppId` por el App ID real de la app nueva de AdMob
- [ ] Decidir qué hacer con `iosAppId` (hoy también es el de prueba). Como iOS no es target, se puede dejar — no afecta el build de Android.

### B3. Versionado

- [ ] `expo.version` en `app.json` está en `1.0.0` — confirmar que es lo que querés publicar
- [ ] `cli.appVersionSource` ya está en `"remote"` ✅ — EAS maneja el `versionCode` automáticamente

### B4. Chequeo de dependencias

- [ ] Confirmar que `react-native-google-mobile-ads` sigue pineado en **15.7.0 exacta**. NO subir a 16.x: trae `play-services-ads` compilado con Kotlin 2.3.0 y Expo SDK 54 usa Kotlin 2.1.20 → el build de Gradle falla en `compileDebugKotlin`. Ya está en `expo.install.exclude`, pero verificar que nadie lo bumpeó.

---

## Bloque C — Código y QA

### C1. Pendientes de código

- [ ] Revisar y commitear los cambios sueltos en `app/receta/[id].tsx`

**Fase 6 — NutriBot: DECIDIDO, entra en la v1.0** (2026-07-31). No se publica sin él.

- [ ] `app/asistente.tsx` (presentación `modal`)
- [ ] Edge Function `supabase/functions/nutribot/` que proxea al Anthropic API
- [ ] `ANTHROPIC_API_KEY` en **secrets de Supabase** (`supabase secrets set`), JAMÁS en el cliente ni en una `EXPO_PUBLIC_*`
- [ ] Store `useAsistenteStore` + persistencia en la tabla `conversaciones_ia` (ya existe en el schema)
- [ ] Rate limiting server-side desde el día uno — free N mensajes/día, premium ilimitado. Sin esto, un usuario puede quemarte la cuenta de Anthropic.
- [ ] Contexto del niño auto-inyectado al prompt: edad, etapa, alergias (desde `perfiles_hijos`)

> **Sequencing — NutriBot NO dispara rebuild.** Es una ruta nueva de Expo Router (JS) más una Edge Function: cero módulos nativos. Por lo tanto **el rebuild del Bloque B (App ID de AdMob) se hace UNA sola vez** y NutriBot viaja después en el mismo binario. Orden recomendado: cerrar AdMob → rebuild → construir NutriBot sobre ese dev client → build de producción final.

### C2. Endurecimiento de Supabase antes de prod

Del linter de seguridad, lo que vale la pena tocar:

- [ ] **Activar leaked password protection** (Dashboard → Auth → Passwords). Chequea contra HaveIBeenPwned. Es un toggle, cero código. Hacelo.
- [ ] Revisar el bucket público `recetas-imagenes`: la policy de SELECT permite **listar todos los archivos**, no solo accederlos por URL. Para servir imágenes no hace falta listar. Bajo impacto, pero es gratis cerrarlo.
- [ ] _(Opcional)_ Fijar `search_path` en las funciones marcadas por el linter — buena higiene, no bloqueante.

> **Ignorar deliberadamente**: el linter marca ERROR `security_definer_view` sobre `recetas_teaser`. **Es intencional y está documentado.** Esa vista es la que gatea `video_url` con `auth.uid()` por request. NO cambiarla a `security_invoker` — romperías el modelo de desbloqueo de videos.

### C3. QA en dispositivo real (con el dev client recompilado)

- [ ] Rebuild del dev client con el App ID real: `eas build -p android --profile development`
- [ ] **Usuario FREE**: banner aparece, intersticial respeta el doble tope (3 momentos Y mínimo 15 min), rewarded desbloquea el video 24h
- [ ] **Usuario PREMIUM**: **CERO anuncios en toda la app.** Banner, intersticial y rewarded deben ser no-op. Un premium que ve un ad es bug crítico, no cosmético.
- [ ] Flujo de compra completo contra Play (requiere el build en testing interno)
- [ ] Verificar que el webhook actualiza `suscripciones` en < 5s
- [ ] Restaurar compras funciona
- [ ] Login con Google **con el keystore de producción**
- [ ] Deep link de confirmación de email vuelve a la app (`yummigluglu://`)
- [ ] Videos de YouTube no listados embeben bien — confirmar "Permitir insertar" activado y que NO estén marcados como "Contenido para niños"

---

## Bloque D — Build y publicación

- [ ] `npm run lint` limpio
- [ ] Build de producción: `eas build -p android --profile production`
- [ ] **Instalar el AAB/APK de producción y abrirlo antes de subirlo.** Este paso es el que atrapa el crash del Bloque B1. No lo saltees por confianza.
- [ ] Subir a testing interno → validar compras reales
- [ ] Promover a producción
- [ ] Vincular AdMob ↔ ficha de Play (cierra el _limited ad serving_)
- [ ] Monitorear crashes en Play Console las primeras 48h

---

## Riesgos ordenados por costo si se descubren tarde

| #   | Riesgo                            | Costo si aparece tarde                                             |
| --- | --------------------------------- | ------------------------------------------------------------------ |
| 1   | Sin env vars en EAS               | App crashea al abrir. Build perdido + posible reseña de 1 estrella |
| 2   | App ID de AdMob de prueba         | Cero ingresos por ads. Rebuild completo                            |
| 3   | Público declarado como "niños"    | Formatos de ads restringidos. Corregir la ficha y esperar revisión |
| 4   | Requisito de 12 testers / 14 días | +2 semanas de calendario                                           |
| 5   | OAuth en modo Testing             | Nadie entra con Google en producción                               |
| 6   | SHA-1 de producción no cargado    | `DEVELOPER_ERROR` en login con Google                              |

---

## Hardening que queda para después de v1.0

- **SSV (Server-Side Verification) en el ad unit rewarded.** Hoy `canjear-desbloqueo` confía en que el cliente vio el anuncio. Daño máximo: un usuario técnico se autoregala 24h de un video. Riesgo bajo, pero es la forma correcta de cerrarlo.
- Fijar `search_path` en las funciones del linter.
- Endurecer la policy de listado del bucket de imágenes.
