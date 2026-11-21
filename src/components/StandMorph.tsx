"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { clamp01, type ProgressMap } from "@/lib/motion";
import { register } from "@/lib/scroll-motion";
import { mountStandMorph } from "@/lib/stand-morph";

/**
 * «Un espacio, tres posibilidades». Escenario sticky controlado por el scroll: el progreso 0–1 (reversible) lo
 * calcula el gestor de scroll compartido y se aplica con referencias directas (sin React por fotograma).
 * Con movimiento reducido no hay transformación animada: se muestra una configuración terminada y se puede
 * cambiar de configuración con botones accesibles.
 */

const EXTRA_VH = { desktop: 2.8, mobile: 2.0 } as const; // = --sm-extra en globals.css
const standMorphProgress: ProgressMap = (r, vh) => {
  const mobile = window.innerWidth < 768;
  const extra = (mobile ? EXTRA_VH.mobile : EXTRA_VH.desktop) * vh;
  const stickyTop = mobile ? 80 : 88; // = .sm-stage top
  const stageH = r.height - extra;
  const start = Math.max(vh - stageH, stickyTop); // escenario entero a la vista
  const end = stickyTop - extra * 0.92; // la presentación final queda fija el último 8 %
  return clamp01((start - r.top) / (start - end));
};

const STEPS = ["Del plano al espacio", "Stand abierto", "Stand de esquina", "Gran formato"] as const;
const REST_P = [0.43, 0.43, 0.64, 0.97] as const; // reposo de cada configuración (movimiento reducido)

const rm = "(prefers-reduced-motion: reduce)";
const subRm = (cb: () => void) => {
  const m = window.matchMedia(rm);
  m.addEventListener("change", cb);
  return () => m.removeEventListener("change", cb);
};
const useReduced = () => useSyncExternalStore(subRm, () => window.matchMedia(rm).matches, () => false);

export function StandMorph() {
  const root = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const engine = useRef<ReturnType<typeof mountStandMorph> | null>(null);
  const reduced = useReduced();
  const [cfg, setCfg] = useState(1); // 1 abierto · 2 esquina · 3 gran formato (solo movimiento reducido)

  useEffect(() => {
    const host = root.current;
    const svg = svgRef.current;
    if (!host || !svg) return;
    const eng = mountStandMorph(svg);
    engine.current = eng;
    const mq = window.matchMedia("(max-width: 767px)");
    const fit = () => svg.setAttribute("viewBox", mq.matches ? "100 10 800 760" : "0 0 1000 770");
    fit();
    mq.addEventListener("change", fit);
    const bar = host.querySelector<HTMLElement>(".sm-bar-fill");
    let off = () => {};
    let io: IntersectionObserver | undefined;
    if (reduced) {
      host.dataset.step = String(eng.render(REST_P[cfg]));
    } else {
      off = register(host, {
        map: standMorphProgress,
        rest: 1,
        onProgress: (P) => {
          host.dataset.step = String(eng.render(P));
          if (bar) bar.style.transform = `scaleX(${P.toFixed(3)})`;
        },
      });
      // movimiento ambiental (balanceo de personas, brillo de pantallas) solo con el escenario a la vista
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

  // Movimiento reducido: cambio de configuración sin transiciones animadas
  useEffect(() => {
    if (!reduced || !engine.current || !root.current) return;
    root.current.dataset.step = String(engine.current.render(REST_P[cfg]));
  }, [reduced, cfg]);

  return (
    <section className="border-b border-[var(--line)] bg-paper-2/40" aria-labelledby="sm-h">
      <div className="mx-auto max-w-[1400px] px-5 pt-14 sm:px-8 lg:pt-20">
        <p className="label text-signal">Un espacio, tres posibilidades</p>
        <h2 id="sm-h" className="font-display mt-3 max-w-3xl text-3xl font-bold sm:text-5xl">
          Del plano al stand, en tres configuraciones.
        </h2>
        <p className="mt-4 max-w-2xl text-ink/85">
          Un mismo espacio se diseña, se produce y se monta como stand abierto, de esquina o de gran formato.
        </p>
      </div>

      <div ref={root} data-step="1" className="sm-track mx-auto max-w-[1400px] px-5 sm:px-8">
        <div className="sm-stage">
          <div className="sm-frame">
            <svg
              ref={svgRef}
              viewBox="0 0 1000 770"
              className="sm"
              role="img"
              aria-label="Animación conceptual de un stand isométrico: nace como plano técnico, se eleva y evoluciona entre tres configuraciones: abierto, de esquina y de gran formato. La marca es ficticia."
            />
          </div>
          <div className="sm-cap">
            <span className="sm-bar" aria-hidden="true"><span className="sm-bar-fill" /></span>
            <ol className="sm-steps">
              {STEPS.map((s, i) => (
                <li key={s} data-i={i + 1}>
                  <span className="label">{String(i + 1).padStart(2, "0")} /</span> {s}
                </li>
              ))}
            </ol>
            <p className="label text-muted">Marca ficticia · visualización conceptual, no es un proyecto real</p>
          </div>
          {reduced && (
            <div role="group" aria-label="Configuración del stand" className="mt-4 flex flex-wrap gap-2">
              {(["Stand abierto", "Stand de esquina", "Gran formato"] as const).map((t, i) => (
                <button
                  key={t}
                  type="button"
                  aria-pressed={cfg === i + 1}
                  onClick={() => setCfg(i + 1)}
                  className={`label min-h-11 border border-ink px-5 transition-colors ${cfg === i + 1 ? "bg-ink text-paper" : "hover:bg-ink/10"}`}
                >
                  {t}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="sm-spacer" aria-hidden="true" />
      </div>
    </section>
  );
}
