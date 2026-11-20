/**
 * Escenario conceptual (identidad ficticia: isotipo abstracto sin texto) (visualización conceptual de producción de eventos).
 * NO es un evento ejecutado por BenRed ni tiene relación con el Tunja Tattoo Festival.
 *
 * Independiente de los dos stands: cámara, ids (`cs-*`), degradados (`c-*`) y motor propios.
 *
 * Cámara: perspectiva frontal con ligera elevación, UNA sola para todas las fases (no hay saltos):
 *     sx = X0 + F·x / (y + D)        sy = Y0 + F·(CZ − z) / (y + D)
 * x lateral (0 = eje del escenario), y profundidad (0 = borde frontal de la tarima, + hacia el fondo,
 * − hacia el público), z altura. Un plano frontal (y = cte) se proyecta como un rectángulo exacto.
 *
 * Progreso de scroll p (0..1), un solo mundo:
 *   0.02–0.24  concepto: líneas técnicas, cotas y anotaciones
 *   0.24–0.54  montaje: la estructura toma volumen (rellenos y materiales)
 *   0.46–0.80  producción: transición a ambiente nocturno, pantallas con identidad, artistas
 *   0.74–0.98  espectáculo: luces, haces y público
 */

import { figure, HAIR, SKIN, WARDROBE, type FigSpec, type Shape } from "./figures";

type Pt = readonly [number, number];
type Win = [number, number];

/* ---------------------------------------------------------------- cámara */

const F = 1560;
const D = 40;
const CZ = 5;
const X0 = 400;
const Y0 = 190;
export const P = (x: number, y: number, z: number): Pt => [X0 + (F * x) / (y + D), Y0 + (F * (CZ - z)) / (y + D)];
const scale = (y: number) => F / (y + D);

/* ---------------------------------------------------------------- ventanas de progreso */

const R1: Win = [0.02, 0.24]; // trazo técnico
const RC: Win = [0.24, 0.54]; // construcción (rellenos y materiales de día)
const RE: Win = [0.44, 0.55]; // retirada de cotas
const RLED: Win = [0.5, 0.7]; // identidad en pantallas
const RART: Win = [0.62, 0.8]; // artistas
const RBEAM: Win = [0.74, 0.94]; // luces y haces
const RCROWD: Win = [0.8, 0.98]; // público
export const NIGHT: Win = [0.46, 0.8]; // transición de ambiente

const lerp = (r: Win, u: number) => r[0] + (r[1] - r[0]) * u;
const win = (r: Win, u: Win): Win => {
  const a = lerp(r, u[0]);
  let b = lerp(r, u[1]);
  if (b - a < 0.012) b = a + 0.012;
  return [a, b];
};

/* ---------------------------------------------------------------- tipos de salida */

export type Deco =
  | { t: "text"; text: string; x: number; y: number; size: number; fill: string; weight?: number; display?: boolean; anchor?: "start" | "middle"; ls?: string }
  | { t: "path"; d: string; fill?: string; fo?: number; stroke?: string; w?: number };

export type CE = {
  id: string;
  /** line: trazo dibujado por progreso · mat: relleno/material con ventana · beam: haz o resplandor · person: figura · deco: marca */
  kind: "line" | "mat" | "beam" | "person" | "deco";
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
  shapes?: Shape[];
  parts?: Deco[];
  /** person: desplazamiento de entrada (px) */
  dx?: number;
  dy?: number;
};
export type CT = { id: string; text: string; x: number; y: number; a: number; b: number; ea: number; eb: number; size?: number; anchor?: "start" | "middle"; rotate?: number; minor?: boolean };
export type CG = { id: string; els: CE[]; txs?: CT[] };
export type Grad = { id: string; kind?: "linear" | "radial"; v?: boolean; stops: Array<[number, string, string, number?]> }; // offset, día, noche, opacidad

/* ---------------------------------------------------------------- utilidades */

const f1 = (n: number) => Math.round(n * 10) / 10;
const pt = (p: Pt) => `${f1(p[0])} ${f1(p[1])}`;
const poly = (pts: Pt[]) => `M${pts.map(pt).join("L")}Z`;
const open = (pts: Pt[]) => `M${pts.map(pt).join("L")}`;
const circlePath = (c: Pt, r0: number) => {
  const r = f1(r0);
  return `M${f1(c[0] - r)} ${f1(c[1])}a${r} ${r} 0 1 0 ${f1(2 * r)} 0a${r} ${r} 0 1 0 ${f1(-2 * r)} 0Z`;
};
const ellipsePath = (c: Pt, rx: number, ry: number) =>
  `M${f1(c[0] - rx)} ${f1(c[1])}a${f1(rx)} ${f1(ry)} 0 1 0 ${f1(2 * rx)} 0a${f1(rx)} ${f1(ry)} 0 1 0 ${f1(-2 * rx)} 0Z`;
const G = (n: string) => `url(#c-${n})`;
const LINE = "currentColor"; // el color de las líneas de estructura pasa de tinta a acero claro con el ambiente
const SIGNAL = "var(--signal)";
const MINT = "var(--mint)";

/* ---------------------------------------------------------------- escena: parámetros (metros) */

const HALF = 7; // media anchura de la tarima
const DECK_H = 1.2;
const DECK_D = 8;
const TRUSS_Z0 = 8.7;
const TRUSS_Z1 = 9.2;
const COLX = 7.4;

