/**
 * Segundo stand ilustrativo (sección "Del plano al piso de feria"): isla de 9 × 6 m con dos frentes
 * abiertos (frente y costado derecho), plataforma elevada, pórtico, video wall, recepción, zona de
 * reuniones, paneles y tótem. NO es un proyecto real de BenRed: es un esquema conceptual.
 *
 * Independiente del stand del hero (stand-model.ts): proyecciones, ids y degradados propios para que
 * ninguno de los dos pueda afectar al otro.
 *
 * UN solo conjunto de objetos (OBJS, en metros) genera las tres representaciones:
 *   plano 2D (Q2) · wireframe isométrico (Q3) · materiales sobre las mismas caras del wireframe.
 *
 * Todo se anima con UN progreso de scroll `p` (0..1). Cada elemento lleva su ventana [a, b] en p:
 *   plano 2D     se dibuja en R2, se borra en RE
 *   wireframe    se dibuja en R3 (arranca mientras el plano se borra)
 *   materiales   aparecen en RM, luces/pantallas en RL
 */

import { figure, HAIR, SKIN, WARDROBE, type Shape } from "./figures";

type Pt = readonly [number, number];

/* ---------------------------------------------------------------- proyecciones */

const K = 60; // px por metro en planta
const PX = 80;
const PY = 90;
export const Q2 = (x: number, y: number): Pt => [PX + K * x, PY + K * y];

const IS = 38;
const IC = Math.sqrt(3) / 2;
const IOX = 270;
const IOY = 140;
export const Q3 = (x: number, y: number, z: number): Pt => [
  IOX + (x - y) * IC * IS,
  IOY + (x + y) * 0.5 * IS - z * IS,
];

/* ---------------------------------------------------------------- rangos de progreso */

export const R2: [number, number] = [0.02, 0.27]; // dibujo del plano
export const RE: [number, number] = [0.3, 0.44]; // borrado del plano
export const R3: [number, number] = [0.31, 0.58]; // dibujo del wireframe
export const RM: [number, number] = [0.54, 0.88]; // materiales
export const RL: [number, number] = [0.84, 1.0]; // luces y pantallas en estado final
export const RP: [number, number] = [0.88, 1.0]; // personas (últimos tramos del recorrido)

const lerp = (r: [number, number], u: number) => r[0] + (r[1] - r[0]) * u;
const win = (r: [number, number], u0: number, u1: number): [number, number] => {
  const a = lerp(r, u0);
  let b = lerp(r, u1);
  if (b - a < 0.012) b = a + 0.012;
  return [a, b];
};

const winAB = (r: [number, number], u0: number, u1: number) => {
  const [a, b] = win(r, u0, u1);
  return { a, b };
};

/* ---------------------------------------------------------------- tipos de salida */

export type E2 = {
  id: string;
  /** line: trazo · face: trazo + relleno de oclusión · tint: relleno sin trazo · mat: material */
  kind: "line" | "face" | "tint" | "mat" | "deco" | "person";
  path: string;
  a: number;
  b: number;
  ea?: number;
  eb?: number;
  stroke?: string;
  w?: number;
  fill?: string;
  fo?: number;
  minor?: boolean;
  /** deco: marca (texto y formas sobre una superficie) · person: figura humana ya proyectada */
  parts?: Deco[];
  shapes?: Shape[];
};
export type Deco =
  | { t: "text"; text: string; mx: [number, number, number, number, number, number]; size: number; fill: string; weight?: number; display?: boolean; anchor?: "start" | "middle"; ls?: string }
  | { t: "path"; d: string; fill?: string; fo?: number; stroke?: string; w?: number };
export type T2 = {
  id: string;
  text: string;
  x: number;
  y: number;
  a: number;
  b: number;
  size?: number;
  anchor?: "start" | "middle";
  fill?: string;
  weight?: number;
  rotate?: number;
  bg?: { x: number; y: number; w: number; h: number };
  minor?: boolean;
  ea?: number;
  eb?: number;
};
export type G2 = { id: string; els: E2[]; txs: T2[]; wf?: boolean; lg?: boolean };

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
const PAPER = "var(--paper-2)"; // la sección usa el fondo paper-2: el relleno de oclusión debe coincidir
const G = (n: string) => `url(#p-${n})`;

/* ---------------------------------------------------------------- modelo (metros) */

type Mats = { front?: string; side?: string; top?: string; body?: string };
type Plan = { kind: "rect" | "circle" | "wall" | "screen" | "flat"; u: [number, number]; fill?: string; fo?: number; stroke?: string };
type Obj = {
  id: string;
  shape: "box" | "cyl" | "person";
  /** person: figura proyectada */
  fig?: Shape[];
  x0: number; x1: number; y0: number; y1: number; z0: number; z1: number;
  /** cilindro: centro y radio (x0..y1 es su caja envolvente) */
  c?: { cx: number; cy: number; r: number };
  u: [number, number]; // ventana de dibujo 3D (unidades dentro de R3)
  mu: [number, number]; // ventana de materiales (dentro de RM)
  mats?: Mats;
  stroke?: string;
  frontTint?: [string, number];
  plan?: Plan;
  minor?: boolean;
};

const box = (id: string, x0: number, x1: number, y0: number, y1: number, z0: number, z1: number, o: Partial<Obj> = {}): Obj => ({
  id, shape: "box", x0, x1, y0, y1, z0, z1, u: [0, 0.2], mu: [0, 0.2], ...o,
});
const cyl = (id: string, cx: number, cy: number, r: number, z0: number, z1: number, o: Partial<Obj> = {}): Obj => ({
  id, shape: "cyl", x0: cx - r, x1: cx + r, y0: cy - r, y1: cy + r, z0, z1, c: { cx, cy, r }, u: [0, 0.2], mu: [0, 0.2], ...o,
});

export const STAND2 = { w: 9, d: 6, h: 3.2 } as const;

const PLAT = 0.12; // altura de la plataforma de exhibición
const WALL_H = 3.0;
const BEAM_Z0 = 3.0;
const BEAM_Z1 = 3.14;
const COL = 0.14;
const COL_X = [5.2, 8.8];
const COL_Y = [1.2, 3.8];

const WALL_MATS: Mats = { front: G("wall-f"), side: G("wall-s"), top: G("top") };
const GRAPHITE: Mats = { front: G("gr-f"), side: G("gr-s"), top: G("gr-t") };

const SCREENS = [
  { id: "pantalla-1", x0: 1.2, x1: 3.0 },
  { id: "pantalla-2", x0: 3.2, x1: 5.0 },
  { id: "pantalla-3", x0: 6.9, x1: 8.5 },
];

