# Checklist de producción — Yummi Glu Glu

> Documento operativo para llevar la app a Google Play.
> Armado: 2026-07-31. **Última verificación contra el estado real: 2026-08-03.**

## Resumen al 2026-08-03

La app está **en prueba cerrada, ya revisada por Google**. Backend, config y código: cerrados.
Lo que queda es **calendario y trámites externos**, no trabajo de desarrollo.

| Bloque                  | Estado                                                    |
| ----------------------- | --------------------------------------------------------- |
| A — Colas externas      | ✅ salvo el Service Account de Play y publicar el consent |
| B — Config del binario  | ✅ completo y verificado                                  |
| C — Código y QA         | ✅ código cerrado · 🔲 falta QA en dispositivo            |
| D — Build y publicación | 🔲 pendiente (falta un build con los últimos fixes)       |

**Los 3 bloqueantes reales para cobrar:**

1. Service Account de Google Play en RevenueCat (sin esto no se validan las compras)
2. Productos de suscripción creados en Play y mapeados a entitlements
3. Los 14 días de prueba cerrada con 12 testers

Los 3 dependen de la Play Console, no del repo.

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

- [x] Crear la app nueva en Play Console (package `com.yummigluglu.app`)
- [ ] 🔴 **Requisito de 12 testers / 14 días — SÍ APLICA.**

  > ⚠️ **Corrección de un error de este documento.** El 2026-08-02 escribí acá que "NO APLICA" porque el owner recordaba haberlo cumplido con una app anterior. **La Play Console mostró al día siguiente que aplica POR APP, no por cuenta.**
  >
  > **La lección importa más que el dato**: un recuerdo del owner sobre una política de un tercero **no es verificación**. Yo lo di por confirmado y taché un bloqueante real de 2 semanas de calendario. Ante una política externa, la fuente es la pantalla de la consola — no la memoria de nadie, incluida la mía.

- [x] ~~Cuenta de desarrollador (USD 25)~~ — ya pagada y activa
- [x] Ficha de tienda: título, descripción corta/larga, capturas, icono, gráfico destacado
- [x] Política de privacidad publicada — `https://yummigluglu-web.samfrasan.workers.dev/privacidad.html` (verificada 200 el 2026-08-03)
- [x] Cuestionario de clasificación de contenido (IARC)
- [x] **Público objetivo → adultos / padres. NO dirigida a niños.** El código lo refleja (`lib/ads.ts` → `tagForChildDirectedTreatment: false`). Que la app sea _sobre_ bebés no la hace _para_ bebés — la usa el padre.
- [x] Formulario de Data Safety

  > ⚠️ **Casi se envía mal.** Estaba marcado **"no se recopilan datos"**, que es una declaración FALSA: la app guarda nombre del hijo, fecha de nacimiento y alergias. Se detectó recién al pedir ver el paso 5 (Vista previa). **Una declaración falsa de Data Safety es causa de suspensión de la app, no de una advertencia.** Si se vuelve a tocar este formulario, revisar SIEMPRE la vista previa completa antes de guardar.

- [x] Subir el primer AAB a prueba cerrada — **ya pasó la revisión de Google**
- [ ] Mandar el link de opt-in a los 12 testers → `https://play.google.com/apps/testing/com.yummigluglu.app`

### A2. AdMob — app nueva y ad units

La cuenta de AdMob ya está aprobada y con pagos verificados por el Himnario. Eso NO se repite. Lo que sí es nuevo:

- [x] Crear la **app nueva** en AdMob (App ID propio: `ca-app-pub-8216818579305822~7966838081`)
- [x] Crear los 3 ad units para Android (banner, intersticial, rewarded) — cargados en EAS `production` y `preview`
- [x] **App ID real en `app.json`** ✅ verificado 2026-08-03 (ya no es el de prueba)
- [ ] Vincular la app de AdMob con la ficha de Play — **cierra el _limited ad serving_**

> **Esperable, no es bug**: una app nueva en AdMob que todavía no está vinculada a su ficha de tienda arranca con _limited ad serving_ — sirve poco o nada. Se normaliza al vincularla y publicarla. No pierdas la noche debuggeando eso.

### A3. RevenueCat + Play Billing

