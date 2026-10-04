# Recetas BLW — Prompts de imagen de portada

> **Qué es esto**: un prompt por cada una de las **18 recetas de trocitos** (Fase 11) para generar
> la foto de portada (`imagen_url`). Hoy las 18 tienen `imagen_url = null` y la tarjeta muestra el
> fondo de color de la etapa.
>
> Fecha: **2026-10-04** · Complementa `docs/contenido/recetas-blw-prompts-video.md` (misma
> numeración: el hueco del **8** es a propósito).

---

## 🔴 Antes de generar — leé esto

### 1. Las fotos tienen que parecerse a las 207 que ya existen

Se midió sobre el catálogo actual (`pollo-al-horno-con-papas`, `causa-limena-de-pollo`,
`arroz-con-leche`): **plato de cerámica crema con pintitas, borde irregular · servilleta de lino
beige · mesa de madera de pino clara · luz de ventana suave desde atrás a la izquierda · cámara a
~35° · fondo desenfocado**. Si una portada sale con otra cocina, en la grilla se nota al toque.

### 2. Formato de salida

| Dato     | Valor                                                                                                                                                   |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tamaño   | En el generador: **`16:9`** (las existentes quedaron en 1200 × 669).                                                                                    |
| Descarga | **PNG** en `D:\Proyectos\recetas\imagenes\<N> — <Nombre>\<N>.png` (N = 207 + #, sin la 215).                                                            |
| Encuadre | **Plato centrado y con aire a los costados**: la tarjeta recorta a **4:3** (`RecetaCard`).                                                              |
| Carga    | `scripts/cargar-imagenes.py` (mapeo v2 ya incluye las 18): convierte a WebP 1200 px, sube a `recetas-imagenes` como `{slug}.webp` y setea `imagen_url`. |

> La columna **Archivo** de abajo es el `{slug}.webp` con el que el script sube cada una. No hace
> falta renombrar nada a mano: vos guardás `<N>.png` y el script hace el resto.

### 3. 🔴 La forma de la comida en la foto ES información de seguridad

Una mamá copia lo que ve en la foto, no lo que dice el texto. Por eso cada prompt pide **la forma
segura** (bastones, cilindros, tiras) y el negativo prohíbe bolitas, rodajas redondas y bordes
crocantes. **Si la imagen sale con una bolita o una rodaja redonda, se descarta**, aunque se vea
linda.

### 4. Bloques fijos — pegar en CADA prompt

Al final de cada prompt:

```
STYLE: food photography, 16:9, served on a handmade cream speckled ceramic plate with an irregular rim, beige linen napkin underneath, light natural pine wood table, soft diffused window light from the back left, camera at 35 degrees, 50mm lens, shallow depth of field, blurred bright background, warm natural tones, photorealistic, plate centered with empty space on both sides.
```

Prompt negativo (donde el generador lo acepte):

```
NEGATIVE: text, letters, watermark, logo, people, hands, baby, child, highchair, cutlery in the food, round balls, meatballs, round slices, whole grapes, whole cherry tomatoes, nuts, salt crystals, chili, burnt edges, crispy hard crust, heavy sauce, dark moody lighting, plastic-looking food, cluttered props.
```

> Sin manos ni bebés a propósito: es la portada del catálogo, no el video. Y las manos generadas
> por IA son el primer lugar donde se nota que es IA.

---

## Los 18 prompts

### 1 · Bastones de pollo al vapor con palta

- **Archivo**: `bastones-pollo-vapor-palta.webp`
- **Prompt**: `Four finger-length steamed chicken breast sticks, pale and juicy with a soft tender texture, lined up next to thick wedges of ripe avocado with a light drizzle of olive oil and a tiny sprig of parsley.`

### 2 · Deditos de carne y quinoa al horno

- **Archivo**: `deditos-carne-quinoa-horno.webp`
- **Prompt**: `Five elongated finger-shaped baked beef and quinoa fingers, lightly golden on the outside with tiny quinoa grains and flecks of grated carrot visible, one broken in half showing a soft moist interior, a few soft steamed broccoli florets on the side.`

### 3 · Hamburguesita de lentejas y avena

- **Archivo**: `hamburguesita-lentejas-avena.webp`
- **Prompt**: `Two small flat rustic lentil and oat patties, lightly golden, one of them cut into three finger-width strips showing a soft brown interior with green zucchini flecks, thick avocado slices beside them.`

### 4 · Bastones de tortilla de huevo y espinaca

- **Archivo**: `bastones-tortilla-huevo-espinaca.webp`
- **Prompt**: `Four thick fluffy omelette sticks, two fingers wide, fully set bright yellow egg with fine green spinach flecks visible on the cut sides, stacked loosely, with a few soft cooked carrot sticks on the side.`

### 5 · Croquetas alargadas de porotos negros con arroz

- **Archivo**: `croquetas-porotos-negros-arroz.webp`
- **Prompt**: `Four elongated cylinder-shaped black bean and rice croquettes, finger-length, softly browned, one broken open revealing a soft mashed bean and white rice interior with green parsley flecks, thick avocado slices beside them.`

### 6 · Pollo desmenuzado con bastones de camote

- **Archivo**: `pollo-desmenuzado-bastones-camote.webp`
- **Prompt**: `Thick chunky roasted sweet potato sticks with vivid orange soft flesh and lightly caramelized surface, next to a small mound of long soft shredded chicken strands, glistening lightly with olive oil, a pinch of dried oregano.`

### 7 · Bastones de zapallo italiano al horno con hummus

- **Archivo**: `bastones-zapallo-italiano-hummus.webp`
- **Prompt**: `Long soft roasted zucchini batons with green skin and tender pale flesh, arranged in a fan beside a small ceramic bowl of smooth creamy pale hummus with a swirl of olive oil on top.`

### 9 · Tortitas de betarraga, lenteja y avena

- **Archivo**: `tortitas-betarraga-lenteja-avena.webp`
- **Prompt**: `Three flat deep magenta beetroot, lentil and oat patties, one cut into finger-width strips showing a soft vivid pink interior, strong natural color contrast against the cream plate.`

### 10 · Bastones de posta de vacuno a la olla

- **Archivo**: `bastones-posta-vacuno-olla.webp`
- **Prompt**: `Long finger-length strips of slow-braised lean beef, very tender with visible soft fibers, glossy with a little cooking juice, beside soft cooked carrot sticks and a bay leaf resting on the edge of the plate.`

### 11 · Dedos de pan con palta y huevo duro

- **Archivo**: `dedos-pan-palta-huevo-duro.webp`
- **Prompt**: `Three long fingers of lightly toasted soft white bread with the crust removed, thickly spread with smooth bright green mashed avocado and topped with finely grated hard-boiled egg, arranged side by side in a row.`

### 12 · Tortitas de avena, huevo y plátano

- **Archivo**: `tortitas-avena-huevo-platano.webp`
- **Prompt**: `A small stack of four thin golden oat, egg and banana pancakes, soft and fluffy, one pancake on the side cut into finger strips, a halved ripe banana lying lengthwise out of focus at the edge of the plate.`

### 13 · Fideos salteados con pollo y verduras

- **Archivo**: `fideos-salteados-pollo-verduras.webp`
- **Prompt**: `Short soft spiral fusilli pasta tossed with long strands of shredded chicken and thin batons of carrot, zucchini and red bell pepper, lightly glossy with olive oil, colorful and fresh, no sauce.`

### 14 · Nuggets caseros de pollo

- **Archivo**: `nuggets-caseros-pollo.webp`
- **Prompt**: `Five homemade baked chicken nuggets shaped as elongated finger-length batons, lightly golden oat crumb coating, matte not fried, one broken open showing a soft pale chicken interior, soft steamed vegetable sticks on the side.`

### 15 · Nuggets de pollo y brócoli

- **Archivo**: `nuggets-pollo-brocoli.webp`
- **Prompt**: `Four baked chicken and broccoli nuggets shaped as elongated batons, lightly golden oat coating, one cut in half revealing a pale filling with fine green broccoli flecks throughout, a few steamed broccoli florets on the side.`

### 16 · Panqueques de betarraga

- **Archivo**: `panqueques-betarraga.webp`
- **Prompt**: `A stack of thin soft vivid magenta beetroot pancakes, natural beet color, plus one pancake rolled up like a cigar and another cut into finger-width strips beside the stack, no syrup, no honey.`

### 17 · Tortilla de papa, zanahoria y acelga

- **Archivo**: `tortilla-papa-zanahoria-acelga.webp`
- **Prompt**: `Thick fully set potato omelette cut into finger-width sticks, the cut sides showing visible layers of soft potato, orange carrot and fine green chard, golden on the outside, sticks loosely stacked.`

### 18 · Cilindros de arroz con palta y pollo

- **Archivo**: `cilindros-arroz-palta-pollo.webp`
- **Prompt**: `Three finger-length elongated rice cylinders, clearly long and log-shaped not round, made of soft white rice mixed with pale green avocado and fine shredded chicken, lying side by side, with two thick avocado slices beside them.`

> 🔴 Esta es la que más se va a equivocar el generador: "rice" + "avocado" lo tira a sushi o a
> onigiri. Si sale una bola, un triángulo o un roll con alga, **regenerar**. Agregá al negativo
> `sushi, seaweed, nori, onigiri, triangle`.

### 19 · Papitas al horno con carne mechada

- **Archivo**: `papitas-horno-carne-mechada.webp`
- **Prompt**: `Thick soft roasted potato wedges with skin, lightly golden but not crispy, topped and surrounded with long tender strands of shredded braised beef, glossy with a little cooking juice, a pinch of dried oregano.`

---

## Checklist por imagen

- [ ] Se ve igual que las del catálogo (plato crema, lino, madera clara, luz de ventana)
- [ ] La comida tiene la **forma segura** (bastón / tira / cilindro), nada redondo
- [ ] Sin texto, sin manos, sin bebés
- [ ] El plato entra completo si se recorta a 4:3 al centro
- [ ] Guardada como `<N>.png` en su carpeta de `D:\Proyectos\recetas\imagenes`
- [ ] Subida con `python scripts/cargar-imagenes.py --ejecutar --solo <slug>`
