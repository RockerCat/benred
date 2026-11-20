/**
 * Modelo arquitectónico compartido del stand ilustrativo del hero (6 × 4 × 2,8 m).
 *
 * UNA sola definición en metros (STAND) se proyecta de dos formas:
 *   - planta 2D:       P2(x, y)    → 60 px por metro, origen (110, 110)
 *   - isométrica 3D:   P3(x, y, z) → proyección axonométrica estándar (30°)
 * Así el plano y el volumen son, por construcción, el mismo proyecto.
 *
 * Ejes: x → ancho (0..6), y → fondo (0 = muro trasero, 4 = frente abierto), z → altura.
 * No es un proyecto real de BenRed: es un esquema ilustrativo y así se rotula.
 */

import { figure, HAIR, SKIN, WARDROBE, type Shape } from "./figures";

export const STAND = {
  w: 6,
  d: 4,
  h: 2.8,
  wallBack: { x0: 0, x1: 6, y0: 0, y1: 0.12, h: 2.8 },
  wallLeft: { x0: 0, x1: 0.12, y0: 0.12, y1: 2.2, h: 2.8 },
  screens: [
    { id: "screen-1", x0: 0.9, x1: 1.9, y0: 0.12, y1: 0.18, z0: 1.2, z1: 1.95 },
    { id: "screen-2", x0: 4.1, x1: 5.1, y0: 0.12, y1: 0.18, z0: 1.2, z1: 1.95 },
  ],
  counter: { x0: 0.5, x1: 2.7, y0: 2.4, y1: 3.0, h: 1.0 },
  table: { x0: 4.3, x1: 5.5, y0: 2.8, y1: 3.4, h: 0.9 },
  totem: { x0: 3.1, x1: 3.45, y0: 1.2, y1: 1.55, h: 2.4 },
  plinth: { cx: 4.4, cy: 1.5, r: 0.4, h: 0.9 },
  stools: [
    { cx: 0.9, cy: 3.7, r: 0.2, h: 0.65 },
    { cx: 1.5, cy: 3.7, r: 0.2, h: 0.65 },
    { cx: 2.1, cy: 3.7, r: 0.2, h: 0.65 },
  ],
  entrance: { x0: 3.0, x1: 4.2 },
} as const;

/* ---------------------------------------------------------------- proyecciones */

type Pt = readonly [number, number];

const PLAN_X0 = 110;
const PLAN_Y0 = 110;
const PLAN_K = 60; // px por metro

export const P2 = (x: number, y: number): Pt => [PLAN_X0 + PLAN_K * x, PLAN_Y0 + PLAN_K * y];

const ISO_S = 44; // px por metro
const ISO_C = Math.sqrt(3) / 2;
const ISO_OX = 250;
const ISO_OY = 205;

export const P3 = (x: number, y: number, z: number): Pt => [
  ISO_OX + (x - y) * ISO_C * ISO_S,
  ISO_OY + (x + y) * 0.5 * ISO_S - z * ISO_S,
];

/* ---------------------------------------------------------------- tipos de salida */

export type El = {
  id: string;
  /** line: solo trazo · face: trazo + relleno opaco (oclusión) · tint: relleno tenue sin trazo */
  kind: "line" | "face" | "tint" | "mat" | "deco" | "person";
  path: string;
  /** inicio y duración del trazo, en segundos, dentro de su fase de dibujo */
  d: number;
  t: number;
  stroke?: string;
  w?: number;
  fill?: string;
  fo?: number;
  minor?: boolean;
  /** mat/deco: retraso (s) dentro de MATERIALIZE · person: retraso (s) dentro de HOLD_REAL */
  m?: number;
  /** deco: marca (texto y formas sobre una superficie) */
  parts?: Deco[];
  /** person: figura humana ya proyectada */
  shapes?: Shape[];
};

/** Elemento gráfico de marca sobre una superficie del stand (texto sobre plano proyectado o forma). */
export type Deco =
  | { t: "text"; text: string; mx: [number, number, number, number, number, number]; size: number; fill: string; weight?: number; display?: boolean; anchor?: "start" | "middle"; ls?: string }
  | { t: "path"; d: string; fill?: string; fo?: number; stroke?: string; w?: number };

export type Tx = {
  id: string;
  text: string;
  x: number;
  y: number;
  d: number;
  size?: number;
  anchor?: "start" | "middle";
  fill?: string;
  weight?: number;
  rotate?: number;
  bg?: { x: number; y: number; w: number; h: number };
  label?: boolean;
  minor?: boolean;
};

/** wf: la geometría del stand (su trazo se atenúa al materializarse). */
export type Group = { id: string; els: El[]; txs: Tx[]; wf?: boolean };

/* ---------------------------------------------------------------- utilidades */

const f = (n: number) => Math.round(n * 10) / 10;
const pt = (p: Pt) => `${f(p[0])} ${f(p[1])}`;
const poly = (pts: Pt[]) => `M${pts.map(pt).join("L")}Z`;
const open = (pts: Pt[]) => `M${pts.map(pt).join("L")}`;
const circle = (c: Pt, r0: number) => {
  const r = f(r0);
  return `M${f(c[0] - r)} ${f(c[1])}a${r} ${r} 0 1 0 ${f(2 * r)} 0a${r} ${r} 0 1 0 ${f(-2 * r)} 0`;
};

const INK = "var(--ink)";
const SIGNAL = "var(--signal)";
const TEAL = "var(--teal-deep)";
const SOFT = "var(--line-strong)";

