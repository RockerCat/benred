# IMPLEMENTATION

## Stack
Next.js 16.4 (App Router, Turbopack, Cache Components activado por defecto) · React 19 · TypeScript · Tailwind CSS 4 · `next/font/google`. **Sin librerías de animación** (el movimiento es CSS + un gestor de scroll propio de ~100 líneas), sin backend, sin base de datos, sin servicios de pago.

## Comandos
```bash
cd web
npm install
npm run dev          # desarrollo → http://localhost:3000
npm run build        # build de producción
npm run start        # servir el build → http://localhost:3000
npm run lint
```

## Estructura
```
web/
├── public/
│   ├── brand/       Logos vectoriales (SVG recortados desde branding/logo benred.ai)
│   ├── work/        Fotos/renders/afiches en WebP (640 y 1280 px)
│   └── og.png       Imagen para compartir (logo sobre blanco)
└── src/
    ├── app/         Rutas: /, /servicios, /servicios/[slug], /portafolio, /nosotros, /contacto,
    │                sitemap.ts, robots.ts, not-found.tsx, icon.png
    ├── components/  Header, Footer, BlueprintHero, Reveal, WorkCard, PortfolioGallery,
    │                ContactForm, WhatsAppFab
    └── lib/site.ts  Datos del sitio: contactos, servicios y proyectos (única fuente)
```

## Datos y contenido
Todo dato comercial vive en `src/lib/site.ts`: contactos, servicios, proyectos y afiches. Para agregar un proyecto: copiar su imagen a `public/work/` (`nombre-640.webp` y, si mide ≥ 1280 px, `nombre-1280.webp`) y añadir un objeto a `PROJECTS`.

## Funcionalidad
- Navegación con menú móvil accesible (Escape, foco, bloqueo de scroll).
- Hero SVG animado propio (esquema ilustrativo, rotulado).
- Galería con filtro por tipo.
- Formulario de contacto **sin backend**: arma el mensaje y lo abre en WhatsApp o en el correo (`mailto:` a `jpduarte@benred.co` con copia a `dbolivar@benred.co`). Valida nombre y descripción antes de abrir.
- SEO: title/description/canonical por página, Open Graph, sitemap, robots, JSON-LD `Organization` (home) y `Service` (servicios) con datos solo verificados.
- Accesibilidad: HTML semántico, un `h1` por página, enlace "Saltar al contenido", foco visible, `aria-current`, `aria-pressed`, `aria-live` en el contador, movimiento reducido.

## Decisiones técnicas
- `metadataBase`, canonical, sitemap y robots apuntan a `https://benred.co`. Es solo configuración: no se publicó nada. Cambiar `SITE.url` si el dominio de producción cambia.
- Logo en SVG con degradados embebidos como imagen (así sale de Illustrator); se carga con `unoptimized`.
- Los renders 3D se muestran con `object-cover`; algunos se recortan ligeramente por proporción.

## Hero: plano 2D → stand 3D
- **Modelo único** (`src/lib/stand-model.ts`): el stand (6 × 4 × 2,8 m) se define una vez en metros (`STAND`) y se proyecta con `P2` (planta, 60 px/m) y `P3` (isométrica 30°). Plano y volumen son el mismo diseño por construcción. Los trazos se agrupan en capas con ids estables (`plano-*`, `iso-*`).
- **Render:** `BlueprintHero` (cliente) pinta ~86 `<path>` con `pathLength="1"`; el trazado usa `stroke-dashoffset` por CSS (`.hs` en `globals.css`), con retardo/duración por elemento (`--d`, `--dd`) y borrado inverso (`--e`).
- **Tres representaciones del mismo stand:** A plano 2D · B isométrica wireframe · C isométrica materializada. C no es otro dibujo: cada superficie de material (`.mt`) **reutiliza el path de la cara del wireframe** y se emite justo después de ella (`box3`/`cylinder3`), así hereda cámara, encuadre, geometría y orden de oclusión. 57 superficies de material, 21 degradados SVG (`GRADIENTS`), 0 filtros.
- **Materiales (estilizados):** piso de madera clara con tablones, muros blanco hueso con zócalo y cabecera en teal, mostrador teal con tapa clara y línea de luz menta, mesa de madera, tótem grafito con panel iluminado, isla blanca con esfera de producto, pantallas con halo, banquetas grafito. Luz arriba-izquierda: tapas claras, frentes medios, costados oscuros; sombras de contacto y ambiente en la base de los muros (formas planas de baja opacidad).
- **Máquina de estados** (`src/lib/hero-sequence.ts`), atributo `data-phase` en el `<svg>`, sin React por frame:

| Fase | Duración |
|---|---|
| `draw2d` | 2,8 s |
| `hold2d` | 3,0 s |
| `erase2d` | 0,9 s |
| `draw3d` | 3,8 s |
| `hold3d` (wireframe completo) | 1,5 s |
| `materialize` | 2,4 s |
| `holdReal` (stand terminado) | 4,0 s |
| `reset` (borrado) | 1,0 s |
| **Ciclo** | **19,4 s** |

- **Materialización:** orden piso → muros → mostrador/mesa/isla → tótem → pantallas → detalles (retraso `--m` por elemento, 0,6 s de fundido). El trazo del wireframe baja a 50 % de opacidad (`stroke-opacity`), no desaparece. Solo `opacity` y `stroke-opacity`.
- **Visibilidad:** `IntersectionObserver` con histéresis (arranca con ≥ 50 % visible, se detiene con ≤ 15 %) y `visibilitychange`. Al salir: cancela el temporizador y pasa a `idle` (lienzo vacío, sin transiciones). Al volver: siempre `idle → draw2d`. Un solo `setTimeout` activo.
- **Movimiento reducido:** no arranca el ciclo; el CSS muestra el stand terminado (materiales + wireframe atenuado) y estático. Sin JS (`<noscript>`) ocurre lo mismo.
- **Móvil (≤ 640 px):** trazos ×1,5, etiquetas a 17 px y se omiten detalles menores (`.minor`).

## Segundo stand: "Del plano al piso de feria" (scroll-linked)
- **Modelo independiente** (`src/lib/stand2-model.ts`): isla de 9 × 6 m con dos frentes abiertos, plataforma elevada, pórtico de 4 columnas y 4 vigas, video wall de 3 pantallas, recepción, zona de reuniones con alfombra, panel gráfico, vitrina, 2 islas de producto y tótem. Un solo conjunto de objetos (`OBJS`, en metros) genera plano 2D, wireframe isométrico y materiales (mismas caras, mismo encuadre). El orden de pintado se calcula por oclusión (orden topológico), no a mano. Proyecciones, ids (`s2-*`) y degradados (`p-*`) propios: no comparte estado con el stand del hero.
- **Progreso del scroll:** `p` ∈ [0, 1] con el gestor compartido (`scroll-motion.ts`, mapa `standProgress` en `motion.ts`). Pista = stage `sticky` + espaciador (65 vh en escritorio, 45 vh en móvil); el scroll es nativo. Rangos: plano 0,02–0,27 · borrado 0,30–0,44 · wireframe 0,31–0,58 · materiales 0,54–0,88 · luces y pantallas 0,84–1,00. Cada elemento lleva su ventana en `data-a/data-b` (`data-ea/data-eb` para el borrado del plano).
- **Motor** (`StandScroll.tsx`, cliente): recibe el SVG renderizado en servidor y, en cada frame de scroll, escribe solo los elementos cuyo valor cambió (trazo, opacidad). Sin re-renders de React. Se descartó animar con `calc()` sobre `--p`: la variable hereda y forzaba recalcular ~1500 nodos por frame (p95 de 44 ms frente a 28 ms de un tramo de control; con el motor actual iguala al control).
- **Servidor vs cliente:** `ProcessStand.tsx` es componente de servidor; el modelo no viaja al cliente. HTML de la home: ~45 KB gzip.
- **Etapas:** el pie del esquema resalta Plano → Estructura 3D → Materiales → Listo para operar según `p`, con barra de progreso. Las cuatro etapas originales y las dos fotografías no cambian.
- **Estado estático** (sin JS o `prefers-reduced-motion`): lo define el CSS (`.ps:not(.live)`): plano oculto, stand terminado, sin sticky ni espaciador.
- **Móvil (≤ 767 px):** pista más corta, trazos ×2, se omiten leyenda, marcadores, cotas con texto y detalles menores.
- El stand 1 (hero) y el stand 2 no corren a la vez: el hero se detiene al salir de pantalla y el stand 2 solo calcula cuando su pista está cerca del viewport.

