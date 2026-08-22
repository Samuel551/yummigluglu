# Runbook — producción

> 🎉 **EL DÍA D LLEGÓ: 2026-08-22.** Google concedió el **acceso a producción** (verificado en
> pantalla: _Prueba y lanza_ → **Producción** muestra "Crear una versión nueva" habilitado, sin
> cartel de solicitud).
>
> 🔴 **Acceso ≠ publicada.** El track sigue **"Inactivo"** = no hay versión publicada, la app **no
> está en el catálogo público**. Los pasos 1 y 2 siguen esperando eso.
>
> **Para qué sirve este archivo**: no hay que averiguar nada. Se ejecuta **en el orden del grafo del
> final**, no por número. Todos los valores están abajo, verificados contra el código (2026-08-19).
>
> Estado de tareas → `docs/checklist-produccion.md`. Esto es **cómo se hace**, no **qué falta**.

---

## Datos duros — verificados contra el repo

| Dato                       | Valor                                                                  | De dónde sale                  |
| -------------------------- | ---------------------------------------------------------------------- | ------------------------------ |
| Package name               | `com.yummigluglu.app`                                                  | `app.json`                     |
| AdMob publisher ID         | `pub-8216818579305822`                                                 | `web/app-ads.txt`              |
| AdMob Android App ID       | `ca-app-pub-8216818579305822~7966838081`                               | `app.json` (plugin)            |
| Contenido de `app-ads.txt` | `google.com, pub-8216818579305822, DIRECT, f08c47fec0942fa0`           | `web/app-ads.txt`              |
| Dominio propio             | `yummigluglu.com` — registrado en Cloudflare                           | `CLAUDE.md` § Resend           |
| Worker actual              | `yummigluglu-web.samfrasan.workers.dev`                                | `docs/checklist-produccion.md` |
| Páginas a servir           | `index.html`, `privacidad.html`, `eliminar-cuenta.html`, `app-ads.txt` | `web/`                         |

✅ El publisher de `app-ads.txt` **coincide** con el App ID de `app.json`. Verificado, no hay que revisarlo.

---

## Paso 0 — ✅ HECHO el 2026-08-19 (dominio propio publicado)

`yummigluglu.com` quedó agregado como **Custom Domain** del Worker `yummigluglu-web`
(Cloudflare → Workers → `yummigluglu-web` → pestaña **Dominios** → _Añadir dominio_).

> 📍 **Dónde está la opción**: es una **pestaña propia del Worker llamada "Dominios"**, al lado de
> _Access_. **NO** está dentro de _Configuración_, ni en el panel del dominio de la barra izquierda.
> El vínculo se crea **desde el Worker**, no desde el dominio.

### Verificación con `curl` — 2026-08-19

```
DNS  yummigluglu.com  →  104.21.25.221 · 172.67.134.203   (Cloudflare)

yummigluglu.com/                     -> 200
yummigluglu.com/app-ads.txt          -> 200
yummigluglu.com/privacidad.html      -> 200
yummigluglu.com/eliminar-cuenta.html -> 200
```

El `app-ads.txt` servido es **byte a byte idéntico** a `web/app-ads.txt`:

```
google.com, pub-8216818579305822, DIRECT, f08c47fec0942fa0
```

No hubo que resubir archivos: el mismo Worker con los mismos assets pasó a servirse también desde
el dominio propio.

### ✅ Lo que faltaba del paso 0 — también cerrado (2026-08-19)

Las dos URLs de la ficha de Play ya apuntan al dominio propio, **confirmadas en pantalla**:

| Campo                  | Dónde está                                                                             | Valor                                     | ¿Pasa por revisión?            |
| ---------------------- | -------------------------------------------------------------------------------------- | ----------------------------------------- | ------------------------------ |
| Política de privacidad | Protegido con Play → Contenido de la app → Política de Privacidad                      | `https://yummigluglu.com/privacidad.html` | **SÍ**                         |
| Sitio web              | Aumenta la cantidad de usuarios → Ficha principal de Play Store → Detalles de contacto | `https://yummigluglu.com`                 | **NO** — se aplica al instante |

> ⚠️ **Los "Detalles de contacto" NO pasan por revisión.** Por eso el campo _Sitio web_ nunca aparece
> en la lista de cambios pendientes y parece que no se guardó. Hay que **ir a mirar el campo** para
> confirmarlo; la lista de revisión no sirve como prueba para esos campos.

> El de política de privacidad **exige URL completa con `https://`** y va la **página**, no la raíz.
> El de _Sitio web_ va con **dominio raíz sin path**.

---