type Box = { x0: number; x1: number; y0: number; y1: number; z0: number; z1: number };
type Mats = { front?: string; side?: string; top?: string };
type Plan = { u: Win; c: Win; mats: Mats; minor?: boolean; faces?: "f" | "ft" };

const elements: CE[] = []; // elementos de la capa "struct" en orden de pintado (de atrás hacia delante)
const struct = (e: CE) => elements.push(e);

const el = (kind: CE["kind"], id: string, path: string, r: Win, u: Win, o: Partial<CE> = {}): CE => {
  const [a, b] = win(r, u);
  return { id, kind, path, a, b, ...o };
};

/** Caja con las caras visibles desde la cámara: frente, tapa (o base si queda sobre la cámara) y el costado que mira al eje. */
function solid(id: string, b: Box, plan: Plan) {
  const { x0, x1, y0, y1, z0, z1 } = b;
  const cx = (x0 + x1) / 2;
  const faces: Array<[string, Pt[], string | undefined]> = [];
  faces.push(["frente", [P(x0, y0, z0), P(x1, y0, z0), P(x1, y0, z1), P(x0, y0, z1)], plan.mats.front]);
  if (plan.faces !== "f" && z1 <= CZ) faces.push(["tapa", [P(x0, y0, z1), P(x1, y0, z1), P(x1, y1, z1), P(x0, y1, z1)], plan.mats.top]);
  else if (plan.faces !== "f" && z0 >= CZ) faces.push(["base", [P(x0, y0, z0), P(x1, y0, z0), P(x1, y1, z0), P(x0, y1, z0)], plan.mats.top]);
  if (plan.faces) void 0;
  else if (x0 > 0) faces.push(["costado", [P(x0, y0, z0), P(x0, y1, z0), P(x0, y1, z1), P(x0, y0, z1)], plan.mats.side]);
  else if (x1 < 0) faces.push(["costado", [P(x1, y0, z0), P(x1, y1, z0), P(x1, y1, z1), P(x1, y0, z1)], plan.mats.side]);
  void cx;
  faces.forEach(([name, pts, mat], i) => {
    const w = plan.c;
    const wc: Win = [w[0] + (w[1] - w[0]) * i * 0.12, w[1]];
    if (mat) struct(el("mat", `${id}-${name}-mat`, poly(pts), RC, wc, { fill: mat, fo: 1, minor: plan.minor }));
    struct(el("line", `${id}-${name}`, poly(pts), R1, plan.u, { stroke: LINE, w: 1.3, minor: plan.minor }));
  });
  return faces;
}

/** Celosía de truss sobre la cara frontal: zigzag entre cordones. */
function lattice(id: string, b: Box, axis: "x" | "z", u: Win, step = 0.7) {
  const pts: Pt[] = [];
  if (axis === "x") {
    const n = Math.max(2, Math.round((b.x1 - b.x0) / step));
    for (let i = 0; i <= n; i++) pts.push(P(b.x0 + ((b.x1 - b.x0) * i) / n, b.y0, i % 2 ? b.z1 : b.z0));
  } else {
    const n = Math.max(2, Math.round((b.z1 - b.z0) / step));
    for (let i = 0; i <= n; i++) pts.push(P(i % 2 ? b.x1 : b.x0, b.y0, b.z0 + ((b.z1 - b.z0) * i) / n));
  }
  struct(el("line", id, open(pts), R1, u, { stroke: LINE, w: 0.8, minor: true }));
}

/* ---------------------------------------------------------------- materiales (gradientes día/noche) */

const MAT = {
  deckTop: { top: G("deck-t"), front: G("deck-f"), side: G("deck-f") },
  steel: { front: G("steel-f"), top: G("steel-t"), side: G("steel-s") },
  black: { front: G("black-f"), top: G("black-t"), side: G("black-s") },
  pa: { front: G("pa-f"), top: G("pa-t"), side: G("pa-s") },
  led: { front: G("led-off"), top: G("black-t"), side: G("black-s") },
  wood: { front: G("wood-f"), top: G("wood-t"), side: G("wood-s") },
  cloth: { front: G("cloth"), top: G("black-t"), side: G("black-s") },
};

