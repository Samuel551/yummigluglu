# Recetas BLW/BLISS + Prompts de video IA

> **Qué es esto**: la lista de recetas de **trocitos** (BLW) que faltan en el catálogo, más las
> **7 que mandó la esposa del owner**, cada una con **6 prompts de 5 segundos** listos para pegar en
> un generador de video con IA. 6 clips × 5 s = **30 segundos**, el largo que funciona en TikTok e
> Instagram Reels.
>
> Fecha: **2026-09-08** · Fase 11 · Complementa `docs/contenido/textos-videos.md`.

---

## 🔴 Antes de generar un solo clip — leé esto

### 1. El modelo es BLISS, no BLW a secas

Cada receta de esta lista cumple las **tres reglas** del protocolo BLISS (Universidad de Otago):

| Regla                         | Por qué                                                     |
| ----------------------------- | ----------------------------------------------------------- |
| 🥩 **Hierro en cada comida**  | A los 6 meses el bebé agota las reservas con las que nació. |
| 🥑 **Energía en cada comida** | Un trozo llena menos que un puré: hay que sumar densidad.   |
| 🚫 **Nada que atragante**     | Nada duro, redondo ni resbaloso.                            |

Por eso cada bloque trae **`forma_servido`** y **`nota_seguridad`** ya escritos: son las **dos
columnas obligatorias** de la migración `039`. La base **no deja guardar** una receta BLW sin ellas
(constraint `recetas_blw_exige_seguridad`). Copialas tal cual al panel admin.

### 2. 🔴 La IA y los bebés — no generes bebés

Los generadores de video **restringen o deforman a los menores**. Un bebé sintético en una app de
alimentación infantil es, además, un problema de confianza: la mamá lo nota.

- ❌ No pidas caras de bebé, ni bebés comiendo.
- ✅ Pedí **la bandeja de la silla de comer**, **una manito pequeña entrando al cuadro**, o el plato solo.
- ✅ Para el C6, lo ideal es **metraje real del hijo de ustedes** cortado a 5 s. Gana siempre.

### 3. Consistencia entre los 6 clips

Son 6 generaciones distintas: si no fijás el estilo, salen 6 cocinas distintas. **Pegá este bloque
al final de CADA prompt** de la misma receta:

```
STYLE: vertical 9:16, 50mm lens, soft natural window light from the left, bright warm kitchen,
white marble counter, light wood cutting board, pastel green and cream props, shallow depth of
field, slow gentle camera move, photorealistic food commercial look, clean and minimal.
```

Y este como **prompt negativo** (donde el generador lo acepte):

```
NEGATIVE: text, captions, watermark, logos, baby faces, children faces, raw meat close-up,
messy splatter, dark moody lighting, plastic-looking food, extra fingers, jewelry on hands.
```

### 4. Cómo se lee cada clip

| Campo       | Para qué                                                                                        |
| ----------- | ----------------------------------------------------------------------------------------------- |
| **Prompt**  | En **inglés a propósito**: los generadores obedecen bastante mejor. Pegalo tal cual + el STYLE. |
| **Muestra** | Qué tiene que verse. Si el clip no muestra eso, regeneralo.                                     |
| **Texto**   | El overlay que se agrega después en CapCut. Español **neutro** (tú), como toda la app.          |

---

## Resumen — 18 recetas

> 🔴 **La #8 (arbolitos de brócoli con pasta de lentejas) se descartó** el 2026-10-02: al
> owner y a su señora no les gustó la receta. Sus 6 clips quedaron en
> `clips\_descartados\215` — **no se borraron**, por si se revierte.
>
> ⚠️ **El 8 NO se reusa y las demás NO se renumeran, a propósito.** El número de cada receta
> es la clave que ata este documento con `clips\NNN` y con `videos\NNN — Algo`
> (receta _n_ = carpeta `207 + n`). Renumerar para tapar el hueco obligaría a renombrar
> carpetas en los dos árboles, y el día que algo quede a medias las tres numeraciones dejan
> de coincidir **sin dar ningún error**. El hueco es información: dice que ahí hubo una
> receta y se cayó.

### Bloque A · Las que faltan en el catálogo (11)

El agujero medido no era "faltan recetas BLW": era **almuerzo y cena con hierro**. 9 de estas 11 son
almuerzo/cena.

| #   | Receta                                          | Etapa               | Momento         | Hierro               |
| --- | ----------------------------------------------- | ------------------- | --------------- | -------------------- |
| 1   | Bastones de pollo al vapor con palta            | inicio · transición | almuerzo, cena  | Pollo                |
| 2   | Deditos de carne y quinoa al horno              | inicio · transición | almuerzo, cena  | Vacuno + quinoa      |
| 3   | Hamburguesita de lentejas y avena               | inicio · transición | almuerzo, cena  | Lentejas             |
| 4   | Bastones de tortilla de huevo y espinaca        | inicio · transición | almuerzo, cena  | Huevo + espinaca     |
| 5   | Croquetas alargadas de porotos negros con arroz | transición          | almuerzo, cena  | Porotos negros       |
| 6   | Pollo desmenuzado con bastones de camote        | inicio · transición | almuerzo, cena  | Pollo                |
| 7   | Bastones de zapallo italiano con hummus         | inicio · transición | almuerzo, cena  | Garbanzo             |
| 9   | Tortitas de betarraga, lenteja y avena          | inicio · transición | almuerzo, cena  | Lentejas             |
| 10  | Bastones de posta de vacuno a la olla           | transición          | almuerzo, cena  | Vacuno (hierro hemo) |
| 11  | Dedos de pan con palta y huevo duro             | inicio · transición | desayuno        | Huevo                |
| 12  | Tortitas de avena, huevo y plátano              | inicio · transición | desayuno, snack | Huevo + avena        |

### Bloque B · Las 7 de la esposa

| #   | Receta                                   | Etapa                   | Momento         | Ajuste que se le hizo             |
| --- | ---------------------------------------- | ----------------------- | --------------- | --------------------------------- |
| 13  | Fideos salteados con pollo y verduras    | transición · preescolar | almuerzo, cena  | Fideo tirabuzón, no spaghetti     |
| 14  | Nuggets caseros de pollo                 | transición · preescolar | almuerzo, cena  | Horneados, sin sal, en bastón     |
| 15  | Nuggets de pollo y brócoli               | transición · preescolar | almuerzo, cena  | Ídem                              |
| 16  | Panqueques de betarraga                  | inicio · transición     | desayuno, snack | + huevo y avena, por el hierro    |
| 17  | Tortilla de papa, zanahoria y acelga     | inicio · transición     | almuerzo, cena  | Cortada en bastones               |
| 18  | **Cilindros** de arroz con palta y pollo | transición              | almuerzo, cena  | 🔴 **No bolitas** — ver nota      |
| 19  | Papitas al horno con carne mechada       | transición · preescolar | almuerzo, cena  | Papa en gajos, carne deshilachada |

---

## 🔴 Nota sobre "bolitas de arroz" — esto no es un detalle de estilo

La receta 18 llegó como **bolitas** y acá va como **cilindros**. No es capricho:

> Una bolita de arroz compactada tiene **la forma y el tamaño exacto** que la vía aérea de un bebé no
> perdona: **redonda, del diámetro de su tráquea y pegajosa**. Es la misma familia de la uva entera y
> el tomate cherry, que BLISS pide partir **siempre** a lo largo.

Se sirve como **cilindro alargado**, del largo de un dedo, para que asome del puño y no pueda entrar
entero. Misma receta, misma foto linda, **cero riesgo**. Y sirve igual para el video: un cilindro se
ve mejor en cámara que una bolita.

---

# BLOQUE A — Las 12 que faltan en el catálogo

---

## 1 · Bastones de pollo al vapor con palta

| Campo            | Valor                                                                                                                            |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Etapa            | `inicio` · `transicion`                                                                                                          |
| Momento          | almuerzo, cena                                                                                                                   |
| `metodo`         | `{blw}`                                                                                                                          |
| `forma_servido`  | Bastones del largo de tu dedo índice y del grosor de dos dedos, para que sobresalgan del puño del bebé.                          |
| `nota_seguridad` | El pollo debe deshacerse al apretarlo entre el pulgar y el índice. Retira cartílagos, piel y grasa. Sirve tibio, nunca caliente. |
| Hierro           | Pollo (pechuga o pollo ganso)                                                                                                    |
| Energía          | Palta + un chorrito de aceite de oliva                                                                                           |

**C1 · 0–5 s**

- **Muestra**: el plato final servido en la bandeja de la silla de comer.
- **Prompt**: `Slow push-in on a pale green highchair tray holding three finger-sized steamed chicken sticks next to thick avocado slices, soft steam rising, food styling for a baby recipe reel.`
- **Texto**: `Pollo en bastones 🍗 | Desde los 6 meses`

**C2 · 5–10 s**

- **Muestra**: los ingredientes crudos ordenados.
- **Prompt**: `Top-down static shot of raw ingredients neatly arranged on a light wood board: one chicken breast, one ripe avocado cut in half, a small bowl of olive oil, a sprig of parsley.`
- **Texto**: `Solo 3 ingredientes 🧡`

**C3 · 10–15 s**

- **Muestra**: el corte en bastones.
- **Prompt**: `Close-up of adult hands cutting a raw chicken breast lengthwise into thick finger-shaped strips on a light wood board, confident clean knife strokes, macro detail on the blade.`
- **Texto**: `Corta en tiras del largo de tu dedo`

**C4 · 15–20 s**

- **Muestra**: la cocción al vapor.
- **Prompt**: `Overhead shot of chicken strips arranged in a bamboo steamer basket over a pot, lid lifting slowly, thick white steam billowing up into the light.`
- **Texto**: `Cocina al vapor 12 minutos`

**C5 · 20–25 s**

- **Muestra**: la prueba de textura. Este es el clip que enseña seguridad, no lo saltees.
- **Prompt**: `Extreme close-up of two adult fingers gently squeezing a cooked chicken strip until it flakes apart, shallow depth of field, warm light.`
- **Texto**: `Aplástalo con los dedos: debe deshacerse`

**C6 · 25–30 s**

- **Muestra**: el plato listo en la bandeja.
- **Prompt**: `Static shot of the finished plate on a highchair tray, chicken sticks and avocado slices side by side, a soft out-of-focus kitchen behind, gentle natural light.`
- **Texto**: `¡Listo! Sin sal ni azúcar 🌿 | @yummigluglu`

---

## 2 · Deditos de carne y quinoa al horno

| Campo            | Valor                                                                                                                          |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Etapa            | `inicio` · `transicion`                                                                                                        |
| Momento          | almuerzo, cena                                                                                                                 |
| `metodo`         | `{blw}`                                                                                                                        |
| `forma_servido`  | Deditos alargados del largo de tu dedo índice. Nunca en bola: la forma redonda es riesgo de atragantamiento.                   |
| `nota_seguridad` | Deben quedar blandos por dentro; si al partirlos con el dedo ofrecen resistencia, les falta cocción. Deja enfriar hasta tibio. |
| Hierro           | Carne de vacuno molida + quinoa                                                                                                |
| Energía          | Aceite de oliva                                                                                                                |

**C1 · 0–5 s**

- **Muestra**: los deditos dorados servidos.
- **Prompt**: `Slow orbit around a small plate with five golden-brown oblong meat fingers stacked, tiny quinoa grains visible on the crust, soft steam, cozy kitchen background.`
- **Texto**: `Deditos de carne y quinoa 🥩 | 6 meses+`

**C2 · 5–10 s**

- **Muestra**: ingredientes.
- **Prompt**: `Top-down flat lay of ground beef in a ceramic bowl, a small bowl of cooked white quinoa, one egg, a handful of grated carrot, on a light wood board.`
- **Texto**: `Carne, quinoa, huevo y zanahoria`

**C3 · 10–15 s**

- **Muestra**: la mezcla.
- **Prompt**: `Close-up of adult hands mixing ground beef with cooked quinoa and grated carrot in a large ceramic bowl, soft folding motion, warm natural light.`
- **Texto**: `Mezcla todo con las manos`

**C4 · 15–20 s**

- **Muestra**: el formado alargado. Este clip es el que enseña la forma segura.
- **Prompt**: `Macro shot of hands rolling the meat mixture into an elongated finger shape, about the length of an adult index finger, placing it on a parchment-lined baking tray next to others.`
- **Texto**: `Forma deditos, nunca bolitas`

**C5 · 20–25 s**

- **Muestra**: el horneado.
- **Prompt**: `Warm shot of a baking tray sliding into a home oven, golden light from inside, meat fingers browning, gentle heat shimmer.`
- **Texto**: `Al horno 20 min a 180°C`

**C6 · 25–30 s**

- **Muestra**: plato final en la bandeja.
- **Prompt**: `Static shot of three baked meat fingers on a pastel highchair tray beside a few soft steamed broccoli florets, clean bright kitchen bokeh behind.`
- **Texto**: `Congela hasta 1 mes ❄️ | @yummigluglu`

---

## 3 · Hamburguesita de lentejas y avena

| Campo            | Valor                                                                                                          |
| ---------------- | -------------------------------------------------------------------------------------------------------------- |
| Etapa            | `inicio` · `transicion`                                                                                        |
| Momento          | almuerzo, cena                                                                                                 |
| `metodo`         | `{blw}`                                                                                                        |
| `forma_servido`  | Disco plano del tamaño de la palma del bebé, o cortado en tiras si recién empieza.                             |
| `nota_seguridad` | Las lentejas deben quedar bien blandas y aplastadas: enteras y firmes son riesgo. Sirve tibia, nunca caliente. |
| Hierro           | Lentejas                                                                                                       |
| Energía          | Avena + aceite de oliva                                                                                        |

**C1 · 0–5 s**

- **Muestra**: la hamburguesita servida.
- **Prompt**: `Slow push-in on two small rustic lentil patties on a pastel plate, golden crust, one broken open showing a soft interior, warm morning light.`
- **Texto**: `Hamburguesita de lentejas 🌱 | 6 meses+`

**C2 · 5–10 s**

