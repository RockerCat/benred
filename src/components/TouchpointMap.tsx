"use client";

import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";

/**
 * Ecosistema «Marca + Público» (servicios · marketing experiencial). Misma geometría, textos y paleta que el
 * diagrama original, con tres capas de movimiento:
 *
 *  1. Construcción (~5 s) al llegar al 40 % visible: núcleo → conexiones → nodos + etiquetas → circunferencia.
 *  2. Ciclo ambiental de 15 s (A 7 s impulsos por las conexiones · B 5 s respuesta de nodos y núcleo ·
 *     C 3 s descanso), repetido mientras el gráfico esté visible, sin reconstruir el gráfico.
 *  3. Interacción (hover / toque / teclado): pausa el ciclo y resalta el nodo y su conexión.
 *
 * data-phase: "static" (servidor, sin JS o movimiento reducido: todo visible) → "idle" (oculto fuera de vista)
 * → "play" (construcción) → "done" (estable). data-amb ("a" | "b" | "c") solo existe en "done" con el gráfico
 * visible, la pestaña activa y sin nodo seleccionado. Sin dependencias: SVG + CSS (transform/opacity) +
 * IntersectionObserver; los temporizadores solo corren mientras el ciclo está activo.
 *
 * En pantallas estrechas (< 640 px) las etiquetas pasan a una leyenda numerada bajo el diagrama, porque a ese
 * ancho el texto del SVG sería ilegible; el diagrama se recorta a su zona útil.
 */
type Phase = "static" | "idle" | "play" | "done";
type Amb = "a" | "b" | "c";

const cx = 320, cy = 210, R = 150;
const BUILD_MS = 5200;
const CYCLE: Array<[Amb, number]> = [["a", 7000], ["b", 5000], ["c", 3000]];

const mq = "(max-width: 639px)";
const subscribeMq = (cb: () => void) => {
  const m = window.matchMedia(mq);
  m.addEventListener("change", cb);
  return () => m.removeEventListener("change", cb);
};
const useCompact = () =>
  useSyncExternalStore(subscribeMq, () => window.matchMedia(mq).matches, () => false);