const GRADS_RAW: Grad[] = [
  { id: "c-deck-t", stops: [[0, "#d8d2c4", "#2b3a3e"], [1, "#c3bcab", "#1c282b"]] },
  { id: "c-deck-f", v: true, stops: [[0, "#2c3a3e", "#141d20"], [1, "#192326", "#0b1112"]] },
  { id: "c-steel-f", v: true, stops: [[0, "#cfd6d7", "#586a6e"], [1, "#9ea9ab", "#36464a"]] },
  { id: "c-steel-t", stops: [[0, "#e4e9e9", "#6d8286"], [1, "#c7d0d1", "#4a5d61"]] },
  { id: "c-steel-s", v: true, stops: [[0, "#aab4b6", "#405256"], [1, "#7e8a8d", "#27343a"]] },
  { id: "c-black-f", v: true, stops: [[0, "#2b3538", "#10181b"], [1, "#161d1f", "#080d0e"]] },
  { id: "c-black-t", stops: [[0, "#43504f", "#1d292c"], [1, "#2c3739", "#121a1c"]] },
  { id: "c-black-s", v: true, stops: [[0, "#1f282a", "#0c1315"], [1, "#101618", "#060a0b"]] },
  { id: "c-pa-f", v: true, stops: [[0, "#3e4a4d", "#1b2629"], [1, "#222c2e", "#0e1517"]] },
  { id: "c-pa-t", stops: [[0, "#5a6a6e", "#2a393d"], [1, "#46545a", "#1d292d"]] },
  { id: "c-pa-s", v: true, stops: [[0, "#2c373a", "#121b1d"], [1, "#192124", "#0a1011"]] },
  { id: "c-led-off", v: true, stops: [[0, "#26302f", "#0c1315"], [1, "#141b1c", "#070b0c"]] },
  { id: "c-wood-f", v: true, stops: [[0, "#dccaa4", "#4a4130"], [1, "#c4ae83", "#312b20"]] },
  { id: "c-wood-t", stops: [[0, "#eddfc0", "#5c5240"], [1, "#dcc9a3", "#463d2e"]] },
  { id: "c-wood-s", v: true, stops: [[0, "#bba67c", "#3a3325"], [1, "#9d885f", "#272118"]] },
  { id: "c-cloth", v: true, stops: [[0, "#2a3437", "#0e1517"], [1, "#171e20", "#070b0c"]] },
  { id: "c-ground", v: true, stops: [[0, "#0d1517", "#0d1517"], [1, "#142023", "#142023"]] },
  { id: "c-kit", stops: [[0, "#f1ede3", "#6f8588"], [1, "#b9b3a3", "#33444a"]] },
  { id: "c-amp", v: true, stops: [[0, "#4a5a5e", "#222f33"], [1, "#2b3a3e", "#10191c"]] },
];
/** Estado "apagado" sobre fondo negro: los colores de día se atenúan hacia el fondo (misma oscuridad de escena en todas las fases). */
const dim = (h: string) => "#" + [1, 3, 5].map((i) => Math.round(parseInt(h.slice(i, i + 2), 16) * 0.5 + (i === 1 ? 13 : i === 3 ? 21 : 23) * 0.5).toString(16).padStart(2, "0")).join("");
export const GRADS: Grad[] = GRADS_RAW.map((g) => (g.id === "c-ground" ? g : { ...g, stops: g.stops.map(([o, d, n]) => [o, dim(d), n] as [number, string, string]) }));
/** Degradados de luz (no cambian con el ambiente). */
export const LIGHT_GRADS = [
  { id: "c-beam-mint", color: "#64bdaf" },
  { id: "c-beam-orange", color: "#ff7a45" },
  { id: "c-beam-white", color: "#d8fff4" },
];

/* ---------------------------------------------------------------- 1 · estructura, en orden de pintado */

function buildStruct() {
  // Suelo del recinto (público) con cuadrícula técnica en perspectiva
  const ground = [P(-18, -22, 0), P(18, -22, 0), P(18, DECK_D, 0), P(-18, DECK_D, 0)];
  struct(el("mat", "suelo", poly(ground), RC, [0, 0.3], { fill: G("ground"), fo: 1 }));
  const gx: string[] = [];
  for (let x = -16; x <= 16; x += 2) gx.push(open([P(x, -22, 0), P(x, DECK_D, 0)]));
  for (let y = -20; y <= DECK_D; y += 2) gy(y, gx);
  struct(el("line", "suelo-cuadricula", gx.join(""), R1, [0, 0.8], { stroke: LINE, w: 0.6, minor: true }));

  // Fondo de tela detrás de la pantalla central
  solid("fondo", { x0: -HALF - 0.4, x1: HALF + 0.4, y0: DECK_D, y1: DECK_D + 0.1, z0: DECK_H, z1: 7.6 }, { u: [0, 0.3], c: [0.1, 0.35], mats: MAT.cloth });

  // Tarima (la tapa y el frente forman el "borde" técnico del escenario)
  solid("tarima", { x0: -HALF, x1: HALF, y0: 0, y1: DECK_D, z0: 0, z1: DECK_H }, { u: [0, 0.3], c: [0, 0.3], mats: MAT.deckTop });
  // Rótulo en el faldón de la tarima (identidad del evento)
  const skirtL = P(-5.2, 0, 0.78);
  const [ma, mb] = win(RLED, [0.3, 0.9]);
  struct({ id: "tarima-marca", kind: "deco", path: "", a: ma, b: mb,
    parts: isotipo(skirtL[0] + 0.3 * scale(0), P(-5.2, 0, 0.6)[1], 0.3 * scale(0)) });

  // Columnas traseras y viga trasera del truss
  for (const s of [-1, 1]) {
    const bx: Box = { x0: s * COLX - 0.25, x1: s * COLX + 0.25, y0: 6.9, y1: 7.4, z0: DECK_H, z1: TRUSS_Z0 };
    solid(`columna-tras-${s < 0 ? "i" : "d"}`, bx, { u: [0.2, 0.45], c: [0.2, 0.4], mats: MAT.steel });
    lattice(`columna-tras-${s < 0 ? "i" : "d"}-celosia`, bx, "z", [0.3, 0.55], 0.8);
  }
  const rb: Box = { x0: -COLX - 0.25, x1: COLX + 0.25, y0: 6.9, y1: 7.4, z0: TRUSS_Z0, z1: TRUSS_Z1 };
  solid("truss-trasero", rb, { u: [0.35, 0.6], c: [0.25, 0.45], mats: MAT.steel });
  lattice("truss-trasero-celosia", rb, "x", [0.45, 0.7]);

  // Pantalla LED central y pantallas laterales (apagadas en el montaje)
  solid("led-central", { x0: -3.7, x1: 3.7, y0: 7.2, y1: 7.5, z0: 1.8, z1: 6.4 }, { u: [0.5, 0.7], c: [0.38, 0.55], mats: MAT.led });
  for (const s of [-1, 1]) {
    const x0 = s < 0 ? -6.8 : 4.6;
    solid(`led-lateral-${s < 0 ? "i" : "d"}`, { x0, x1: x0 + 2.2, y0: 6.6, y1: 6.8, z0: 2.4, z1: 6.0 }, { u: [0.55, 0.75], c: [0.4, 0.57], mats: MAT.led });
  }

  buildLed();

  // Riser de batería, amplificadores, baterista y batería (cada pieza se pinta tras lo que tiene detrás)
  solid("riser", { x0: -1.8, x1: 1.8, y0: 4.4, y1: 6.6, z0: DECK_H, z1: DECK_H + 0.4 }, { u: [0.62, 0.8], c: [0.5, 0.65], mats: MAT.black });
  for (const s of [-1, 1]) {
    solid(`ampli-${s < 0 ? "i" : "d"}`, { x0: s * 3.3 - 0.6, x1: s * 3.3 + 0.6, y0: 5.9, y1: 6.4, z0: DECK_H, z1: DECK_H + 1.1 }, { u: [0.66, 0.84], c: [0.52, 0.68], mats: { front: G("amp"), top: G("pa-t"), side: G("pa-s") } });
  }

  struct(ARTIST_EL.bateria);
  drumKit();
  struct(ARTIST_EL.guitarra);
  struct(ARTIST_EL.bajo);
}
function gy(y: number, out: string[]) {
  out.push(open([P(-18, y, 0), P(18, y, 0)]));
}