- **Muestra**: ingredientes.
- **Prompt**: `Top-down flat lay of cooked brown lentils in a bowl, rolled oats, one egg, finely grated zucchini, and a small bowl of olive oil on a light wood board.`
- **Texto**: `Lentejas, avena, huevo y zapallo italiano`

**C3 · 10–15 s**

- **Muestra**: el aplastado de las lentejas.
- **Prompt**: `Macro close-up of a fork mashing soft cooked lentils in a ceramic bowl until creamy, texture detail, soft side light.`
- **Texto**: `Aplasta bien las lentejas`

**C4 · 15–20 s**

- **Muestra**: formar el disco.
- **Prompt**: `Close-up of hands shaping a small flat patty from the lentil and oat mixture, pressing it gently between the palms, placing it on parchment paper.`
- **Texto**: `Forma discos del tamaño de su palma`

**C5 · 20–25 s**

- **Muestra**: la sartén.
- **Prompt**: `Side-angle shot of lentil patties cooking in a lightly oiled non-stick pan, edges turning golden, a spatula flipping one over, gentle sizzle steam.`
- **Texto**: `Dora 3 min por lado, sin sal`

**C6 · 25–30 s**

- **Muestra**: plato final.
- **Prompt**: `Static shot of one lentil patty cut into three strips on a pastel highchair tray, avocado slices beside it, clean bright background.`
- **Texto**: `Córtala en tiras si recién empieza 🖐️`

---

## 4 · Bastones de tortilla de huevo y espinaca

| Campo            | Valor                                                                                                               |
| ---------------- | ------------------------------------------------------------------------------------------------------------------- |
| Etapa            | `inicio` · `transicion`                                                                                             |
| Momento          | almuerzo, cena                                                                                                      |
| `metodo`         | `{blw}`                                                                                                             |
| `forma_servido`  | Tortilla gruesa cortada en bastones del ancho de dos dedos.                                                         |
| `nota_seguridad` | El huevo debe estar completamente cuajado, sin partes líquidas. Ofrécelo solo si ya probó huevo antes sin reacción. |
| Hierro           | Huevo + espinaca                                                                                                    |
| Energía          | Queso rallado suave + aceite de oliva                                                                               |

**C1 · 0–5 s**

- **Muestra**: los bastones apilados.
- **Prompt**: `Slow tilt-down on four thick omelette sticks stacked on a pale plate, green spinach flecks visible inside the fluffy yellow egg, soft steam.`
- **Texto**: `Tortilla en bastones 🥚 | 6 meses+`

**C2 · 5–10 s**

- **Muestra**: ingredientes.
- **Prompt**: `Top-down flat lay of two eggs, a handful of fresh spinach leaves, a small bowl of grated mild cheese, and a bottle of olive oil on a light wood board.`
- **Texto**: `Huevo, espinaca y queso suave`

**C3 · 10–15 s**

- **Muestra**: picar la espinaca finita.
- **Prompt**: `Close-up of a knife finely chopping fresh spinach leaves into tiny pieces on a wooden board, rhythmic motion, vivid green.`
- **Texto**: `Pica la espinaca bien fina`

**C4 · 15–20 s**

- **Muestra**: la sartén chica, que es lo que da el grosor.
- **Prompt**: `Overhead shot of beaten egg with green flecks poured into a small hot non-stick pan, the mixture spreading and setting, edges lifting.`
- **Texto**: `Usa una sartén chica: queda más gruesa`

**C5 · 20–25 s**

- **Muestra**: el corte en bastones.
- **Prompt**: `Macro close-up of a knife slicing a thick cooked omelette into finger-width sticks on a wooden board, clean cuts, fluffy interior visible.`
- **Texto**: `Corta en bastones del ancho de dos dedos`

**C6 · 25–30 s**

- **Muestra**: plato final.
- **Prompt**: `Static shot of three omelette sticks fanned out on a pastel highchair tray with soft cooked carrot sticks, bright clean kitchen bokeh.`
- **Texto**: `Perfecta para llevar 🧺 | @yummigluglu`

---

## 5 · Croquetas alargadas de porotos negros con arroz

| Campo            | Valor                                                                                                                      |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Etapa            | `transicion`                                                                                                               |
| Momento          | almuerzo, cena                                                                                                             |
| `metodo`         | `{blw}`                                                                                                                    |
| `forma_servido`  | Croquetas alargadas tipo dedito, nunca redondas.                                                                           |
| `nota_seguridad` | Los porotos van aplastados, nunca enteros: un poroto entero tiene el tamaño justo para obstruir la vía aérea. Sirve tibio. |
| Hierro           | Porotos negros                                                                                                             |
| Energía          | Arroz + aceite de oliva                                                                                                    |

**C1 · 0–5 s**

- **Muestra**: las croquetas servidas.
- **Prompt**: `Slow push-in on four elongated dark bean croquettes on a pastel plate, crisp golden edges, one broken open revealing soft rice and bean interior.`
- **Texto**: `Croquetas de porotos negros 🖤 | 9 meses+`

**C2 · 5–10 s**

- **Muestra**: ingredientes.
- **Prompt**: `Top-down flat lay of cooked black beans in a bowl, cooked white rice, one egg, breadcrumbs, and chopped parsley on a light wood board.`
- **Texto**: `Porotos, arroz, huevo y perejil`

**C3 · 10–15 s**

- **Muestra**: aplastar los porotos.
- **Prompt**: `Macro shot of a potato masher pressing cooked black beans into a rough paste in a ceramic bowl, glossy texture, warm light.`
- **Texto**: `Aplasta hasta que no quede ninguno entero`

**C4 · 15–20 s**

- **Muestra**: el formado alargado.
- **Prompt**: `Close-up of hands rolling the bean and rice mixture into finger-length cylinders, lining them up on a parchment-lined tray.`
- **Texto**: `Forma cilindros, no bolitas`

**C5 · 20–25 s**

- **Muestra**: el horneado.
- **Prompt**: `Warm shot of bean croquettes on a baking tray inside an oven, browning slowly, golden interior light, soft heat shimmer.`
- **Texto**: `Al horno 20 min a 180°C`

**C6 · 25–30 s**

- **Muestra**: plato final.
- **Prompt**: `Static shot of two bean croquettes on a pastel highchair tray next to thick avocado slices, bright clean background.`
- **Texto**: `Hierro y energía en un solo plato 💪`

---

## 6 · Pollo desmenuzado con bastones de camote

| Campo            | Valor                                                                                                                 |
| ---------------- | --------------------------------------------------------------------------------------------------------------------- |
| Etapa            | `inicio` · `transicion`                                                                                               |
| Momento          | almuerzo, cena                                                                                                        |
| `metodo`         | `{blw}`                                                                                                               |
| `forma_servido`  | Camote en bastones gruesos y pollo deshilachado en hebras largas y blandas.                                           |
| `nota_seguridad` | El camote debe ceder al apretarlo entre los dedos. Las hebras de pollo deben ser largas y suaves, nunca trozos duros. |
| Hierro           | Pollo                                                                                                                 |
| Energía          | Camote + aceite de oliva                                                                                              |

**C1 · 0–5 s**