const ln = (id: string, path: string, d: number, t: number, o: Partial<El> = {}): El => ({
  id, kind: "line", path, d, t, stroke: INK, w: 1.6, ...o,
});
const face = (id: string, path: string, d: number, t: number, o: Partial<El> = {}): El => ({
  id, kind: "face", path, d, t, stroke: INK, w: 1.6, fill: "var(--paper)", ...o,
});
const tint = (id: string, path: string, d: number, color: string, fo: number): El => ({
  id, kind: "tint", path, d, t: 0, fill: color, fo,
});

/* ---------------------------------------------------------------- 3D: primitivas */

/**
 * Materiales (fase C). Cada superficie de material REUTILIZA el path de la cara del wireframe y se
 * emite justo después de ella: el orden de pintado (y por tanto la oclusión) es el mismo que ya
 * estaba aprobado. Luz desde arriba-izquierda: tapas claras, frentes (y+) medios, costados (x+) oscuros.
 */
const G = (n: string) => `url(#m-${n})`;
const mat = (id: string, path: string, m: number, fill: string, o: Partial<El> = {}): El => ({
  id, kind: "mat", path, d: 0, t: 0, m, fill, ...o,
});

type Mats = { front?: string; side?: string; top?: string };
type Box = { x0: number; x1: number; y0: number; y1: number; z0?: number; z1: number };

/** Caja con sus tres caras visibles desde el punto de vista isométrico: frente (y+), costado (x+) y tapa. */
function box3(
  id: string,
  b: Box,
  d: number,
  o: { stroke?: string; frontTint?: [string, number]; t?: number; mats?: Mats; m?: number } = {},
): El[] {
  const { x0, x1, y0, y1, z1 } = b;
  const z0 = b.z0 ?? 0;
  const t = o.t ?? 0.5;
  const stroke = o.stroke ?? INK;
  const m = o.m ?? 0;
  const front = poly([P3(x0, y1, z0), P3(x1, y1, z0), P3(x1, y1, z1), P3(x0, y1, z1)]);
  const side = poly([P3(x1, y0, z0), P3(x1, y1, z0), P3(x1, y1, z1), P3(x1, y0, z1)]);
  const top = poly([P3(x0, y0, z1), P3(x1, y0, z1), P3(x1, y1, z1), P3(x0, y1, z1)]);
  const out: El[] = [face(`${id}-frente`, front, d, t, { stroke })];
  if (o.frontTint) out.push(tint(`${id}-frente-tinte`, front, d + 0.1, o.frontTint[0], o.frontTint[1]));
  if (o.mats?.front) out.push(mat(`${id}-frente-mat`, front, m, o.mats.front));
  out.push(face(`${id}-costado`, side, d + 0.08, t, { stroke }));
  out.push(tint(`${id}-costado-tinte`, side, d + 0.1, TEAL, 0.08));
  if (o.mats?.side) out.push(mat(`${id}-costado-mat`, side, m + 0.05, o.mats.side));
  out.push(face(`${id}-tapa`, top, d + 0.16, t, { stroke }));
  if (o.mats?.top) out.push(mat(`${id}-tapa-mat`, top, m + 0.1, o.mats.top));
  return out;
}

/** Punto de una circunferencia horizontal proyectada (ángulo θ en el plano x-y). */
const rim = (cx: number, cy: number, r: number, z: number, th: number): Pt =>
  P3(cx + r * Math.cos(th), cy + r * Math.sin(th), z);

const ring = (cx: number, cy: number, r: number, z: number, n = 32): Pt[] =>
  Array.from({ length: n }, (_, i) => rim(cx, cy, r, z, (i / n) * Math.PI * 2));

/** Cilindro: cuerpo (laterales + arco frontal de la base) y elipse superior. */
function cylinder3(
  id: string,
  c: { cx: number; cy: number; r: number; h: number },
  d: number,
  t = 0.5,
  o: { mats?: { body?: string; top?: string }; m?: number } = {},
): El[] {
  const { cx, cy, r, h } = c;
  const L = (3 * Math.PI) / 4; // extremo izquierdo de la elipse
  const R = -Math.PI / 4; // extremo derecho
  const arc: Pt[] = [];
  const N = 14;
  for (let i = 0; i <= N; i++) arc.push(rim(cx, cy, r, 0, L + ((R - L) * i) / N));
  const body = `M${pt(rim(cx, cy, r, h, L))}L${arc.map(pt).join("L")}L${pt(rim(cx, cy, r, h, R))}Z`;
  const top = poly(ring(cx, cy, r, h));
  const m = o.m ?? 0;
  const out: El[] = [
    face(`${id}-cuerpo`, body, d, t),
    tint(`${id}-cuerpo-tinte`, body, d + 0.05, TEAL, 0.08),
  ];
  if (o.mats?.body) out.push(mat(`${id}-cuerpo-mat`, body, m, o.mats.body));
  out.push(face(`${id}-tapa`, top, d + 0.15, t));
  if (o.mats?.top) out.push(mat(`${id}-tapa-mat`, top, m + 0.1, o.mats.top));
  return out;
}

/** Rectángulo en un plano vertical y = const (caras frontales), con holgura opcional. */
const planeY = (x0: number, x1: number, y: number, z0: number, z1: number, pad = 0): Pt[] => [
  P3(x0 - pad, y, z0 - pad), P3(x1 + pad, y, z0 - pad), P3(x1 + pad, y, z1 + pad), P3(x0 - pad, y, z1 + pad),
];
/** Rectángulo en un plano vertical x = const (caras laterales). */
const planeX = (x: number, y0: number, y1: number, z0: number, z1: number): Pt[] => [
  P3(x, y0, z0), P3(x, y1, z0), P3(x, y1, z1), P3(x, y0, z1),
];

