"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { createHeroSequence, START_RATIO, STOP_RATIO } from "@/lib/hero-sequence";
import { DRAWING, GRADIENTS, type El, type Grad, type Group, type Tx } from "@/lib/stand-model";

/**
 * Hero arquitectónico: plano 2D → stand isométrico 3D, en bucle mientras el hero es visible.
 * Geometría en src/lib/stand-model.ts (un solo modelo, dos proyecciones).
 * Fases y reinicio por visibilidad en src/lib/hero-sequence.ts. Estilos en globals.css (".hs").
 * Esquema ilustrativo: no representa un proyecto real de BenRed y así se rotula.
 */

/** Retraso de borrado: lo dibujado al final se borra primero (inverso del trazado). */
function eraseDelays(groups: Group[]) {
  let end = 0;
  for (const g of groups) for (const e of g.els) end = Math.max(end, e.d + e.t);
  return (e: { d: number; t: number }) => Math.max(0, end - (e.d + e.t)) * 0.08;
}

function Defs() {
  return (
    <defs>
      {GRADIENTS.map((g: Grad) =>
        g.kind === "radial" ? (
          <radialGradient key={g.id} id={g.id} cx={g.cx ?? 0.5} cy={g.cy ?? 0.5} r="0.7">
            {g.stops.map(([o, c], i) => (
              <stop key={i} offset={o} stopColor={c} />
            ))}
          </radialGradient>
        ) : (
          <linearGradient key={g.id} id={g.id} x1="0" y1="0" x2={g.v ? 0 : 1} y2={g.v ? 1 : 0}>
            {g.stops.map(([o, c], i) => (
              <stop key={i} offset={o} stopColor={c} />
            ))}
          </linearGradient>
        ),
      )}
    </defs>
  );
}

function Lines({ groups }: { groups: Group[] }) {
  const erase = eraseDelays(groups);
  return (
    <>
      {groups.map((g) => (
        <g key={g.id} id={g.id}>
          {g.els.map((e) => (
            <Path key={e.id} e={e} erase={erase(e)} wf={g.wf} />
          ))}
          {g.txs.map((t) => (
            <Text key={t.id} t={t} />
          ))}
        </g>
      ))}
    </>
  );
}

function Path({ e, erase, wf }: { e: El; erase: number; wf?: boolean }) {
  const style = {
    ["--d" as string]: `${e.d}s`,
    ["--dd" as string]: `${e.t}s`,
    ["--e" as string]: `${erase.toFixed(2)}s`,
    ["--w" as string]: e.w ?? 1.6,
  } as CSSProperties;
  if (e.kind === "deco") {
    // Marca sobre una superficie del stand: aparece en MATERIALIZE, encima del material de su cara.
    return (
      <g id={e.id} className="mt br" style={{ ["--m" as string]: `${e.m ?? 0}s`, ["--e" as string]: `${erase.toFixed(2)}s` } as CSSProperties}>
        {e.parts?.map((p, i) =>
          p.t === "text" ? (
            <text
              key={i}
              className="br-t"
              transform={`matrix(${p.mx.map((n) => Math.round(n * 1000) / 1000).join(" ")})`}
              fontSize={p.size}
              fontWeight={p.weight ?? 400}
              fontFamily={p.display ? "var(--font-display)" : "var(--font-mono)"}
              textAnchor={p.anchor ?? "start"}
              letterSpacing={p.ls}
              fill={p.fill}
            >
              {p.text}
            </text>
          ) : (
            <path key={i} d={p.d} fill={p.fill ?? "none"} fillOpacity={p.fo} stroke={p.stroke ?? "none"} strokeWidth={p.w} strokeLinejoin="round" />
          ),
        )}
      </g>
    );
  }
  if (e.kind === "person") {
    // Figura humana: aparece en HOLD_REAL (escalonada) con una entrada corta sobre el plano del suelo.
    return (
      <g id={e.id} className="pp" style={{ ["--m" as string]: `${e.m ?? 0}s` } as CSSProperties}>
        {e.shapes?.map((s, i) => (
          <path key={i} d={s.d} fill={s.fill} fillOpacity={s.fo} stroke={s.stroke ?? "none"} strokeWidth={s.sw} strokeLinejoin="round" />
        ))}
      </g>
    );
  }
  if (e.kind === "mat") {
    // Superficie de material: reutiliza la geometría de una cara y aparece en MATERIALIZE.
    return (
      <path
        id={e.id}
        d={e.path}
        className={`mt${e.minor ? " minor" : ""}`}
        style={{ ["--m" as string]: `${e.m ?? 0}s`, ["--e" as string]: `${erase.toFixed(2)}s` } as CSSProperties}
        fill={e.fill ?? "none"}
        fillOpacity={e.fo}
        stroke={e.stroke ?? "none"}
        strokeWidth={e.w}
        strokeLinecap="round"
      />
    );
  }
  const cls = e.kind === "line" ? "st" : e.kind === "face" ? "st fl" : "fl";
  return (
    <path
      id={e.id}
      d={e.path}
      pathLength={1}
      className={`${cls}${wf ? " wf" : ""}${e.minor ? " minor" : ""}`}
      style={style}
      fill={e.fill ?? "none"}
      fillOpacity={e.fo}
      stroke={e.kind === "tint" ? "none" : (e.stroke ?? "var(--ink)")}
      strokeLinecap="square"
      strokeLinejoin="miter"
    />
  );
}

