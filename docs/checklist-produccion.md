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

## 📌 Plan para mañana (2026-08-06) — EL BUILD

Es lo único que queda. **No hay más trabajo de código pendiente.**

```
1. eas build -p android --profile preview      → APK solo para el owner
2. Instalarlo y probar a fondo                 → los testers ni se enteran si algo sale mal
3. eas build -p android --profile production   → AAB
4. INSTALARLO Y ABRIRLO ANTES DE SUBIRLO       → ver nota de abajo
5. Subir al canal de prueba cerrada
6. Los testers terminan los 14 días con la app CORREGIDA
```

> 🔴 **El paso 4 no se saltea por confianza.** Es el único que atrapa el crash por variables
> de entorno faltantes, que es el riesgo nº1 de esta tabla (`lib/supabase.ts` lanza excepción
> al arrancar si falta la URL o la anon key → pantalla negra, no degradación).

**Por qué el build va AHORA y no al terminar la prueba:** si se buildea al final, se publica
en producción un binario **que nadie probó**. Los testers habrían pasado 14 días con la
versión del 2 de agosto, y lo que se lanza tiene RevenueCat v10 (SDK de **pagos**),
keyboard-controller en 7 pantallas, SSV y 13 componentes tocados. La prueba no habría
validado nada de eso.

**Qué probar sí o sí en el paso 2:**

- [ ] Abrir la app (no crashea → las env vars llegaron)
- [ ] Teclado en login, register y NutriBot: entra y sale sin dejar espacio muerto
- [ ] Botones "Volver": con margen y en fila, no apilados
- [ ] Perfil → Cuenta → **Eliminar cuenta** aparece y el doble Alert funciona
- [ ] **Usuario premium: CERO anuncios**, sobre todo en arranque en frío
- [ ] Tab Videos: badge "GRATIS ESTE MES" en las libres
- [ ] Rewarded → desbloquea el video (**requiere el SSV ya configurado en AdMob ✅**)
- [ ] Login con Google (ya arreglado del lado de Google Cloud)
- [ ] Panel admin: aparecen las métricas de NutriBot

> ℹ️ **Sobre los testers**: NO tienen que desinstalar nada. Play actualiza el canal cerrado
> como cualquier app, y en la mayoría es automático. **Publicar versiones nuevas NO reinicia
> los 14 días** — iterar durante la prueba es justamente lo que Google espera.

## 🔒 Bloqueado hasta PRODUCCIÓN (no insistir antes)

Todo esto necesita que la app esté **públicamente publicada**. Verificado el 2026-08-05:

| Tarea                                   | Por qué no se puede antes                                                                           |
| --------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Vincular AdMob ↔ ficha de Play          | El buscador de AdMob solo ve el **catálogo público** de Play. Una app en prueba cerrada no aparece. |
| `app-ads.txt` validado                  | AdMob lo rastrea desde el sitio del desarrollador **de la ficha vinculada**, que no existe todavía. |
| Productos de suscripción → entitlements | Requiere acceso a producción en Play Console.                                                       |
| Service Account de Play → RevenueCat    | Decisión del owner: se hace al pasar a producción, junto con el resto del cobro.                    |

> **Consecuencia del punto 1 mientras tanto**: la app queda en _limited ad serving_ (en AdMob figura como **"Estado de aprobación: Debe revisarse"**). **Es esperable y no es un bug.** Durante la prueba cerrada da igual: 12 testers no generan ingresos.

**El build (6) incluye 4 cosas que hoy NO están en el dispositivo de nadie:**

- 🔴 **Play Billing Library 8.3.0** — obligatoria desde el **30 ago 2026** o se rechazan las actualizaciones
- La pantalla de eliminar cuenta
- El fix del race condition de anuncios (premium veía banner al arrancar)
- El badge "GRATIS ESTE MES" de la rotación de videos

