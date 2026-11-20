"use client";

import { useEffect, type CSSProperties } from "react";
import { GRADS, LIGHT_GRADS, SCENE, VIEW, type CE, type CG, type CT } from "@/lib/concert-model";

/**
 * Escena SVG del concierto conceptual (modelo + trazos). Se carga de forma DIFERIDA desde ConcertStage cuando
 * la sección se acerca al viewport: así el HTML inicial de la home no la incluye.
 * Estado estático (movimiento reducido): lo define el CSS = concierto terminado, de noche.
 * Visualización conceptual: no corresponde a un evento real ni al Tunja Tattoo Festival.
 */

const num = (n: number) => n.toFixed(2);
const winAttrs = (e: { a: number; b: number; ea?: number; eb?: number; dx?: number; dy?: number }) => ({
  "data-a": num(e.a),
  "data-b": num(e.b),
  ...(e.ea !== undefined && e.eb !== undefined ? { "data-ea": num(e.ea), "data-eb": num(e.eb) } : {}),
  ...(e.dx !== undefined ? { "data-dx": e.dx } : {}),
  ...(e.dy !== undefined ? { "data-dy": e.dy } : {}),
});

function Defs() {
  return (
    <defs>
      {GRADS.map((g) => (
        <linearGradient key={g.id} id={g.id} x1="0" y1="0" x2={g.v ? 0 : 1} y2={g.v ? 1 : 0}>
          {g.stops.map(([o, day, night], i) => (
            <stop key={i} offset={o} stopColor={night} data-day={day} data-night={night} />
          ))}
        </linearGradient>
      ))}
      {LIGHT_GRADS.map((g) => (
        <linearGradient key={g.id} id={g.id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={g.color} stopOpacity="0.95" />
          <stop offset="1" stopColor={g.color} stopOpacity="0" />
        </linearGradient>
      ))}
      <linearGradient id="c-led-on" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#0b2530" />
        <stop offset="0.6" stopColor="#0a1a22" />
        <stop offset="1" stopColor="#120e1c" />
      </linearGradient>
      <radialGradient id="c-haze" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stopColor="#64bdaf" stopOpacity="0.55" />
        <stop offset="1" stopColor="#64bdaf" stopOpacity="0" />
      </radialGradient>
    </defs>
  );
}

function Parts({ e }: { e: CE }) {
  return (
    <>
      {e.parts?.map((p, i) =>
        p.t === "text" ? (
          <text key={i} className="br-t" x={p.x} y={p.y} fontSize={p.size} fontWeight={p.weight ?? 400} fontFamily={p.display ? "var(--font-display)" : "var(--font-mono)"} textAnchor={p.anchor ?? "start"} letterSpacing={p.ls} fill={p.fill}>
            {p.text}
          </text>
        ) : (
          <path key={i} d={p.d} fill={p.fill ?? "none"} fillOpacity={p.fo} stroke={p.stroke ?? "none"} strokeWidth={p.w} strokeLinejoin="round" />
        ),
      )}
    </>
  );
}

function El({ e }: { e: CE }) {
  const win = winAttrs(e);
  if (e.kind === "deco")
    return (
      <g id={`cs-${e.id}`} className="mt" {...win}>
        <Parts e={e} />
      </g>
    );
  if (e.kind === "person")
    return (
      <g id={`cs-${e.id}`} className="pp" {...win} fill={e.shapes ? undefined : e.fill} fillOpacity={e.shapes ? undefined : e.fo}>
        {e.shapes ? e.shapes.map((s, i) => <path key={i} d={s.d} fill={s.fill} fillOpacity={s.fo} stroke={s.stroke ?? "none"} strokeWidth={s.sw} strokeLinejoin="round" />) : <path d={e.path} stroke={e.stroke ?? "none"} strokeOpacity={0.28} strokeWidth={e.w} />}
      </g>
    );
  if (e.kind === "line") {
    // fill/stroke/join por defecto viven en el CSS (.cs .st); solo se emiten las excepciones (en style, que gana al CSS)
    const w = e.w ?? 1.3;
    const st: Record<string, string> = {};
    if (w !== 1.3) st.strokeWidth = `${w}px`;
    if (e.stroke && e.stroke !== "currentColor") st.stroke = e.stroke;
    return <path d={e.path} pathLength={1} className={`st${e.minor ? " minor" : ""}`} style={Object.keys(st).length ? (st as CSSProperties) : undefined} {...win} />;
  }
  // mat | beam (sin id: el DOM se mantiene ligero)
  return <path d={e.path} className={`mt${e.kind === "beam" ? " bm" : ""}${e.minor ? " minor" : ""}`} fill={e.fill} fillOpacity={e.fo === 1 ? undefined : e.fo} {...win} />;
}

function Tx({ t }: { t: CT }) {
  return (
    <text id={`cs-${t.id}`} className={`tx${t.minor ? " minor" : ""}`} x={t.x} y={t.y} fontFamily="var(--font-mono)" fontSize={t.size ?? 11} textAnchor={t.anchor ?? "middle"} fill="#bfe6e8" {...winAttrs(t)} transform={t.rotate ? `rotate(${t.rotate} ${t.x} ${t.y})` : undefined}>
      {t.text}
    </text>
  );
}

function Group({ g, className }: { g: CG; className?: string }) {
  return (
    <g id={`cs-${g.id}`} className={className}>
      {g.els.map((e) => (
        <El key={e.id} e={e} />
      ))}
      {g.txs?.map((t) => (
        <Tx key={t.id} t={t} />
      ))}
    </g>
  );
}

export const SCENE_LABEL =
  "Visualización conceptual de un escenario de concierto: tarima con estructura truss, torres, pantalla LED central y laterales, altavoces, luminarias, artistas y público. Al desplazarte pasa de plano técnico a montaje, a producción y a concierto nocturno.";

export default function ConcertScene({ onReady }: { onReady: () => void }) {
  const [struct, lights, crowd] = SCENE.groups;
  useEffect(() => onReady(), [onReady]);
  return (
    <svg viewBox={`0 0 ${VIEW.w} ${VIEW.h}`} role="img" aria-label={SCENE_LABEL} className="cs">
      <Defs />
      <rect className="cs-bg" width={VIEW.w} height={VIEW.h} fill="#0d1517" />
      <Group g={struct} className="struct" />
      <Group g={lights} className="lights" />
      <Group g={crowd} className="crowd" />
      <Group g={SCENE.ann} className="ann" />
    </svg>
  );
}
