"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { clamp01, type ProgressMap } from "@/lib/motion";
import { register } from "@/lib/scroll-motion";
import { mountEventHall } from "@/lib/event-hall";

/**
 * «Del espacio vacío al evento en vivo». Escenario sticky controlado por el scroll (reversible, 0–1) que construye
 * un mismo salón en cuatro fases. El progreso lo calcula el gestor de scroll compartido y se aplica con referencias
 * directas (sin React por fotograma). Con movimiento reducido no hay transformación animada: se muestra el evento
 * montado y se puede revisar cada fase con botones accesibles.
 */

const EXTRA_VH = { desktop: 3.2, mobile: 2.2 } as const; // = --eh-extra en globals.css
const eventHallProgress: ProgressMap = (r, vh) => {
  const mobile = window.innerWidth < 768;
  const extra = (mobile ? EXTRA_VH.mobile : EXTRA_VH.desktop) * vh;
  const stickyTop = mobile ? 80 : 88; // = .eh-stage top
  const stageH = r.height - extra;
  const start = Math.max(vh - stageH, stickyTop);
  const end = stickyTop - extra * 0.92; // la escena final queda fija el último 8 %
  return clamp01((start - r.top) / (start - end));
};

const STEPS = ["Planificación", "Infraestructura", "Ambientación", "Evento en vivo"] as const;
const REST_P = [0.12, 0.46, 0.73, 0.98] as const; // reposo de cada fase (movimiento reducido)

const rm = "(prefers-reduced-motion: reduce)";
const subRm = (cb: () => void) => {
  const m = window.matchMedia(rm);
  m.addEventListener("change", cb);
  return () => m.removeEventListener("change", cb);
};
const useReduced = () => useSyncExternalStore(subRm, () => window.matchMedia(rm).matches, () => false);

export function EventHall() {
  const root = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const engine = useRef<ReturnType<typeof mountEventHall> | null>(null);
  const reduced = useReduced();
  const [phase, setPhase] = useState(3); // 0–3 (solo movimiento reducido; por defecto, el evento en vivo)

  useEffect(() => {
    const host = root.current;
    const svg = svgRef.current;
    if (!host || !svg) return;
    const eng = mountEventHall(svg);
    engine.current = eng;
    const mq = window.matchMedia("(max-width: 767px)");
    const fit = () => svg.setAttribute("viewBox", mq.matches ? "80 0 840 780" : "0 0 1000 780");
    fit();
    mq.addEventListener("change", fit);
    const bar = host.querySelector<HTMLElement>(".eh-bar-fill");
    let off = () => {};
    let io: IntersectionObserver | undefined;
    if (reduced) {
      host.dataset.step = String(eng.render(REST_P[phase]));
    } else {
      off = register(host, {
        map: eventHallProgress,
        rest: 1,
        onProgress: (P) => {
          host.dataset.step = String(eng.render(P));
          if (bar) bar.style.transform = `scaleX(${P.toFixed(3)})`;
        },
      });
      // movimiento ambiental (luz, pantallas, balanceo) solo con el escenario a la vista
      io = new IntersectionObserver(([e]) => svg.classList.toggle("live", e.isIntersecting), { threshold: 0 });
      io.observe(svg);
    }
    return () => {
      off();
      io?.disconnect();
      mq.removeEventListener("change", fit);
      eng.destroy();
      engine.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced]);

  useEffect(() => {
    if (!reduced || !engine.current || !root.current) return;
    root.current.dataset.step = String(engine.current.render(REST_P[phase]));
  }, [reduced, phase]);

  return (
    <section className="border-b border-[var(--line)] bg-paper-2/40" aria-labelledby="eh-h">
      <div className="mx-auto max-w-[1400px] px-5 pt-14 sm:px-8 lg:pt-20">
        <p className="label text-signal">Del espacio vacío al evento en vivo</p>
        <h2 id="eh-h" className="font-display mt-3 max-w-3xl text-3xl font-bold sm:text-5xl">
          Un mismo salón, de la planificación al evento en marcha.
        </h2>
      </div>

      <div ref={root} data-step="1" className="eh-track mx-auto max-w-[1400px] px-5 sm:px-8">
        <div className="eh-stage">
          <div className="eh-frame">
            <svg
              ref={svgRef}
              viewBox="0 0 1000 780"
              className="eh"
              role="img"
              aria-label="Animación conceptual de un salón de convenciones que pasa de estar vacío a un evento en vivo: planificación, infraestructura con tarima, truss y pantallas LED, ambientación con mesas y sillas, y evento con público. La marca es ficticia."
            />
          </div>
          <div className="eh-cap">
            <span className="eh-bar" aria-hidden="true"><span className="eh-bar-fill" /></span>
            <ol className="eh-steps">
              {STEPS.map((s, i) => (
                <li key={s} data-i={i + 1}>
                  <span className="label">{String(i + 1).padStart(2, "0")} /</span> {s.toUpperCase()}
                </li>
              ))}
            </ol>
            <p className="label text-muted">Marca ficticia · visualización conceptual, no es un evento real</p>
          </div>
          {reduced && (
            <div role="group" aria-label="Fase del montaje" className="mt-4 flex flex-wrap gap-2">
              {STEPS.map((t, i) => (
                <button
                  key={t}
                  type="button"
                  aria-pressed={phase === i}
                  onClick={() => setPhase(i)}
                  className={`label min-h-11 border border-ink px-5 transition-colors ${phase === i ? "bg-ink text-paper" : "hover:bg-ink/10"}`}
                >
                  {t}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="eh-spacer" aria-hidden="true" />
      </div>
    </section>
  );
}