/** Personas del stand 2: cinco figuras repartidas por zonas (recepción, acceso, conversación, exhibición). */
const PEOPLE: Array<{ id: string; x: number; y: number; z0: number; u: [number, number]; spec: Parameters<typeof figure>[0] }> = [
  { id: "persona-1", x: 2.55, y: 3.95, z0: 0, u: [0.0, 0.5], spec: { dir: "tl", pose: "talk", h: 1.7, outfit: "blazer", top: WARDROBE.paper.top, topShade: WARDROBE.paper.shade, bottom: "#26363a", shirt: "#7fcfc0", skin: SKIN.a, hair: HAIR.brown, hairStyle: "bun", accent: "#64bdaf" } },
  { id: "persona-2", x: 4.75, y: 5.2, z0: 0, u: [0.15, 0.65], spec: { dir: "al", pose: "hold", h: 1.84, outfit: "blazer", top: WARDROBE.sand.top, topShade: WARDROBE.sand.shade, bottom: "#3a4c50", shirt: "#f6f3ea", skin: SKIN.c, hair: HAIR.black } },
  { id: "persona-3", x: 4.0, y: 2.95, z0: 0, u: [0.3, 0.8], spec: { dir: "tr", pose: "talk", h: 1.7, outfit: "dress", top: WARDROBE.teal.top, topShade: WARDROBE.teal.shade, bottom: "#d9c7a2", skin: SKIN.b, hair: HAIR.blond, hairStyle: "long", accent: "#d9c7a2" } },
  { id: "persona-4", x: 4.7, y: 2.65, z0: 0, u: [0.4, 0.9], spec: { dir: "al", pose: "stand", h: 1.86, outfit: "coat", top: WARDROBE.graphite.top, topShade: WARDROBE.graphite.shade, bottom: "#16221f", skin: SKIN.d, hair: HAIR.black, accent: "#64bdaf" } },
  { id: "persona-5", x: 5.65, y: 2.3, z0: 0.12, u: [0.5, 1.0], spec: { dir: "ar", pose: "point", h: 1.72, outfit: "tee", top: WARDROBE.mint.top, topShade: WARDROBE.mint.shade, bottom: "#26363a", skin: SKIN.a, hair: HAIR.chestnut, hairStyle: "wavy" } },
];

/** Objetos del stand. El orden de PINTADO se calcula por oclusión (ver sortPainter); el orden de
 *  aparición lo dan las ventanas u / mu / plan.u. */
const OBJS: Obj[] = [
  // Muros
  box("muro-trasero", 0, 9, 0, 0.15, 0, WALL_H, { u: [0.1, 0.4], mu: [0.1, 0.3], mats: WALL_MATS, plan: { kind: "wall", u: [0.2, 0.45] } }),
  box("muro-izquierdo", 0, 0.15, 0.15, 3.2, 0, WALL_H, { u: [0.15, 0.45], mu: [0.12, 0.32], mats: WALL_MATS, plan: { kind: "wall", u: [0.25, 0.5] } }),
  // Plataforma de exhibición (segundo nivel) y alfombra de reuniones
  box("plataforma", 5.0, 9.0, 1.0, 4.0, 0, PLAT, { u: [0, 0.3], mu: [0.02, 0.2], mats: { front: G("plat-f"), side: G("plat-s"), top: G("plat-t") }, plan: { kind: "rect", u: [0.3, 0.5], stroke: INK } }),
  // Video wall (3 pantallas) sobre el muro trasero
  ...SCREENS.map((s, i) =>
    box(s.id, s.x0, s.x1, 0.15, 0.21, 1.0, 2.45, {
      u: [0.55 + i * 0.07, 0.75 + i * 0.07], mu: [0.55 + i * 0.05, 0.8 + i * 0.05], stroke: TEAL,
      frontTint: ["var(--mint)", 0.45], mats: { front: G("scr-f"), side: G("scr-s"), top: G("scr-s") },
      plan: { kind: "screen", u: [0.45 + i * 0.05, 0.62 + i * 0.05] },
    }),
  ),
  // Panel gráfico independiente
  box("panel-grafico", 6.3, 6.45, 0.9, 2.4, 0, 2.6, { u: [0.5, 0.72], mu: [0.5, 0.72], mats: { front: G("pan-f"), side: G("pan-s"), top: G("top") }, plan: { kind: "wall", u: [0.55, 0.72] } }),
  // Pórtico: 4 columnas + 4 vigas
  ...COL_X.flatMap((x, i) =>
    COL_Y.map((y, j) =>
      box(`columna-${i}${j}`, x - COL / 2, x + COL / 2, y - COL / 2, y + COL / 2, PLAT, BEAM_Z1, {
        u: [0.3 + i * 0.05 + j * 0.04, 0.5 + i * 0.05 + j * 0.04], mu: [0.3, 0.5], mats: GRAPHITE,
        plan: { kind: "rect", u: [0.6, 0.78], stroke: INK },
      }),
    ),
  ),
  box("viga-trasera", COL_X[0] - COL / 2, COL_X[1] + COL / 2, COL_Y[0] - COL / 2, COL_Y[0] + COL / 2, BEAM_Z0, BEAM_Z1, { u: [0.45, 0.65], mu: [0.35, 0.55], mats: GRAPHITE }),
  box("viga-frontal", COL_X[0] - COL / 2, COL_X[1] + COL / 2, COL_Y[1] - COL / 2, COL_Y[1] + COL / 2, BEAM_Z0, BEAM_Z1, { u: [0.5, 0.7], mu: [0.35, 0.55], mats: GRAPHITE }),
  box("viga-izquierda", COL_X[0] - COL / 2, COL_X[0] + COL / 2, COL_Y[0] + COL / 2, COL_Y[1] - COL / 2, BEAM_Z0, BEAM_Z1, { u: [0.5, 0.7], mu: [0.35, 0.55], mats: GRAPHITE }),
  box("viga-derecha", COL_X[1] - COL / 2, COL_X[1] + COL / 2, COL_Y[0] + COL / 2, COL_Y[1] - COL / 2, BEAM_Z0, BEAM_Z1, { u: [0.55, 0.75], mu: [0.35, 0.55], mats: GRAPHITE }),
  // Recepción
  box("mostrador", 0.9, 4.2, 4.2, 4.8, 0, 1.05, { u: [0.6, 0.82], mu: [0.4, 0.62], mats: { front: G("gr-f"), side: G("gr-s"), top: G("ctr-t") }, plan: { kind: "rect", u: [0.45, 0.68], stroke: INK } }),
  ...[1.5, 2.5, 3.5].map((x, i) =>
    cyl(`banqueta-recepcion-${i + 1}`, x, 5.4, 0.2, 0, 0.72, { u: [0.78 + i * 0.04, 0.92 + i * 0.04], mu: [0.6, 0.75], mats: { body: G("stool"), top: G("stool-t") }, plan: { kind: "circle", u: [0.7 + i * 0.03, 0.8 + i * 0.03], stroke: INK }, minor: true }),
  ),
  // Zona de reuniones
  cyl("mesa-reuniones", 1.8, 2.2, 0.6, 0, 0.75, { u: [0.7, 0.9], mu: [0.55, 0.75], mats: { body: G("cyl-d"), top: G("wood-t") }, plan: { kind: "circle", u: [0.5, 0.7], stroke: INK } }),
  ...[[0.95, 2.3], [2.65, 2.0], [1.8, 3.15]].map(([x, y], i) =>
    cyl(`silla-${i + 1}`, x, y, 0.22, 0, 0.5, { u: [0.82 + i * 0.04, 0.96], mu: [0.65, 0.8], mats: { body: G("stool"), top: G("stool-t") }, plan: { kind: "circle", u: [0.62 + i * 0.03, 0.74 + i * 0.03], stroke: INK }, minor: true }),
  ),
  // Zona principal de exhibición (sobre la plataforma)
  cyl("isla-1", 7.4, 2.5, 0.5, PLAT, PLAT + 1.0, { u: [0.65, 0.88], mu: [0.6, 0.82], mats: { body: G("cyl"), top: G("cyl-t") }, plan: { kind: "circle", u: [0.52, 0.7], stroke: INK } }),
  cyl("isla-2", 8.2, 3.3, 0.35, PLAT, PLAT + 0.8, { u: [0.72, 0.92], mu: [0.65, 0.85], mats: { body: G("cyl"), top: G("cyl-t") }, plan: { kind: "circle", u: [0.56, 0.74], stroke: INK } }),
  box("vitrina", 5.3, 6.2, 3.0, 3.6, PLAT, PLAT + 0.95, { u: [0.7, 0.9], mu: [0.6, 0.82], mats: { front: G("wood-f"), side: G("wood-s"), top: G("wood-t") }, plan: { kind: "rect", u: [0.55, 0.72], stroke: INK } }),
  // Tótem en el frente
  box("totem", 8.3, 8.7, 4.6, 5.0, 0, 2.8, { u: [0.8, 1.0], mu: [0.7, 0.9], mats: { front: G("tot-f"), side: G("tot-s"), top: G("tot-t") }, plan: { kind: "rect", u: [0.7, 0.85], stroke: INK } }),
  // Personas (ocupan su posición en los últimos tramos del recorrido; se pintan por oclusión como el resto)
  ...PEOPLE.map(({ id, x, y, z0, u, spec }) => ({
    id, shape: "person" as const, x0: x - 0.22, x1: x + 0.22, y0: y - 0.22, y1: y + 0.22, z0, z1: z0 + 1.75,
    u, mu: [0, 0.2] as [number, number], fig: figure(spec, IS, Q3(x, y, z0)),
  })),
];