Acá está el reuso que te mencionaba. El Himnario ya tenía suscripción, así que:

- [x] Crear el **proyecto nuevo** en RevenueCat y agregar la app Android
- [x] Copiar la **Android API key** de RevenueCat → `EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID`

  > ⚠️ **Fallo silencioso que costó una vuelta.** La key era una `test_` (sandbox): con esa, **las compras no se procesan de verdad, y el síntoma NO aparece en desarrollo**. La buena empieza con `goog_` y se genera **sola** al crear la app de Play Store en RevenueCat. No confundirla con el "REST API Identifier" (`app…`) ni con una "Secret API key" (esa NUNCA va en el cliente).
  >
  > Segunda trampa encadenada: al reemplazarla en `.env.local` quedó la vieja arriba y la nueva abajo. **En un `.env` una variable duplicada no da error y gana la PRIMERA** — el parser seguía leyendo la de sandbox en silencio. Reemplazar la línea, nunca agregar otra.

- [x] Configurar el webhook de RevenueCat → Edge Function `revenuecat-webhook`
- [x] `REVENUECAT_WEBHOOK_SECRET` (≥ 32 chars) cargado en los dos lados. **Nunca en el repo, ni en `.env.local`, ni en logs.**
- [ ] 🔴 **Service Account de Google Play en RevenueCat** — **el bloqueante nº1 para cobrar.** La app de Play Store existe en RC pero **sin el `Service Account Credentials JSON`**, así que RevenueCat todavía **no puede validar las compras contra Google**. El JSON sale de Google Cloud (proyecto `yummi-glu-glu`) + Play Console → _Users and permissions_. Dar permisos mínimos, NO Admin.
- [ ] Conectar las **Google developer notifications** (renovaciones y cancelaciones al instante en vez de por sondeo). Mismo requisito previo que el punto anterior.
- [ ] 🔴 **Crear los productos de suscripción en Play Console** (mensual / anual) — **requiere acceso a producción**, o sea, después de los 14 días.
- [ ] Mapear esos productos a **entitlements** en RevenueCat
- [ ] Agregar cuentas de **license testers** en Play Console para probar compras sin pagar

> **Huevo y gallina**: no podés validar el flujo de compra de punta a punta hasta que haya un build en un track de testing de Play. Por eso A1 arranca primero.

### A4. Google OAuth — publicar el consent screen

- [ ] Google Cloud Console → proyecto `yummi-glu-glu` → OAuth consent screen → **Publish app** (pasar de Testing a Production)

> **Buena noticia**: la app usa solo scopes básicos (`email`, `profile`, `openid`), que son _no sensibles_. Eso significa que publicar es **un click, sin cola de verificación de Google**. Yo antes te lo pinté como si tuviera espera — no la tiene, mientras no agregues scopes sensibles. Lo que sí es real: mientras esté en Testing, **solo loguean las cuentas cargadas como testers**. Un usuario real de Play no podría entrar con Google.

- [ ] Verificar que el **SHA-1 del keystore de producción de EAS** esté cargado en el OAuth Client de Android. Si el keystore de producción es distinto al que usaste para el dev client, Google tira `DEVELOPER_ERROR` y el login con Google muere en producción. El SHA-1 se saca de expo.dev → proyecto → Credentials.

---

## Bloque B — Config que se hornea en el binario 🔁

Todo este bloque va ANTES del build de producción. Cambiar cualquier cosa de acá después obliga a recompilar.

### B1. Variables de entorno en EAS — ✅ RESUELTO (2026-08-02)

Era el bloqueante crítico: sin las `EXPO_PUBLIC_*`, `lib/supabase.ts` **lanza excepción al arrancar** y la app de producción **crashea al abrir** — pantalla negra, no degradación. En dev no se nota porque Metro lee `.env.local`; los builds standalone no tienen Metro.

- [x] Las 8 variables cargadas en **EAS Environment Variables**, environments `production` y `preview`
- [x] `eas.json` ata cada perfil al suyo con `"environment": "preview" | "production"`
- [x] Verificado con `eas env:list production` el **2026-08-03**: las 8 presentes
- [ ] Confirmar en el build log de EAS que se resolvieron (al hacer el build final)

