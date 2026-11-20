import type { CSSProperties } from "react";

/**
 * Diagramas técnicos conceptuales del "Laboratorio creativo" (servicios). SVG estático renderizado en el servidor:
 * ningún cálculo en el cliente. La interacción la gestiona LabSwitch (data-cur) con CSS; el trazado de líneas
 * (`lab-draw`) se dispara con la clase `is-in` del contenedor Reveal. Todo es ilustrativo, no proyectos reales.
 */

const k = (n: number): CSSProperties => ({ ["--k" as string]: n });
/** Atributos de una línea que se dibuja al entrar en vista (pathLength normalizado). */
const draw = (n: number) => ({ pathLength: 1, className: "ln lab-draw", style: k(n) });

/* ---------------------------------------------------------------- 0 · mapa de los tres frentes (hero) */

export function ServicesMap() {
  return (
    <svg viewBox="0 0 640 300" className="lab-svg" role="img" aria-label="Esquema de los tres servicios conectados: experiencia, espacio y evento.">
      {/* ejes y retícula de construcción */}
      <path {...draw(0)} d="M20 230H620" className="ln ln-faint lab-draw" />
      <path d="M160 40V260M320 40V260M480 40V260" className="ln ln-faint" strokeDasharray="2 5" />
      {/* conectores */}
      <path {...draw(2)} d="M210 130H270M370 130H430" className="ln ln-t lab-draw" />
      <path d="M262 124l8 6-8 6M422 124l8 6-8 6" className="ln ln-t" />

      {/* 01 EXPERIENCIA: onda de interacción */}
      <g>
        <rect x="60" y="80" width="150" height="100" className="ln lab-draw" pathLength={1} style={k(1)} />
        <circle cx="135" cy="130" r="9" className="fl-s" />
        <circle cx="135" cy="130" r="22" className="ln ln-s" />
        <circle cx="135" cy="130" r="38" className="ln ln-faint" />
        <text x="60" y="206" className="t">01 EXPERIENCIA</text>
      </g>
      {/* 02 ESPACIO: módulo isométrico */}
      <g>
        <rect x="270" y="80" width="100" height="100" className="ln lab-draw" pathLength={1} style={k(3)} />
        <path d="M320 98L352 116V148L320 166L288 148V116Z" className="ln ln-t" />
        <path d="M288 116L320 134L352 116M320 134V166" className="ln ln-t" />
        <text x="270" y="206" className="t">02 ESPACIO</text>
      </g>
      {/* 03 EVENTO: planta de producción */}
      <g>
        <rect x="430" y="80" width="150" height="100" className="ln lab-draw" pathLength={1} style={k(5)} />
        <rect x="465" y="92" width="80" height="20" className="fl-m ln" />
        <path d="M455 142H555M455 154H555M455 166H555" className="ln ln-faint" />
        <circle cx="455" cy="102" r="3" className="fl-s" />
        <circle cx="555" cy="102" r="3" className="fl-s" />
        <text x="430" y="206" className="t">03 EVENTO</text>
      </g>
      <text x="20" y="256" className="t t-s">UN SOLO EQUIPO · TRES FRENTES QUE SE COMBINAN</text>
    </svg>
  );
}

/* ---------------------------------------------------------------- 1 · activación de marca (pasos) */

export const EXPERIENCE_STEPS = [
  { id: "1", label: "Espacio", hint: "Espacio: el área donde la marca se encuentra con el público, con su acceso y su salida." },
  { id: "2", label: "Zonas", hint: "Zonas: la activación se organiza en áreas de atracción, interacción y contacto." },
  { id: "3", label: "Puntos de interacción", hint: "Puntos de interacción: 1 pieza de marca · 2 módulo de exhibición · 3 personal de atención · 4 punto de contacto." },
  { id: "4", label: "Recorrido", hint: "Recorrido: el camino del visitante une los puntos, de la entrada a la salida." },
];

