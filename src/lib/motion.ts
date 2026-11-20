/**
 * Lenguaje de movimiento de BenRed.
 *
 * Dos mecanismos, ambos sin React en el camino caliente:
 *  - SCROLL-TRIGGERED: una vez que el elemento entra al viewport se le añade `is-in` (CSS hace el resto).
 *  - SCROLL-LINKED:    el progreso 0..1 se escribe en la variable CSS `--p` del elemento (ver scroll-motion.ts).
 *
 * Duraciones, easings y distancias viven en globals.css (:root --m-*) para que CSS y TS no diverjan.
 * Aquí solo están los números que necesita JavaScript: umbrales y mapas de progreso.
 */

export type ProgressMap = (r: DOMRect, vh: number, sy: number) => number;

/** Margen del observador de entrada: el elemento se anima un poco antes de quedar centrado. */
export const REVEAL_ROOT_MARGIN = "0px 0px -8% 0px";
export const REVEAL_THRESHOLD = 0.08;

/** Margen del observador de seguimiento: se calcula progreso solo cerca del viewport. */
export const TRACK_ROOT_MARGIN = "20% 0px 20% 0px";

const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);
export { clamp01 };

/**
 * Hero: 0 mientras el plano está en su posición inicial; 1 cuando se ha desplazado ~90 % de su alto.
 * En móvil (plano bajo el fold) el progreso arranca cuando el plano entra a la pantalla.
 */
export const heroProgress: ProgressMap = (r, vh, sy) => {
  const absTop = r.top + sy;
  const start = Math.max(0, absTop - vh * 0.55);
  return clamp01((sy - start) / (r.height * 0.9));
};

/** Etapas del proceso: 0 cuando el elemento asoma por abajo, 1 cuando llega a media pantalla. */
export const stepProgress: ProgressMap = (r, vh) => clamp01((vh * 0.92 - r.top) / (vh * 0.42));

/** Paralaje interno de imágenes: 0 al entrar por abajo, 1 al salir por arriba. */
export const parallaxProgress: ProgressMap = (r, vh) => clamp01((vh - r.top) / (vh + r.height));

/**
 * Stand de "Del plano al piso de feria". El elemento es una pista (stage sticky + espaciador):
 *  - p = 0 cuando la pista asoma al 45 % del viewport (el plano empieza a dibujarse),
 *  - p = 1 con ~15 % de la pista aún fijada (el stand queda terminado antes de soltarse).
 * Pista discreta: 65 % del alto de pantalla en escritorio, 45 % en móvil (coincide con globals.css).
 */
export const standProgress: ProgressMap = (r, vh) => {
  const extra = (window.innerWidth < 768 ? 0.45 : 0.65) * vh;
  const stickyTop = 88;
  return clamp01((vh * 0.45 - r.top) / (vh * 0.45 - stickyTop + extra * 0.85));
};

/**
 * Escenario "De la idea al escenario". Geometría (r = pista completa = escenario fijado + espacio de recorrido):
 *   altura del escenario  H = r.height - extra            (extra = alto del `.cs-spacer`, mismo valor que --cs-extra en CSS)
 *   p = 0  cuando el escenario ya está ENTERO dentro del viewport: su borde inferior toca el inferior (r.top = vh - H),
 *          de modo que el primer trazo se ve con el dibujo completo a la vista y nada se ha adelantado;
 *   p = 1  con el 85 % del recorrido fijado consumido (r.top = stickyTop - 0.85·extra): el concierto terminado
 *          permanece visible el 15 % restante, sin salir del sitio.
 * El recorrido útil es todo el trayecto hasta el final: antes y durante el anclaje (sticky).
 */
export const CONCERT_EXTRA_VH = { desktop: 0.9, mobile: 0.7 } as const;
export const concertProgress: ProgressMap = (r, vh) => {
  const mobile = window.innerWidth < 768;
  const extra = (mobile ? CONCERT_EXTRA_VH.mobile : CONCERT_EXTRA_VH.desktop) * vh;
  const stickyTop = mobile ? 80 : 88; // = .cs-stage top
  const stageH = r.height - extra;
  const start = Math.max(vh - stageH, stickyTop); // escenario entero visible (nunca por debajo del anclaje)
  const end = stickyTop - extra * 0.85;
  return clamp01((start - r.top) / (start - end));
};

/** Valor de reposo (sin movimiento / con prefers-reduced-motion). */
export const REST = { hero: 0, step: 1, parallax: 0.5, stand: 1, concert: 1 } as const;
export const MAPS = { hero: heroProgress, step: stepProgress, parallax: parallaxProgress, stand: standProgress, concert: concertProgress } as const;
export type MapName = keyof typeof MAPS;
