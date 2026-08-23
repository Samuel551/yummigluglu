# Recetas SIEMPRE FREE — `rotacion_grupo = 0`

> 📅 Generado el **2026-08-23** desde la base (`uoqzkbbnesmvmgbjikrn`).
> **53 recetas · 25,6% del catálogo · las 53 tienen video.**

Estas recetas **nunca se bloquean**. El job mensual `rotar_videos_premium()` (pg_cron, día 1 a las
03:00 UTC) **no las toca**: su video queda libre para todos, todos los meses, para siempre.

**Para qué sirve esta lista**: es el material de marketing. Cualquiera de estas se puede promocionar
en redes con la certeza de que quien abra la app **va a poder ver el video**, sin importar el mes ni
si es premium. Con las de los grupos 1–3 eso no se puede prometer: rotan.

> 🔒 **Sin links de YouTube a propósito.** Este repo es **público** y los videos son de YouTube _no
> listado_ — pegar las URLs acá las volvería rastreables desde fuera de la app. Si necesitás los
> links para publicar, se generan aparte y se guardan **fuera del repo**.

## Cómo regenerar esta lista

```sql
select nombre, slug,
       array_to_string(etapas_compatibles, ' / ') as etapas,
       array_to_string(momento_dia, ' / ')        as momentos,
       tiempo_preparacion, alergenos, tags
from public.recetas
where activa and rotacion_grupo = 0
order by nombre;
```

---

## 🍼 Etapa `inicio` (6–8 meses) — 11 recetas

| Receta                                       | Momento          | Min | Alérgenos | País  |
| -------------------------------------------- | ---------------- | --- | --------- | ----- |
| Atol de yuca venezolano                      | desayuno / snack | 18  | —         | 🇻🇪    |
| Compota de aguaymanto y manzana              | snack / desayuno | 15  | —         | 🇵🇪    |
| Compota de mango maduro y banano             | snack / desayuno | 8   | —         | 🇨🇴    |
| Compota de níspero con manzana               | snack / desayuno | 15  | —         | 🇻🇪    |
| Papilla de quínoa con leche y canela         | desayuno / snack | 22  | lactosa   | 🇵🇪    |
| Puré de aguacate con limón mexicano          | snack            | 5   | —         | 🇲🇽    |
| Puré de banana con yogur natural             | snack / desayuno | 5   | lactosa   | 🇦🇷    |
| Puré de brócoli y papa                       | almuerzo / cena  | 20  | —         | LATAM |
| Puré de camote y plátano de la selva         | almuerzo / cena  | 18  | —         | 🇵🇪    |
| Puré de mamey con plátano                    | snack / desayuno | 5   | —         | 🇲🇽    |
| Puré de papa y zanahoria con aceite de oliva | almuerzo / cena  | 20  | —         | 🇨🇱    |

## 🥣 Etapa `inicio / transicion` — 5 recetas

| Receta                             | Momento          | Min | Alérgenos | País     |
| ---------------------------------- | ---------------- | --- | --------- | -------- |
| Arroz Cremoso con Espinaca         | almuerzo / cena  | 30  | —         | 🇨🇱 🇵🇪 🇨🇴 |
| Compota de durazno y manzana       | desayuno / snack | 15  | —         | 🇨🇱 🇦🇷    |
| Compota de Manzana y Pera          | desayuno / snack | 15  | —         | LATAM    |
| Puré de pescado con camote         | almuerzo / cena  | 25  | pescado   | 🇨🇱 🇵🇪 🇲🇽 |
| Puré de pollo con papa y zanahoria | almuerzo / cena  | 30  | —         | LATAM    |

## 🌟 Las 3 etapas — 1 receta

| Receta                            | Momento | Min | Alérgenos | País  |
| --------------------------------- | ------- | --- | --------- | ----- |
| Galletitas de zanahoria y manzana | snack   | 30  | gluten    | LATAM |

## 🥄 Etapa `transicion` (9–12 meses) — 12 recetas

| Receta                             | Momento          | Min | Alérgenos              | País     |
| ---------------------------------- | ---------------- | --- | ---------------------- | -------- |
| Ajiaco bogotano baby               | almuerzo / cena  | 50  | —                      | 🇨🇴       |
| Ajiaco peruano de papa baby        | almuerzo / cena  | 25  | lactosa                | 🇵🇪       |
| Calabacitas con elote y queso      | almuerzo / cena  | 22  | lactosa                | 🇲🇽       |
| Calentado caleño baby              | desayuno         | 18  | —                      | 🇨🇴       |
| Changua suave                      | desayuno         | 18  | lactosa, huevo, gluten | 🇨🇴       |
| Chupe verde de papa amarilla       | almuerzo / cena  | 30  | lactosa                | 🇵🇪       |
| Estofado suave de pollo con arroz  | almuerzo / cena  | 35  | —                      | 🇨🇱       |
| Fideos con tuco baby               | almuerzo / cena  | 35  | gluten                 | 🇦🇷       |
| Hervido de pollo con ñame y mapuey | almuerzo / cena  | 50  | —                      | 🇻🇪       |
| Mini panqueques de avena           | desayuno / snack | 15  | gluten, huevo, lácteos | 🇨🇱 🇻🇪 🇦🇷 |
| Mini tortilla de acelga            | almuerzo / cena  | 20  | huevo                  | 🇨🇱 🇦🇷    |
| Tamales de elote dulces baby       | snack / desayuno | 50  | lactosa                | 🇲🇽       |

