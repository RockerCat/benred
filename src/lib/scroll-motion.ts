import {
  REVEAL_ROOT_MARGIN,
  REVEAL_THRESHOLD,
  TRACK_ROOT_MARGIN,
  clamp01,
  type ProgressMap,
} from "./motion";

/**
 * Gestor único de scroll.
 *  - Un solo listener pasivo + requestAnimationFrame para TODOS los elementos.
 *  - IntersectionObserver: solo se mide lo que está cerca del viewport.
 *  - Lecturas (getBoundingClientRect) primero y escrituras después, sin intercalar.
 *  - Escribe `--p` directamente en el DOM: cero re-renders de React por scroll.
 */

type Entry = {
  el: HTMLElement;
  map?: ProgressMap;
  /** si existe, recibe el progreso en lugar de escribir `--p` (evita invalidar el estilo de todo el subárbol) */
  cb?: (p: number) => void;
  rest: number;
  last: number;
  near: boolean;
};

const tracked = new Map<Element, Entry>();
let trackIO: IntersectionObserver | null = null;
let revealIO: IntersectionObserver | null = null;
let raf = 0;
let bound = false;

const reduced = () =>
  typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;

function flush() {
  raf = 0;
  const vh = window.innerHeight;
  const sy = window.scrollY;
  const work: Array<[Entry, number]> = [];
  tracked.forEach((e) => {
    if (e.near && e.map) work.push([e, clamp01(e.map(e.el.getBoundingClientRect(), vh, sy))]);
  });
  for (const [e, p] of work) {
    if (Math.abs(p - e.last) > 0.001) {
      e.last = p;
      if (e.cb) e.cb(p);
      else e.el.style.setProperty("--p", p.toFixed(3));
    }
  }
}

function schedule() {
  if (!raf) raf = requestAnimationFrame(flush);
}

function bind() {
  if (bound) return;
  bound = true;
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule, { passive: true });
}

function getTrackIO() {
  if (!trackIO) {
    trackIO = new IntersectionObserver(
      (list) => {
        for (const it of list) {
          const e = tracked.get(it.target);
          if (e) e.near = it.isIntersecting;
        }
        schedule();
      },
      { rootMargin: TRACK_ROOT_MARGIN },
    );
  }
  return trackIO;
}

/**
 * Entrada reutilizable: dos observadores con histéresis sobre la clase `is-in`.
 *  - armado/entrada: el elemento entra (≥ umbral, o ≥ 40 % del viewport si es muy alto) → `is-in`.
 *  - rearme/salida: solo cuando está a más de REARM_MARGIN fuera del viewport se quita `is-in`, siempre fuera
 *    de la vista (nunca se oculta mientras se lee) y sin oscilar cerca del borde.
 * Cada callback comprueba la geometría actual, así un scroll muy rápido no deja estados obsoletos.
 */
const REARM_MARGIN = 0.3; // fracción del alto del viewport
let rearmIO: IntersectionObserver | null = null;
const REVEAL_STEPS = [0, 0.01, 0.02, 0.04, REVEAL_THRESHOLD, 0.15, 0.3, 0.5, 0.8, 1];

function getRevealIO() {
  if (!revealIO) {
    revealIO = new IntersectionObserver(
      (list) => {
        const vh = window.innerHeight;
        const last = new Map<Element, IntersectionObserverEntry>();
        for (const it of list) last.set(it.target, it);
        for (const it of last.values()) {
          if (!it.isIntersecting) continue;
          const r = it.target.getBoundingClientRect();
          const visible = Math.min(r.bottom, vh) - Math.max(r.top, 0);
          const needed = Math.min(r.height * REVEAL_THRESHOLD, vh * 0.4);
          if (visible > 0 && visible >= needed) it.target.classList.add("is-in");
        }
      },
      { rootMargin: REVEAL_ROOT_MARGIN, threshold: REVEAL_STEPS },
    );
  }
  return revealIO;
}

function getRearmIO() {
  if (!rearmIO) {
    rearmIO = new IntersectionObserver(
      (list) => {
        const vh = window.innerHeight;
        const last = new Map<Element, IntersectionObserverEntry>();
        for (const it of list) last.set(it.target, it);
        for (const it of last.values()) {
          if (it.isIntersecting) continue;
          const r = it.target.getBoundingClientRect();
          const m = vh * REARM_MARGIN;
          if (r.bottom < -m || r.top > vh + m) it.target.classList.remove("is-in");
        }
      },
      { rootMargin: `${REARM_MARGIN * 100}% 0px ${REARM_MARGIN * 100}% 0px` },
    );
  }
  return rearmIO;
}

export function register(
  el: HTMLElement,
  opts: { map?: ProgressMap; rest?: number; reveal?: boolean; onProgress?: (p: number) => void },
) {
  const rest = opts.rest ?? 0;

  // Sin movimiento o sin soporte: contenido visible de inmediato, estado de reposo.
  if (reduced() || typeof IntersectionObserver === "undefined") {
    if (opts.reveal) el.classList.add("is-in");
    if (opts.map && !opts.onProgress) el.style.setProperty("--p", String(rest));
    return () => {};
  }

  if (opts.reveal) {
    getRevealIO().observe(el);
    getRearmIO().observe(el);
  }

  let entry: Entry | undefined;
  if (opts.map) {
    entry = { el, map: opts.map, cb: opts.onProgress, rest, last: -1, near: false };
    // Cálculo síncrono inicial para evitar parpadeo al hidratar.
    const p = clamp01(opts.map(el.getBoundingClientRect(), window.innerHeight, window.scrollY));
    entry.last = p;
    if (entry.cb) entry.cb(p);
    else el.style.setProperty("--p", p.toFixed(3));
    tracked.set(el, entry);
    getTrackIO().observe(el);
    bind();
  }

  return () => {
    revealIO?.unobserve(el);
    rearmIO?.unobserve(el);
    if (entry) {
      trackIO?.unobserve(el);
      tracked.delete(el);
    }
  };
}