/* ---------------------------------------------------------------- 2 · estructura delantera */

function buildFront() {
  const sides = [-1, 1];
  // Truss de iluminación intermedio con sus varillas de suspensión
  const mt: Box = { x0: -6.3, x1: 6.3, y0: 3.8, y1: 4.3, z0: 7.3, z1: 7.8 };
  for (const s of sides) solid(`varilla-${s < 0 ? "i" : "d"}`, { x0: s * 6.3 - 0.06, x1: s * 6.3 + 0.06, y0: 3.95, y1: 4.05, z0: 7.8, z1: TRUSS_Z0 }, { u: [0.6, 0.8], c: [0.5, 0.65], mats: MAT.steel, minor: true });
  solid("truss-medio", mt, { u: [0.45, 0.7], c: [0.3, 0.5], mats: MAT.steel });
  lattice("truss-medio-celosia", mt, "x", [0.55, 0.8]);
  // Vigas laterales superiores (de fondo a frente)
  for (const s of sides) solid(`viga-lateral-${s < 0 ? "i" : "d"}`, { x0: s * COLX - 0.25, x1: s * COLX + 0.25, y0: 1.4, y1: 6.9, z0: TRUSS_Z0, z1: TRUSS_Z1 }, { u: [0.4, 0.65], c: [0.28, 0.48], mats: MAT.steel });
  // Columnas delanteras (torres) y viga frontal
  for (const s of sides) {
    const bx: Box = { x0: s * COLX - 0.25, x1: s * COLX + 0.25, y0: 0.9, y1: 1.4, z0: 0, z1: TRUSS_Z0 };
    solid(`torre-${s < 0 ? "i" : "d"}`, bx, { u: [0.15, 0.4], c: [0.12, 0.32], mats: MAT.steel });
    lattice(`torre-${s < 0 ? "i" : "d"}-celosia`, bx, "z", [0.25, 0.5], 0.8);
  }
  const fb: Box = { x0: -8.7, x1: 8.7, y0: 0.9, y1: 1.4, z0: TRUSS_Z0, z1: TRUSS_Z1 };
  solid("truss-frontal", fb, { u: [0.3, 0.6], c: [0.2, 0.42], mats: MAT.steel });
  lattice("truss-frontal-celosia", fb, "x", [0.4, 0.7]);

  // Line array (colgado de la viga frontal) y subgraves en el suelo
  for (const s of sides) {
    const x0 = s < 0 ? -8.6 : 7.7;
    const box: Box = { x0, x1: x0 + 0.9, y0: 1.0, y1: 1.9, z0: 5.7, z1: TRUSS_Z0 };
    solid(`pa-${s < 0 ? "i" : "d"}`, box, { u: [0.5, 0.75], c: [0.4, 0.6], mats: MAT.pa });
    const mods: string[] = [];
    for (let i = 1; i < 7; i++) mods.push(open([P(box.x0, box.y0, box.z0 + ((box.z1 - box.z0) * i) / 7), P(box.x1, box.y0, box.z0 + ((box.z1 - box.z0) * i) / 7)]));
    struct(el("line", `pa-${s < 0 ? "i" : "d"}-modulos`, mods.join(""), R1, [0.6, 0.85], { stroke: LINE, w: 0.8, minor: true }));
  }
  for (const s of sides) {
    const x0 = s < 0 ? -9.2 : 7.8;
    solid(`sub-${s < 0 ? "i" : "d"}`, { x0, x1: x0 + 1.4, y0: -0.8, y1: 0.8, z0: 0, z1: 1.4 }, { u: [0.55, 0.8], c: [0.42, 0.62], mats: MAT.pa });
  }
  // Monitores de escenario (cuñas) delante de la tarima; la vocalista (más atrás) se pinta antes
  struct(ARTIST_EL.voz);
  [-4.4, -2.2, 0, 2.2, 4.4].forEach((x, i) =>
    solid(`monitor-${i}`, { x0: x - 0.45, x1: x + 0.45, y0: 0.5, y1: 1.0, z0: DECK_H, z1: DECK_H + 0.35 }, { u: [0.7, 0.9], c: [0.55, 0.7], mats: MAT.black, minor: true, faces: "ft" }),
  );
}