- **Muestra**: el plato final.
- **Prompt**: `Slow orbit around a plate of bright orange roasted sweet potato sticks beside a small mound of shredded chicken, glistening lightly with olive oil, warm light.`
- **Texto**: `Pollo desmenuzado y camote 🍠 | 6 meses+`

**C2 · 5–10 s**

- **Muestra**: ingredientes.
- **Prompt**: `Top-down flat lay of one whole sweet potato, a cooked chicken thigh, a small bowl of olive oil, and a pinch of oregano on a light wood board.`
- **Texto**: `Camote, pollo y aceite de oliva`

**C3 · 10–15 s**

- **Muestra**: el corte del camote.
- **Prompt**: `Close-up of a knife cutting a peeled sweet potato lengthwise into thick chunky sticks on a wooden board, vivid orange flesh.`
- **Texto**: `Corta el camote en bastones gruesos`

**C4 · 15–20 s**

- **Muestra**: el horneado.
- **Prompt**: `Overhead shot of sweet potato sticks spread on a parchment-lined tray, drizzled with olive oil, sliding into a warm oven.`
- **Texto**: `Al horno 25 min hasta que estén blandos`

**C5 · 20–25 s**

- **Muestra**: deshilachar el pollo.
- **Prompt**: `Macro close-up of two forks pulling cooked chicken apart into long soft strands on a wooden board, steam rising gently.`
- **Texto**: `Deshilacha el pollo en hebras largas`

**C6 · 25–30 s**

- **Muestra**: plato final en bandeja.
- **Prompt**: `Static shot of sweet potato sticks and shredded chicken arranged on a pastel highchair tray, soft kitchen bokeh behind.`
- **Texto**: `Se agarra solo 🖐️ | @yummigluglu`

---

## 7 · Bastones de zapallo italiano al horno con hummus

| Campo            | Valor                                                                                        |
| ---------------- | -------------------------------------------------------------------------------------------- |
| Etapa            | `inicio` · `transicion`                                                                      |
| Momento          | almuerzo, cena                                                                               |
| `metodo`         | `{blw}`                                                                                      |
| `forma_servido`  | Zapallo italiano en bastones largos, con una cucharada de hummus al lado para untar o mojar. |
| `nota_seguridad` | El zapallo debe quedar blando, nunca al dente. El hummus va sin sal y sin ajo crudo.         |
| Hierro           | Garbanzo                                                                                     |
| Energía          | Tahini + aceite de oliva                                                                     |

**C1 · 0–5 s**

- **Muestra**: bastones parados junto al hummus.
- **Prompt**: `Slow push-in on roasted zucchini sticks standing upright in a small bowl beside a swirl of creamy pale hummus drizzled with olive oil, warm side light.`
- **Texto**: `Zapallo italiano con hummus 🥒 | 6 meses+`

**C2 · 5–10 s**

- **Muestra**: ingredientes.
- **Prompt**: `Top-down flat lay of two zucchinis, a bowl of cooked chickpeas, a jar of tahini, half a lemon, and olive oil on a light wood board.`
- **Texto**: `Zapallo italiano, garbanzos y tahini`

**C3 · 10–15 s**

- **Muestra**: el corte.
- **Prompt**: `Close-up of a knife cutting a zucchini lengthwise into long thick batons on a wooden board, fresh green skin, clean cuts.`
- **Texto**: `Corta en bastones largos`

**C4 · 15–20 s**

- **Muestra**: el horneado.
- **Prompt**: `Overhead shot of zucchini batons on a parchment-lined tray drizzled with olive oil, sliding into a warm oven, gentle steam.`
- **Texto**: `Al horno 20 min hasta que estén blandos`

**C5 · 20–25 s**

- **Muestra**: el hummus procesándose.
- **Prompt**: `Close-up of a food processor blending chickpeas, tahini and lemon into a smooth creamy hummus, the blade turning, thick texture folding.`
- **Texto**: `Procesa el hummus sin sal`

**C6 · 25–30 s**

- **Muestra**: plato final.
- **Prompt**: `Static shot of zucchini batons and a small bowl of hummus on a pastel highchair tray, bright clean kitchen behind.`
- **Texto**: `Aprende a mojar y untar 🖐️ | @yummigluglu`

---

## 9 · Tortitas de betarraga, lenteja y avena

| Campo            | Valor                                                                         |
| ---------------- | ----------------------------------------------------------------------------- |
| Etapa            | `inicio` · `transicion`                                                       |
| Momento          | almuerzo, cena                                                                |
| `metodo`         | `{blw}`                                                                       |
| `forma_servido`  | Tortitas planas cortadas en tiras del ancho de dos dedos.                     |
| `nota_seguridad` | La betarraga va cocida y rallada fina, nunca cruda ni en trozos. Sirve tibia. |
| Hierro           | Lentejas + betarraga                                                          |
| Energía          | Avena + aceite de oliva                                                       |

**C1 · 0–5 s**

- **Muestra**: el color, que es lo que hace parar el scroll.
- **Prompt**: `Slow orbit around three deep magenta beetroot patties stacked on a pale ceramic plate, vivid color contrast, soft steam, warm light.`
- **Texto**: `Tortitas de betarraga 💗 | 6 meses+`

**C2 · 5–10 s**

- **Muestra**: ingredientes.
- **Prompt**: `Top-down flat lay of one cooked beetroot, a bowl of cooked lentils, rolled oats, and one egg on a light wood board, vivid magenta against neutral tones.`
- **Texto**: `Betarraga, lentejas, avena y huevo`

**C3 · 10–15 s**

- **Muestra**: el rallado.
- **Prompt**: `Macro close-up of a cooked beetroot being grated finely, magenta shreds falling into a white ceramic bowl, rich saturated color.`
- **Texto**: `Ralla la betarraga bien fina`

**C4 · 15–20 s**

- **Muestra**: la mezcla, que tiñe todo.
- **Prompt**: `Close-up of a spoon folding grated beetroot into mashed lentils and oats in a bowl, the mixture turning deep pink, slow swirling motion.`
- **Texto**: `Mezcla hasta que tome color`

**C5 · 20–25 s**

- **Muestra**: la sartén.
- **Prompt**: `Side-angle shot of magenta patties cooking in a lightly oiled non-stick pan, a spatula flipping one over, gentle steam.`
- **Texto**: `Dora 3 min por lado`

**C6 · 25–30 s**

- **Muestra**: plato final en tiras.
- **Prompt**: `Static shot of one beetroot patty cut into strips on a pastel highchair tray, bright clean background, vivid color pop.`
- **Texto**: `Color natural, sin colorantes 🌿`

---

## 10 · Bastones de posta de vacuno a la olla

| Campo            | Valor                                                                                                                         |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Etapa            | `transicion`                                                                                                                  |
| Momento          | almuerzo, cena                                                                                                                |
| `metodo`         | `{blw}`                                                                                                                       |
| `forma_servido`  | Tiras largas cortadas **a contrafibra**, del largo de un dedo.                                                                |
| `nota_seguridad` | La carne debe deshilacharse sola con un tenedor: si hay que hacer fuerza, le falta cocción. Retira toda la grasa y el nervio. |
| Hierro           | Vacuno — la mejor fuente de hierro hemo del catálogo                                                                          |
| Energía          | Aceite de oliva + el caldo de cocción                                                                                         |