export function TouchpointMap({ nodes }: { nodes: string[] }) {
  const n = nodes.length;
  const ref = useRef<SVGSVGElement>(null);
  const maskId = useId();
  const compact = useCompact();
  const [phase, setPhase] = useState<Phase>("static");
  const [visible, setVisible] = useState(false);
  const [tabVisible, setTabVisible] = useState(true);
  const [step, setStep] = useState<Amb>("a");
  const [hover, setHover] = useState<number | null>(null); // puntero (ratón)
  const [focus, setFocus] = useState<number | null>(null); // foco de teclado
  const [selected, setSelected] = useState<number | null>(null); // selección por toque / Enter
  const active = hover ?? focus ?? selected;
  const running = phase === "done" && visible && tabVisible && active === null;

  // Construcción: al 40 % visible; reinicio al salir por completo de la vista.
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return; // permanece "static": gráfico completo
    let current: Phase = "static";
    let timer: ReturnType<typeof setTimeout> | undefined;
    let raf1 = 0;
    let raf2 = 0;
    const set = (p: Phase) => {
      current = p;
      setPhase(p);
    };
    const io = new IntersectionObserver(
      ([entry]) => {
        setVisible(entry.isIntersecting);
        if (!entry.isIntersecting) {
          clearTimeout(timer);
          cancelAnimationFrame(raf1);
          cancelAnimationFrame(raf2);
          if (current !== "idle") set("idle");
          return;
        }
        if (entry.intersectionRatio >= 0.4 && (current === "idle" || current === "static")) {
          if (current === "static") set("idle");
          // dos fotogramas: asegura que el estado oculto se pinte antes de iniciar la transición
          raf1 = requestAnimationFrame(() => {
            raf2 = requestAnimationFrame(() => {
              set("play");
              timer = setTimeout(() => set("done"), BUILD_MS);
            });
          });
        } else if (current === "static") {
          set("idle");
        }
      },
      { threshold: [0, 0.4] },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      clearTimeout(timer);
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, []);

  // Pestaña oculta: se detiene el ciclo ambiental.
  useEffect(() => {
    const onVis = () => setTabVisible(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  // Ciclo ambiental A → B → C → A…: un único temporizador a la vez, solo mientras `running`.
  useEffect(() => {
    if (!running) return;
    let timer: ReturnType<typeof setTimeout>;
    const next = (k: number) => {
      const [name, ms] = CYCLE[k];
      setStep(name);
      timer = setTimeout(() => next((k + 1) % CYCLE.length), ms);
    };
    timer = setTimeout(() => next(1), CYCLE[0][1]); // el estado inicial ya es "a"
    return () => {
      clearTimeout(timer);
      setStep("a"); // al reanudar, el ciclo vuelve a empezar por los impulsos
    };
  }, [running]);

  const toggle = (i: number) => setSelected((s) => (s === i ? null : i));
  const viewBox = compact ? "130 30 380 330" : "0 0 700 420";

  return (
    <>
      <svg
        ref={ref}
        viewBox={viewBox}
        className="lab-svg tp"
        role="group"
        aria-label={`Mapa conceptual de puntos de contacto de una activación: ${nodes.join(", ")}.`}
        data-phase={phase}
        data-amb={running ? step : undefined}
        data-active={active !== null ? "" : undefined}
        onClick={() => setSelected(null)}
        onKeyDown={(e) => {
          if (e.key === "Escape") setSelected(null);
        }}
      >
        <defs>
          <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width="700" height="420">
            <circle cx={cx} cy={cy} r={R} pathLength={1} className="tp-ringmask" transform={`rotate(-90 ${cx} ${cy})`} />
          </mask>
        </defs>
        <circle cx={cx} cy={cy} r={R} className="ln ln-faint tp-ring" strokeDasharray="2 5" mask={`url(#${maskId})`} />
        <g className="tp-core">
          <circle cx={cx} cy={cy} r="48" className="fl-ink" />
          <text x={cx} y={cy - 2} textAnchor="middle" className="t t-inv">MARCA</text>
          <text x={cx} y={cy + 14} textAnchor="middle" className="t t-inv t-s2">+ PÚBLICO</text>
        </g>
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
          const d = `M${sx.toFixed(1)} ${sy.toFixed(1)}L${x.toFixed(1)} ${y.toFixed(1)}`;
          return (
            <g
              key={label}
              className="tp-n"
              style={{ ["--i" as string]: i }}
              data-a={active === i ? "true" : undefined}
              role="button"
              tabIndex={0}
              aria-pressed={selected === i}
              aria-label={`Punto ${i + 1}: ${label}`}
              onPointerEnter={(e) => e.pointerType === "mouse" && setHover(i)}
              onPointerLeave={(e) => e.pointerType === "mouse" && setHover(null)}
              onFocus={(e) => setFocus(e.currentTarget.matches(":focus-visible") ? i : null)}
              onBlur={() => setFocus(null)}
              onClick={(e) => {
                e.stopPropagation();
                toggle(i);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  toggle(i);
                }
              }}
            >
              <path d={d} pathLength={1} className="ln ln-t tp-line" />
              <path d={d} pathLength={1} className="tp-pulse" />
              <circle cx={x} cy={y} r="24" className="tp-hit" />
              <circle cx={x} cy={y} r="17" className="tp-focus" />
              <circle cx={x} cy={y} r="11" className="tp-ripple" />
              <g className="tp-dot">
                <circle cx={x} cy={y} r="11" className="fl-s" />
                <text x={x} y={y + 4} textAnchor="middle" className="t t-inv">{i + 1}</text>
              </g>
              {!compact && (
                <text x={lx} y={ly} textAnchor={right ? "start" : left ? "end" : "middle"} className="t t-s tp-lbl">
                  {lines.map((l, j) => (
                    <tspan key={j} x={lx} dy={j === 0 ? 0 : 14}>{l.toUpperCase()}</tspan>
                  ))}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {compact && (
        <ol className="tp-leg mt-5 grid gap-2" data-phase={phase} aria-hidden="true">
          {nodes.map((label, i) => (
            <li
              key={label}
              style={{ ["--i" as string]: i }}
              data-a={active === i ? "true" : undefined}
              onClick={() => toggle(i)}
              className="label flex min-h-11 cursor-pointer items-center gap-3 text-muted"
            >
              <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-signal text-paper">{i + 1}</span>
              <span>{label.toUpperCase()}</span>
            </li>
          ))}
        </ol>
      )}
    </>
  );
}
