import { PHASE_MS } from "./stand-model";

/**
 * Máquina de estados del hero. Es TEMPORAL (no depende del scroll):
 *
 *   draw2d → hold2d → erase2d → draw3d → hold3d → materialize → holdReal → reset → draw2d …
 *
 * El estado vive en el atributo `data-phase` del <svg>; el CSS (globals.css, bloque "Hero")
 * traduce cada fase en transiciones de stroke-dashoffset. No hay React por frame ni listeners
 * de scroll: solo un setTimeout activo a la vez.
 *
 *  - start(): reinicia SIEMPRE desde un lienzo vacío (idle → draw2d).
 *  - stop():  cancela el temporizador y deja el lienzo vacío (idle, sin transiciones).
 */

const ORDER = ["draw2d", "hold2d", "erase2d", "draw3d", "hold3d", "materialize", "holdReal", "reset"] as const;
export type Phase = (typeof ORDER)[number] | "idle";

export function createHeroSequence(root: Element) {
  let timer: number | undefined;
  let running = false;
  let i = 0;

  const setPhase = (p: Phase) => root.setAttribute("data-phase", p);

  const step = () => {
    const name = ORDER[i];
    setPhase(name);
    timer = window.setTimeout(() => {
      i = (i + 1) % ORDER.length;
      step();
    }, PHASE_MS[name]);
  };

  return {
    start() {
      if (running) return;
      running = true;
      i = 0;
      setPhase("idle");
      void root.getBoundingClientRect(); // fuerza el estilo "vacío" antes de animar
      step();
    },
    stop() {
      running = false;
      if (timer !== undefined) window.clearTimeout(timer);
      timer = undefined;
      setPhase("idle");
    },
    get running() {
      return running;
    },
  };
}

/** Umbrales con histéresis: arranca con ≥ 50 % visible y solo se detiene por debajo de 15 %. */
export const START_RATIO = 0.5;
export const STOP_RATIO = 0.15;