## 🍽️ Etapa `transicion / preescolar` — 6 recetas

| Receta                              | Momento          | Min | Alérgenos              | País     |
| ----------------------------------- | ---------------- | --- | ---------------------- | -------- |
| Ajiaco santafereño suave            | almuerzo / cena  | 45  | —                      | 🇨🇴       |
| Caldo tlalpeño suave                | almuerzo / cena  | 35  | —                      | 🇲🇽       |
| Causa limeña de pollo               | almuerzo / cena  | 35  | —                      | 🇵🇪       |
| Galletitas de zanahoria con dátiles | snack            | 30  | gluten, huevo          | 🇵🇪 🇦🇷 🇲🇽 |
| Mazamorra con leche                 | desayuno / snack | 40  | leche                  | 🇦🇷       |
| Tortitas de zapallo al horno        | snack            | 30  | gluten, huevo, lácteos | 🇨🇱 🇵🇪 🇦🇷 |

## 🧒 Etapa `preescolar` (13m+) — 18 recetas

| Receta                                 | Momento                 | Min | Alérgenos              | País        |
| -------------------------------------- | ----------------------- | --- | ---------------------- | ----------- |
| Bolitas energéticas de dátiles y avena | snack                   | 15  | gluten                 | 🇨🇱 🇦🇷 🇲🇽    |
| Carbonada chilena                      | almuerzo / cena         | 55  | —                      | 🇨🇱          |
| Enchiladas suizas suaves               | almuerzo / cena         | 35  | gluten, lactosa        | 🇲🇽          |
| Galletitas de avena con miel y canela  | snack                   | 30  | gluten, huevo, lácteos | LATAM       |
| Galletitas de coco y limón             | snack                   | 30  | gluten, huevo          | 🇨🇴 🇻🇪 🇲🇽    |
| Humitas dulces baby                    | snack                   | 40  | lactosa                | 🇨🇱          |
| Mazamorra colombiana de maíz blanco    | snack                   | 60  | lactosa                | 🇨🇴          |
| Merluza al horno con puré              | almuerzo / cena         | 35  | pescado, lácteos       | 🇨🇱 🇵🇪 🇦🇷    |
| Milanesa de pollo al horno             | almuerzo / cena         | 30  | huevo, gluten          | 🇦🇷          |
| Pabellón criollo baby                  | almuerzo                | 50  | —                      | 🇻🇪          |
| Pan amasado                            | desayuno / snack        | 90  | gluten                 | 🇨🇱          |
| Pastel de choclo baby                  | almuerzo / cena         | 50  | lactosa, huevo         | 🇨🇱          |
| Pastelitos de batata al horno baby     | snack                   | 45  | gluten                 | 🇦🇷          |
| Porotos con riendas                    | almuerzo / cena         | 60  | gluten                 | 🇨🇱          |
| Quesadilla de frijoles y queso         | almuerzo / cena / snack | 10  | leche                  | 🇲🇽          |
| Quinoto de verduras                    | almuerzo / cena         | 35  | lácteos                | 🇨🇱 🇵🇪 🇨🇴 🇦🇷 |
| Tamales tolimenses baby light          | almuerzo / cena         | 90  | —                      | 🇨🇴          |
| Tequeños al horno baby                 | snack                   | 35  | lactosa, huevo, gluten | 🇻🇪          |

---

## 🔴 Al cargar recetas nuevas: `rotacion_grupo` tiene DEFAULT 0

```
rotacion_grupo  smallint  NOT NULL  DEFAULT 0
```

**Toda receta nueva entra al grupo "siempre free" sin que nadie lo decida.** Si se cargan 50 videos
más sin tocar nada:

|                            | Siempre free | Catálogo | %         |
| -------------------------- | ------------ | -------- | --------- |
| Hoy                        | 53           | 207      | **25,6%** |
| Tras +50 sin asignar grupo | 103          | 257      | **40,1%** |

El premium **se diluye solo, en silencio**, y no se nota hasta mirar los números meses después.
Antes de una carga masiva hay que decidir a qué grupo entra lo nuevo. Opciones: cambiar el default,
elegir el grupo en el formulario del admin, o un trigger que reparta por hash (como el `ntile(4)`
original).

## Los otros grupos, para referencia

| Grupo | Recetas | Comportamiento                  |
| ----- | ------- | ------------------------------- |
| **0** | 53      | **Siempre free** — esta lista   |
| 1     | 52      | Rota: free 1 de cada 3 meses    |
| 2     | 51      | Rota                            |
| 3     | 51      | Rota — **libre en agosto 2026** |

El grupo libre del mes es `(mes % 3) + 1`. Free en todo momento ≈ **104 de 207 (50,2%)**.