**C1 · 0–5 s**

- **Muestra**: las tiras tiernas.
- **Prompt**: `Slow push-in on tender slow-cooked beef strips resting on a pale plate, glossy with cooking juices, visibly soft fibers, warm rich light.`
- **Texto**: `Carne en tiras suaves 🥩 | 9 meses+`

**C2 · 5–10 s**

- **Muestra**: ingredientes.
- **Prompt**: `Top-down flat lay of a lean beef cut, a carrot, half an onion, a bay leaf, and a small bowl of olive oil on a light wood board.`
- **Texto**: `Posta, zanahoria, cebolla y laurel`

**C3 · 10–15 s**

- **Muestra**: la olla, el tiempo largo.
- **Prompt**: `Side shot of beef simmering slowly in a heavy pot with vegetables and broth, gentle bubbles, steam curling upward, cozy warm kitchen.`
- **Texto**: `A fuego bajo 90 min: el secreto es el tiempo`

**C4 · 15–20 s**

- **Muestra**: la prueba del tenedor.
- **Prompt**: `Macro close-up of a fork pressing into cooked beef and the meat falling apart into soft strands with almost no pressure.`
- **Texto**: `Si se deshace sola, está lista`

**C5 · 20–25 s**

- **Muestra**: el corte a contrafibra. Este dato es el que hace la diferencia.
- **Prompt**: `Close-up of a knife slicing cooked beef across the grain into long finger-length strips on a wooden board, visible muscle fibers cut short.`
- **Texto**: `Corta a contrafibra: queda más tierna`

**C6 · 25–30 s**

- **Muestra**: plato final.
- **Prompt**: `Static shot of beef strips on a pastel highchair tray beside soft cooked carrot sticks, clean bright kitchen bokeh.`
- **Texto**: `El plato con más hierro de todos 💪`

---

## 11 · Dedos de pan con palta y huevo duro

| Campo            | Valor                                                                                                                   |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Etapa            | `inicio` · `transicion`                                                                                                 |
| Momento          | desayuno                                                                                                                |
| `metodo`         | `{blw}`                                                                                                                 |
| `forma_servido`  | Pan cortado en tres dedos largos, con la palta bien untada y el huevo rallado encima.                                   |
| `nota_seguridad` | Usa pan de miga blanda apenas tostado: el pan crudo y esponjoso se apelmaza en la boca. Nunca ofrezcas la corteza dura. |
| Hierro           | Huevo (la yema)                                                                                                         |
| Energía          | Palta + aceite de oliva                                                                                                 |

**C1 · 0–5 s**

- **Muestra**: los tres dedos alineados.
- **Prompt**: `Slow tilt-down on three long toast fingers spread with bright green avocado and topped with finely grated hard-boiled egg, arranged in a row on a pale plate.`
- **Texto**: `Dedos de pan con palta 🥑 | 6 meses+`

**C2 · 5–10 s**

- **Muestra**: ingredientes.
- **Prompt**: `Top-down flat lay of two slices of soft sandwich bread, one ripe avocado, one hard-boiled egg, and a bottle of olive oil on a light wood board.`
- **Texto**: `Pan, palta y huevo duro`

**C3 · 10–15 s**

- **Muestra**: el pisado de la palta.
- **Prompt**: `Macro close-up of a fork mashing ripe avocado in a small ceramic bowl until creamy, vivid green texture, soft natural light.`
- **Texto**: `Pisa la palta hasta que quede cremosa`

**C4 · 15–20 s**

- **Muestra**: el untado.
- **Prompt**: `Close-up of a butter knife spreading mashed avocado thickly and evenly over a lightly toasted bread slice, smooth motion.`
- **Texto**: `Unta bien: que no se despegue`

**C5 · 20–25 s**

- **Muestra**: el rallado del huevo.
- **Prompt**: `Macro shot of a hard-boiled egg being grated over green avocado toast, fine yellow and white flakes falling, shallow depth of field.`
- **Texto**: `Ralla el huevo encima: ahí está el hierro`

**C6 · 25–30 s**

- **Muestra**: plato final.
- **Prompt**: `Static shot of three avocado toast fingers on a pastel highchair tray, soft bright morning kitchen behind.`
- **Texto**: `Desayuno en 5 minutos ⏱️ | @yummigluglu`

---

## 12 · Tortitas de avena, huevo y plátano

| Campo            | Valor                                                                                                                               |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Etapa            | `inicio` · `transicion`                                                                                                             |
| Momento          | desayuno, snack                                                                                                                     |
| `metodo`         | `{blw}`                                                                                                                             |
| `forma_servido`  | Tortitas chicas y planas, o cortadas en tiras si recién empieza.                                                                    |
| `nota_seguridad` | Deben quedar firmes al tacto, no gomosas. El plátano bien maduro se pisa completo: nunca en rodajas, que son redondas y resbalosas. |
| Hierro           | Huevo + avena                                                                                                                       |
| Energía          | Plátano + aceite de oliva                                                                                                           |

**C1 · 0–5 s**

- **Muestra**: la pila de tortitas.
- **Prompt**: `Slow push-in on a small stack of golden oat pancakes on a pale plate, soft morning light, a few banana slices out of focus in the background.`
- **Texto**: `Tortitas de avena y plátano 🍌 | 6 meses+`

**C2 · 5–10 s**

- **Muestra**: los 3 ingredientes.
- **Prompt**: `Top-down flat lay of one very ripe spotted banana, one egg, and a small bowl of rolled oats on a light wood board, minimal styling.`
- **Texto**: `Solo 3 ingredientes 🧡`

**C3 · 10–15 s**

- **Muestra**: pisar el plátano.
- **Prompt**: `Macro close-up of a fork mashing a very ripe banana in a ceramic bowl until smooth and creamy, warm light.`
- **Texto**: `Pisa el plátano bien maduro`

**C4 · 15–20 s**

- **Muestra**: la mezcla.
- **Prompt**: `Close-up of an egg being cracked into mashed banana and oats in a bowl, then a spoon stirring the batter until thick.`
- **Texto**: `Suma huevo y avena, mezcla`

**C5 · 20–25 s**

- **Muestra**: la sartén.
- **Prompt**: `Overhead shot of small round pancakes cooking in a lightly oiled non-stick pan, bubbles forming on the surface, a spatula flipping one to reveal a golden side.`
- **Texto**: `Dora 2 min por lado, sin azúcar`

**C6 · 25–30 s**

- **Muestra**: plato final.
- **Prompt**: `Static shot of three small oat pancakes on a pastel highchair tray, one cut into strips, bright clean morning kitchen behind.`
- **Texto**: `Sin azúcar, dulce del plátano 🌿`

---

# BLOQUE B — Las 7 recetas de la esposa