> ⚠️ **El build subió de prioridad.** Ya no es solo "llevar mejoras": lleva un requisito con **fecha de corte al 30 de agosto**. Y como el cambio es en el SDK de pagos, el flujo de compra hay que **reprobarlo completo** — lo que a su vez depende del Service Account (tarea 2). Orden real: **2 → 6 → QA de compras**.

---

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

- [ ] 🔒 **`app-ads.txt`** — archivo ya creado en `web/app-ads.txt`, falta publicarlo y declararlo

  Contenido (una línea; el publisher sale del App ID de `app.json`, verificado):

  ```
  google.com, pub-8216818579305822, DIRECT, f08c47fec0942fa0
  ```

  **Qué es**: la declaración pública de quién puede vender tu inventario publicitario. Sin él, buena parte de los compradores **no puja** por tu inventario — no es una penalización, es que no te ven. Por eso AdMob avisa de "pérdida significativa de ingresos".

  **Dónde va**: en la RAÍZ del dominio que declares como _sitio web del desarrollador_ en la ficha de Play. AdMob lee ese campo y busca `https://TU-DOMINIO/app-ads.txt`.

  > ⚠️ **NO usar el dominio `*.workers.dev`.** Es un dominio **compartido** (está en la Public Suffix List, como `github.io`), y los rastreadores de app-ads.txt resuelven al dominio registrable — ahí la validación se vuelve ambigua. El lugar correcto es **`yummigluglu.com`**, que ya está registrado y con DNS en Cloudflare.
  >
  > Camino recomendado: agregar `yummigluglu.com` como **dominio personalizado** del Worker en Cloudflare y servir desde ahí las 4 páginas (`index`, `privacidad`, `eliminar-cuenta`, `app-ads.txt`). De paso quedan URLs profesionales para la ficha de Play.

  > ℹ️ Tras publicar el archivo, **AdMob tarda ~24 h en rastrearlo**. La advertencia no desaparece al instante.

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

### A4. Google OAuth — 🔴 SÍNTOMA REPORTADO POR UN TESTER (2026-08-03)

> 🔴 **Un tester reportó error al iniciar sesión con Google desde la build de prueba cerrada.** Ninguna de las dos causas posibles estaba cerrada, así que el fallo era esperable. **Las dos hay que arreglarlas antes de producción.**

#### Estado del diagnóstico al 2026-08-04 — 5 hipótesis DESCARTADAS con datos

| Hipótesis                                | Cómo se descartó                                                       |
| ---------------------------------------- | ---------------------------------------------------------------------- |
| Consent screen en modo Testing           | Google Auth Platform → Público dice **"En producción"**                |
| SHA-1 de Play App Signing sin registrar  | OAuth Client `Yummi Glu Glu Android - Play` lo tiene desde el 3 ago    |
| Nombre de paquete mal escrito            | Dice `com.yummigluglu.app`, idéntico a `app.json`                      |
| Falta `GOOGLE_WEB_CLIENT_ID` en el build | Variable creada **1 ago 23:47**, build de producción **2 ago 16:07**   |
| Supabase mal configurado                 | **0 peticiones `grant_type=id_token` en 24h**, contra 11 de `password` |

> 🔑 **El hallazgo que ordena todo: la petición NUNCA sale del dispositivo.** Los logs de auth de Supabase registran los logins por contraseña de la app (`referer: yummigluglu://`) pero **cero** intentos con `id_token`. El error explota dentro de `GoogleSignin.signIn()` y Supabase ni se entera, así que toda hipótesis sobre configuración de Supabase queda descartada por construcción.
>
> **Cómo repetir la comprobación**: MCP de Supabase → `get_logs` service `auth` → contar `grant_type`. Si aparece `id_token`, el problema es del lado de Supabase; si no aparece, es del cliente. Parte el problema en dos en un minuto.

**Qué falta para cerrarlo**: el **código de error real del dispositivo**. Desde el commit `40d3686`, cuando un error no matchea ningún patrón conocido el mensaje muestra el código entre paréntesis — así que **una foto de la pantalla del tester va a alcanzar**. Viaja en el próximo build.