function Text({ t }: { t: Tx }) {
  const style = { ["--d" as string]: `${t.d}s` } as CSSProperties;
  return (
    <g id={t.id} className={`tx${t.minor ? " minor" : ""}`} style={style}>
      {t.bg && <rect x={t.bg.x} y={t.bg.y} width={t.bg.w} height={t.bg.h} fill="var(--paper)" />}
      <text
        x={t.x}
        y={t.y}
        className={t.label ? "lbl" : undefined}
        fontFamily="var(--font-mono)"
        fontSize={t.size ?? 15}
        fontWeight={t.weight ?? 400}
        textAnchor={t.anchor ?? "start"}
        fill={t.fill ?? "var(--ink)"}
        transform={t.rotate ? `rotate(${t.rotate} ${t.x} ${t.y - 6})` : undefined}
      >
        {t.text}
      </text>
    </g>
  );
}

export function BlueprintHero() {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = ref.current;
    if (!svg) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const seq = createHeroSequence(svg);
    let ratio = 0;
    let io: IntersectionObserver | null = null;

    const evaluate = () => {
      if (!seq.running && ratio >= START_RATIO && !document.hidden) seq.start();
      else if (seq.running && (ratio <= STOP_RATIO || document.hidden)) seq.stop();
    };

    const enable = () => {
      io = new IntersectionObserver(
        ([entry]) => {
          ratio = entry.isIntersecting ? entry.intersectionRatio : 0;
          evaluate();
        },
        { threshold: [0, STOP_RATIO, 0.3, START_RATIO, 1] },
      );
      io.observe(svg);
      document.addEventListener("visibilitychange", evaluate);
    };
    const disable = () => {
      io?.disconnect();
      io = null;
      document.removeEventListener("visibilitychange", evaluate);
      seq.stop();
    };

    // Movimiento reducido: sin ciclo, sin temporizadores; el CSS muestra el stand 3D completo.
    if (!reduce.matches) enable();
    const onPref = () => (reduce.matches ? disable() : enable());
    reduce.addEventListener("change", onPref);

    return () => {
      reduce.removeEventListener("change", onPref);
      disable();
    };
  }, []);

  return (
    <figure className="m-0">
      <svg
        ref={ref}
        viewBox="0 0 640 520"
        role="img"
        aria-label="Esquema de un stand de 6 por 4 metros con pantallas, recepción, isla de producto y tótem. Se dibuja primero en planta y luego en vista isométrica."
        className="hs h-auto w-full"
        data-phase="idle"
      >
        <Defs />
        <g id="vista-planta" className="v2">
          <Lines groups={DRAWING.plan} />
        </g>
        <g id="vista-isometrica" className="v3">
          <Lines groups={DRAWING.iso} />
        </g>
      </svg>
      <figcaption className="sr-only">
        Esquema ilustrativo de un stand; no corresponde a un proyecto específico.
      </figcaption>
    </figure>
  );
}
