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
