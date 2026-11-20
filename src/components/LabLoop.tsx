"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Ciclo del hero de Servicios: trazado (~1,8 s) → composición final estable (5 s) → fundido suave → reinicio.
 * Solo corre mientras el hero está visible y la pestaña activa; al salir se limpia todo y queda listo para
 * reproducirse desde el comienzo al volver. Sin movimiento reducido: composición final estática, sin ciclos.
 * La fase vive en `data-phase` (CSS hace el resto): no hay estado React ni re-renders.
 */
const DRAW_MS = 1800;
const HOLD_MS = 5000;
const FADE_MS = 600;

export function LabLoop({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const set = (p: string) => el.setAttribute("data-phase", p);

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || typeof IntersectionObserver === "undefined") {
      set("hold"); // composición final estática
      return;
    }

    let timer = 0;
    let raf = 0;
    let running = false;
    let inView = false;

    const clear = () => {
      window.clearTimeout(timer);
      cancelAnimationFrame(raf);
    };
    const draw = () => {
      set("idle");
      // dos frames para que el estado inicial se aplique antes de la transición de trazado
      raf = requestAnimationFrame(() => {
        raf = requestAnimationFrame(() => {
          set("draw");
          timer = window.setTimeout(() => {
            set("hold");
            timer = window.setTimeout(() => {
              set("reset");
              timer = window.setTimeout(draw, FADE_MS);
            }, HOLD_MS);
          }, DRAW_MS);
        });
      });
    };
    const start = () => {
      if (running) return;
      running = true;
      clear();
      draw();
    };
    const stop = () => {
      running = false;
      clear();
      set("idle"); // fuera de vista: listo para reproducirse desde el principio
    };
    const sync = () => (inView && !document.hidden ? start() : stop());

    const io = new IntersectionObserver(
      (list) => {
        const e = list[list.length - 1];
        // histéresis: arranca con ≥ 50 % visible, se detiene con ≤ 15 %
        if (e.intersectionRatio >= 0.5) inView = true;
        else if (e.intersectionRatio <= 0.15) inView = false;
        else return;
        sync();
      },
      { threshold: [0, 0.15, 0.5] },
    );
    io.observe(el);
    document.addEventListener("visibilitychange", sync);

    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", sync);
      running = false;
      clear();
    };
  }, []);

  return (
    <div ref={ref} data-phase="idle" className={`lab lab-loop ${className}`}>
      {children}
    </div>
  );
}