> **NO** usar un bloque `env` con valores dentro de `eas.json`: ese archivo se commitea y **el repo es público**.
> Para sincronizar tras cambiar `.env.local`: `eas env:push production --force`.

Variables requeridas para `production` (las 8, todas ✅):

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

> ⚠️ **Toda `EXPO_PUBLIC_*` se hornea en el bundle y es extraíble de cualquier APK** — no son secretos, ni en EAS ni en ningún lado. La anon key de Supabase está diseñada para eso (RLS es lo que protege). Por eso el gate del panel admin (`EXPO_PUBLIC_ADMIN_PASSWORD_HASH`) es **solo cosmético**: la autorización real la hace RLS con `es_admin()`.
>
> Lo que NUNCA va acá: `SUPABASE_SERVICE_ROLE_KEY`, `ANTHROPIC_API_KEY`, `REVENUECAT_WEBHOOK_SECRET`.

### B2. App ID real de AdMob en `app.json` — ✅ RESUELTO

- [x] `androidAppId` = `ca-app-pub-8216818579305822~7966838081` (verificado 2026-08-03, ya no es el de prueba)
- [x] `iosAppId` sigue siendo el de prueba — **a propósito**, iOS no es target y no afecta el build de Android

### B3. Versionado — ✅

- [x] `expo.version` = `1.0.0`
- [x] `cli.appVersionSource` = `"remote"` — EAS maneja el `versionCode`

### B4. Chequeo de dependencias — ✅ verificado 2026-08-03

- [x] `react-native-google-mobile-ads` en **15.7.0 exacta** y en `expo.install.exclude`

> 🔴 **NO subir a 16.x.** Trae `play-services-ads` ≥ 24.6.0 compilado con **Kotlin 2.3.0**, y Expo SDK 54 usa **Kotlin 2.1.20** → el build de Gradle muere en `:react-native-google-mobile-ads:compileDebugKotlin`. Y **no "arreglarlo" subiendo Kotlin del proyecto a 2.3**: rompe KSP y otros módulos de Expo.

---

## Bloque C — Código y QA

### C1. Pendientes de código — ✅ CERRADO

- [x] **Fase 6 — NutriBot completa**: `app/asistente.tsx`, Edge Function, `ANTHROPIC_API_KEY` en secrets de Supabase, `useAsistenteStore`, cupo mensual server-side (free 20 / premium 250), contexto del niño auto-inyectado, historial de conversaciones (migración `030`)
- [x] Rotación mensual de videos free/premium con `pg_cron` (migraciones `032` y `033`)
- [x] Fix del race condition de anuncios — un premium veía banner en cada arranque en frío (commit `4d1e952`)
- [x] Eliminación de cuenta dentro de la app — **requisito de Google Play** (commit `6873329`)
- [x] Árbol de git limpio, `npm run lint` limpio

**Deuda técnica conocida (NO bloqueante, no rompe el build):**

- [ ] Error de tipos preexistente en `app/(tabs)/plan.tsx:387` (`string | null` vs `string | undefined`)
- [ ] Errores de tipos preexistentes en `lib/notificaciones.ts` (falta index signature en `NotificacionData`)

### C2. Endurecimiento de Supabase antes de prod

- [x] **`search_path` fijado** en las 9 funciones `SECURITY DEFINER` (migración `031`) — el linter ya no lo reporta
- [x] **Cerrada la enumeración de usuarios** — revocado el `EXECUTE` de `verificar_email_registrado` a `anon`/`authenticated` (migración `031`). Ese RPC convertía el formulario de reset en un buscador de usuarios: con la anon key (pública, viaja en el APK) se podía iterar emails y sacar el padrón. En una app de alimentación infantil eso revela que la persona tiene un hijo pequeño.

- [ ] ~~**Activar leaked password protection**~~ — **NO DISPONIBLE: requiere el plan Pro.** El proyecto está en Free.

  > ⚠️ Otra corrección de este documento: lo puse como "un toggle, cero código, hacelo". **Es de pago.** Ante una feature del dashboard, verificar el plan antes de prometer que es gratis.