## Marca conceptual y personas (ambos stands)
- **Marcas demostrativas** (no son clientes ni proyectos de BenRed; texto + geometría SVG, colores del sitio): **ORBE** en el hero (mayúsculas anchas, tinta + naranja señal + menta, isotipo de círculos concéntricos) y **malva** en el stand del proceso (minúsculas, tinta + menta + papel, isotipo de anillo). No se comprobó su disponibilidad como marca registrada: son nombres genéricos de demostración.
- **Branding desde el plano:** en 2D, anotaciones técnicas discretas ("FRISO · IDENTIDAD", "PANEL DE MARCA"; en el stand 2, marcador G "Identidad"). En wireframe, las superficies de marca se reconocen solo con contornos finos (línea del friso, marco del panel, placa del mostrador), sin color. En la fase materializada la marca se revela sobre friso, panel principal, mostrador, tótem y pantallas, siempre como capa sobre la cara existente y respetando el orden de pintado.
- **Figuras** (`src/lib/figures.ts`, módulo aislado): personas estilizadas sin rostro, proporciones de ~7,5 cabezas, tres cuartos de perfil, 4 orientaciones, poses (de pie, conversando, señalando, con tableta), vestuario distinto y sombra de contacto que las ancla al suelo. Se construyen con paths SVG a partir del punto de apoyo ya proyectado; no hay iconos, emojis ni imágenes.
- **Hero:** 3 personas (atención tras el mostrador, visitante frente al mostrador, visitante en la exhibición). Aparecen dentro de `holdReal`, escalonadas (0,15 / 0,5 / 0,85 s) con una entrada corta sobre el plano del suelo. La marca se revela dentro de `materialize`. El ciclo no cambia (19,4 s).
- **Stand 2:** 5 personas (recepción, visitante con tableta, pareja conversando, visitante en la plataforma). Entran en el último tramo del progreso (0,88–1,00) y se retiran al retroceder; la marca aparece en 0,72–0,92 y las pantallas muestran su contenido en 0,84–1,00. Todo sigue siendo función de `p`: sin temporizadores.
- **Oclusión:** en el hero las personas se insertan entre grupos (la atención va antes del mostrador, que le oculta las piernas; el visitante 3 va entre la isla y la mesa). En el stand 2 las figuras son objetos del orden topológico por oclusión.
- **Móvil:** el texto de marca (`.br-t`) se omite por ilegible; se conservan isotipos y personas. Movimiento reducido o sin JS: escena final completa (marca + personas).

## Pulido visual final (figuras, marca, escala)
- **Figuras** (`figures.ts`): siluetas con piernas de dos segmentos y contrapposto, hombros caídos, cintura y cadera, brazos con codo, calzado con suela y cabello con volumen; cuatro vestuarios (`blazer`, `coat`, `tee`, `dress`), camisa visible bajo el blazer, estaturas 1,70–1,86 m. La API anterior sigue siendo válida.
- **Marca:** friso más alto (hero 0,34 m; stand 2 0,40 m) con nombre más grande y continuidad en el friso del muro lateral; mostrador y panel principal con wordmark mayor; isotipo del tótem más grande. Las pantallas pasan a fondo oscuro con composición de marca/producto (anillos, ondas, isotipo), sin gráficos tipo aplicación.
- **Escala del stand 2:** `viewBox` recortado al contenido (`0 8 790 512`), altura máxima del escenario 720 px (`100svh − 190px`) y, en móvil, el SVG se amplía al 123 % dentro de un marco con `overflow: hidden` (la leyenda está oculta en móvil). Geometría y proyección intactas. Recorrido de scroll: +25 px en móvil, +57 px de alto de escenario en escritorio.