/** Definición de degradados del material (se inyectan como <defs> en el SVG). */
export type Grad = { id: string; kind?: "linear" | "radial"; v?: boolean; stops: Array<[number, string, number?]>; cx?: number; cy?: number };
const V = true; // degradado vertical
export const GRADIENTS: Grad[] = [
  { id: "m-wall-f", v: V, stops: [[0, "#fbf9f4"], [1, "#e6e1d4"]] },
  { id: "m-wall-s", v: V, stops: [[0, "#e4dfd2"], [1, "#cdc7b7"]] },
  { id: "m-top", stops: [[0, "#ffffff"], [1, "#ece7da"]] },
  { id: "m-floor", v: V, stops: [[0, "#cfc2a8"], [1, "#e0d5be"]] },
  { id: "m-ctr-f", v: V, stops: [[0, "#2f9096"], [1, "#026472"]] },
  { id: "m-ctr-s", v: V, stops: [[0, "#1b6f77"], [1, "#014a55"]] },
  { id: "m-ctr-t", stops: [[0, "#ffffff"], [1, "#e4dfd2"]] },
  { id: "m-wood-f", v: V, stops: [[0, "#dccaa4"], [1, "#c4ae83"]] },
  { id: "m-wood-s", v: V, stops: [[0, "#bba67c"], [1, "#9d885f"]] },
  { id: "m-wood-t", stops: [[0, "#eddfc0"], [1, "#dcc9a3"]] },
  { id: "m-tot-f", v: V, stops: [[0, "#33454a"], [1, "#16221f"]] },
  { id: "m-tot-s", v: V, stops: [[0, "#1f2d30"], [1, "#0d1517"]] },
  { id: "m-tot-t", stops: [[0, "#566a6e"], [1, "#3a4c50"]] },
  { id: "m-lit", v: V, stops: [[0, "#d4f4ec"], [1, "#64bdaf"]] },
  { id: "m-scr-f", stops: [[0, "#c9f1e8"], [0.55, "#7fcfc0"], [1, "#258288"]] },
  { id: "m-scr-s", v: V, stops: [[0, "#258288"], [1, "#026472"]] },
  { id: "m-cyl", stops: [[0, "#fdfbf6"], [0.45, "#ebe6d9"], [1, "#b9b3a3"]] },
  { id: "m-cyl-top", stops: [[0, "#ffffff"], [1, "#ebe6d9"]] },
  { id: "m-stool", stops: [[0, "#4a5d61"], [1, "#0d1517"]] },
  { id: "m-stool-top", stops: [[0, "#6a7f83"], [1, "#2c3d40"]] },
  { id: "m-orb", kind: "radial", cx: 0.35, cy: 0.3, stops: [[0, "#d4f4ec"], [0.55, "#2f9096"], [1, "#014a55"]] },
];

/* ---------------------------------------------------------------- marca y personas */

/**
 * Marca conceptual del stand: ORBE (identidad demostrativa; no es un cliente ni un proyecto de BenRed).
 * Colores del propio sitio: tinta, naranja señal y menta. Todo es texto + geometría SVG.
 */
export const BRAND1 = { name: "ORBE" };
const SC = ISO_S / 100; // 100 unidades locales de texto = 1 metro
/** Matriz que pone un texto sobre un plano vertical y=cte (frente) con baseline en (x, y, z). */
const mX1 = (x: number, y: number, z: number): [number, number, number, number, number, number] => mY(x, y, z);
/** Texto sobre una cara x+ (corre hacia -y: se lee de izquierda a derecha sin espejo). */
const mXface = (x: number, y: number, z: number): [number, number, number, number, number, number] => {
  const [e, f] = P3(x, y, z);
  return [ISO_C * SC, -0.5 * SC, 0, SC, e, f];
};
const mY = (x: number, y: number, z: number): [number, number, number, number, number, number] => {
  const [e, f] = P3(x, y, z);
  return [ISO_C * SC, 0.5 * SC, 0, SC, e, f];
};
/** Polígono de una circunferencia contenida en el plano vertical y=cte. */
const circY = (cx: number, y: number, cz: number, r: number, n = 30): Pt[] =>
  Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    return P3(cx + r * Math.cos(a), y, cz + r * Math.sin(a));
  });
const rectY = (x0: number, x1: number, y: number, z0: number, z1: number): Pt[] => [P3(x0, y, z0), P3(x1, y, z0), P3(x1, y, z1), P3(x0, y, z1)];

const deco = (id: string, m: number, parts: Deco[], o: Partial<El> = {}): El => ({ id, kind: "deco", path: "", d: 0, t: 0, m, parts, ...o });
const person = (id: string, m: number, shapes: Shape[]): El => ({ id, kind: "person", path: "", d: 0, t: 0, m, shapes });
const PAPER_FILL = "var(--paper)";
const ORBE_INK = "#14201f";
const ORBE_ORANGE = "var(--signal)";

/* ---------------------------------------------------------------- vista 3D */

export const ISO_LABELS = {
  A: P3(4.6, 0.18, 1.58),
  B: P3(2.7, 2.4, 1.0),
  C: P3(4.4, 1.5, 0.9),
  D: P3(3.275, 1.375, 2.4),
};