> ⚠️ **NO es bloqueante para publicar.** El login por correo y el registro funcionan. Google es un método alternativo, no el principal.

**Referencia — cómo distinguir la causa por el texto del error:**

| Lo que ve el tester                                                          | Causa                 |
| ---------------------------------------------------------------------------- | --------------------- |
| Elige la cuenta y falla al instante · `DEVELOPER_ERROR` · "Error 10"         | SHA-1 (A4.1)          |
| "Acceso bloqueado" · "no completó el proceso de verificación" · "en pruebas" | Consent screen (A4.2) |

#### A4.1 — SHA-1 de **Play App Signing** (la causa más probable)

- [ ] Crear un **OAuth Client de Android NUEVO** en Google Cloud (`yummi-glu-glu`) con el SHA-1 de Play y package `com.yummigluglu.app`

> **Por qué falla justo en Play y no en el dev client**: al subir un AAB, **Google lo vuelve a firmar** con su propia clave (Play App Signing). El APK que le llega al tester **no está firmado con el keystore de EAS**, así que la huella que la app presenta en runtime es **la de Google** — una que Google Cloud no tiene registrada → `DEVELOPER_ERROR`. Mismo código, distinta firma.
>
> El SHA-1 correcto sale de: **Play Console → la app → Prueba y lanzamiento → Configuración → Integridad de la app → Certificado de la clave de firma de apps → SHA-1.**
>
> ⚠️ **El formulario de un OAuth Client de Android acepta UNA sola huella.** No se agrega al cliente existente: **se crea un cliente nuevo.** (Ya me equivoqué una vez diciendo que se sumaba al mismo.)
>
> Conviene tener **los dos clientes** en paralelo: el del keystore de EAS (dev client) y el de Play App Signing (builds distribuidas por Play). Si no, arreglás producción y rompés el desarrollo.

#### A4.2 — Publicar el consent screen

- [x] ~~Google Cloud Console → `yummi-glu-glu` → OAuth consent screen → **Publish app**~~ — ✅ **YA ESTABA HECHO.** Verificado en pantalla el **2026-08-22**: Google Auth Platform → _Público_ → **Estado de publicación: "En producción"**, tipo _Usuarios externos_.

> ⚠️ **Esta tarea estaba sin tildar y contradecía a la tabla de hipótesis descartadas de más arriba**, que desde el 2026-08-04 ya decía "Público dice En producción". Cuando dos partes del mismo documento se contradicen, **gana la que cita una observación en pantalla**, no la casilla sin tildar.

> La app usa solo scopes básicos (`email`, `profile`, `openid`), que son **no sensibles**: publicar es **un click, sin cola de verificación**. Mientras siga en Testing, **solo loguean las cuentas cargadas como test users** — un usuario real de Play no entra.
>
> **Mientras tanto**, para desbloquear a los testers de esta semana sin publicar: agregar sus correos como _test users_ en el consent screen.

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
- [x] **`react-native-purchases` en `^10.6.0` → Play Billing Library 8.3.0** (subido el 2026-08-04)

  > 🔴 **Aviso de Google Play recibido el 2026-08-04**: desde el **30 de agosto de 2026** toda app debe usar Play Billing Library **≥ 8.0.0** o **se rechazan las actualizaciones**. La app estaba en `react-native-purchases ^8.9.0` → `billing 7.1.1`. **La Billing Library no se declara en el proyecto: viene dentro de RevenueCat.** Detalle completo de la cadena y cómo verificarla en `CLAUDE.md` § "RevenueCat — versión del SDK y la Play Billing Library".
  >
  > ⚠️ **Este cambio NO está en ningún dispositivo hasta el próximo build**, y el flujo de compra hay que **reprobarlo entero** — es el SDK que maneja el dinero.

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