/* ---------------------------------------------------------------- 3 · luminarias y haces */

type Fixture = { id: string; x: number; y: number; z: number; tx: number; ty: number; tz: number; color: string; spread: number };

function fixtures(): Fixture[] {
  const list: Fixture[] = [];
  const colors = ["mint", "orange", "white"];
  [-5.7, -4, -2.4, -0.8, 0.8, 2.4, 4, 5.7].forEach((x, i) =>
    list.push({ id: `mover-${i}`, x, y: 4.05, z: 7.3, tx: -x * 0.55 + (i % 2 ? 1.2 : -1.2), ty: 1.8 - (i % 3) * 1.4, tz: DECK_H, color: colors[i % 3], spread: 0.9 }),
  );
  [-6.2, -3.7, -1.2, 1.2, 3.7, 6.2].forEach((x, i) =>
    list.push({ id: `wash-${i}`, x, y: 1.15, z: 8.7, tx: x * 0.6, ty: 3.4 + (i % 2), tz: DECK_H, color: i % 2 ? "orange" : "mint", spread: 1.4 }),
  );
  [-5.2, -1.8, 1.8, 5.2].forEach((x, i) =>
    list.push({ id: `contra-${i}`, x, y: 7.15, z: 8.7, tx: x * 0.35, ty: -4 - (i % 2) * 2, tz: 0, color: i % 2 ? "mint" : "white", spread: 1.7 }),
  );
  return list;
}

function buildFixtures() {
  const list = fixtures();
  list.forEach((fx, i) => {
    // Cuerpo de la luminaria (estructura) — la lente emite la luz
    const bx: Box = { x0: fx.x - 0.22, x1: fx.x + 0.22, y0: fx.y - 0.2, y1: fx.y + 0.2, z0: fx.z - 0.55, z1: fx.z };
    solid(fx.id, bx, { u: [0.65 + (i % 5) * 0.05, 0.9], c: [0.55, 0.72], mats: MAT.black, minor: true, faces: "f" });
  });
  return list;
}

function beamsAndGlows(): CE[] {
  const out: CE[] = [];
  const list = fixtures();
  list.forEach((fx, i) => {
    const lens = P(fx.x, fx.y, fx.z - 0.55);
    const t0 = P(fx.tx - fx.spread, fx.ty, fx.tz);
    const t1 = P(fx.tx + fx.spread, fx.ty, fx.tz);
    const a = P(fx.x - 0.09, fx.y, fx.z - 0.55);
    const b = P(fx.x + 0.09, fx.y, fx.z - 0.55);
    const u0 = (i % 9) / 12;
    out.push(el("beam", `haz-${fx.id}`, poly([a, b, t1, t0]), RBEAM, [u0, Math.min(1, u0 + 0.35)], { fill: `url(#c-beam-${fx.color})`, fo: 0.28 }));
    out.push(el("beam", `lente-${fx.id}`, circlePath(lens, Math.max(2.2, 0.17 * scale(fx.y))), RBEAM, [u0, Math.min(1, u0 + 0.25)], { fill: fx.color === "orange" ? "#ffb08a" : "#e8fff9", fo: 0.95 }));
    // mancha de luz en la tarima, en el punto de destino
    const gp = P(fx.tx, fx.ty, fx.tz);
    const gs = fx.spread * scale(fx.ty);
    out.push(el("beam", `mancha-${fx.id}`, ellipsePath(gp, gs * 1.3, gs * 0.32), RBEAM, [u0 + 0.1, Math.min(1, u0 + 0.5)], { fill: `url(#c-beam-${fx.color})`, fo: 0.3 }));
  });
  // Neblina de luz sobre el público (origen: la tarima iluminada)
  out.push(el("beam", "neblina", ellipsePath(P(0, -5, 0), 330, 40), RBEAM, [0.3, 0.9], { fill: "url(#c-haze)", fo: 0.55 }));
  return out;
}

/* ---------------------------------------------------------------- 4 · pantallas con identidad (emisivas) */