## Paso 1 — Vincular AdMob ↔ ficha de Play

**Requiere**: app pública en Play (el buscador de AdMob solo ve el catálogo público).

AdMob → **Apps** → Yummi Glu Glu → **Configuración de la app** → vincular a la tienda → buscar
`com.yummigluglu.app`.

Mientras no esté vinculada, AdMob muestra **"Estado de aprobación: Debe revisarse"** y sirve pocos
anuncios (_limited ad serving_). **Es la consecuencia esperada, no un bug.**

## Paso 2 — Validar `app-ads.txt`

**Requiere**: paso 0 + paso 1. AdMob rastrea el archivo desde el sitio del desarrollador **de la
ficha vinculada**.

AdMob → **Apps** → pestaña **app-ads.txt** → ver estado. El rastreo **no es inmediato** (puede
tardar más de 24 h). No tocar nada mientras tanto.

## Paso 3 — Productos de suscripción

**Requiere**: acceso a producción.

Play Console → **Monetiza con Play** → **Productos** → **Suscripciones** → crear.
Después, en RevenueCat: asociar cada producto a un **Offering** y al **Entitlement**.

> 🔎 **El backend NO depende de los IDs de producto.** `revenuecat-webhook` mapea por **tipo de
> evento**, no por SKU: `INITIAL_PURCHASE` / `RENEWAL` / `UNCANCELLATION` / `NON_RENEWING_PURCHASE` /
> `CANCELLATION` → `plan = 'premium'`; `EXPIRATION` / `BILLING_ISSUE` → `plan = 'free'`.
> Se pueden nombrar los productos como se quiera, con tal de que queden dentro del Offering.
>
> ℹ️ `useSuscripcionStore.ts` acepta `'premium'` y `'premium_anual'`, pero el webhook **nunca emite
> `premium_anual`** — siempre escribe `'premium'`. La rama anual es defensiva y **no rompe nada**
> (un suscriptor anual entra igual por `'premium'`). No "arreglarla" sin pensar.

## Paso 4 — Service Account de Play → RevenueCat

**Requiere**: acceso a producción ✅ (concedido el 2026-08-22) + Paso 3 cerrado ✅.

Sin esto RevenueCat **no puede validar las compras contra Google**: el usuario paga, el
entitlement no se concede y la app lo deja en `free`.