/* ---------------------------------------------------------------- orden de pintado (oclusión) */

/**
 * Orden topológico por oclusión: A se pinta antes que B si A está completamente "detrás" de B en
 * algún eje (A.x1<=B.x0, A.y1<=B.y0 o A.z1<=B.z0). Vale para cualquier orden temporal de aparición.
 */
function sortPainter(list: Obj[]): Obj[] {
  const n = list.length;
  const eps = 1e-6;
  const behind = (a: Obj, b: Obj) => a.x1 <= b.x0 + eps || a.y1 <= b.y0 + eps || a.z1 <= b.z0 + eps;
  const adj: number[][] = Array.from({ length: n }, () => []);
  const indeg = new Array(n).fill(0);
  for (let i = 0; i < n; i++)
    for (let j = 0; j < n; j++) {
      if (i === j) continue;
      const ab = behind(list[i], list[j]);
      const ba = behind(list[j], list[i]);
      if (ab && !ba) {
        adj[i].push(j);
        indeg[j]++;
      }
    }
  const key = (o: Obj) => o.x1 + o.y1 + o.z1 * 0.01;
  const ready = list.map((_, i) => i).filter((i) => indeg[i] === 0);
  const out: Obj[] = [];
  while (ready.length) {
    ready.sort((p, q) => key(list[p]) - key(list[q]));
    const i = ready.shift()!;
    out.push(list[i]);
    for (const j of adj[i]) if (--indeg[j] === 0) ready.push(j);
  }
  if (out.length < n) for (let i = 0; i < n; i++) if (!out.includes(list[i])) out.push(list[i]); // ciclos: conserva
  return out;
}

/* ---------------------------------------------------------------- 3D */

const rim = (cx: number, cy: number, r: number, z: number, th: number): Pt => Q3(cx + r * Math.cos(th), cy + r * Math.sin(th), z);
const ring = (cx: number, cy: number, r: number, z: number, n = 28): Pt[] =>
  Array.from({ length: n }, (_, i) => rim(cx, cy, r, z, (i / n) * Math.PI * 2));

function el(kind: E2["kind"], id: string, path: string, range: [number, number], u: [number, number], o: Partial<E2> = {}): E2 {
  const [a, b] = win(range, u[0], u[1]);
  return { id, kind, path, a, b, ...o };
}