function buildLed() {
  const mk = (id: string, box: Box, content: (r: { l: number; t: number; w: number; h: number; cx: number; cy: number; s: number }) => Deco[], u: Win) => {
    const tl = P(box.x0, box.y0, box.z1);
    const br = P(box.x1, box.y0, box.z0);
    const r = { l: tl[0], t: tl[1], w: br[0] - tl[0], h: br[1] - tl[1], cx: (tl[0] + br[0]) / 2, cy: (tl[1] + br[1]) / 2, s: scale(box.y0) };
    struct({
      id, kind: "deco", path: "", a: lerp(RLED, u[0]), b: lerp(RLED, u[1]),
      parts: [{ t: "path", d: `M${f1(r.l)} ${f1(r.t)}h${f1(r.w)}v${f1(r.h)}h${f1(-r.w)}Z`, fill: "url(#c-led-on)" }, ...content(r)],
    });
  };
  // La pantalla se pinta en su posición de profundidad (tras lo que la tapa), no sobre toda la escena.
  mk("led-central-identidad", { x0: -3.7, x1: 3.7, y0: 7.2, y1: 7.5, z0: 1.8, z1: 6.4 }, (r) => [
    { t: "path", d: wavePath(r.l + r.w * 0.06, r.l + r.w * 0.94, r.cy + r.h * 0.26, r.h * 0.07, 3), fill: "none", stroke: MINT, w: 2.4 },
    { t: "path", d: wavePath(r.l + r.w * 0.06, r.l + r.w * 0.94, r.cy + r.h * 0.36, r.h * 0.07, 3), fill: "none", stroke: SIGNAL, w: 1.6 },
    ...isotipo(r.cx, r.cy - r.h * 0.04, r.h * 0.3),
    { t: "path", d: circlePath([r.l + r.w * 0.1, r.t + r.h * 0.16], r.h * 0.06), fill: SIGNAL },
  ], [0, 0.6]);
  for (const s of [-1, 1]) {
    const x0 = s < 0 ? -6.8 : 4.6;
    mk(`led-lateral-${s < 0 ? "i" : "d"}-identidad`, { x0, x1: x0 + 2.2, y0: 6.6, y1: 6.8, z0: 2.4, z1: 6.0 }, (r) => [
      { t: "path", d: circlePath([r.cx, r.cy], r.h * 0.26), fill: "none", stroke: MINT, w: 2 },
      { t: "path", d: circlePath([r.cx, r.cy], r.h * 0.14), fill: SIGNAL },
      { t: "path", d: wavePath(r.l + r.w * 0.12, r.l + r.w * 0.88, r.cy + r.h * 0.38, r.h * 0.04, 2), fill: "none", stroke: "#ffffff", w: 1.4 },
    ], [0.2, 0.8]);
  }
}
/** Isotipo abstracto sin letras: un pulso (punto) con ondas que se abren a ambos lados. `r` = radio de la onda exterior. */
function isotipo(cx: number, cy: number, r: number): Deco[] {
  const arc = (k: number, side: number) => {
    const rr = r * k, a = 0.9; // medio ángulo del arco (rad)
    const x0 = cx + side * rr * Math.cos(a), x1 = x0, y0 = cy - rr * Math.sin(a), y1 = cy + rr * Math.sin(a);
    return `M${f1(x0)} ${f1(y0)}A${f1(rr)} ${f1(rr)} 0 0 ${side > 0 ? 1 : 0} ${f1(x1)} ${f1(y1)}`;
  };
  const w = Math.max(1.4, r * 0.11);
  const out: Deco[] = [{ t: "path", d: circlePath([cx, cy], r * 0.2), fill: SIGNAL }];
  for (const [k, c] of [[0.5, "#ffffff"], [0.75, MINT], [1, MINT]] as const) for (const side of [-1, 1]) out.push({ t: "path", d: arc(k, side), fill: "none", stroke: c, w });
  return out;
}
function wavePath(x0: number, x1: number, y: number, amp: number, k: number): string {
  const pts: Pt[] = [];
  for (let i = 0; i <= 28; i++) pts.push([x0 + ((x1 - x0) * i) / 28, y + amp * Math.sin((i / 28) * Math.PI * 2 * k)]);
  return open(pts);
}

/* ---------------------------------------------------------------- 5 · artistas */

type Artist = { id: string; x: number; y: number; z0: number; u: Win; spec: FigSpec; extra?: "guitar" | "bass" | "mic"; seated?: boolean };

const ARTISTS: Artist[] = [
  { id: "bateria", x: 0, y: 5.5, z0: DECK_H + 0.4, u: [0, 0.5], spec: { dir: "tl", pose: "talk", h: 1.45, outfit: "tee", top: WARDROBE.signal.top, topShade: WARDROBE.signal.shade, bottom: "#16221f", skin: SKIN.c, hair: HAIR.black }, seated: true },
  { id: "guitarra", x: -2.9, y: 3.0, z0: DECK_H, u: [0.15, 0.65], spec: { dir: "tr", pose: "stand", h: 1.82, outfit: "tee", top: WARDROBE.paper.top, topShade: WARDROBE.paper.shade, bottom: "#16221f", skin: SKIN.b, hair: HAIR.brown, hairStyle: "wavy" }, extra: "guitar" },
  { id: "bajo", x: 3.1, y: 3.0, z0: DECK_H, u: [0.3, 0.8], spec: { dir: "tl", pose: "stand", h: 1.76, outfit: "blazer", top: WARDROBE.graphite.top, topShade: WARDROBE.graphite.shade, bottom: "#0d1517", shirt: "#7fcfc0", skin: SKIN.d, hair: HAIR.black }, extra: "bass" },
  { id: "voz", x: 0.5, y: 1.9, z0: DECK_H, u: [0.45, 1], spec: { dir: "tr", pose: "talk", h: 1.72, outfit: "dress", top: WARDROBE.mint.top, topShade: WARDROBE.mint.shade, bottom: "#26363a", skin: SKIN.a, hair: HAIR.chestnut, hairStyle: "long", accent: "#ff5a2b" }, extra: "mic" },
];