function build3D(): Group[] {
  const S = STAND;
  const g: Group[] = [];
  const SHADOW = "var(--ink)";

  // 1 · Base y perímetro (+ piso terminado, ambiente en muros y sombras de contacto)
  const floor = [P3(0, 0, 0), P3(S.w, 0, 0), P3(S.w, S.d, 0), P3(0, S.d, 0)];
  const e = S.entrance;
  const sh = (id: string, x0: number, y0: number, x1: number, y1: number, m: number) =>
    mat(id, poly([P3(x0 + 0.1, y0 + 0.08, 0), P3(x1 + 0.24, y0 + 0.08, 0), P3(x1 + 0.24, y1 + 0.2, 0), P3(x0 + 0.1, y1 + 0.2, 0)]), m, SHADOW, { fo: 0.13 });
  const p = S.plinth;
  const c = S.counter;
  const tb = S.table;
  const t = S.totem;
  g.push({
    id: "iso-base",
    wf: true,
    txs: [],
    els: [
      ln("iso-perimetro", poly(floor), 0, 0.9, { w: 2 }),
      tint("iso-piso-tinte", poly(floor), 0.5, TEAL, 0.05),
      mat("iso-piso-mat", poly(floor), 0, G("floor")),
      ...Array.from({ length: 11 }, (_, i) =>
        mat(`iso-piso-tablon-${i + 1}`, open([P3(0.5 + i * 0.5, 0, 0), P3(0.5 + i * 0.5, S.d, 0)]), 0.1, "none", { stroke: "rgb(70 52 24 / 0.16)", w: 1, minor: true }),
      ),
      mat("iso-ambiente-trasero", poly([P3(0, 0.12, 0), P3(S.w, 0.12, 0), P3(S.w, 0.62, 0), P3(0, 0.62, 0)]), 0.25, SHADOW, { fo: 0.1 }),
      mat("iso-ambiente-izquierdo", poly([P3(0.12, 0.62, 0), P3(0.62, 0.62, 0), P3(0.62, 2.2, 0), P3(0.12, 2.2, 0)]), 0.25, SHADOW, { fo: 0.08 }),
      sh("iso-sombra-mostrador", c.x0, c.y0, c.x1, c.y1, 0.3),
      sh("iso-sombra-mesa", tb.x0, tb.y0, tb.x1, tb.y1, 0.3),
      sh("iso-sombra-totem", t.x0, t.y0, t.x1, t.y1, 0.3),
      mat("iso-sombra-isla", poly(ring(p.cx + 0.16, p.cy + 0.12, p.r, 0, 28)), 0.3, SHADOW, { fo: 0.13 }),
      ln("iso-acceso-jamba-1", open([P3(e.x0, S.d - 0.12, 0), P3(e.x0, S.d + 0.12, 0)]), 0.8, 0.25),
      ln("iso-acceso-jamba-2", open([P3(e.x1, S.d - 0.12, 0), P3(e.x1, S.d + 0.12, 0)]), 0.85, 0.25),
    ],
  });

  // 2 · Estructura vertical y paredes
  const wb = S.wallBack;
  const wl = S.wallLeft;
  g.push({
    id: "iso-paredes",
    wf: true,
    txs: [],
    els: [
      ...box3("iso-muro-trasero", { ...wb, z1: wb.h }, 0.5, { t: 0.6, m: 0.45, mats: { front: G("wall-f"), side: G("wall-s"), top: G("top") } }),
      // acabados: zócalo oscuro y cabecera en teal sobre el frente del muro trasero
      mat("iso-muro-trasero-zocalo", poly(planeY(0, S.w, wb.y1, 0, 0.12)), 0.7, "var(--ink)", { fo: 0.55 }),
      mat("iso-muro-trasero-cabecera", poly(planeY(0, S.w, wb.y1, 2.46, 2.8)), 0.75, TEAL, { fo: 0.94 }),
      ...box3("iso-muro-izquierdo", { ...wl, z1: wl.h }, 0.9, { t: 0.55, m: 0.5, mats: { front: G("wall-f"), side: G("wall-s"), top: G("top") } }),
      mat("iso-muro-izquierdo-zocalo", poly(planeX(wl.x1, wl.y0, wl.y1, 0, 0.12)), 0.75, "var(--ink)", { fo: 0.55 }),
      mat("iso-muro-izquierdo-cabecera", poly(planeX(wl.x1, wl.y0, wl.y1, 2.46, 2.8)), 0.8, TEAL, { fo: 0.942 }),
      ln("iso-muro-juntas-1", open([P3(2, wb.y1, 0.12), P3(2, wb.y1, 2.55)]), 1.5, 0.4, { stroke: SOFT, w: 1, minor: true }),
      ln("iso-muro-juntas-2", open([P3(4, wb.y1, 0.12), P3(4, wb.y1, 2.55)]), 1.55, 0.4, { stroke: SOFT, w: 1, minor: true }),
      // Superficies de identidad en wireframe: línea del friso y marco del panel principal
      ln("iso-friso-linea", open([P3(0, wb.y1, 2.46), P3(S.w, wb.y1, 2.46)]), 1.6, 0.5, { stroke: SOFT, w: 1.1 }),
      ln("iso-panel-marca-marco", poly(rectY(2.18, 3.82, wb.y1, 0.82, 2.24)), 1.7, 0.6, { stroke: SOFT, w: 1.1 }),
      // Marca revelada (MATERIALIZE): friso con el nombre y panel principal con el isotipo
      deco("iso-marca-friso", 1.65, [
        { t: "path", d: poly(circY(0.36, wb.y1, 2.63, 0.085)), fill: ORBE_ORANGE },
        { t: "text", text: BRAND1.name, mx: mX1(0.56, wb.y1, 2.56), size: 21, fill: PAPER_FILL, weight: 700, display: true, ls: "0.14em" },
      ]),
      // La identidad continúa en el friso del muro lateral (texto sobre la cara x+, corre hacia -y)
      deco("iso-marca-friso-lateral", 1.7, [
        { t: "text", text: BRAND1.name, mx: mXface(wl.x1, 2.1, 2.56), size: 19, fill: PAPER_FILL, weight: 700, display: true, ls: "0.14em" },
      ]),
      deco("iso-marca-panel", 1.75, [
        { t: "path", d: poly(rectY(2.18, 3.82, wb.y1, 0.82, 2.24)), fill: ORBE_INK, fo: 0.94 },
        { t: "path", d: poly(circY(3.0, wb.y1, 1.62, 0.42)), fill: "none", stroke: ORBE_ORANGE, w: 2.2 },
        { t: "path", d: poly(circY(3.0, wb.y1, 1.62, 0.28)), fill: "none", stroke: "var(--mint)", w: 1.6 },
        { t: "path", d: poly(circY(3.0, wb.y1, 1.62, 0.13)), fill: ORBE_ORANGE },
        { t: "text", text: BRAND1.name, mx: mY(3.0, wb.y1, 0.93), size: 15, fill: PAPER_FILL, weight: 700, display: true, anchor: "middle", ls: "0.22em" },
      ]),
    ],
  });

  // 3 · Paneles y pantallas
  g.push({
    id: "iso-pantallas",
    wf: true,
    txs: [],
    els: [...S.screens.flatMap((s, i) => [
      // halo de luz sobre el muro, detrás de la pantalla
      mat(`iso-${s.id}-halo`, poly(planeY(s.x0, s.x1, s.y0, s.z0, s.z1, 0.14)), 1.55 + i * 0.05, "var(--mint)", { fo: 0.2 }),
      ...box3(`iso-${s.id}`, { x0: s.x0, x1: s.x1, y0: s.y0, y1: s.y1, z0: s.z0, z1: s.z1 }, 1.4 + i * 0.12, {
        stroke: TEAL,
        frontTint: ["var(--mint)", 0.45],
        t: 0.4,
        m: 1.5 + i * 0.05,
        mats: { front: G("scr-f"), side: G("scr-s"), top: G("scr-s") },
      }),
    ]),
      // Pantallas encendidas con contenido abstracto de la marca (isotipo y barras)
      deco("iso-pantalla-1-contenido", 2.05, [
        { t: "path", d: poly(rectY(0.93, 1.87, 0.19, 1.23, 1.92)), fill: ORBE_INK, fo: 0.96 },
        { t: "path", d: poly(circY(1.4, 0.19, 1.66, 0.3)), fill: "none", stroke: "var(--mint)", w: 1.3 },
        { t: "path", d: poly(circY(1.4, 0.19, 1.66, 0.2)), fill: ORBE_ORANGE },
        { t: "text", text: BRAND1.name, mx: mY(1.4, 0.19, 1.3), size: 9, fill: PAPER_FILL, weight: 700, display: true, anchor: "middle", ls: "0.2em" },
      ]),
      deco("iso-pantalla-2-contenido", 2.15, [
        { t: "path", d: poly(rectY(4.13, 5.07, 0.19, 1.23, 1.92)), fill: ORBE_INK, fo: 0.96 },
        ...[0.5, 0.36, 0.22].map((r, i): Deco => ({ t: "path", d: poly(circY(4.35, 0.19, 1.35, r).filter((q, k) => k % 1 === 0)), fill: "none", stroke: i === 2 ? ORBE_ORANGE : "var(--mint)", w: 1.3 - i * 0.2 })),
        { t: "path", d: poly(circY(4.35, 0.19, 1.35, 0.07)), fill: ORBE_ORANGE },
      ]),
    ],
  });

  // 4 · Tótem
  g.push({
    id: "iso-totem",
    wf: true,
    txs: [],
    els: [
      ...box3("iso-totem", { ...t, z1: t.h }, 1.6, { t: 0.55, m: 1.25, mats: { front: G("tot-f"), side: G("tot-s"), top: G("tot-t") } }),
      mat("iso-totem-panel", poly(planeY(t.x0 + 0.04, t.x1 - 0.04, t.y1, 1.55, 2.25)), 1.55, G("lit")),
      deco("iso-totem-marca", 2.0, [
        { t: "path", d: poly(circY((t.x0 + t.x1) / 2, t.y1, 1.95, 0.105)), fill: "none", stroke: ORBE_ORANGE, w: 1.6 },
        { t: "path", d: poly(circY((t.x0 + t.x1) / 2, t.y1, 1.95, 0.045)), fill: ORBE_ORANGE },
      ]),
      ln("iso-totem-banda", open([P3(t.x0, t.y1, 1.6), P3(t.x1, t.y1, 1.6), P3(t.x1, t.y0, 1.6)]), 2.3, 0.3, { stroke: SOFT, w: 1, minor: true }),
    ],
  });

  // 5 · Zonas de exhibición: isla de producto y mesa
  g.push({
    id: "iso-exhibicion",
    wf: true,
    txs: [],
    els: [
      ...cylinder3("iso-isla", p, 1.8, 0.55, { m: 1.0, mats: { body: G("cyl"), top: G("cyl-top") } }),
      mat("iso-isla-anillo-mat", poly(ring(p.cx, p.cy, p.r * 0.62, p.h, 24)), 1.2, "var(--mint)", { fo: 0.55 }),
      mat("iso-isla-producto", circle(P3(p.cx, p.cy, p.h + 0.16), 9), 1.75, G("orb")),
      // Visitante observando la exhibición (delante de la isla, detrás de la mesa)
      person("iso-persona-3", 0.85, figure({ dir: "ar", pose: "point", h: 1.7, outfit: "dress", top: WARDROBE.sand.top, topShade: WARDROBE.sand.shade, bottom: "#26363a", skin: SKIN.c, hair: HAIR.chestnut, hairStyle: "wavy", accent: "#26363a" }, ISO_S, P3(3.95, 2.45, 0))),
      ln("iso-isla-anillo", poly(ring(p.cx, p.cy, p.r * 0.62, p.h, 24)), 2.4, 0.3, { stroke: SOFT, w: 1, minor: true }),
      ...box3("iso-mesa", { ...tb, z1: tb.h }, 2.3, { t: 0.5, m: 1.0, mats: { front: G("wood-f"), side: G("wood-s"), top: G("wood-t") } }),
      ln("iso-mesa-junta", open([P3(4.9, tb.y1, 0), P3(4.9, tb.y1, tb.h - 0.1)]), 2.85, 0.25, { stroke: SOFT, w: 1, minor: true }),
    ],
  });

  // Personal de atención detrás del mostrador (el mostrador, pintado después, oculta sus piernas)
  g.push({
    id: "iso-personal",
    txs: [],
    els: [
      person("iso-persona-1", 0.15, figure({ dir: "tl", pose: "talk", h: 1.74, outfit: "blazer", top: WARDROBE.ink.top, topShade: WARDROBE.ink.shade, bottom: "#3a4c50", shirt: "#f6f3ea", skin: SKIN.b, hair: HAIR.black, hairStyle: "long", accent: "#ff5a2b" }, ISO_S, P3(1.6, 2.15, 0))),
    ],
  });

  // 6 · Mostrador de recepción y mobiliario
  g.push({
    id: "iso-recepcion",
    wf: true,
    txs: [],
    els: [
      ...box3("iso-mostrador", { ...c, z1: c.h }, 2.0, { t: 0.6, m: 0.9, mats: { front: G("ctr-f"), side: G("ctr-s"), top: G("ctr-t") } }),
      mat("iso-mostrador-luz", open([P3(c.x0, c.y1, 0.92), P3(c.x1, c.y1, 0.92)]), 1.8, "none", { stroke: "var(--mint)", w: 2 }),
      ln("iso-mostrador-repisa", open([P3(c.x0, c.y1, 0.92), P3(c.x1, c.y1, 0.92)]), 2.7, 0.3, { stroke: SOFT, w: 1, minor: true }),
      ln("iso-mostrador-paneles", `${open([P3(1.23, c.y1, 0), P3(1.23, c.y1, 0.92)])}${open([P3(1.97, c.y1, 0), P3(1.97, c.y1, 0.92)])}`, 2.75, 0.3, { stroke: SOFT, w: 1, minor: true }),
      ln("iso-mostrador-placa", poly(rectY(0.6, 2.6, c.y1, 0.15, 0.8)), 2.8, 0.4, { stroke: SOFT, w: 1.1 }),
      deco("iso-mostrador-marca", 1.95, [
        { t: "text", text: BRAND1.name, mx: mY(1.6, c.y1, 0.33), size: 21, fill: PAPER_FILL, weight: 700, display: true, anchor: "middle", ls: "0.16em" },
        { t: "path", d: poly(rectY(1.3, 1.9, c.y1, 0.21, 0.24)), fill: ORBE_ORANGE },
      ]),
      ...S.stools.flatMap((s, i) =>
        cylinder3(`iso-banqueta-${i + 1}`, s, 2.6 + i * 0.12, 0.35, { m: 1.2 + i * 0.05, mats: { body: G("stool"), top: G("stool-top") } }).map((x) => ({ ...x, minor: true })),
      ),
    ],
  });

  // Visitante frente al mostrador (delante de él)
  g.push({
    id: "iso-visitante",
    txs: [],
    els: [
      person("iso-persona-2", 0.5, figure({ dir: "al", pose: "talk", h: 1.84, outfit: "coat", top: WARDROBE.teal.top, topShade: WARDROBE.teal.shade, bottom: "#26363a", skin: SKIN.a, hair: HAIR.brown }, ISO_S, P3(3.0, 3.1, 0))),
    ],
  });

  // 7 · Detalles técnicos: acceso, cotas y anotaciones
  const cx0 = P3(0, 4.7, 0);
  const cx1 = P3(S.w, 4.7, 0);
  const cy0 = P3(-0.7, 0, 0);
  const cy1 = P3(-0.7, S.d, 0);
  const mid = (a: Pt, b: Pt): Pt => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const mx = P3(1.4, 4.7, 0); // etiqueta desplazada para no tapar la flecha de acceso
  const my = mid(cy0, cy1);
  const arrowA = P3(3.6, 4.95, 0);
  const arrowB = P3(3.6, 4.15, 0);
  g.push({
    id: "iso-cotas",
    els: [
      ln("iso-acceso-flecha", `${open([arrowA, arrowB])}${open([P3(3.45, 4.35, 0), arrowB, P3(3.75, 4.35, 0)])}`, 2.9, 0.4, { stroke: TEAL, w: 2.2 }),
      ln("iso-cota-x", `${open([cx0, cx1])}${open([P3(0, 4.5, 0), P3(0, 4.9, 0)])}${open([P3(S.w, 4.5, 0), P3(S.w, 4.9, 0)])}`, 3.0, 0.5, { stroke: SIGNAL, w: 1.8 }),
      ln("iso-cota-y", `${open([cy0, cy1])}${open([P3(-0.9, 0, 0), P3(-0.5, 0, 0)])}${open([P3(-0.9, S.d, 0), P3(-0.5, S.d, 0)])}`, 3.05, 0.5, { stroke: SIGNAL, w: 1.8 }),
    ],
    txs: [
      { id: "iso-cota-x-texto", text: "6,00 m", x: mx[0], y: mx[1] + 6, d: 3.4, anchor: "middle", fill: SIGNAL, weight: 600, size: 17, bg: { x: mx[0] - 38, y: mx[1] - 12, w: 76, h: 26 } },
      { id: "iso-cota-y-texto", text: "4,00 m", x: my[0], y: my[1] + 6, d: 3.4, anchor: "middle", fill: SIGNAL, weight: 600, size: 17, bg: { x: my[0] - 38, y: my[1] - 12, w: 76, h: 26 } },
    ],
  });

  // Llamadas
  const labels: Array<[string, string, Pt, number]> = [
    ["D", "Tótem", ISO_LABELS.D, 201],
    ["A", "Pantallas", ISO_LABELS.A, 240],
    ["B", "Recepción", ISO_LABELS.B, 276],
    ["C", "Producto", ISO_LABELS.C, 306],
  ];
  g.push({
    id: "iso-llamadas",
    els: labels.map(([k, , a, ly], i) =>
      ln(`iso-llamada-${k}`, `M${pt(a)}L${f(a[0] + 12)} ${ly}H490`, 3.1 + i * 0.05, 0.4, { w: 1.3 }),
    ),
    txs: labels.map(([k, name, , ly]) => ({
      id: `iso-llamada-${k}-texto`, text: `${k} · ${name}`, x: 498, y: ly + 5, d: 3.4, size: 15, label: true,
    })),
  });

  // Cajetín
  g.push(cajetin("iso", "Isométrica · h 2,80 m", 3.2));
  return g;
}