function faces3(o: Obj): E2[] {
  if (o.shape === "person") return [el("person", `iso-${o.id}`, "", RP, o.u, { shapes: o.fig })];
  const [u0, u1] = o.u;
  const w = u1 - u0;
  const [m0, m1] = o.mu;
  const mw = m1 - m0;
  const stroke = o.stroke ?? INK;
  const out: E2[] = [];
  if (o.shape === "box") {
    const { x0, x1, y0, y1, z0, z1 } = o;
    const front = poly([Q3(x0, y1, z0), Q3(x1, y1, z0), Q3(x1, y1, z1), Q3(x0, y1, z1)]);
    const side = poly([Q3(x1, y0, z0), Q3(x1, y1, z0), Q3(x1, y1, z1), Q3(x1, y0, z1)]);
    const top = poly([Q3(x0, y0, z1), Q3(x1, y0, z1), Q3(x1, y1, z1), Q3(x0, y1, z1)]);
    out.push(el("face", `iso-${o.id}-frente`, front, R3, [u0, u0 + w * 0.6], { stroke, fill: PAPER, w: 1.5 }));
    if (o.frontTint) out.push(el("tint", `iso-${o.id}-frente-tinte`, front, R3, [u0 + w * 0.1, u0 + w * 0.6], { fill: o.frontTint[0], fo: o.frontTint[1] }));
    if (o.mats?.front) out.push(el("mat", `iso-${o.id}-frente-mat`, front, RM, [m0, m0 + mw * 0.7], { fill: o.mats.front }));
    out.push(el("face", `iso-${o.id}-costado`, side, R3, [u0 + w * 0.2, u0 + w * 0.75], { stroke, fill: PAPER, w: 1.5 }));
    out.push(el("tint", `iso-${o.id}-costado-tinte`, side, R3, [u0 + w * 0.2, u0 + w * 0.75], { fill: TEAL, fo: 0.08 }));
    if (o.mats?.side) out.push(el("mat", `iso-${o.id}-costado-mat`, side, RM, [m0 + mw * 0.1, m0 + mw * 0.8], { fill: o.mats.side }));
    out.push(el("face", `iso-${o.id}-tapa`, top, R3, [u0 + w * 0.45, u1], { stroke, fill: PAPER, w: 1.5 }));
    if (o.mats?.top) out.push(el("mat", `iso-${o.id}-tapa-mat`, top, RM, [m0 + mw * 0.2, m1], { fill: o.mats.top }));
  } else {
    const c = o.c!;
    const L = (3 * Math.PI) / 4;
    const R = -Math.PI / 4;
    const arc: Pt[] = [];
    for (let i = 0; i <= 14; i++) arc.push(rim(c.cx, c.cy, c.r, o.z0, L + ((R - L) * i) / 14));
    const body = `M${pt(rim(c.cx, c.cy, c.r, o.z1, L))}L${arc.map(pt).join("L")}L${pt(rim(c.cx, c.cy, c.r, o.z1, R))}Z`;
    const top = poly(ring(c.cx, c.cy, c.r, o.z1));
    out.push(el("face", `iso-${o.id}-cuerpo`, body, R3, [u0, u0 + w * 0.7], { stroke, fill: PAPER, w: 1.5 }));
    out.push(el("tint", `iso-${o.id}-cuerpo-tinte`, body, R3, [u0, u0 + w * 0.7], { fill: TEAL, fo: 0.08 }));
    if (o.mats?.body) out.push(el("mat", `iso-${o.id}-cuerpo-mat`, body, RM, [m0, m0 + mw * 0.8], { fill: o.mats.body }));
    out.push(el("face", `iso-${o.id}-tapa`, top, R3, [u0 + w * 0.4, u1], { stroke, fill: PAPER, w: 1.5 }));
    if (o.mats?.top) out.push(el("mat", `iso-${o.id}-tapa-mat`, top, RM, [m0 + mw * 0.2, m1], { fill: o.mats.top }));
  }
  return out.map((e) => (o.minor ? { ...e, minor: true } : e));
}

/** Plano horizontal / vertical de apoyo (acabados sobre geometría existente). */
const planeY = (x0: number, x1: number, y: number, z0: number, z1: number, pad = 0): Pt[] => [
  Q3(x0 - pad, y, z0 - pad), Q3(x1 + pad, y, z0 - pad), Q3(x1 + pad, y, z1 + pad), Q3(x0 - pad, y, z1 + pad),
];
const planeX = (x: number, y0: number, y1: number, z0: number, z1: number): Pt[] => [
  Q3(x, y0, z0), Q3(x, y1, z0), Q3(x, y1, z1), Q3(x, y0, z1),
];


/* ---------------------------------------------------------------- marca conceptual: malva */

/**
 * Marca conceptual del stand 2: malva (identidad demostrativa; no es un cliente ni un proyecto de
 * BenRed). Personalidad distinta a la del hero: minúsculas, trazo suave, tinta + menta + papel.
 */
export const BRAND2 = { name: "malva" };
const SC = IS / 100;
const mY = (x: number, y: number, z: number): [number, number, number, number, number, number] => {
  const [e, f] = Q3(x, y, z);
  return [IC * SC, 0.5 * SC, 0, SC, e, f];
};
/** Texto sobre una cara x+ (corre hacia -y: se lee de izquierda a derecha sin espejo). */
const mX = (x: number, y: number, z: number): [number, number, number, number, number, number] => {
  const [e, f] = Q3(x, y, z);
  return [IC * SC, -0.5 * SC, 0, SC, e, f];
};
const circY = (cx: number, y: number, cz: number, r: number, n = 30): Pt[] =>
  Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    return Q3(cx + r * Math.cos(a), y, cz + r * Math.sin(a));
  });
const circX = (x: number, cy: number, cz: number, r: number, n = 30): Pt[] =>
  Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    return Q3(x, cy + r * Math.cos(a), cz + r * Math.sin(a));
  });
const rectY2 = (x0: number, x1: number, y: number, z0: number, z1: number): Pt[] => [Q3(x0, y, z0), Q3(x1, y, z0), Q3(x1, y, z1), Q3(x0, y, z1)];
const rectX2 = (x: number, y0: number, y1: number, z0: number, z1: number): Pt[] => [Q3(x, y0, z0), Q3(x, y1, z0), Q3(x, y1, z1), Q3(x, y0, z1)];
const MALVA_INK = "#14201f";
const MALVA_MINT = "var(--mint)";
const deco = (id: string, range: [number, number], u: [number, number], parts: Deco[]): E2 => el("deco", id, "", range, u, { parts });
const wave = (x0: number, x1: number, y: number, zc: number, amp: number, k: number): string => {
  const pts: Pt[] = [];
  for (let i = 0; i <= 24; i++) {
    const x = x0 + ((x1 - x0) * i) / 24;
    pts.push(Q3(x, y, zc + amp * Math.sin((i / 24) * Math.PI * k)));
  }
  return open(pts);
};