function instrument(a: Artist, foot: Pt, S: number): Shape[] {
  const u = (a.spec.h ?? 1.78) / 1.78;
  const sgn = a.spec.dir[1] === "r" ? 1 : -1;
  const X = (lx: number) => foot[0] + sgn * lx * u * S;
  const Y = (ly: number) => foot[1] - ly * u * S;
  if (a.extra === "guitar" || a.extra === "bass") {
    const body = ellipsePath([X(0.05), Y(0.98)], 0.19 * u * S, 0.14 * u * S);
    const neck = `M${pt([X(0.17), Y(1.0)])}L${pt([X(0.86), Y(1.4)])}L${pt([X(0.86), Y(1.35)])}L${pt([X(0.17), Y(0.94)])}Z`;
    const col = a.extra === "guitar" ? "#ff5a2b" : "#64bdaf";
    return [
      { d: neck, fill: "#1b1411", stroke: "rgb(13 21 23 / 0.6)", sw: 0.7 },
      { d: body, fill: col, stroke: "rgb(13 21 23 / 0.6)", sw: 0.7 },
      { d: `M${pt([X(-0.14), Y(1.45)])}L${pt([X(0.18), Y(1.0)])}`, fill: "none", stroke: "#1b1411", sw: 1.1 },
    ];
  }
  if (a.extra === "mic") {
    const hand: Pt = [X(0.37 * 0.86), Y(1.4)];
    return [
      { d: circlePath(hand, 0.045 * u * S), fill: "#d8fff4", stroke: "rgb(13 21 23 / 0.6)", sw: 0.7 },
      { d: `M${pt(hand)}l${f1(sgn * 0.05 * u * S)} ${f1(0.22 * u * S)}`, fill: "none", stroke: "#1b1411", sw: 1.4 },
    ];
  }
  return [];
}

function artistElements(): CE[] {
  return ARTISTS.map((a) => {
    const S = scale(a.y);
    const foot = P(a.x, a.y, a.z0);
    const shapes = [...figure(a.spec, S, foot), ...instrument(a, foot, S)];
    return el("person", `artista-${a.id}`, "", RART, a.u, { shapes, dy: 0, dx: -6 });
  });
}

/** Batería (instrumento) como piezas frontales; se pinta tras el baterista, que queda sentado detrás. */
function drumKit() {
  const mk = (id: string, c: Pt, rx: number, ry: number, u: Win) => struct(el("mat", id, ellipsePath(c, rx, ry), RC, u, { fill: G("kit"), fo: 1 }));
  const k = P(0, 4.95, DECK_H + 0.9);
  const s = scale(4.95);
  mk("bateria-bombo", k, 0.55 * s, 0.55 * s, [0.55, 0.75]);
  mk("bateria-tom-1", P(-0.55, 5.1, DECK_H + 1.55), 0.28 * s, 0.14 * s, [0.6, 0.78]);
  mk("bateria-tom-2", P(0.55, 5.1, DECK_H + 1.55), 0.28 * s, 0.14 * s, [0.6, 0.78]);
  mk("bateria-caja", P(-0.9, 4.8, DECK_H + 1.1), 0.3 * s, 0.1 * s, [0.62, 0.8]);
  mk("bateria-platillo-1", P(-1.3, 5.3, DECK_H + 2.2), 0.4 * s, 0.07 * s, [0.64, 0.82]);
  mk("bateria-platillo-2", P(1.35, 5.3, DECK_H + 2.1), 0.42 * s, 0.07 * s, [0.64, 0.82]);
  struct(el("line", "bateria-aro", circlePath(k, 0.55 * s), R1, [0.7, 0.9], { stroke: LINE, w: 1.2, minor: true }));
  struct(el("line", "bateria-soportes", `${open([P(-1.3, 5.3, DECK_H + 2.2), P(-1.3, 5.3, DECK_H + 0.5)])}${open([P(1.35, 5.3, DECK_H + 2.1), P(1.35, 5.3, DECK_H + 0.5)])}`, R1, [0.7, 0.9], { stroke: LINE, w: 0.9, minor: true }));
}

/* ---------------------------------------------------------------- 6 · público (siluetas por filas) */

