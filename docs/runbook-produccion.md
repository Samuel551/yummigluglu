# Runbook — el día que Google apruebe producción

> **Para qué sirve este archivo**: cuando llegue la aprobación de acceso a producción, no hay que
> averiguar nada. Se ejecuta de arriba hacia abajo. Todos los valores están abajo, ya verificados
> contra el código (2026-08-19).
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

## Paso 0 — NO está bloqueado: hacerlo YA

**`yummigluglu.com` ya está registrado en Cloudflare, con el DNS gestionado ahí.** No hace falta
esperar a Google para esto.

1. Cloudflare → Worker `yummigluglu-web` → **Custom Domains** → agregar `yummigluglu.com`
2. Subir las **4 páginas** de `web/` (hoy `index.html` y `app-ads.txt` **no están publicados**)
3. Verificar que respondan 200:
   - `https://yummigluglu.com/app-ads.txt`
   - `https://yummigluglu.com/privacidad.html`
   - `https://yummigluglu.com/eliminar-cuenta.html`
4. En la ficha de Play, apuntar **sitio web del desarrollador** y política de privacidad a
   `yummigluglu.com` (no al `workers.dev`)

> ⚠️ **`app-ads.txt` NUNCA va en `*.workers.dev`**: es dominio compartido (Public Suffix List, como
> `github.io`). Los rastreadores resuelven al dominio registrable y la validación queda ambigua.
>
> 💡 Cloudflare hace **clean URLs**: `/privacidad.html` devuelve **307** hacia `/privacidad`, que da 200. Un `curl` sin `-L` parece roto y **no lo está**.

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

**Requiere**: acceso a producción.

1. Google Cloud Console → crear **Service Account** en el proyecto ligado a Play
2. Play Console → **Usuarios y permisos** → invitarla con permisos de datos financieros / pedidos
3. Descargar el **JSON** de credenciales
4. RevenueCat → configuración de la app de Play Store → subir el JSON

Sin esto RevenueCat **no puede validar las compras contra Google**.

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

## Orden de dependencias

```
Paso 0 (dominio + web)  ──── se puede HOY, no depende de nadie
                    │
Aprobación de Google ├──> Paso 1 (AdMob ↔ Play) ──> Paso 2 (app-ads.txt)
                    │
                    └──> Paso 3 (productos) ──> Paso 4 (Service Account) ──> Paso 5 (QA compras)
```