> 🔴 **EL JSON ES UNA CREDENCIAL Y EL REPO ES PÚBLICO** (`github.com/Samuel551/yummigluglu`,
> `private: false`, verificado contra la API). Google lo descarga como
> `<project-id>-<key-id>.json` (ej. `yummi-glu-glu-3f2a1b9c8d7e.json`). Ese archivo da acceso a
> los **datos financieros y los pedidos** de Play Console.
>
> **Guardalo FUERA del proyecto** (ej. `C:\Users\Samuel\secretos\`). El `.gitignore` ya atrapa
> `yummi-glu-glu-*.json`, `*service-account*.json`, `*-credentials.json` y `secretos/`
> (verificado con `git check-ignore`), pero eso es el **cinturón de seguridad, no el plan**.
>
> Si alguna vez se filtra: Google Cloud → la service account → _Manage keys_ → **borrar la clave**
> y generar otra. Rotar la clave la invalida al instante; el JSON viejo queda muerto.

### 4.0 — ❌ NO existe. No busques "Acceso a la API" en Play Console.

> 🔴 **Google ELIMINÓ este requisito.** Textual en su doc oficial
> ([android-publisher/getting_started](https://developers.google.com/android-publisher/getting_started)):
> _"You no longer need to link your developer account to a Google Cloud Project in order to access
> the Google Play Developer API."_
>
> **No hay que vincular ningún proyecto de Google Cloud con Play Console.** La service account se
> crea en el proyecto de Google Cloud que se quiera y se le da acceso **solo** invitándola en
> Play Console → **Usuarios y permisos** (paso 4.4). Nada más.
>
> ⚠️ Este paso estaba en el runbook y **hizo perder tiempo el 2026-08-22** buscando una página que
> ya no cumple esa función. Se deja documentado en negativo a propósito: si alguien lee un tutorial
> viejo que manda a _Configuración → Acceso a la API_, **que sepa que puede saltearlo**.

**Proyecto de Google Cloud a usar: `yummi-glu-glu`** — el mismo del login con Google. No por
obligación, sino para no dispersar credenciales en varios proyectos.

### 4.1 — Habilitar 3 APIs (no 1)

Google Cloud Console → **APIs y servicios** → _Habilitar API_, en el proyecto `yummi-glu-glu`:

- **Google Play Android Developer API**
- **Google Play Developer Reporting API**
- **Google Cloud Pub/Sub API** ← la que casi siempre se olvida; sin ella el paso 4.6 falla

### 4.2 — Crear la Service Account CON 2 roles

Google Cloud Console → **IAM y administración** → **Cuentas de servicio** → _Crear cuenta de
servicio_. En el paso 2 ("Otorgar acceso"), asignar **los dos**:

| Rol                   | Para qué                                                                                       |
| --------------------- | ---------------------------------------------------------------------------------------------- |
| **Pub/Sub Editor**    | Habilita las notificaciones de servidor. Si tira error de permisos, subir a **Pub/Sub Admin**. |
| **Monitoring Viewer** | Deja monitorear la cola de notificaciones.                                                     |

El paso 3 (acceso de usuarios) se saltea. **Copiar el email de la cuenta** (`…@….iam.gserviceaccount.com`) — se usa en 4.4.

> ⚠️ El runbook viejo decía que no hacían falta roles. **Era incorrecto.** Sin `Pub/Sub Editor`,
> RevenueCat no puede crear el topic en 4.6.

> 🔴 **LA TRAMPA DEL FILTRO — pasó de verdad el 2026-08-22.** Al filtrar por `Pub/Sub` en el
> selector de roles, Google mezcla en la misma lista los roles de **Pub/Sub** y los de
> **Pub/Sub _Lite_**, que es **otro producto** (zonal, con su propia API y sus propios permisos).
> Se eligió **"Editor de Pub/Sub Lite"** (`roles/pubsublite.editor`) creyendo que era el correcto.
>
> **`roles/pubsublite.editor` NO otorga ningún permiso sobre Pub/Sub normal.** El rol que va es
> **`roles/pubsub.editor`**, que en la UI en español figura **exactamente** como `Editor de Pub/Sub`
> — sin nada después de "Pub/Sub".
>
> Variantes que aparecen en ese filtro y **NO** sirven: `Publicador de Pub/Sub`,
> `Suscriptor de Pub/Sub`, `Visualizador de Pub/Sub`, y **toda** la familia `… de Pub/Sub Lite`.
>
> 💡 **El error no da la cara acá**: la cuenta se crea igual, sin advertencias. Revienta recién en
> el **4.6**, con un error de permisos al crear el topic, a horas de distancia y sin pista de la
> causa. **Verificar los roles en pantalla antes de seguir** (ver recuadro siguiente).

> ✅ **Cómo verificar los roles después de crear la cuenta** — el asistente de creación no deja
> revisarlos, pero IAM sí: Google Cloud Console → **IAM y administración** → **IAM**
> (`console.cloud.google.com/iam-admin/iam?project=yummi-glu-glu`) → buscar la cuenta en la columna
> _Entidad_. La columna _Rol_ tiene que decir **`Editor de Pub/Sub`** y **`Visualizador de
Monitoring`**.
>
> **Los roles son editables para siempre** (✏️ lápiz en la fila): equivocarse acá no obliga a
> rehacer la cuenta ni a regenerar el JSON.

### 4.3 — Generar y descargar el JSON

En la lista de cuentas de servicio → menú de 3 puntos → **Administrar claves** → _Agregar clave_ →
**Crear clave nueva** → formato **JSON** → descargar.

**Al bajarlo, moverlo a `C:\Users\Samuel\secretos\` inmediatamente.** No dejarlo en Descargas ni,
mucho menos, en la carpeta del proyecto.

### 4.4 — Invitar la cuenta en Play Console con 3 permisos

Play Console → **Usuarios y permisos** → _Invitar a un usuario_ → pegar el email de 4.2.

- **Permisos de app**: agregar `com.yummigluglu.app`
- **Permisos de cuenta**, los tres:
  - ✅ Ver información de la app y descargar informes masivos (solo lectura)
  - ✅ Ver datos financieros, pedidos y respuestas de encuestas de cancelación
  - ✅ **Administrar pedidos y suscripciones**

Enviar la invitación.

### 4.5 — Subir el JSON a RevenueCat

RevenueCat → **Project Settings** → la app de **Google Play Store** → arrastrar el JSON al campo
**Service Account Credentials JSON** → guardar.

### 4.6 — Notificaciones en tiempo real (RTDN)

Recién **después** de que las credenciales estén activas:

1. RevenueCat → Google Play App Settings → botón **"Connect to Google"** → genera un **Topic ID** → copiarlo.
2. Play Console → **Monetizar** → **Configuración de monetización** → _Notificaciones para
   desarrolladores en tiempo real_ → pegar en **Nombre del tema**.
3. Elegir **"Suscripciones, compras anuladas y todos los productos únicos"** → guardar.
4. Apretar **"Enviar notificación de prueba"**. Si aparece un **"Last received"** en RevenueCat, cerró.

Sin RTDN, RevenueCat se entera de renovaciones y cancelaciones **por sondeo** en vez de al instante.

---

### 🔴 Los 3 gotchas que cuestan horas

> ⏳ **Propagación de hasta 36 HORAS.** Es lo que dice la doc oficial de RevenueCat, textual. Si
> justo después de cargar el JSON el Paso 5 falla, **lo más probable es que sea esto, NO un bug**.
> No empezar a "arreglar" el flujo de compra antes de descartarlo.
>
> 💡 **Atajo documentado por RevenueCat**: entrar a Play Console → _Monetizar_ → editar la
> descripción de cualquier producto → guardar. Eso puede activar las credenciales al instante.

> ⚠️ **Domain Restricted Sharing.** Las organizaciones de Google Cloud creadas **después del 3 de
> mayo de 2024** traen esa política prendida por defecto, y **bloquea agregar la service account**.
> Si el paso 4.4 o el 4.6 rebotan por política, es esto: hay que desactivarla o hacer un override a
> nivel del proyecto.

> ⚠️ **El paso 4.6 pide un permiso extra sobre el topic.** La cuenta de Google
> `google-play-developer-notifications@system.gserviceaccount.com` necesita el rol **Pub/Sub
> Publisher** sobre el topic creado. Se agrega en Google Cloud → Pub/Sub → el topic → _Permisos_ →
> _Agregar principal_.

## Paso 5 — QA del flujo de compra (NO SALTEAR)

> 🔴 **El SDK de pagos saltó dos majors**: `react-native-purchases` de `^8.9.0` a `^10.6.0`
> (commit `f8534cd`, por el requisito de Play Billing 8). **Ese flujo de compra nunca se volvió a
> probar end-to-end en dispositivo.**

Depende del paso 4. Configurar **verificadores de licencia** en Play Console
(Configuración → Pruebas de licencia) para comprar sin cobro real, y probar el ciclo completo:

- [ ] Compra inicial → llega el webhook → `suscripciones.plan = 'premium'`
- [ ] La app refleja premium sin reiniciar (ver "RevenueCat — polling post-compra" en `CLAUDE.md`)
- [ ] Los anuncios desaparecen para el premium
- [ ] Cancelación → sigue premium hasta `expires_at`
- [ ] Expiración → vuelve a `free`

---

## Paso 6 — Publicar la versión de producción

**Requiere**: pasos 3, 4 y 5 cerrados. **No antes.**

Play Console → **Prueba y lanza** → **Producción** → **Crear una versión nueva** → en _Paquetes de
aplicación_ elegir **"Agregar desde la biblioteca"** y tomar el **`versionCode 2`** ya subido a la
prueba cerrada.

> ✅ **No se rebuildea.** Ese bundle ya está firmado, aceptado por Play y trae RevenueCat v10 /
> Billing 8. Rebuildear solo quema otro `versionCode` y agrega riesgo.

> ⏳ La primera publicación en producción pasa por **revisión humana de Google** (días, no minutos).
> Recién cuando quede _Activo_ y la ficha sea visible en el catálogo público arrancan los pasos 1 y 2.

> 💡 Se puede lanzar por **etapas** (10 % → 50 % → 100 %) desde la misma pantalla. Con base de
> usuarios chica no aporta mucho, pero es la red de seguridad si el QA de compras dejó dudas.

---

## Orden de dependencias

```
Paso 0 (dominio + ficha)              ✅ CERRADO el 2026-08-19
Acceso a producción concedido         ✅ 2026-08-22
        │
        ├──> Paso 3 (productos de suscripción)
        │            │
        │            ▼
        │       Paso 4 (Service Account → RevenueCat)
        │            │
        │            ▼
        │       Paso 5 (QA del flujo de compra)   🔴 NO SALTEAR
        │            │
        │            ▼
        └──────> Paso 6 (PUBLICAR producción)
                     │
          Google aprueba (revisión humana, días)
                     │
                     ▼
                Paso 1 (AdMob ↔ ficha de Play) ──> Paso 2 (app-ads.txt)
```

> 🔴 **La única regla innegociable del orden**: el **cobro se conecta antes de publicar**. Sin el
> Service Account (paso 4), RevenueCat **no puede validar la compra contra Google** → el usuario paga
> y la app lo deja en `free`. Cobro sin producto, reembolso y reseña de 1 estrella el primer día.