> Llegaron así, textual: _fideos salteados con pollo o carne y verduras · nuggets caseros de pollo ·
> nuggets de pollo y brócoli · waffles o panqueques de betarraga · tortilla de papa, zanahoria y
> acelga · bolitas de arroz con palta y pollo · papitas al horno con carne mechada._
>
> Las 7 entran. Solo se les ajustó **la forma de servir**, nunca el sabor ni los ingredientes.

---

## 13 · Fideos salteados con pollo y verduras

| Campo            | Valor                                                                                                                               |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Etapa            | `transicion` · `preescolar`                                                                                                         |
| Momento          | almuerzo, cena                                                                                                                      |
| `metodo`         | `{blw, papilla}`                                                                                                                    |
| `forma_servido`  | Fideo corto tipo tirabuzón o caracol, que el bebé agarra con el puño. Verduras en bastones, pollo en hebras.                        |
| `nota_seguridad` | Nunca spaghetti largo ni fideo al dente: se enrolla y cuesta manejarlo. Cocina el fideo 2 minutos de más. Sin salsa de soya ni sal. |
| Hierro           | Pollo o carne de vacuno                                                                                                             |
| Energía          | Fideo + aceite de oliva                                                                                                             |

**C1 · 0–5 s**

- **Muestra**: el wok listo, colorido.
- **Prompt**: `Slow orbit around a wok filled with short spiral pasta, shredded chicken and colorful vegetable batons, glossy and steaming, warm appetizing light.`
- **Texto**: `Fideos salteados con pollo 🍝 | 9 meses+`

**C2 · 5–10 s**

- **Muestra**: ingredientes.
- **Prompt**: `Top-down flat lay of dry spiral pasta, a chicken breast, a carrot, a zucchini, and a red bell pepper on a light wood board, colorful and neat.`
- **Texto**: `Fideo corto, pollo y verduras de colores`

**C3 · 10–15 s**

- **Muestra**: el corte en bastones.
- **Prompt**: `Close-up of a knife cutting carrot and zucchini into thin long batons on a wooden board, quick precise cuts, vivid colors.`
- **Texto**: `Corta las verduras en bastones`

**C4 · 15–20 s**

- **Muestra**: el salteado.
- **Prompt**: `Side-angle shot of vegetables and shredded chicken sautéing in a wok with olive oil, gentle tossing motion, steam rising, no flames.`
- **Texto**: `Saltea a fuego medio, sin sal`

**C5 · 20–25 s**

- **Muestra**: el fideo entrando, bien blando.
- **Prompt**: `Overhead shot of cooked spiral pasta being poured into the wok and folded together with the vegetables and chicken, glossy coating.`
- **Texto**: `Cocina el fideo 2 min de más: más blando`

**C6 · 25–30 s**

- **Muestra**: plato final.
- **Prompt**: `Static shot of spiral pasta with chicken and vegetables served on a pastel highchair tray, bright clean kitchen behind.`
- **Texto**: `Toda la familia come lo mismo 👨‍👩‍👧`

---

## 14 · Nuggets caseros de pollo

| Campo            | Valor                                                                                       |
| ---------------- | ------------------------------------------------------------------------------------------- |
| Etapa            | `transicion` · `preescolar`                                                                 |
| Momento          | almuerzo, cena                                                                              |
| `metodo`         | `{blw}`                                                                                     |
| `forma_servido`  | Nuggets alargados tipo bastón, no redondos ni en bolita.                                    |
| `nota_seguridad` | Horneados, nunca fritos. Sin sal. Deja enfriar hasta tibio: por dentro guardan mucho calor. |
| Hierro           | Pollo                                                                                       |
| Energía          | Avena molida o pan rallado + aceite de oliva                                                |

**C1 · 0–5 s**

- **Muestra**: los nuggets dorados.
- **Prompt**: `Slow push-in on five golden homemade chicken nuggets shaped like elongated batons on a pale plate, crisp oat crumb coating, soft steam rising.`
- **Texto**: `Nuggets caseros de pollo 🍗 | 9 meses+`

**C2 · 5–10 s**

- **Muestra**: ingredientes.
- **Prompt**: `Top-down flat lay of a chicken breast, a bowl of ground oats, one egg, and a small bowl of olive oil on a light wood board, clean minimal styling.`
- **Texto**: `Pollo, avena molida y huevo. Nada más.`

**C3 · 10–15 s**

- **Muestra**: procesar el pollo.
- **Prompt**: `Close-up of a food processor turning chicken breast into a smooth pale mince, blade spinning, texture becoming uniform.`
- **Texto**: `Procesa el pollo hasta que quede fino`

**C4 · 15–20 s**

- **Muestra**: el empanizado en forma de bastón.
- **Prompt**: `Macro shot of hands shaping chicken mince into an elongated baton and rolling it in ground oats, coating it evenly, tray of others behind.`
- **Texto**: `Forma bastones y pasa por avena`

**C5 · 20–25 s**

- **Muestra**: el horno.
- **Prompt**: `Warm shot of nuggets on a parchment-lined tray inside an oven, coating turning golden, gentle heat shimmer, appetizing glow.`
- **Texto**: `Al horno 18 min a 200°C, nunca fritos`

**C6 · 25–30 s**

- **Muestra**: plato final.
- **Prompt**: `Static shot of three golden nuggets on a pastel highchair tray next to soft steamed vegetable sticks, bright clean background.`
- **Texto**: `Los del supermercado no se comparan 🌿`

---

## 15 · Nuggets de pollo y brócoli

| Campo            | Valor                                                                                                             |
| ---------------- | ----------------------------------------------------------------------------------------------------------------- |
| Etapa            | `transicion` · `preescolar`                                                                                       |
| Momento          | almuerzo, cena                                                                                                    |
| `metodo`         | `{blw}`                                                                                                           |
| `forma_servido`  | Bastones alargados, igual que los de pollo solo.                                                                  |
| `nota_seguridad` | El brócoli va cocido y picado muy fino: crudo queda firme dentro del nugget. Horneados, sin sal, servidos tibios. |
| Hierro           | Pollo                                                                                                             |
| Energía          | Avena molida + aceite de oliva                                                                                    |

**C1 · 0–5 s**

- **Muestra**: el corte que revela el verde.
- **Prompt**: `Slow push-in on golden nuggets on a pale plate, one broken open revealing green broccoli flecks inside the pale filling, soft steam.`
- **Texto**: `Nuggets de pollo y brócoli 🥦 | 9 meses+`

**C2 · 5–10 s**

- **Muestra**: ingredientes.
- **Prompt**: `Top-down flat lay of a chicken breast, steamed broccoli florets, ground oats, and one egg on a light wood board, fresh green accent.`
- **Texto**: `Pollo, brócoli, avena y huevo`

**C3 · 10–15 s**

- **Muestra**: picar el brócoli finito.
- **Prompt**: `Macro close-up of a knife finely chopping steamed broccoli into tiny green pieces on a wooden board, rhythmic motion.`
- **Texto**: `Pica el brócoli muy fino: cocido, no crudo`

**C4 · 15–20 s**

- **Muestra**: la mezcla verde.
- **Prompt**: `Close-up of hands mixing chicken mince with chopped broccoli in a ceramic bowl, green flecks distributing through the pale mixture.`
- **Texto**: `Mezcla hasta repartir el verde`