## Escenario de concierto: "De la idea al escenario" (scroll-linked, carga diferida)
- **Qué es:** visualización conceptual de producción de eventos (identidad ficticia **MAREA**; no es un evento de BenRed ni del Tunja Tattoo Festival; nombre genérico de demostración, sin comprobar disponibilidad como marca). Vive dentro de la sección del festival, **después** de los afiches y separada por una línea; no toca sus textos ni sus enlaces.
- **Cámara única** (`src/lib/concert-model.ts`): perspectiva frontal elevada, `sx = X0 + F·x/(y+D)`, `sy = Y0 + F·(CZ−z)/(y+D)`. Un plano frontal se proyecta como rectángulo exacto. La cámara no cambia entre fases.
- **Escena:** tarima de 14 × 8 × 1,2 m, truss de 9,2 m con columnas y vigas, line arrays y subgraves, pantalla LED central y dos laterales con la identidad, 18 luminarias (movers, washes, contraluces) que originan cada haz, monitores, batería, amplificadores, 4 artistas (figuras de `figures.ts` + instrumentos) y público en 4 filas (un solo path por fila, generado con semilla determinista).
- **Fases por progreso p:** 0,02–0,24 líneas técnicas con cotas y anotaciones · 0,24–0,54 montaje (rellenos y materiales de día) · 0,46–0,80 transición a noche, pantallas con identidad y artistas · 0,74–0,98 luces, haces y público.
- **Ambiente día → noche sin capa superpuesta:** cada degradado de material guarda su color de día y de noche (`data-day`/`data-night`); `ConcertScroll` los interpola (24 pasos) junto con el fondo y el color de las líneas. Así la oclusión no se rompe y las pantallas, lentes y haces (colores propios) quedan encendidos.
- **Motor** (`ConcertScroll.tsx`): mismo patrón que el segundo stand (gestor de scroll compartido con callback, escribe solo lo que cambia). Pista corta: 40 vh en escritorio, 30 vh en móvil; mapa `concertProgress` en `motion.ts`.
- **Carga diferida** (`ConcertStage.tsx` + `ConcertScene.tsx`): el HTML inicial solo lleva un marcador estable (mismo tamaño, descripción accesible y título) y la escena se descarga a ~1 pantalla de distancia (`next/dynamic`, `ssr: false`). Peso de la home: 61,7 KB comprimidos (antes 58,1 KB); renderizarla en el servidor la subía a ~91–96 KB.
- **Estático** (movimiento reducido): concierto terminado, de noche, sin cotas ni sticky.
- **Móvil:** se omiten anotaciones y detalles menores; el marco ocupa todo el ancho.

## Sistema de movimiento
- **Tokens** (`globals.css :root --m-*`): easings, duraciones (0,3 / 0,7 / 1,1 s), distancias (10 / 18 px) y escalonado (70 ms). Números de JS (umbrales y mapas de progreso) en `src/lib/motion.ts`.
- **Gestor de scroll** (`src/lib/scroll-motion.ts`): un único listener pasivo + `requestAnimationFrame`, `IntersectionObserver` para medir solo lo cercano al viewport, lecturas antes que escrituras. Escribe la variable CSS `--p` (0–1) directo en el DOM: cero re-renders de React por scroll.
- **Scroll-triggered** (`Reveal`, `RevealWords`, `WorkCard`): añade `is-in` al entrar; el CSS hace la transición (opacidad/transform/clip-path).
- **Scroll-linked** (`ScrollLinked`): proceso (`--a` por etapa) y paralaje interno de renders (±2,5 %). Bidireccional y determinista. El hero ya no es scroll-linked: su secuencia es temporal (ver abajo).
- **Scroll nativo:** sin Lenis/GSAP, sin `scroll-behavior`, sin snap, sin sticky de recorrido.
- **Accesibilidad / fallback:** con `prefers-reduced-motion` el gestor deja todo visible y en reposo (hero 0, etapas 1, paralaje 0,5) y el CSS anula transiciones. Sin JS, `<noscript>` muestra todo y las variables tienen valor por defecto legible.
- **Móvil:** desplazamientos más cortos, escalonado menor, hover solo con `@media (hover: hover)`.

## Limitaciones y pendientes
- **Fotografía de montajes terminados y video:** hoy solo hay 2 fotos reales (stand de Tunja, montaje de evento). Con más material se puede pasar al concepto B (hero de imagen/video).
- **Confirmar con BenRed:** nombres de cliente de cada render, si fueron construidos, año de los afiches del Tunja Tattoo Festival y su rol en ellos, nombre legal, ciudad.
- **Formulario:** funciona vía WhatsApp o correo. Para recibir envíos directos haría falta un servicio de envío (no incluido).
- **Cifra "+10 años":** tomada del sitio actual de BenRed; confirmar antes de publicar.
- **Imagen para compartir (`og.png`):** provisional, solo el logo; conviene una versión con trabajo.
- Sin analítica, sin banner de cookies (no se carga ningún tercero).
- **Realismo del hero:** es una representación estilizada en SVG (degradados y capas), no fotorrealista. Un render fotorrealista requeriría un modelo 3D real del stand y un motor de render fuera del alcance de este sitio.
- Pruebas de rendimiento (Lighthouse) no ejecutadas; ver `RESEARCH.md` y reporte final.