export function ExperienceDiagram() {
  const badge = (x: number, y: number, n: number) => (
    <g key={n}>
      <circle cx={x} cy={y} r="11" className="fl-ink" />
      <text x={x} y={y + 4.5} textAnchor="middle" className="t t-inv">{n}</text>
    </g>
  );
  return (
    <svg viewBox="0 0 640 420" className="lab-svg" role="img" aria-label="Plano conceptual de una activación de marca: espacio, tres zonas, cuatro puntos de interacción y el recorrido del visitante.">
      <defs>
        <marker id="xp-arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
          <path d="M1 1L9 5L1 9" className="ln ln-s" />
        </marker>
      </defs>
      <g data-s="1">
        <rect x="30" y="30" width="580" height="330" {...draw(0)} />
        <path d="M30 330h-14M610 330h14" className="ln ln-s" />
        <text x="30" y="386" className="t t-s">← ENTRADA</text>
        <text x="610" y="386" textAnchor="end" className="t t-s">SALIDA →</text>
        <text x="610" y="22" textAnchor="end" className="t t-s">ÁREA DE ACTIVACIÓN · PLANTA</text>
      </g>
      <g data-s="2">
        <rect x="50" y="52" width="150" height="130" className="fl-m ln" />
        <rect x="225" y="52" width="220" height="200" className="fl-p ln" />
        <rect x="470" y="52" width="120" height="130" className="fl-m ln" />
        <text x="58" y="72" className="t">ATRACCIÓN</text>
        <text x="233" y="72" className="t">INTERACCIÓN</text>
        <text x="478" y="72" className="t">CONTACTO</text>
      </g>
      <g data-s="3">
        <rect x="108" y="112" width="34" height="34" className="ln ln-t" />
        <path d="M108 112l34 34M142 112l-34 34" className="ln ln-faint" />
        <rect x="262" y="112" width="100" height="52" className="fl-m ln" />
        <circle cx="408" cy="200" r="9" className="fl-s" />
        <circle cx="408" cy="200" r="20" className="ln ln-s" />
        <circle cx="530" cy="118" r="8" className="fl-s" />
        <circle cx="530" cy="118" r="22" className="ln ln-t" />
        {badge(125, 100, 1)}
        {badge(312, 100, 2)}
        {badge(408, 232, 3)}
        {badge(560, 140, 4)}
      </g>
      <g data-s="4">
        <path
          d="M30 330H125V152M125 152H210L312 190H380L470 150L530 150V330H610"
          className="ln ln-s"
          strokeDasharray="7 5"
          markerEnd="url(#xp-arr)"
        />
      </g>
    </svg>
  );
}

/* ---------------------------------------------------------------- 2 · módulo de exhibición (capas) */

export const STAND_LAYERS = [
  { id: "all", label: "Todas", hint: "Módulo de exhibición conceptual con sus cuatro capas. Elige una para destacarla." },
  { id: "est", label: "Estructura", hint: "Estructura: piso, muros y marcos que definen el volumen y soportan todo lo demás." },
  { id: "bra", label: "Branding", hint: "Branding: gráfica sobre los muros y el cabezal de identificación. El diseño gráfico se ajusta a cada marca." },
  { id: "mob", label: "Mobiliario", hint: "Mobiliario: mostrador, pedestal de producto y asientos para atender y exhibir." },
  { id: "ilu", label: "Iluminación", hint: "Iluminación: spots sobre la gráfica y el producto; las líneas discontinuas indican su haz." },
];

