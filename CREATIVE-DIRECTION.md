# CREATIVE DIRECTION — "Plano y escena"

## Tres conceptos evaluados

| | A. **Plano y escena** (elegido) | B. Escenario negro | C. Collage de afiche |
|---|---|---|---|
| Idea | El lenguaje del plano técnico (grilla, cotas, llamadas) como identidad. Muestra el *cómo*: del plano al piso. | Dirección cinematográfica oscura con fotografía a sangre y video, al estilo de las grandes agencias de activaciones. | Tipografía enorme, colores saturados y afiches superpuestos, inspirado en la identidad del Tunja Tattoo Festival. |
| Fortaleza | Usa el material que sí existe (renders 3D) y es único frente a los referentes. Honesto y fácil de ejecutar. | Máximo impacto con buen material. | Mucha personalidad y energía. |
| Riesgo | Puede sentirse "técnico" si no se equilibra con color y trabajo real. | **No hay fotografía ni video de calidad suficiente**: quedaría vacío o con stock. | Reduce BenRed a un solo evento cultural y compite con los afiches, no con la propuesta B2B. |
| Viabilidad | Alta | Baja hoy | Media |

Se elige **A** porque combina originalidad, credibilidad y viabilidad con el inventario real de BenRed. B queda como evolución cuando exista fotografía y video de montajes terminados.

## Concepto: *Plano y escena*
BenRed convierte ideas en espacios construidos. El sitio lo dice con su propia forma: el hero es un plano técnico que se dibuja solo (un stand de 6 × 4 m con pantallas, recepción y producto), la grilla del papel de plano sostiene todo el layout y el trabajo aparece rotulado como lo que es: *Render 3D*, *Fotografía* o *Afiche*.

Titular: **"Tu marca, a escala real."** Promete lo que el negocio hace (llevar una marca al espacio físico, con medidas) sin adjetivos vacíos.

## Sistema visual
**Color** (derivado del degradado del logo, medido sobre el vector):
- Papel `#F3F0E9` / papel 2 `#E9E5DB`: fondo base, cálido como un plano impreso.
- Tinta `#0D1517`: texto y secciones oscuras.
- Teal profundo `#026472`, teal `#258288`, menta `#64BDAF`: los tres tonos del degradado del logo.
- Señal `#FF5A2B`: **solo** acciones (CTA) y cotas del plano. Es el color que no pertenece al logo, por eso funciona como marcador.

**Tipografía** (Google Fonts, vía `next/font`):
- *Bricolage Grotesque* para títulos (peso 600–700, tracking −3,5 %).
- *Instrument Sans* para texto.
- *JetBrains Mono* en mayúsculas para anotaciones de plano (etiquetas, cotas, tipos de pieza).

**Lenguaje gráfico:** grilla de 48 px, cajetín de plano, cotas, llamadas con líneas finas, cuadrados de color como viñeta, bordes rectos de 1,5 px. Sin sombras decorativas ni degradados, salvo la gráfica de lectura sobre imágenes.

**Logo:** vectores oficiales extraídos de `branding/logo benred.ai` (páginas 1 y 3), sin modificar geometría ni color. Solo se ajustó el encuadre (`viewBox`) al contenido. En fondos oscuros se coloca sobre una placa de papel para respetar los tonos originales.

## Fotografía y trabajo
Solo material publicado por BenRed en su sitio. Cada pieza lleva etiqueta de tipo. No se usaron imágenes stock ni la foto de la persona, no se generó nada con IA. Las imágenes solo se recomprimieron a WebP en dos tamaños; los originales no se tocaron.

## Motion
- Dibujo de líneas del plano en el hero (≈ 2 s, una sola vez).
- Revelado de secciones al hacer scroll (opacidad + 18 px, 0,7 s).
- Hover: subrayado animado, escala 1,03 en imágenes, flecha que se desplaza.
- `prefers-reduced-motion`: todo se muestra de inmediato, sin transiciones. Sin JS el contenido es visible.
- Sin scroll secuestrado, sin parallax, sin animación permanente.

## Arquitectura de información
```
/                       Posicionamiento, servicios, proceso, trabajo, evento propio, CTA
/servicios              Visión general de los tres frentes
/servicios/[slug]       Un detalle por servicio (3 URLs con SEO propio)
/portafolio             Galería filtrable (Todo / Stands / Eventos)
/nosotros               Quiénes somos, misión, visión
/contacto               WhatsApp, correo, teléfonos y formulario (→ WhatsApp o mailto)
```
Se omiten: blog (el actual no aporta al negocio), casos de éxito (no hay datos verificados), testimonios, clientes.

## CTA
"**Cuéntanos tu proyecto**" (WhatsApp con mensaje prellenado) visible en header, hero, cierre y botón flotante. Alternativas: formulario y correo.