/** Contenido abstracto de las pantallas (apagadas hasta el último tramo): marca, ondas y barras. */
const SCREEN_CONTENT: Array<() => Deco[]> = [
  () => [
    { t: "path", d: poly(rectY2(1.2, 3.0, 0.22, 1.0, 2.45)), fill: MALVA_INK, fo: 0.96 },
    { t: "path", d: poly(circY(2.1, 0.23, 1.95, 0.3)), fill: "none", stroke: MALVA_MINT, w: 1.8 },
    { t: "path", d: poly(circY(2.1, 0.23, 1.95, 0.12)), fill: MALVA_MINT },
    { t: "text", text: BRAND2.name, mx: mY(2.1, 0.23, 1.24), size: 24, fill: "var(--paper)", weight: 700, display: true, anchor: "middle" },
  ],
  () => [
    { t: "path", d: poly(rectY2(3.2, 5.0, 0.22, 1.0, 2.45)), fill: MALVA_INK, fo: 0.96 },
    { t: "path", d: wave(3.4, 4.8, 0.23, 2.0, 0.2, 2), fill: "none", stroke: MALVA_MINT, w: 2.2 },
    { t: "path", d: wave(3.4, 4.8, 0.23, 1.72, 0.2, 2), fill: "none", stroke: "var(--paper)", w: 1.4 },
    { t: "path", d: wave(3.4, 4.8, 0.23, 1.44, 0.2, 2), fill: "none", stroke: "var(--teal-deep)", w: 1.6 },
  ],
  () => [
    { t: "path", d: poly(rectY2(6.9, 8.5, 0.22, 1.0, 2.45)), fill: MALVA_INK, fo: 0.96 },
    { t: "path", d: poly(circY(7.7, 0.23, 1.72, 0.46)), fill: "none", stroke: MALVA_MINT, w: 1.4 },
    { t: "path", d: poly(circY(7.7, 0.23, 1.72, 0.3)), fill: "none", stroke: "var(--paper)", w: 1.2 },
    { t: "path", d: poly(circY(7.7, 0.23, 1.72, 0.12)), fill: MALVA_MINT },
  ],
];

export const ANCHORS = {
  A: { plan: Q2(4.1, 0.18), iso: Q3(4.1, 0.21, 1.75), name: "Pantallas" },
  B: { plan: Q2(4.2, 4.5), iso: Q3(1.7, 4.5, 1.05), name: "Recepción" },
  C: { plan: Q2(7.4, 2.5), iso: Q3(7.4, 2.5, PLAT + 1.0), name: "Exhibición" },
  D: { plan: Q2(8.8, 1.2), iso: Q3(8.8, 1.2, BEAM_Z1), name: "Pórtico" },
  E: { plan: Q2(1.8, 2.2), iso: Q3(1.8, 2.2, 0.75), name: "Reuniones" },
  F: { plan: Q2(8.5, 4.8), iso: Q3(8.5, 4.8, 2.8), name: "Tótem" },
  G: { plan: Q2(7.9, 0.05), iso: Q3(7.9, 0.15, 2.85), name: "Identidad" },
} as const;