**C5 · 20–25 s**

- **Muestra**: formado y horneado.
- **Prompt**: `Overhead shot of green-flecked nugget batons lined up on a parchment tray, drizzled with olive oil, sliding into a warm oven.`
- **Texto**: `Al horno 18 min a 200°C`

**C6 · 25–30 s**

- **Muestra**: plato final.
- **Prompt**: `Static shot of three broccoli nuggets on a pastel highchair tray, one cut in half showing green inside, bright clean background.`
- **Texto**: `La verdura que sí se come 😉 | @yummigluglu`

---

## 16 · Panqueques de betarraga

| Campo            | Valor                                                                                                       |
| ---------------- | ----------------------------------------------------------------------------------------------------------- |
| Etapa            | `inicio` · `transicion`                                                                                     |
| Momento          | desayuno, snack                                                                                             |
| `metodo`         | `{blw}`                                                                                                     |
| `forma_servido`  | Panqueque chico cortado en tiras del ancho de dos dedos, o enrollado como cigarro.                          |
| `nota_seguridad` | Sin azúcar ni miel. La miel está prohibida antes del año por riesgo de botulismo. Betarraga siempre cocida. |
| Hierro           | Huevo + betarraga (se le sumaron a propósito)                                                               |
| Energía          | Avena + aceite de oliva                                                                                     |

> 💡 **Ajuste**: llegó como "waffles o panqueques de betarraga". Va como **panqueque** porque la
> wafflera deja los bordes duros y crocantes, justo lo que BLISS pide evitar. Y se le sumaron
> **huevo y avena** para que la comida traiga hierro de verdad: la betarraga sola no alcanza.

**C1 · 0–5 s**

- **Muestra**: el color rosado. Esto para de scrollear.
- **Prompt**: `Slow tilt-down on a stack of vivid magenta pancakes on a pale ceramic plate, natural beet color, soft morning light, minimal styling.`
- **Texto**: `Panqueques de betarraga 💗 | 6 meses+`

**C2 · 5–10 s**

- **Muestra**: ingredientes.
- **Prompt**: `Top-down flat lay of one cooked beetroot, rolled oats, one egg, and a small jug of milk on a light wood board, vivid magenta against neutrals.`
- **Texto**: `Betarraga, avena, huevo y leche`

**C3 · 10–15 s**

- **Muestra**: la licuadora tiñendo todo.
- **Prompt**: `Close-up of a blender turning cooked beetroot, oats and egg into a smooth vivid pink batter, the color swirling as the blade spins.`
- **Texto**: `Licua todo: el color es natural`

**C4 · 15–20 s**

- **Muestra**: la sartén.
- **Prompt**: `Overhead shot of pink batter being poured into a small non-stick pan forming a round pancake, bubbles rising on the surface.`
- **Texto**: `Sartén chica, fuego bajo`

**C5 · 20–25 s**

- **Muestra**: la vuelta.
- **Prompt**: `Side-angle shot of a spatula flipping a magenta pancake, revealing a lightly browned underside, gentle steam.`
- **Texto**: `Da vuelta cuando salgan burbujas`

**C6 · 25–30 s**

- **Muestra**: plato final en tiras.
- **Prompt**: `Static shot of two magenta pancakes on a pastel highchair tray, one cut into finger strips, bright clean morning background.`
- **Texto**: `Sin azúcar ni miel 🌿 | @yummigluglu`

---

## 17 · Tortilla de papa, zanahoria y acelga

| Campo            | Valor                                                                                                                                |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Etapa            | `inicio` · `transicion`                                                                                                              |
| Momento          | almuerzo, cena                                                                                                                       |
| `metodo`         | `{blw, papilla}`                                                                                                                     |
| `forma_servido`  | Tortilla gruesa cortada en bastones del ancho de dos dedos.                                                                          |
| `nota_seguridad` | La papa y la zanahoria van cocidas hasta que se aplasten con el dedo. Acelga bien picada, solo la hoja. Huevo completamente cuajado. |
| Hierro           | Huevo + acelga                                                                                                                       |
| Energía          | Papa + aceite de oliva                                                                                                               |

**C1 · 0–5 s**

- **Muestra**: la porción con capas visibles.
- **Prompt**: `Slow push-in on a thick wedge of potato omelette on a pale plate, visible layers of potato, orange carrot and green chard inside, soft steam.`
- **Texto**: `Tortilla de papa, zanahoria y acelga 🥔 | 6 meses+`

**C2 · 5–10 s**

- **Muestra**: ingredientes.
- **Prompt**: `Top-down flat lay of two potatoes, one carrot, a bunch of green chard leaves, and three eggs on a light wood board.`
- **Texto**: `Papa, zanahoria, acelga y huevo`

**C3 · 10–15 s**

- **Muestra**: cocer papa y zanahoria.
- **Prompt**: `Overhead shot of diced potato and carrot boiling gently in a pot of water, steam rising, soft bubbles.`
- **Texto**: `Cocina hasta que se aplasten con el dedo`

**C4 · 15–20 s**

- **Muestra**: picar la acelga.
- **Prompt**: `Close-up of a knife finely chopping green chard leaves on a wooden board, vivid green, stems set aside.`
- **Texto**: `Usa solo la hoja, bien picada`

**C5 · 20–25 s**

- **Muestra**: cuajar la tortilla.
- **Prompt**: `Side-angle shot of a thick vegetable omelette setting in a small non-stick pan, edges firming, a spatula easing around the rim.`
- **Texto**: `Cuájala bien: sin partes líquidas`

**C6 · 25–30 s**

- **Muestra**: plato final en bastones.
- **Prompt**: `Static shot of three omelette sticks on a pastel highchair tray, layers visible in cross-section, bright clean background.`
- **Texto**: `Dura 2 días en el refrigerador 🧊`

---

## 18 · Cilindros de arroz con palta y pollo

| Campo            | Valor                                                                                                                                                                |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Etapa            | `transicion`                                                                                                                                                         |
| Momento          | almuerzo, cena                                                                                                                                                       |
| `metodo`         | `{blw}`                                                                                                                                                              |
| `forma_servido`  | 🔴 **Cilindros alargados del largo de un dedo, NUNCA bolitas.**                                                                                                      |
| `nota_seguridad` | Una bolita de arroz es redonda, compacta y del diámetro exacto de la vía aérea del bebé. Formada como cilindro asoma del puño y no puede entrar entera. Sirve tibio. |
| Hierro           | Pollo                                                                                                                                                                |
| Energía          | Arroz + palta                                                                                                                                                        |

> 🔴 **Este es el único cambio de fondo que se le hizo a la lista de tu señora, y va explicado en el
> video a propósito.** Misma receta, mismo sabor, misma foto linda. Solo cambia la forma — y esa
> forma es la diferencia entre un snack y un riesgo. El clip C4 es el que enseña esto: **no lo cortes
> del edit.**

**C1 · 0–5 s**

- **Muestra**: los cilindros parados.
- **Prompt**: `Slow orbit around three finger-shaped rice cylinders standing upright on a pale plate, pale green avocado visible in the center of each, soft light.`
- **Texto**: `Cilindros de arroz con palta y pollo 🍚 | 9 meses+`