- [ ] _(Opcional, bajo impacto)_ Bucket público `recetas-imagenes`: la policy `publico lee imagenes recetas` da `SELECT` al rol `public`, lo que permite **listar todos los archivos**. Un bucket público sirve las imágenes por URL directa **sin necesitar esa policy**, así que se puede borrar sin romper nada. Verificar en dispositivo después de tocarlo.

- [ ] _(Opcional, bajo impacto)_ Revocar `EXECUTE` de `user_es_premium(uuid)` a `anon`/`authenticated`. Hoy cualquiera con la anon key puede preguntar si un `user_id` dado es premium. **Verificado que es seguro revocarlo**: no lo usa ninguna policy ni vista; solo lo llaman la Edge Function `nutribot` (con `service_role`) y triggers `SECURITY DEFINER`, que no pierden el permiso. Mismo patrón que la migración `031`.

> **Los otros WARN del linter son ruido, no deuda:**
>
> - `stats_admin()` callable por anon → **tiene `IF NOT es_admin() THEN RAISE EXCEPTION` adentro.** Verificado leyendo la definición.
> - `crear_suscripcion_gratuita()`, `rls_auto_enable()`, `check_limite_*()` → son funciones de **trigger / event trigger**. Postgres no deja invocarlas por RPC.
> - `webhook_events_procesados` con RLS y sin policies → **intencional**: solo `service_role` la toca.

> 🔴 **Ignorar deliberadamente**: el linter marca ERROR `security_definer_view` sobre `recetas_teaser`. **Es intencional y está documentado.** Esa vista gatea `video_url` con `auth.uid()` por request. Cambiarla a `security_invoker` **rompe el modelo de desbloqueo de videos**.

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

| #   | Riesgo                            | Costo si aparece tarde                                             | Estado       |
| --- | --------------------------------- | ------------------------------------------------------------------ | ------------ |
| 1   | Sin env vars en EAS               | App crashea al abrir. Build perdido + posible reseña de 1 estrella | ✅ cerrado   |
| 2   | App ID de AdMob de prueba         | Cero ingresos por ads. Rebuild completo                            | ✅ cerrado   |
| 3   | Público declarado como "niños"    | Formatos de ads restringidos. Corregir ficha y esperar revisión    | ✅ cerrado   |
| 4   | Requisito de 12 testers / 14 días | +2 semanas de calendario                                           | 🔴 abierto   |
| 5   | OAuth en modo Testing             | Nadie entra con Google en producción                               | 🔴 abierto   |
| 6   | SHA-1 de producción no cargado    | `DEVELOPER_ERROR` en login con Google                              | 🔴 verificar |
| 7   | Service Account de Play faltante  | RevenueCat no valida compras → **nadie puede pagar**               | 🔴 abierto   |

## Patrón que se repitió toda la implementación: los FALLOS SILENCIOSOS

Ninguno de estos tiraba error. Ninguno se veía usando la app normalmente. Vale tenerlos
presentes como categoría, porque el próximo va a tener la misma forma:

| Fallo                                    | Por qué no se veía                                                                |
| ---------------------------------------- | --------------------------------------------------------------------------------- |
| Key `test_` de RevenueCat en producción  | En desarrollo funciona igual; solo falla el cobro real                            |
| Variable duplicada en `.env.local`       | Sin error: gana la PRIMERA, en silencio                                           |
| `Pressable` con `style` como función     | css-interop descarta los estilos sin warning                                      |
| Política de privacidad sin `.html` → 404 | El link "existía", pero devolvía 404                                              |
| Race condition de anuncios               | Solo en el arranque en frío de un usuario premium                                 |
| Data Safety en "no recopila datos"       | El formulario guardaba feliz una declaración falsa                                |
| Prompt caching de NutriBot               | Si el system prompt baja de 1.024 tokens, deja de cachear en silencio → input 10x |

---

## Hardening que queda para después de v1.0

- **SSV (Server-Side Verification) en el ad unit rewarded.** Hoy `canjear-desbloqueo` confía en que el cliente vio el anuncio. Daño máximo: un usuario técnico se autoregala 24h de un video. Riesgo bajo, pero es la forma correcta de cerrarlo.
- Fijar `search_path` en las funciones del linter.
- Endurecer la policy de listado del bucket de imágenes.