function build3D(): G2[] {
  const g: G2[] = [];
  const floorPts = [Q3(0, 0, 0), Q3(9, 0, 0), Q3(9, 6, 0), Q3(0, 6, 0)];
  const carpet = poly([Q3(0.4, 1.0, 0), Q3(3.4, 1.0, 0), Q3(3.4, 3.6, 0), Q3(0.4, 3.6, 0)]);

  // Base: piso, alfombra, ambiente y sombras
  const sh = (id: string, o: Obj, m: [number, number]) =>
    el("mat", id, o.shape === "cyl" ? poly(ring(o.c!.cx + 0.14, o.c!.cy + 0.1, o.c!.r, 0, 24)) : poly([Q3(o.x0 + 0.1, o.y0 + 0.08, 0), Q3(o.x1 + 0.22, o.y0 + 0.08, 0), Q3(o.x1 + 0.22, o.y1 + 0.2, 0), Q3(o.x0 + 0.1, o.y1 + 0.2, 0)]), RM, m, { fill: INK, fo: 0.12 });
  const byId = (id: string) => OBJS.find((o) => o.id === id)!;
  g.push({
    id: "iso-base",
    wf: true,
    txs: [],
    els: [
      el("line", "iso-perimetro", poly(floorPts), R3, [0, 0.3], { stroke: INK, w: 2 }),
      el("tint", "iso-piso-tinte", poly(floorPts), R3, [0.1, 0.3], { fill: TEAL, fo: 0.05 }),
      el("mat", "iso-piso-mat", poly(floorPts), RM, [0, 0.2], { fill: G("floor") }),
      ...Array.from({ length: 17 }, (_, i) => el("mat", `iso-piso-junta-${i + 1}`, open([Q3(0.5 + i * 0.5, 0, 0), Q3(0.5 + i * 0.5, 6, 0)]), RM, [0.05, 0.22], { fill: "none", stroke: "rgb(30 40 40 / 0.09)", w: 1, minor: true })),
      el("line", "iso-alfombra", carpet, R3, [0.05, 0.3], { stroke: SOFT, w: 1.2 }),
      el("mat", "iso-alfombra-mat", carpet, RM, [0.08, 0.28], { fill: TEAL, fo: 0.2 }),
      el("mat", "iso-ambiente-trasero", poly([Q3(0, 0.15, 0), Q3(9, 0.15, 0), Q3(9, 0.7, 0), Q3(0, 0.7, 0)]), RM, [0.15, 0.35], { fill: INK, fo: 0.09 }),
      el("mat", "iso-ambiente-izquierdo", poly([Q3(0.15, 0.7, 0), Q3(0.7, 0.7, 0), Q3(0.7, 3.2, 0), Q3(0.15, 3.2, 0)]), RM, [0.15, 0.35], { fill: INK, fo: 0.07 }),
      sh("iso-sombra-mostrador", byId("mostrador"), [0.45, 0.65]),
      sh("iso-sombra-totem", byId("totem"), [0.7, 0.9]),
      sh("iso-sombra-mesa", byId("mesa-reuniones"), [0.55, 0.75]),
      sh("iso-sombra-plataforma", byId("plataforma"), [0.1, 0.3]),
    ],
  });

  // Objetos en orden de pintado (oclusión correcta, cualquiera que sea el orden de aparición)
  const painted = sortPainter(OBJS);
  g.push({ id: "iso-objetos", wf: true, txs: [], els: painted.flatMap((o) => faces3(o)) });

  // Acabados sobre la geometría: muros, panel, mostrador, totem, pórtico
  const wb = byId("muro-trasero");
  const wl = byId("muro-izquierdo");
  const tt = byId("totem");
  const cn = byId("mostrador");
  const pn = byId("panel-grafico");
  // (se insertan al final del orden de objetos: son superficies planas de acabado sobre caras ya
  //  pintadas; se colocan DESPUÉS del objeto que las porta, pero antes de los que lo ocultan)
  const finishes = (host: Obj, items: E2[]) => ({ host, items });
  const FIN = [
    finishes(wb, [
      el("mat", "iso-muro-trasero-zocalo", poly(planeY(0, 9, 0.15, 0, 0.12)), RM, [0.25, 0.4], { fill: INK, fo: 0.55 }),
      el("mat", "iso-muro-trasero-cabecera", poly(planeY(0, 9, 0.15, 2.6, WALL_H)), RM, [0.3, 0.45], { fill: TEAL, fo: 0.92 }),
      el("line", "iso-muro-trasero-friso-linea", open([Q3(0, 0.15, 2.6), Q3(9, 0.15, 2.6)]), R3, [0.5, 0.7], { stroke: SOFT, w: 1.1 }),
      deco("iso-muro-trasero-marca-friso", RM, [0.72, 0.86], [
        { t: "path", d: poly(circY(0.4, 0.15, 2.8, 0.1)), fill: MALVA_MINT },
        { t: "text", text: BRAND2.name, mx: mY(0.64, 0.15, 2.69), size: 30, fill: "var(--paper)", weight: 700, display: true, ls: "0.04em" },
      ]),
    ]),
    finishes(wl, [
      el("mat", "iso-muro-izquierdo-zocalo", poly(planeX(0.15, 0.15, 3.2, 0, 0.12)), RM, [0.3, 0.45], { fill: INK, fo: 0.55 }),
      el("mat", "iso-muro-izquierdo-cabecera", poly(planeX(0.15, 0.15, 3.2, 2.6, WALL_H)), RM, [0.35, 0.5], { fill: TEAL, fo: 0.92 }),
      deco("iso-muro-izquierdo-marca-friso", RM, [0.74, 0.88], [{ t: "text", text: BRAND2.name, mx: mX(0.15, 3.05, 2.69), size: 28, fill: "var(--paper)", weight: 700, display: true }]),
    ]),
    finishes(pn, [
      el("mat", "iso-panel-banda", poly(planeY(6.3, 6.45, 2.4, 1.6, 2.2)), RM, [0.55, 0.75], { fill: TEAL, fo: 0.9 }),
      el("line", "iso-panel-grafico-marco", poly(rectX2(6.45, 0.98, 2.32, 0.3, 2.45)), R3, [0.55, 0.75], { stroke: SOFT, w: 1.1 }),
      deco("iso-panel-grafico-marca", RM, [0.78, 0.92], [
        { t: "path", d: poly(rectX2(6.45, 0.98, 2.32, 0.3, 2.45)), fill: MALVA_INK, fo: 0.94 },
        { t: "path", d: poly(circX(6.45, 1.65, 1.72, 0.4)), fill: "none", stroke: MALVA_MINT, w: 2.2 },
        { t: "path", d: poly(circX(6.45, 1.65, 1.72, 0.15)), fill: MALVA_MINT },
        { t: "text", text: BRAND2.name, mx: mX(6.45, 2.24, 0.6), size: 34, fill: "var(--paper)", weight: 700, display: true },
      ]),
    ]),
    finishes(cn, [
      el("mat", "iso-mostrador-luz", open([Q3(0.9, 4.8, 0.95), Q3(4.2, 4.8, 0.95)]), RM, [0.55, 0.75], { fill: "none", stroke: "var(--mint)", w: 2 }),
      el("line", "iso-mostrador-placa", poly(rectY2(1.0, 4.1, 4.8, 0.15, 0.8)), R3, [0.7, 0.9], { stroke: SOFT, w: 1.1 }),
      deco("iso-mostrador-marca", RM, [0.8, 0.92], [{ t: "text", text: BRAND2.name, mx: mY(2.55, 4.8, 0.33), size: 30, fill: MALVA_MINT, weight: 700, display: true, anchor: "middle" }]),
    ]),
    finishes(tt, [
      el("mat", "iso-totem-panel", poly(planeY(8.34, 8.66, 5.0, 1.6, 2.4)), RM, [0.8, 0.95], { fill: G("lit") }),
      deco("iso-totem-marca", RM, [0.86, 0.96], [
        { t: "path", d: poly(circY(8.5, 5.0, 2.0, 0.115)), fill: "none", stroke: MALVA_INK, w: 1.5 },
        { t: "path", d: poly(circY(8.5, 5.0, 2.0, 0.05)), fill: MALVA_INK },
      ]),
    ]),
    // Pantallas encendidas (estado final), luces del pórtico y estela de luz sobre la plataforma:
    // se insertan tras su anfitrión para respetar la oclusión de lo que se pinta después.
    ...SCREENS.map((s, i) =>
      finishes(byId(s.id), [
        el("mat", `iso-${s.id}-halo`, poly(planeY(s.x0, s.x1, 0.15, 1.0, 2.45, 0.16)), RL, [0.05 + i * 0.1, 0.55 + i * 0.1], { fill: "var(--mint)", fo: 0.22 }),
        el("mat", `iso-${s.id}-encendida`, poly(planeY(s.x0, s.x1, 0.21, 1.0, 2.45)), RL, [0.1 + i * 0.1, 0.65 + i * 0.1], { fill: G("scr-on") }),
        deco(`iso-${s.id}-contenido`, RL, [0.35 + i * 0.1, 0.8 + i * 0.1], SCREEN_CONTENT[i]()),
      ]),
    ),
    finishes(byId("viga-frontal"), [6.0, 7.0, 8.0].map((x, i) => el("mat", `iso-luz-${i + 1}`, circle(Q3(x, 3.8, BEAM_Z0), 6), RL, [0.4 + i * 0.1, 0.7 + i * 0.1], { fill: "var(--mint)", fo: 0.95 }))),
    finishes(byId("plataforma"), [el("mat", "iso-luz-estela", poly([Q3(5.4, 1.4, PLAT), Q3(8.6, 1.4, PLAT), Q3(8.6, 3.6, PLAT), Q3(5.4, 3.6, PLAT)]), RL, [0.5, 1], { fill: "var(--mint)", fo: 0.1 })]),
  ];
  // Reinsertar: cada grupo de acabados justo tras la última cara del objeto anfitrión
  const els = g[g.length - 1].els;
  for (const { host, items } of FIN) {
    let last = -1;
    els.forEach((e, i) => {
      if (e.id.startsWith(`iso-${host.id}-`)) last = i;
    });
    els.splice(last + 1, 0, ...items);
  }

  return g;
}

/* ---------------------------------------------------------------- 2D */

function rect2(o: Obj): string {
  return poly([Q2(o.x0, o.y0), Q2(o.x1, o.y0), Q2(o.x1, o.y1), Q2(o.x0, o.y1)]);
}