/* ---------------------------------------------------------------- vista 2D */

export const PLAN_LABELS = { A: P2(4.6, 0.15), B: P2(2.7, 2.4), C: P2(4.4, 1.5), D: P2(3.275, 1.2) };

function rect2(x0: number, y0: number, x1: number, y1: number) {
  return poly([P2(x0, y0), P2(x1, y0), P2(x1, y1), P2(x0, y1)]);
}

function cajetin(prefix: string, line2: string, d: number): Group {
  return {
    id: `${prefix}-cajetin`,
    els: [ln(`${prefix}-cajetin-marco`, "M400 440H626V502H400Z", d, 0.5, { w: 1.5 })],
    txs: [
      { id: `${prefix}-cajetin-t1`, text: "ESQUEMA ILUSTRATIVO", x: 414, y: 464, d: d + 0.3, size: 14, weight: 700 },
      { id: `${prefix}-cajetin-t2`, text: line2, x: 414, y: 488, d: d + 0.3, size: 14 },
    ],
  };
}

function build2D(): Group[] {
  const S = STAND;
  const g: Group[] = [];
  const e = S.entrance;
  const a = P2(e.x0, S.d);
  const b = P2(e.x1, S.d);

  // Perímetro con vano de acceso (un solo trazo continuo)
  g.push({
    id: "plano-perimetro",
    txs: [],
    els: [
      ln("plano-perimetro-trazo", `M${pt(a)}L${pt(P2(0, S.d))}L${pt(P2(0, 0))}L${pt(P2(S.w, 0))}L${pt(P2(S.w, S.d))}L${pt(b)}`, 0, 0.95, { w: 2 }),
      ln("plano-acceso-jambas", `${open([[a[0], a[1] - 7], [a[0], a[1] + 7]])}${open([[b[0], b[1] - 7], [b[0], b[1] + 7]])}`, 0.9, 0.25),
    ],
  });

  // Paredes
  g.push({
    id: "plano-paredes",
    txs: [],
    els: [
      ln("plano-muro-trasero", rect2(0, 0, S.w, 0.12), 0.6, 0.6, { fill: INK, kind: "face", w: 1 }),
      ln("plano-muro-izquierdo", rect2(0, 0.12, 0.12, 2.2), 0.8, 0.5, { fill: INK, kind: "face", w: 1 }),
    ],
  });

  // Pantallas / paneles
  g.push({
    id: "plano-pantallas",
    txs: [],
    els: S.screens.map((s, i) =>
      ln(`plano-${s.id}`, rect2(s.x0, s.y0, s.x1, s.y1), 1.1 + i * 0.12, 0.4, { kind: "face", fill: "var(--mint)", stroke: TEAL, w: 1.5 }),
    ),
  });

  // Mobiliario y zonas de exhibición
  const c = S.counter;
  const tb = S.table;
  const p = S.plinth;
  const t = S.totem;
  const inset = 5 / PLAN_K;
  g.push({
    id: "plano-mobiliario",
    txs: [],
    els: [
      ln("plano-mostrador", rect2(c.x0, c.y0, c.x1, c.y1), 1.2, 0.6),
      ln("plano-mostrador-detalle", rect2(c.x0 + inset, c.y0 + inset, c.x1 - inset, c.y1 - inset), 1.75, 0.3, { stroke: SOFT, w: 1, minor: true }),
      ln("plano-isla", circle(P2(p.cx, p.cy), p.r * PLAN_K), 1.4, 0.5),
      ln("plano-isla-anillo", circle(P2(p.cx, p.cy), p.r * PLAN_K * 0.55), 1.85, 0.3, { stroke: SOFT, w: 1, minor: true }),
      ln("plano-mesa", rect2(tb.x0, tb.y0, tb.x1, tb.y1), 1.45, 0.5),
      ln("plano-mesa-detalle", rect2(tb.x0 + inset, tb.y0 + inset, tb.x1 - inset, tb.y1 - inset), 1.9, 0.3, { stroke: SOFT, w: 1, minor: true }),
      ln("plano-totem", rect2(t.x0, t.y0, t.x1, t.y1), 1.6, 0.5),
      ln("plano-totem-cruz", `${open([P2(t.x0, t.y0), P2(t.x1, t.y1)])}${open([P2(t.x1, t.y0), P2(t.x0, t.y1)])}`, 2.0, 0.3, { stroke: SOFT, w: 1, minor: true }),
      ...S.stools.map((s, i) => ln(`plano-banqueta-${i + 1}`, circle(P2(s.cx, s.cy), s.r * PLAN_K), 1.8 + i * 0.1, 0.3, { minor: true })),
      ln("plano-acceso-flecha", `${open([[326, 410], [326, 372]])}${open([[316, 382], [326, 372], [336, 382]])}`, 2.0, 0.5, { stroke: TEAL, w: 2.2 }),
    ],
  });

  // Identidad desde el plano: friso y panel de marca (anotación técnica discreta)
  const fr0 = P2(0, 0);
  g.push({
    id: "plano-marca",
    els: [
      ln("plano-marca-friso", `${open([[fr0[0], 100], [290, 100]])}${open([[fr0[0], 96], [fr0[0], 104]])}${open([[290, 96], [290, 104]])}`, 2.15, 0.45, { stroke: SOFT, w: 1 }),
      ln("plano-marca-panel", rect2(2.2, 0.12, 3.8, 0.24), 2.2, 0.4, { stroke: SOFT, w: 1 }),
    ],
    txs: [
      { id: "plano-marca-friso-texto", text: "FRISO · IDENTIDAD", x: 112, y: 92, d: 2.45, size: 10 },
      { id: "plano-marca-panel-texto", text: "PANEL DE MARCA", x: 244, y: 141, d: 2.45, size: 10, minor: true },
    ],
  });

  // Cotas
  g.push({
    id: "plano-cotas",
    els: [
      ln("plano-cota-x", "M110 396H470M110 386V406M470 386V406", 2.1, 0.5, { stroke: SIGNAL, w: 1.8 }),
      ln("plano-cota-y", "M70 110V350M60 110H80M60 350H80", 2.15, 0.5, { stroke: SIGNAL, w: 1.8 }),
    ],
    txs: [
      { id: "plano-cota-x-texto", text: "6,00 m", x: 300, y: 402, d: 2.45, anchor: "middle", fill: SIGNAL, weight: 600, size: 17, bg: { x: 262, y: 383, w: 76, h: 26 } },
      { id: "plano-cota-y-texto", text: "4,00 m", x: 52, y: 236, d: 2.45, anchor: "middle", fill: SIGNAL, weight: 600, size: 17, rotate: -90, bg: { x: 12, y: 217, w: 80, h: 26 } },
    ],
  });

  // Llamadas (rutas libres de elementos del plano)
  const A = PLAN_LABELS.A;
  const B = PLAN_LABELS.B;
  const C = PLAN_LABELS.C;
  const D = PLAN_LABELS.D;
  g.push({
    id: "plano-llamadas",
    els: [
      ln("plano-llamada-D", `M${pt(D)}V78H490`, 2.2, 0.5, { w: 1.3 }),
      ln("plano-llamada-A", `M${pt(A)}V104H490`, 2.25, 0.5, { w: 1.3 }),
      ln("plano-llamada-C", `M${pt([C[0] + p.r * PLAN_K, C[1]])}H490`, 2.3, 0.5, { w: 1.3 }),
      ln("plano-llamada-B", `M${pt([B[0], B[1] + 6])}V252H490`, 2.35, 0.5, { w: 1.3 }),
    ],
    txs: [
      { id: "plano-llamada-D-texto", text: "D · Tótem", x: 498, y: 83, d: 2.45, size: 15, label: true },
      { id: "plano-llamada-A-texto", text: "A · Pantallas", x: 498, y: 109, d: 2.45, size: 15, label: true },
      { id: "plano-llamada-C-texto", text: "C · Producto", x: 498, y: 205, d: 2.45, size: 15, label: true },
      { id: "plano-llamada-B-texto", text: "B · Recepción", x: 498, y: 257, d: 2.45, size: 15, label: true },
    ],
  });

  g.push(cajetin("plano", "Stand 6 × 4 m · Esc. 1:50", 2.3));
  return g;
}

/* ---------------------------------------------------------------- resultado */

/** Tiempos (ms) de cada fase de la secuencia. HOLD_2D es exactamente 3 s. */
export const PHASE_MS = {
  draw2d: 2800,
  hold2d: 3000,
  erase2d: 900,
  draw3d: 3800,
  hold3d: 1500, // wireframe completo
  materialize: 2400, // acabados progresivos sobre la misma geometría
  holdReal: 4000, // stand terminado
  reset: 1000,
} as const;

export const DRAWING = { plan: build2D(), iso: build3D() };