**C2 · 5–10 s**

- **Muestra**: ingredientes.
- **Prompt**: `Top-down flat lay of a bowl of cooked white rice, one ripe avocado, shredded cooked chicken, and a small lemon on a light wood board.`
- **Texto**: `Arroz, palta y pollo desmenuzado`

**C3 · 10–15 s**

- **Muestra**: la mezcla.
- **Prompt**: `Close-up of a spoon folding mashed avocado and shredded chicken into warm cooked rice in a ceramic bowl, creamy binding texture.`
- **Texto**: `Mezcla mientras el arroz está tibio: pega mejor`

**C4 · 15–20 s**

- **Muestra**: 🔴 el formado alargado. **Este es el clip clave del video.**
- **Prompt**: `Macro shot of hands pressing the rice mixture into a long finger-shaped cylinder, clearly elongated not round, placing it beside two others on a board.`
- **Texto**: `Cilindros, nunca bolitas 🔴`

**C5 · 20–25 s**

- **Muestra**: el porqué, mostrado con la mano.
- **Prompt**: `Close-up of an adult hand holding a rice cylinder in a closed fist with both ends clearly sticking out past the fingers, warm soft light.`
- **Texto**: `Debe asomar de su puño por los dos lados`

**C6 · 25–30 s**

- **Muestra**: plato final.
- **Prompt**: `Static shot of three rice cylinders on a pastel highchair tray with avocado slices, bright clean background.`
- **Texto**: `Guarda este video 🔖 | @yummigluglu`

---

## 19 · Papitas al horno con carne mechada

| Campo            | Valor                                                                                                                       |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Etapa            | `transicion` · `preescolar`                                                                                                 |
| Momento          | almuerzo, cena                                                                                                              |
| `metodo`         | `{blw}`                                                                                                                     |
| `forma_servido`  | Papa en gajos gruesos y carne deshilachada en hebras largas encima.                                                         |
| `nota_seguridad` | Sin sal ni aliños picantes. La papa debe ceder al apretarla, no quedar crocante y dura. Retira grasa y nervios de la carne. |
| Hierro           | Carne de vacuno mechada                                                                                                     |
| Energía          | Papa + aceite de oliva                                                                                                      |

**C1 · 0–5 s**

- **Muestra**: el plato final, el más apetitoso de la lista.
- **Prompt**: `Slow push-in on golden roasted potato wedges topped with tender shredded beef on a rustic plate, glossy juices, warm inviting light.`
- **Texto**: `Papitas con carne mechada 🥔 | 9 meses+`

**C2 · 5–10 s**

- **Muestra**: ingredientes.
- **Prompt**: `Top-down flat lay of three potatoes, a lean beef cut, olive oil, a bay leaf and a pinch of oregano on a light wood board.`
- **Texto**: `Papas, carne, aceite de oliva y orégano`

**C3 · 10–15 s**

- **Muestra**: el corte en gajos.
- **Prompt**: `Close-up of a knife cutting a potato into thick chunky wedges on a wooden board, clean cuts, starchy fresh surface.`
- **Texto**: `Corta en gajos gruesos, con cáscara`

**C4 · 15–20 s**

- **Muestra**: el horneado.
- **Prompt**: `Overhead shot of potato wedges spread on a parchment-lined tray, drizzled with olive oil and oregano, sliding into a warm oven.`
- **Texto**: `Al horno 30 min a 200°C`

**C5 · 20–25 s**

- **Muestra**: deshilachar la carne.
- **Prompt**: `Macro close-up of two forks pulling slow-cooked beef apart into long tender strands on a wooden board, glossy with juices, steam rising.`
- **Texto**: `Deshilacha la carne en hebras largas`

**C6 · 25–30 s**

- **Muestra**: plato final en la bandeja.
- **Prompt**: `Static shot of potato wedges topped with shredded beef on a pastel highchair tray, bright clean kitchen bokeh behind.`
- **Texto**: `Almuerzo de grande, porción de bebé 💪`

---

# Cómo se carga esto en la app

> ✅ **YA ESTÁ HECHO (2026-10-03): las 18 recetas están cargadas en la base.** Un solo `INSERT`
> atómico con ingredientes, pasos, nutrientes, `metodo`, `forma_servido` y `nota_seguridad`. El
> catálogo pasó de 207 a **225 recetas**.
>
> 🔴 **Entraron con `activa = false`, y así deben quedar hasta que haya video.** La vista
> `recetas_teaser` filtra por `activa`, así que **ninguna llega al catálogo todavía**.
>
> **Lo que falta es trabajo manual del owner, receta por receta:**
>
> 1. Subir el video a YouTube — ⚠️ **"No es contenido para niños"** y **"Permitir insertar"**
>    activado, o el embed de la app no funciona.
> 2. En **`/admin`** → la receta → pegar la **`video_url`**.
> 3. **Activarla.** Recién ahí aparece en el catálogo.
>
> 📝 La descripción para pegar en YouTube ya está escrita, con el link de la app incluido, en
> `D:\Proyectos\recetas\descripciones-videos.txt`, entradas **208 a 226** (sin la 215).

Si alguna vez hay que crear una receta de trocitos **a mano**, va por **`/admin` → nueva receta**,
sección **🍽️ Método**:

1. Marcá **Trocitos** (eso escribe `metodo = {blw}`).
2. Copiá **`forma_servido`** y **`nota_seguridad`** de la tabla de cada bloque, tal cual.
3. Si además sirve como papilla, marcá las dos.

> 🔴 **La base rechaza una receta BLW sin esos dos campos.** No es el formulario el que valida: es la
> constraint `recetas_blw_exige_seguridad` de la migración `039`. Un formulario se llena con sueño a
> las 2 de la mañana; una constraint no.

> ✅ **`rotacion_grupo` ya está decidido y cargado (2026-10-03): 9 al grupo 0** (siempre gratis,
> el cron no las toca nunca) **y 9 repartidas 3 por grupo 1/2/3**. El criterio de las 9 gratis fue
> **etapa `inicio` + almuerzo/cena + hierro**, que es el agujero medido. El reparto completo, con
> el porqué de cada una, está en `CLAUDE.md` § PENDIENTE → punto 5.
>
> 🔴 **Al publicar en redes, solo los videos del grupo 0 son seguros.** Los de los grupos 1–3
> rotan: el día 1 de cada mes el cron los puede bloquear, y quien vio el video se encuentra un
> candado.

# Checklist de producción por receta

- [ ] 6 clips generados (5 s cada uno)
- [ ] Los 6 comparten cocina, luz y estilo
- [ ] Ningún clip muestra una cara de bebé generada por IA
- [ ] Textos en español **neutro** (tú), no rioplatense
- [ ] El clip de seguridad (prueba de textura o forma) **está en el corte final**
- [ ] Video armado, 30 s, 9:16
- [ ] Subido a YouTube — **"No es contenido para niños"** y **"Permitir insertar"** activado
- [ ] Receta cargada en `/admin` con `metodo`, `forma_servido` y `nota_seguridad`
- [ ] `video_url` pegada en la receta