function build2D(): G2[] {
  const g: G2[] = [];
  const withErase = (e: E2): E2 => {
    // lo último que se dibujó se borra primero (inverso del trazado)
    const rev = 1 - (e.b - R2[0]) / (R2[1] - R2[0]);
    const ea = RE[0] + (RE[1] - RE[0]) * Math.max(0, Math.min(1, rev)) * 0.55;
    return { ...e, ea, eb: ea + (RE[1] - RE[0]) * 0.45 };
  };

  // Perímetro (un trazo continuo, dos frentes abiertos señalados con jambas)
  const per = [Q2(0, 0), Q2(9, 0), Q2(9, 6), Q2(0, 6)];
  g.push({
    id: "plano-perimetro",
    txs: [],
    els: [
      el("line", "plano-perimetro-trazo", `${poly(per)}`, R2, [0, 0.3], { stroke: INK, w: 2 }),
      el("line", "plano-acceso-frente", open([Q2(2.4, 6), Q2(2.4, 5.8)]) + open([Q2(8.0, 6), Q2(8.0, 5.8)]), R2, [0.25, 0.4], { stroke: INK, w: 1.5 }),
    ].map(withErase),
  });

  // Objetos del modelo en planta
  const els: E2[] = [];
  for (const o of OBJS) {
    if (!o.plan) continue;
    const p = o.plan;
    const path = p.kind === "circle" ? circle(Q2(o.c!.cx, o.c!.cy), o.c!.r * K) : rect2(o);
    const stroke = p.stroke ?? INK;
    els.push(el("line", `plano-${o.id}`, path, R2, p.u, { stroke, w: p.kind === "wall" ? 1 : 1.6 }));
    if (p.kind === "wall") els.push(el("tint", `plano-${o.id}-relleno`, path, R2, [p.u[1], p.u[1] + 0.05], { fill: INK, fo: 1 }));
    if (p.kind === "screen") els.push(el("tint", `plano-${o.id}-relleno`, path, R2, [p.u[1], p.u[1] + 0.05], { fill: "var(--mint)", fo: 0.85 }));
  }
  // Plataforma: rayado ligero
  const plat = OBJS.find((o) => o.id === "plataforma")!;
  els.push(el("tint", "plano-plataforma-relleno", rect2(plat), R2, [0.5, 0.56], { fill: TEAL, fo: 0.07 }));
  // Alfombra de reuniones
  const carpet = poly([Q2(0.4, 1.0), Q2(3.4, 1.0), Q2(3.4, 3.6), Q2(0.4, 3.6)]);
  els.push(el("line", "plano-alfombra", carpet, R2, [0.3, 0.5], { stroke: SOFT, w: 1.2 }));
  els.push(el("tint", "plano-alfombra-relleno", carpet, R2, [0.5, 0.55], { fill: TEAL, fo: 0.1 }));
  // Pórtico (proyección superior): marco de vigas en trazo fino + cruces en columnas
  const fr = poly([Q2(COL_X[0], COL_Y[0]), Q2(COL_X[1], COL_Y[0]), Q2(COL_X[1], COL_Y[1]), Q2(COL_X[0], COL_Y[1])]);
  els.push(el("line", "plano-portico", fr, R2, [0.6, 0.82], { stroke: SOFT, w: 1.4 }));
  const xs = COL_X.flatMap((x) => COL_Y.map((y) => open([Q2(x - 0.1, y - 0.1), Q2(x + 0.1, y + 0.1)]) + open([Q2(x + 0.1, y - 0.1), Q2(x - 0.1, y + 0.1)])));
  els.push(el("line", "plano-portico-cruces", xs.join(""), R2, [0.75, 0.9], { stroke: SOFT, w: 1, minor: true }));
  g.push({ id: "plano-objetos", txs: [], els: els.map(withErase) });

  // Identidad desde el plano: friso (anotación técnica discreta sobre el muro trasero)
  const frisoLn = withErase(el("line", "plano-marca-friso", `M80 80H330M80 76V84M330 76V84`, R2, [0.84, 0.98], { stroke: SOFT, w: 1 }));
  const frTxt = winAB(R2, 0.9, 1);
  const frRev = 1 - (frTxt.b - R2[0]) / (R2[1] - R2[0]);
  const frEa = RE[0] + (RE[1] - RE[0]) * Math.max(0, Math.min(1, frRev)) * 0.55;
  g.push({
    id: "plano-marca",
    els: [frisoLn],
    txs: [{ id: "plano-marca-friso-texto", text: "FRISO · IDENTIDAD", x: 82, y: 72, ...frTxt, ea: frEa, eb: frEa + (RE[1] - RE[0]) * 0.45, size: 10 }],
  });

  // Cotas
  const cotas: E2[] = [
    el("line", "plano-cota-x", `M80 495H620M80 485V505M620 485V505`, R2, [0.8, 1], { stroke: SIGNAL, w: 1.8 }),
    el("line", "plano-cota-y", `M40 90V450M30 90H50M30 450H50`, R2, [0.82, 1], { stroke: SIGNAL, w: 1.8 }),
  ].map(withErase);
  g.push({
    id: "plano-cotas",
    els: cotas,
    txs: [
      { id: "plano-cota-x-texto", text: "9,00 m", x: 350, y: 501, ...winAB(R2, 0.9, 1), anchor: "middle", fill: SIGNAL, weight: 600, size: 16, bg: { x: 313, y: 484, w: 74, h: 24 } },
      { id: "plano-cota-y-texto", text: "6,00 m", x: 22, y: 276, ...winAB(R2, 0.9, 1), anchor: "middle", fill: SIGNAL, weight: 600, size: 16, rotate: -90, bg: { x: -16, y: 258, w: 76, h: 24 } },
    ],
  });
  return g;
}

/* ---------------------------------------------------------------- marcadores y leyenda */

function markers(view: "plan" | "iso"): G2 {
  const keys = Object.keys(ANCHORS) as Array<keyof typeof ANCHORS>;
  const range = view === "plan" ? R2 : R3;
  return {
    id: `${view === "plan" ? "plano" : "iso"}-marcadores`,
    lg: true,
    els: keys.map((k, i) => {
      const a = ANCHORS[k][view];
      const e = el("face", `${view}-marcador-${k}`, circle(a, 9), range, [0.8 + i * 0.03, 0.92 + i * 0.03], { stroke: INK, fill: PAPER, w: 1.3 });
      if (view === "plan") {
        const rev = 1 - (e.b - R2[0]) / (R2[1] - R2[0]);
        const ea = RE[0] + (RE[1] - RE[0]) * rev * 0.55;
        return { ...e, ea, eb: ea + (RE[1] - RE[0]) * 0.45 };
      }
      return e;
    }),
    txs: keys.map((k, i) => {
      const a = ANCHORS[k][view];
      const [wa, wb] = win(range, 0.84 + i * 0.03, 0.95 + i * 0.03);
      const t: T2 = { id: `${view}-marcador-${k}-letra`, text: k, x: a[0], y: a[1] + 4.5, a: wa, b: wb, anchor: "middle", size: 12, weight: 700 };
      if (view === "plan") {
        const rev = 1 - (wb - R2[0]) / (R2[1] - R2[0]);
        t.ea = RE[0] + (RE[1] - RE[0]) * rev * 0.55;
        t.eb = t.ea + (RE[1] - RE[0]) * 0.45;
      }
      return t;
    }),
  };
}