function rng(seed: number) {
  let t = seed >>> 0;
  return () => {
    t = (t + 0x6d2b79f5) >>> 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function crowd(): CE[] {
  const rows = [
    { y: -6.6, n: 11, xr: 7, tone: "#0e1a1d", seed: 11 },
    { y: -8.6, n: 14, xr: 8, tone: "#0a1214", seed: 23 },
    { y: -10.6, n: 16, xr: 8.8, tone: "#070d0f", seed: 37 },
    { y: -12.6, n: 17, xr: 9.4, tone: "#04090a", seed: 41 },
  ];
  return rows.map((row, ri) => {
    const r = rng(row.seed);
    let d = "";
    for (let i = 0; i < row.n; i++) {
      const x = -row.xr + ((2 * row.xr) * (i + 0.5 + (r() - 0.5) * 0.7)) / row.n;
      const h = 1.62 + (r() - 0.5) * 0.16;
      const lean = (r() - 0.5) * 0.12;
      const sw = 0.5 + r() * 0.08;
      const head = P(x + lean, row.y, h);
      const s = scale(row.y);
      d += circlePath(head, 0.115 * s);
      d += `M${pt(P(x - sw / 2 - 0.05, row.y, 0.6))}L${pt(P(x - sw / 2, row.y, 1.32))}Q${pt(P(x - sw / 2 + 0.02, row.y, 1.5))} ${pt(P(x + lean * 0.5 - 0.12, row.y, 1.5))}L${pt(P(x + lean * 0.5 + 0.12, row.y, 1.5))}Q${pt(P(x + sw / 2 - 0.02, row.y, 1.5))} ${pt(P(x + sw / 2, row.y, 1.32))}L${pt(P(x + sw / 2 + 0.05, row.y, 0.6))}Z`;
      if (r() < 0.18) {
        // brazo en alto (mano hacia arriba) y, a veces, un teléfono encendido
        const sx = x + (r() < 0.5 ? -1 : 1) * (sw / 2 - 0.02);
        const hx = sx + (r() - 0.5) * 0.2;
        d += poly([P(sx - 0.065, row.y, 1.4), P(sx + 0.065, row.y, 1.4), P(hx + 0.055, row.y, 2.1), P(hx - 0.055, row.y, 2.1)]);
        d += circlePath(P(hx, row.y, 2.18), 0.06 * s);
      }
    }
    return el("person", `publico-fila-${ri + 1}`, d, RCROWD, [ri * 0.14, Math.min(1, 0.5 + ri * 0.16)], { fill: row.tone, fo: 0.95, stroke: "#64bdaf", w: 0.7, dy: 12, dx: 0 });
  });
}

/* ---------------------------------------------------------------- 7 · anotaciones técnicas (se retiran al construir) */

function annotations(): { lines: CE[]; txs: CT[] } {
  const lines: CE[] = [];
  const txs: CT[] = [];
  const erase = (e: CE, u: number): CE => ({ ...e, ea: lerp(RE, 0.4 * (1 - u)), eb: lerp(RE, 0.4 * (1 - u) + 0.6) });
  const bl = P(-HALF, 0, 0);
  const br = P(HALF, 0, 0);
  const yy = bl[1] + 26;
  lines.push(erase(el("line", "cota-ancho", `M${f1(bl[0])} ${f1(yy)}H${f1(br[0])}M${f1(bl[0])} ${f1(yy - 7)}V${f1(yy + 7)}M${f1(br[0])} ${f1(yy - 7)}V${f1(yy + 7)}`, R1, [0.6, 0.9], { stroke: SIGNAL, w: 1.6 }), 0.7));
  const hb = P(-9.7, 1.15, 0);
  const ht = P(-9.7, 1.15, TRUSS_Z1);
  lines.push(erase(el("line", "cota-alto", `M${f1(hb[0])} ${f1(hb[1])}V${f1(ht[1])}M${f1(hb[0]) - 7} ${f1(hb[1])}H${f1(hb[0]) + 7}M${f1(hb[0]) - 7} ${f1(ht[1])}H${f1(hb[0]) + 7}`, R1, [0.65, 0.95], { stroke: SIGNAL, w: 1.6 }), 0.5));
  const dp0 = P(HALF + 1.2, 0, 0);
  const dp1 = P(HALF + 1.2, DECK_D, 0);
  lines.push(erase(el("line", "cota-fondo", `M${f1(dp0[0])} ${f1(dp0[1])}L${f1(dp1[0])} ${f1(dp1[1])}`, R1, [0.7, 1], { stroke: SIGNAL, w: 1.6 }), 0.3));
  const tag = (id: string, text: string, x: number, y: number, u: Win, anchor: "start" | "middle" = "middle", extra: Partial<CT> = {}) => {
    const [a, b] = win([0.1, 0.26], u);
    txs.push({ id, text, x, y, a, b, ea: RE[0], eb: RE[1], size: 11, anchor, ...extra });
  };
  tag("tag-ancho", "TARIMA 14,00 × 8,00 × 1,20 m", (bl[0] + br[0]) / 2, yy + 20, [0.5, 0.9]);
  tag("tag-led", "LED CENTRAL 7,40 × 4,60 m", P(0, 7.2, 4.1)[0], P(0, 7.2, 4.1)[1] + 4, [0.2, 0.6], "middle", { minor: false });
  tag("tag-pa-i", "PA L", P(-8.15, 1, 7.2)[0], P(-8.15, 1, 7.2)[1], [0.3, 0.7], "middle", { minor: true });
  tag("tag-pa-d", "PA R", P(8.15, 1, 7.2)[0], P(8.15, 1, 7.2)[1], [0.3, 0.7], "middle", { minor: true });
  tag("tag-truss", "TRUSS · 9,20 m", P(0, 1, 9.45)[0], P(0, 1, 9.45)[1] - 6, [0.1, 0.5]);
  tag("tag-mover", "MOVING HEADS × 8", P(0, 4, 6.9)[0], P(0, 4, 6.9)[1] + 14, [0.3, 0.8], "middle", { minor: true });
  tag("tag-alto", "9,20 m", hb[0] + 14, (hb[1] + ht[1]) / 2, [0.4, 0.9], "start", { rotate: 0, minor: true });
  return { lines, txs };
}

/* ---------------------------------------------------------------- resultado */

const ARTIST_EL = Object.fromEntries(artistElements().map((e) => [e.id.replace('artista-', ''), e])) as Record<'bateria' | 'guitarra' | 'bajo' | 'voz', CE>;

function build(): { groups: CG[]; ann: CG } {
  buildStruct();
  buildFront();
  buildFixtures();
  const { lines, txs } = annotations();
  return {
    groups: [
      { id: "estructura", els: elements },
      { id: "luces", els: beamsAndGlows() },
      { id: "publico", els: crowd() },
    ],
    ann: { id: "anotaciones", els: lines, txs },
  };
}

const BUILT = build();
export const SCENE = BUILT;
export const VIEW = { w: 800, h: 520 };