const S = 40;
const iso = (x: number, y: number, z: number): [number, number] => [320 + (x - y) * 0.866 * S, 170 + (x + y) * 0.5 * S - z * S];
const pt = (p: [number, number]) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`;
const poly = (ps: Array<[number, number, number]>) => "M" + ps.map((p) => pt(iso(...p))).join("L") + "Z";
function box(x0: number, y0: number, z0: number, w: number, d: number, h: number) {
  const x1 = x0 + w, y1 = y0 + d, z1 = z0 + h;
  return {
    top: poly([[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]]),
    front: poly([[x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]]),
    side: poly([[x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [x1, y0, z1]]),
  };
}

export function StandDiagram() {
  const H = 2.8, W = 4;
  const counter = box(1.8, 2.5, 0, 1.8, 0.8, 1);
  const plinth = box(0.7, 0.9, 0, 0.8, 0.8, 0.9);
  const stools = [box(2.0, 1.5, 0, 0.4, 0.4, 0.6), box(2.9, 1.5, 0, 0.4, 0.4, 0.6)];
  const spots = [0.8, 2.0, 3.2];
  return (
    <svg viewBox="0 0 640 420" className="lab-svg" role="img" aria-label="Isométrica conceptual de un módulo de exhibición, separada en cuatro capas: estructura, branding, mobiliario e iluminación.">
      <defs>
        <pattern id="st-hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <path d="M0 0V6" className="ln ln-t" strokeWidth="1.2" />
        </pattern>
      </defs>
      <g className="ly" data-ly="est">
        <path d={poly([[0, 0, 0], [W, 0, 0], [W, W, 0], [0, W, 0]])} className="fl-p ln" />
        <path d={poly([[0, 0, 0], [0, W, 0], [0, W, H], [0, 0, H]])} className="fl-w ln" />
        <path d={poly([[0, 0, 0], [W, 0, 0], [W, 0, H], [0, 0, H]])} className="fl-w2 ln" />
        <path
          d={[1, 2, 3].map((x) => `M${pt(iso(x, 0, 0))}L${pt(iso(x, 0, H))}`).join("") + [1, 2, 3].map((y) => `M${pt(iso(0, y, 0))}L${pt(iso(0, y, H))}`).join("")}
          className="ln ln-faint"
        />
        <path d={`M${pt(iso(0, W, 0))}L${pt(iso(0, W, H))}M${pt(iso(W, 0, 0))}L${pt(iso(W, 0, H))}`} className="ln" strokeWidth="2.4" />
      </g>
      <g className="ly" data-ly="bra">
        <path d={poly([[0, 0.5, 0.45], [0, 3.5, 0.45], [0, 3.5, 2.0], [0, 0.5, 2.0]])} className="ln ln-t" fill="url(#st-hatch)" />
        <path d={poly([[0.5, 0, 0.45], [3.5, 0, 0.45], [3.5, 0, 2.0], [0.5, 0, 2.0]])} className="ln ln-t" fill="url(#st-hatch)" />
        <path d={poly([[0.5, 0, 2.2], [3.5, 0, 2.2], [3.5, 0, 2.65], [0.5, 0, 2.65]])} className="fl-ink" />
        <path d={poly([[0.8, 0, 2.3], [1.1, 0, 2.3], [1.1, 0, 2.55], [0.8, 0, 2.55]])} className="fl-s" />
        <path d={poly([[1.3, 0, 2.3], [2.2, 0, 2.3], [2.2, 0, 2.55], [1.3, 0, 2.55]])} className="fl-mint" />
      </g>
      <g className="ly" data-ly="mob">
        {[plinth, ...stools, counter].map((b, i) => (
          <g key={i}>
            <path d={b.front} className="fl-w ln" />
            <path d={b.side} className="fl-w2 ln" />
            <path d={b.top} className="fl-p ln" />
          </g>
        ))}
      </g>
      <g className="ly" data-ly="ilu">
        <path d={`M${pt(iso(0.2, 0.5, 2.6))}L${pt(iso(3.8, 0.5, 2.6))}`} className="ln" strokeWidth="2" />
        {spots.map((x) => (
          <g key={x}>
            <circle cx={iso(x, 0.5, 2.6)[0]} cy={iso(x, 0.5, 2.6)[1]} r="4.5" className="fl-s" />
            <path d={`M${pt(iso(x, 0.5, 2.6))}L${pt(iso(x - 0.5, 1.8, 0))}M${pt(iso(x, 0.5, 2.6))}L${pt(iso(x + 0.5, 1.8, 0))}`} className="ln ln-s" strokeDasharray="4 3" />
          </g>
        ))}
      </g>
      <text x="30" y="400" className="t t-s">EJEMPLO CONCEPTUAL · ISOMÉTRICA</text>
    </svg>
  );
}

/* ---------------------------------------------------------------- 3 · sistema de producción de un evento (pasos) */

export const EVENT_STEPS = [
  { id: "1", label: "Planificación", hint: "Planificación: el brief, el plan y el cronograma definen qué se produce y cuándo." },
  { id: "2", label: "Infraestructura", hint: "Infraestructura: zona principal, sonido e iluminación se instalan según el plan." },
  { id: "3", label: "Coordinación", hint: "Coordinación: proveedores y logística se conectan con el control de producción." },
  { id: "4", label: "Operación", hint: "Operación: el día del evento el control en sitio coordina el flujo de los asistentes." },
];

export function EventDiagram() {
  return (
    <svg viewBox="0 0 640 420" className="lab-svg" role="img" aria-label="Esquema conceptual de producción de un evento: planificación, infraestructura, coordinación con proveedores y logística, y operación con los asistentes.">
      <defs>
        <marker id="ev-arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
          <path d="M1 1L9 5L1 9" className="ln ln-s" />
        </marker>
      </defs>
      <g data-s="1">
        <rect x="30" y="30" width="580" height="270" {...draw(0)} />
        <text x="610" y="22" textAnchor="end" className="t t-s">RECINTO · ESQUEMA DE PRODUCCIÓN</text>
        <path d="M30 340H610" className="ln" />
        {[["BRIEF", 30], ["PLAN", 225], ["CRONOGRAMA", 420]].map(([t, x]) => (
          <g key={t as string}>
            <rect x={x as number} y="326" width="190" height="28" className="fl-m ln" />
            <text x={(x as number) + 95} y="345" textAnchor="middle" className="t">{t}</text>
          </g>
        ))}
        <path d="M222 340h6M417 340h6" className="ln ln-s" />
      </g>
      <g data-s="2">
        <rect x="190" y="68" width="260" height="56" className="fl-w ln" />
        <text x="320" y="102" textAnchor="middle" className="t">ZONA PRINCIPAL</text>
        <rect x="150" y="74" width="26" height="44" className="fl-ink" />
        <rect x="464" y="74" width="26" height="44" className="fl-ink" />
        <text x="163" y="138" textAnchor="middle" className="t t-s">SONIDO</text>
        <text x="477" y="138" textAnchor="middle" className="t t-s">SONIDO</text>
        <path d="M190 60H450" className="ln ln-s" strokeWidth="2.4" />
        <text x="320" y="52" textAnchor="middle" className="t t-s">ILUMINACIÓN</text>
      </g>
      <g data-s="3">
        <rect x="46" y="150" width="100" height="56" className="fl-m ln" />
        <text x="96" y="182" textAnchor="middle" className="t">PROVEEDORES</text>
        <rect x="46" y="226" width="100" height="56" className="fl-m ln" />
        <text x="96" y="258" textAnchor="middle" className="t">LOGÍSTICA</text>
        <path d="M146 178H520M146 254H520V232" className="ln ln-t" strokeDasharray="6 4" />
      </g>
      <g data-s="4">
        <rect x="494" y="150" width="100" height="82" className="fl-ink" />
        <text x="544" y="186" textAnchor="middle" className="t t-inv">CONTROL</text>
        <text x="544" y="204" textAnchor="middle" className="t t-inv">EN SITIO</text>
        <rect x="200" y="150" width="270" height="132" className="ln" fill="url(#ev-dots)" />
        <text x="335" y="220" textAnchor="middle" className="t">ASISTENTES</text>
        <path d="M335 296V288" className="ln ln-s" markerEnd="url(#ev-arr)" />
      </g>
      <pattern id="ev-dots" width="14" height="14" patternUnits="userSpaceOnUse">
        <circle cx="7" cy="7" r="1.3" className="fl-s" />
      </pattern>
    </svg>
  );
}

/* ---------------------------------------------------------------- detalle: puntos de contacto (marketing) */

export function TouchpointMap({ nodes }: { nodes: string[] }) {
  const cx = 320, cy = 210, R = 150;
  const n = nodes.length;
  return (
    <svg viewBox="0 0 640 420" className="lab-svg" role="img" aria-label={`Mapa conceptual de puntos de contacto de una activación: ${nodes.join(", ")}.`}>
      <circle cx={cx} cy={cy} r={R} className="ln ln-faint" strokeDasharray="2 5" />
      <circle cx={cx} cy={cy} r="48" className="fl-ink" />
      <text x={cx} y={cy - 2} textAnchor="middle" className="t t-inv">MARCA</text>
      <text x={cx} y={cy + 14} textAnchor="middle" className="t t-inv t-s2">+ PÚBLICO</text>
      {nodes.map((label, i) => {
        const a = -Math.PI / 2 + (i * 2 * Math.PI) / n;
        const x = cx + Math.cos(a) * R, y = cy + Math.sin(a) * R;
        const sx = cx + Math.cos(a) * 48, sy = cy + Math.sin(a) * 48;
        const right = Math.cos(a) > 0.2, left = Math.cos(a) < -0.2;
        const lx = right ? x + 18 : left ? x - 18 : x;
        const words = label.split(" ");
        const half = Math.ceil(words.length / 2);
        const lines = words.length > 3 ? [words.slice(0, half).join(" "), words.slice(half).join(" ")] : [label];
        const ly = right || left ? y + 4 : y + (Math.sin(a) < 0 ? -20 - 14 * (lines.length - 1) : 28);
        return (
          <g key={label}>
            <path d={`M${sx.toFixed(1)} ${sy.toFixed(1)}L${x.toFixed(1)} ${y.toFixed(1)}`} {...draw(i)} className="ln ln-t lab-draw" />
            <circle cx={x} cy={y} r="11" className="fl-s" />
            <text x={x} y={y + 4} textAnchor="middle" className="t t-inv">{i + 1}</text>
            <text x={lx} y={ly} textAnchor={right ? "start" : left ? "end" : "middle"} className="t t-s">
              {lines.map((l, j) => (
                <tspan key={j} x={lx} dy={j === 0 ? 0 : 14}>{l.toUpperCase()}</tspan>
              ))}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/* ---------------------------------------------------------------- detalle: hoja técnica de stand (planta + alzado) */

export function StandSheet() {
  return (
    <svg viewBox="0 0 640 420" className="lab-svg" role="img" aria-label="Hoja técnica conceptual de un stand: planta y alzado frontal con cotas simbólicas de ancho, profundidad y altura.">
      {/* PLANTA */}
      <text x="40" y="40" className="t">PLANTA</text>
      <rect x="40" y="60" width="220" height="220" {...draw(0)} />
      <rect x="70" y="80" width="160" height="10" className="fl-ink" />
      <rect x="100" y="190" width="100" height="30" className="fl-m ln" />
      <rect x="62" y="116" width="34" height="34" className="ln ln-t" />
      <circle cx="120" cy="244" r="8" className="ln" /><circle cx="180" cy="244" r="8" className="ln" />
      <path d="M40 304H260M40 296v16M260 296v16" {...draw(1)} className="ln ln-s lab-draw" />
      <text x="150" y="326" textAnchor="middle" className="t t-s">L · ANCHO</text>
      <path d="M284 60V280M276 60h16M276 280h16" {...draw(2)} className="ln ln-s lab-draw" />
      <text x="296" y="176" className="t t-s" transform="rotate(90 296 176)" textAnchor="middle">P · PROF.</text>
      {/* ALZADO */}
      <text x="360" y="40" className="t">ALZADO FRONTAL</text>
      <rect x="360" y="60" width="240" height="220" {...draw(3)} />
      <rect x="380" y="76" width="200" height="34" className="fl-ink" />
      <rect x="394" y="86" width="22" height="14" className="fl-s" />
      <rect x="426" y="86" width="60" height="14" className="fl-mint" />
      <rect x="380" y="124" width="200" height="90" className="ln ln-t" />
      <path d="M380 214l200-90M380 124l200 90" className="ln ln-faint" />
      <rect x="420" y="226" width="120" height="54" className="fl-m ln" />
      <path d="M620 60V280M612 60h16M612 280h16" {...draw(4)} className="ln ln-s lab-draw" />
      <text x="612" y="176" className="t t-s" transform="rotate(90 612 176)" textAnchor="middle">H · ALTURA</text>
      <text x="40" y="378" className="t t-s">MEDIDAS SEGÚN PROYECTO</text>
    </svg>
  );
}

/* ---------------------------------------------------------------- detalle: hilo de proceso numerado */

export function LabFlow({ steps }: { steps: Array<{ title: string; text: string }> }) {
  return (
    <ol className="lab-flow" style={{ ["--cols" as string]: steps.length }}>
      {steps.map((s, i) => (
        <li key={s.title}>
          <span aria-hidden="true" className="lab-fb" style={k(i)} />
          <span className="lab-fn label">0{i + 1}</span>
          <h3 className="font-display text-2xl font-semibold">{s.title}</h3>
          <p className="mt-2 text-ink/80">{s.text}</p>
        </li>
      ))}
    </ol>
  );
}