export function legend(): G2 {
  const keys = Object.keys(ANCHORS) as Array<keyof typeof ANCHORS>;
  return {
    id: "leyenda",
    lg: true,
    els: [],
    txs: keys.map((k, i) => {
      const [a, b] = win(R2, 0.9, 1);
      return { id: `leyenda-${k}`, text: `${k} · ${ANCHORS[k].name}`, x: 664, y: 118 + i * 30, a, b, size: 14 };
    }),
  };
}

/* ---------------------------------------------------------------- 3D: cotas (se borran con el 3D, no) */

function cotas3D(): G2 {
  const cx0 = Q3(0, 6.7, 0);
  const cx1 = Q3(9, 6.7, 0);
  const cy0 = Q3(-0.7, 0, 0);
  const cy1 = Q3(-0.7, 6, 0);
  const mx = Q3(2.6, 6.7, 0);
  const my: Pt = [(cy0[0] + cy1[0]) / 2, (cy0[1] + cy1[1]) / 2];
  return {
    id: "iso-cotas",
    els: [
      el("line", "iso-cota-x", `${open([cx0, cx1])}${open([Q3(0, 6.5, 0), Q3(0, 6.9, 0)])}${open([Q3(9, 6.5, 0), Q3(9, 6.9, 0)])}`, R3, [0.85, 1], { stroke: SIGNAL, w: 1.8 }),
      el("line", "iso-cota-y", `${open([cy0, cy1])}${open([Q3(-0.9, 0, 0), Q3(-0.5, 0, 0)])}${open([Q3(-0.9, 6, 0), Q3(-0.5, 6, 0)])}`, R3, [0.88, 1], { stroke: SIGNAL, w: 1.8 }),
    ],
    txs: [
      { id: "iso-cota-x-texto", text: "9,00 m", x: mx[0], y: mx[1] + 6, ...winAB(R3, 0.95, 1), anchor: "middle", fill: SIGNAL, weight: 600, size: 16, bg: { x: mx[0] - 37, y: mx[1] - 11, w: 74, h: 24 } },
      { id: "iso-cota-y-texto", text: "6,00 m", x: my[0], y: my[1] + 6, ...winAB(R3, 0.95, 1), anchor: "middle", fill: SIGNAL, weight: 600, size: 16, bg: { x: my[0] - 37, y: my[1] - 11, w: 74, h: 24 } },
    ],
  };
}

/* ---------------------------------------------------------------- degradados */

export type Grad = { id: string; kind?: "linear" | "radial"; v?: boolean; cx?: number; cy?: number; stops: Array<[number, string]> };
const V = true;
export const GRADS: Grad[] = [
  { id: "p-wall-f", v: V, stops: [[0, "#fbf9f4"], [1, "#e6e1d4"]] },
  { id: "p-wall-s", v: V, stops: [[0, "#e4dfd2"], [1, "#cdc7b7"]] },
  { id: "p-top", stops: [[0, "#ffffff"], [1, "#ece7da"]] },
  { id: "p-floor", v: V, stops: [[0, "#d7d3c8"], [1, "#e6e2d8"]] },
  { id: "p-plat-f", v: V, stops: [[0, "#cdbf9f"], [1, "#b8a885"]] },
  { id: "p-plat-s", v: V, stops: [[0, "#a99a78"], [1, "#8f8160"]] },
  { id: "p-plat-t", stops: [[0, "#e4d8bd"], [1, "#d3c4a2"]] },
  { id: "p-gr-f", v: V, stops: [[0, "#3a4d52"], [1, "#16221f"]] },
  { id: "p-gr-s", v: V, stops: [[0, "#26363a"], [1, "#0d1517"]] },
  { id: "p-gr-t", stops: [[0, "#566a6e"], [1, "#3a4c50"]] },
  { id: "p-ctr-t", stops: [[0, "#ffffff"], [1, "#e4dfd2"]] },
  { id: "p-pan-f", v: V, stops: [[0, "#fdfbf6"], [1, "#e6e1d4"]] },
  { id: "p-pan-s", v: V, stops: [[0, "#cfc9ba"], [1, "#b3ad9d"]] },
  { id: "p-wood-f", v: V, stops: [[0, "#dccaa4"], [1, "#c4ae83"]] },
  { id: "p-wood-s", v: V, stops: [[0, "#bba67c"], [1, "#9d885f"]] },
  { id: "p-wood-t", stops: [[0, "#eddfc0"], [1, "#dcc9a3"]] },
  { id: "p-tot-f", v: V, stops: [[0, "#33454a"], [1, "#16221f"]] },
  { id: "p-tot-s", v: V, stops: [[0, "#1f2d30"], [1, "#0d1517"]] },
  { id: "p-tot-t", stops: [[0, "#566a6e"], [1, "#3a4c50"]] },
  { id: "p-lit", v: V, stops: [[0, "#d4f4ec"], [1, "#64bdaf"]] },
  { id: "p-scr-f", stops: [[0, "#9fb6b3"], [0.55, "#6f8f8c"], [1, "#2b5257"]] },
  { id: "p-scr-s", v: V, stops: [[0, "#2b5257"], [1, "#183436"]] },
  { id: "p-scr-on", stops: [[0, "#d9f7ef"], [0.5, "#8fe0cf"], [1, "#2f9096"]] },
  { id: "p-cyl", stops: [[0, "#fdfbf6"], [0.45, "#ebe6d9"], [1, "#b9b3a3"]] },
  { id: "p-cyl-d", stops: [[0, "#4a5d61"], [0.5, "#2c3d40"], [1, "#0d1517"]] },
  { id: "p-cyl-t", stops: [[0, "#ffffff"], [1, "#ebe6d9"]] },
  { id: "p-stool", stops: [[0, "#2f9096"], [1, "#014a55"]] },
  { id: "p-stool-t", stops: [[0, "#4aa7ab"], [1, "#1b6f77"]] },
];

/* ---------------------------------------------------------------- resultado */

export const DRAWING2 = {
  plan: [...build2D(), markers("plan")],
  iso: [...build3D(), cotas3D(), markers("iso")],
  legend: legend(),
};
