/**
 * «Del espacio vacío al evento en vivo»: UN salón isométrico que se construye con el scroll.
 * Marca ficticia y abstracta (sin texto); NO es un evento ni un cliente de BenRed.
 *
 * Mismo escenario, cámara y coordenadas en todo el recorrido. Cada pieza tiene una pose final y una pose inicial
 * física (se eleva, desciende por los truss, entra deslizándose, se amplía) dentro de una ventana del progreso p:
 *   0.00–0.20  planificación: el salón vacío se traza (suelo, muros, pilastras) con cotas y zonas
 *   0.20–0.50  infraestructura: tarima, torres, truss, luces, pantallas LED (por paneles), altavoces, control técnico
 *   0.50–0.76  ambientación: alfombra, mesas y sillas, señalización, plantas, luz decorativa, contenido en pantallas
 *   0.76–1.00  evento en vivo: baja la luz ambiente, pantallas y reflectores, entran los asistentes
 * Render SVG imperativo (sin React por fotograma). La noche se aplica con variables CSS en el <svg> (pocos pasos).
 */

const NS = "http://www.w3.org/2000/svg";
const C30 = 0.8660254;
const S = 21;
const OX = 427;
const OY = 258;
const F = 0.4; // altura del suelo

type Pose = [number, number, number, number, number, number]; // x, y, w, d, h, z
type Mat = "floor" | "wall" | "col" | "stage" | "metal" | "dark" | "table" | "chair" | "carpet" | "banner" | "scr";
type Face = "x" | "y";

type Ev = {
  id: string;
  mat: Mat;
  kind?: "box" | "cyl";
  E: Pose;
  from?: Pose;
  win?: [number, number];
  fade?: number; // fracción inicial de la ventana en la que la pieza entra con opacidad
  base?: boolean;
  shadow?: boolean;
  lattice?: boolean;
  hatch?: boolean;
  mark?: { face: Face; u: number; v: number; size: number; after?: number };
  screen?: { face: Face; cols: number; rows: number };
  glass?: boolean;
};

const p = (x: number, y: number, w: number, d: number, h: number, z = F): Pose => [x, y, w, d, h, z];
const r0 = (q: Pose): Pose => [q[0], q[1], q[2], q[3], 0, q[5]];

const W: Record<string, [number, number]> = {
  stage: [0.22, 0.3],
  steps: [0.3, 0.33],
  towers: [0.28, 0.37],
  beams: [0.35, 0.43],
  lights: [0.42, 0.5],
  screens: [0.38, 0.52],
  speakers: [0.43, 0.5],
  gear: [0.46, 0.52],
};

const ELS: Ev[] = [];
const add = (e: Ev) => ELS.push(e);

// --- salón (base)
add({ id: "floor", mat: "floor", base: true, E: p(0, 0, 26, 19, F, 0) });
add({ id: "wB", mat: "wall", base: true, hatch: true, E: p(0, 0, 26, 0.6, 11) });
add({ id: "wL", mat: "wall", base: true, hatch: true, E: p(0, 0.6, 0.6, 18.4, 11) });
[4.8, 9.6, 14.4].forEach((y, i) => add({ id: `pil${i}`, mat: "col", base: true, E: p(0.6, y, 0.9, 1.3, 11) }));

// --- infraestructura
add({ id: "stage", mat: "stage", win: W.stage, from: r0(p(4.2, 0.6, 17.4, 5.4, 1.2)), E: p(4.2, 0.6, 17.4, 5.4, 1.2), shadow: true,
  mark: { face: "y", u: 7.2, v: 0.25, size: 0.7, after: 0.9 } });
add({ id: "step", mat: "stage", win: W.steps, from: r0(p(2.5, 3.2, 1.7, 1.6, 0.6)), E: p(2.5, 3.2, 1.7, 1.6, 0.6) });
const TOWER_H = 10.4;
const towers: Array<[string, number, number]> = [["tfl", 3.4, 5.0], ["tfr", 21.8, 5.0], ["trl", 3.4, 1.0], ["trr", 21.8, 1.0]];
towers.forEach(([id, x, y], i) =>
  add({ id, mat: "metal", lattice: true, shadow: true, win: [W.towers[0] + i * 0.012, W.towers[1] + i * 0.012], from: r0(p(x, y, 0.8, 0.8, TOWER_H)), E: p(x, y, 0.8, 0.8, TOWER_H) }));
const BZ = F + 9.6; // cota final de las vigas (suben por las torres)
const BZ0 = F + 2.4; // cota inicial (sobre la tarima)
add({ id: "bF", mat: "metal", lattice: true, win: [W.beams[0], W.beams[1]], from: p(3.4, 5.0, 19.2, 0.8, 0.8, BZ0), E: p(3.4, 5.0, 19.2, 0.8, 0.8, BZ) });
add({ id: "bR", mat: "metal", lattice: true, win: [W.beams[0] + 0.01, W.beams[1] + 0.01], from: p(3.4, 1.0, 19.2, 0.8, 0.8, BZ0), E: p(3.4, 1.0, 19.2, 0.8, 0.8, BZ) });
add({ id: "bL", mat: "metal", lattice: true, win: [W.beams[0] + 0.02, W.beams[1] + 0.02], from: p(3.4, 1.8, 0.8, 3.2, 0.8, BZ0), E: p(3.4, 1.8, 0.8, 3.2, 0.8, BZ) });
add({ id: "bRt", mat: "metal", lattice: true, win: [W.beams[0] + 0.02, W.beams[1] + 0.02], from: p(21.8, 1.8, 0.8, 3.2, 0.8, BZ0), E: p(21.8, 1.8, 0.8, 3.2, 0.8, BZ) });
// luces colgadas de la viga frontal (descienden hasta su cota)
for (let i = 0; i < 8; i++) {
  const x = 5.0 + i * 2.2;
  const a = W.lights[0] + i * 0.008;
  add({ id: `lt${i}`, mat: "dark", win: [a, a + 0.05], fade: 0.5, from: p(x, 5.15, 0.5, 0.5, 0, BZ), E: p(x, 5.15, 0.5, 0.5, 0.7, BZ - 0.7) });
}
// altavoces (line array) colgados bajo la viga
add({ id: "spL", mat: "dark", win: W.speakers, from: p(5.4, 5.15, 0.7, 0.7, 0, BZ), E: p(5.4, 5.15, 0.7, 0.7, 3.2, BZ - 3.2) });
add({ id: "spR", mat: "dark", win: W.speakers, from: p(19.9, 5.15, 0.7, 0.7, 0, BZ), E: p(19.9, 5.15, 0.7, 0.7, 3.2, BZ - 3.2) });
// pantallas LED por paneles
add({ id: "scM", mat: "scr", win: W.screens, E: p(8, 0.6, 10, 0.2, 4.8, F + 1.2 + 2.2), screen: { face: "y", cols: 10, rows: 5 } });
add({ id: "scL", mat: "scr", win: W.screens, E: p(5.4, 0.6, 2, 0.2, 4.8, F + 1.2 + 2.2), screen: { face: "y", cols: 2, rows: 5 } });
add({ id: "scR", mat: "scr", win: W.screens, E: p(18.6, 0.6, 2, 0.2, 4.8, F + 1.2 + 2.2), screen: { face: "y", cols: 2, rows: 5 } });
// control técnico y cajas de equipo (entran deslizándose)
add({ id: "foh", mat: "dark", win: [0.45, 0.52], fade: 0.3, shadow: true, from: p(11.2, 20.2, 3.6, 1.5, 1.1), E: p(11.2, 15.2, 3.6, 1.5, 1.1) });
add({ id: "mon1", mat: "scr", win: [0.5, 0.54], from: p(11.9, 15.35, 1.0, 0.12, 0, F + 1.1), E: p(11.9, 15.35, 1.0, 0.12, 0.7, F + 1.1) });
add({ id: "mon2", mat: "scr", win: [0.51, 0.55], from: p(13.2, 15.35, 1.0, 0.12, 0, F + 1.1), E: p(13.2, 15.35, 1.0, 0.12, 0.7, F + 1.1) });
add({ id: "cs1", mat: "dark", win: W.gear, fade: 0.3, from: p(0.9, 11.6, 1.4, 1.0, 1.0), E: p(1.9, 6.4, 1.4, 1.0, 1.0) });
add({ id: "cs2", mat: "dark", win: [0.47, 0.53], fade: 0.3, from: p(24.9, 11.6, 1.4, 1.0, 1.0), E: p(23.2, 6.4, 1.4, 1.0, 1.0) });

// --- ambientación
add({ id: "carpet", mat: "carpet", win: [0.5, 0.6], from: p(3, 7.2, 20, 0.01, 0.06), E: p(3, 7.2, 20, 11.2, 0.06) });
const TABLES: Array<[number, number]> = [[6, 10.8], [20, 10.8], [6, 15.4], [20, 15.4]];
TABLES.forEach(([cx, cy], ti) => {
  const a = 0.54 + ti * 0.02;
  add({ id: `tb${ti}`, mat: "table", kind: "cyl", shadow: true, win: [a, a + 0.06], from: p(cx, cy, 1.5, 1.5, 0), E: p(cx, cy, 1.5, 1.5, 1.5) });
  for (let k = 0; k < 6; k++) {
    const ang = (k * Math.PI) / 3 + 0.5;
    const x = cx + Math.cos(ang) * 2.45 - 0.4;
    const y = cy + Math.sin(ang) * 2.45 - 0.4;
    const b = 0.58 + ti * 0.02 + k * 0.004;
    add({ id: `ch${ti}-${k}`, mat: "chair", win: [b, b + 0.05], from: p(x, y, 0.8, 0.8, 0), E: p(x, y, 0.8, 0.8, 1.0) });
  }
});
add({ id: "bn1", mat: "banner", win: [0.62, 0.68], mark: { face: "y", u: 0.1, v: 3.0, size: 1.0, after: 0.8 }, from: p(8.9, 17.7, 1.2, 0.25, 0), E: p(8.9, 17.7, 1.2, 0.25, 5.4) });
add({ id: "bn2", mat: "banner", win: [0.64, 0.7], mark: { face: "y", u: 0.1, v: 3.0, size: 1.0, after: 0.8 }, from: p(16.9, 17.7, 1.2, 0.25, 0), E: p(16.9, 17.7, 1.2, 0.25, 5.4) });
add({ id: "bn3", mat: "banner", win: [0.66, 0.72], mark: { face: "x", u: 0.1, v: 3.0, size: 1.0, after: 0.8 }, from: p(1.3, 18.2, 0.25, 1.2, 0), E: p(1.3, 18.2, 0.25, 1.2, 5.4) });
// luz decorativa a ras de muro (se enciende en la fase en vivo)
[3, 8, 13, 17].forEach((y, i) => {
  const a = 0.68 + i * 0.015;
  add({ id: `up${i}`, mat: "dark", win: [a, a + 0.04], from: p(1.6, y, 0.5, 0.5, 0), E: p(1.6, y, 0.5, 0.5, 0.5) });
});

type Person = { id: string; sym: number; scale: number; path: Array<[number, number, number]>; win: [number, number]; stage?: boolean };
const LA = 10.4;
const LB = 15.6;
const PEOPLE: Person[] = [
  { id: "pr", sym: 0, scale: 1, stage: true, win: [0.79, 0.86], path: [[2.6, 7.2, F], [12.6, 7.2, F], [12.6, 3.2, 1.6]] },
  { id: "a1", sym: 1, scale: 1, win: [0.84, 0.92], path: [[LA, 19.8, F], [LA, 7.6, F], [9, 7.3, F]] },
  { id: "a2", sym: 2, scale: 1, win: [0.85, 0.93], path: [[LB, 19.8, F], [LB, 8.0, F], [16.8, 7.9, F]] },
  { id: "a3", sym: 3, scale: 1, win: [0.86, 0.94], path: [[LA, 19.8, F], [LA, 7.8, F], [11.4, 7.7, F]] },
  { id: "a4", sym: 4, scale: 1, win: [0.87, 0.95], path: [[LB, 19.8, F], [LB, 7.4, F], [14.6, 7.5, F]] },
  { id: "b1", sym: 2, scale: 1, win: [0.84, 0.93], path: [[LA, 19.8, F], [LA, 12.8, F], [8.4, 12.8, F]] },
  { id: "b2", sym: 1, scale: 1, win: [0.85, 0.94], path: [[LB, 19.8, F], [LB, 12.8, F], [17.8, 12.8, F]] },
  { id: "b3", sym: 3, scale: 1, win: [0.86, 0.95], path: [[LA, 19.8, F], [LA, 17.4, F], [8.2, 17.4, F]] },
  { id: "b4", sym: 4, scale: 1, win: [0.87, 0.96], path: [[LB, 19.8, F], [LB, 17.4, F], [17.8, 17.4, F]] },
  { id: "c1", sym: 0, scale: 1, win: [0.88, 0.96], path: [[LA, 19.8, F], [LA, 13.2, F], [LA, 12.2, F]] },
  { id: "c2", sym: 2, scale: 1, win: [0.88, 0.97], path: [[LB, 19.8, F], [LB, 13.4, F], [LB, 12.4, F]] },
  { id: "t1", sym: 1, scale: 1, win: [0.82, 0.9], path: [[LA, 19.8, F], [LA, 14.4, F], [13, 14.2, F]] },
];

const OUTFITS = [
  { skin: "#e6b99a", top: "#026472", pants: "#1a2427", hair: "#2a1c14" },
  { skin: "#c98f6b", top: "#e9e5db", pants: "#26363b", hair: "#0d1517" },
  { skin: "#8d5a3b", top: "#258288", pants: "#0d1517", hair: "#0d1517" },
  { skin: "#f0cdb0", top: "#1a2427", pants: "#3a4a50", hair: "#6b4a2b" },
  { skin: "#d9a27c", top: "#64bdaf", pants: "#26363b", hair: "#1a1109" },
];

const DAY: Record<Mat, [string, string, string]> = {
  floor: ["#e3ddcf", "#cfc7b4", "#b7ae98"],
  wall: ["#f4f1ea", "#e4dfd3", "#c9c2b2"],
  col: ["#fbfaf6", "#ece8de", "#d3cdbe"],
  stage: ["#4a5c62", "#33444a", "#1f2d31"],
  metal: ["#a4b1b5", "#7e8d92", "#5c6b70"],
  dark: ["#33444a", "#1f2d31", "#0d1517"],
  table: ["#ffffff", "#e9e5db", "#cfc9bb"],
  chair: ["#2b6f78", "#1f5a63", "#15444c"],
  carpet: ["#3d7d82", "#3d7d82", "#3d7d82"],
  banner: ["#ffffff", "#ece8de", "#cdc7b8"],
  scr: ["#1d3a40", "#0d2328", "#0a1a1e"],
};
const SCR_ON: [string, string, string] = ["#2fd0c2", "#1fa3a0", "#168a8c"];

const c01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);
const sm = (t: number) => t * t * (3 - 2 * t);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const f1 = (n: number) => n.toFixed(1);
const proj = (x: number, y: number, z: number): [number, number] => [OX + (x - y) * C30 * S, OY + (x + y) * 0.5 * S - z * S];
const hex = (s: string): [number, number, number] => [parseInt(s.slice(1, 3), 16), parseInt(s.slice(3, 5), 16), parseInt(s.slice(5, 7), 16)];
const mix = (a: string, b: string, t: number) => {
  const A = hex(a), B = hex(b);
  return `rgb(${Math.round(lerp(A[0], B[0], t))} ${Math.round(lerp(A[1], B[1], t))} ${Math.round(lerp(A[2], B[2], t))})`;
};

/** setAttribute solo si cambia (evita invalidar estilos en cada fotograma). */
const sa = (e: Element, k: string, v: string) => {
  const c = e as unknown as Record<string, string>;
  if (c[`_${k}`] === v) return;
  c[`_${k}`] = v;
  e.setAttribute(k, v);
};

const el = (tag: string, attrs: Record<string, string | number> = {}, parent?: Element) => {
  const e = document.createElementNS(NS, tag);
  for (const k in attrs) e.setAttribute(k, String(attrs[k]));
  parent?.appendChild(e);
  return e;
};

type Node = {
  d: Ev;
  g: SVGGElement;
  top: SVGPathElement;
  left: SVGPathElement;
  right: SVGPathElement;
  lat?: SVGPathElement[];
  hat?: SVGPathElement;
  decal?: SVGGElement;
  mark?: SVGGElement;
  tiles?: Array<{ g: SVGGElement; cx: number; cy: number; a: number }>;
  content?: SVGGElement;
  shadow?: SVGPathElement;
  idx: number;
  pose: Pose;
  key: number;
  sig: string;
};
type PNode = { d: Person; g: SVGGElement; inner: SVGUseElement; k: number; sig: string };

export function mountEventHall(svg: SVGSVGElement) {
  svg.textContent = "";
  const defs = el("defs", {}, svg);
  // símbolo de marca ficticia (isotipo abstracto, sin texto)
  const mk = el("symbol", { id: "eh-mark", viewBox: "0 0 100 100" }, defs);
  el("circle", { cx: 50, cy: 50, r: 46, fill: "#026472" }, mk);
  el("path", { d: "M26 60L50 30L74 60", fill: "none", stroke: "#ffffff", "stroke-width": 11, "stroke-linecap": "round", "stroke-linejoin": "round" }, mk);
  el("circle", { cx: 50, cy: 74, r: 6, fill: "#ff5a2b" }, mk);
  const hatch = el("pattern", { id: "eh-hatch", width: 5, height: 5, patternUnits: "userSpaceOnUse", patternTransform: "rotate(45)" }, defs);
  el("line", { x1: 0, y1: 0, x2: 0, y2: 5, stroke: "#0d1517", "stroke-width": 0.8, "stroke-opacity": 0.4 }, hatch);
  const lat = el("pattern", { id: "eh-lat", width: 7, height: 7, patternUnits: "userSpaceOnUse" }, defs);
  el("path", { d: "M0 7L3.5 0L7 7", fill: "none", stroke: "#0d1517", "stroke-width": 0.8, "stroke-opacity": 0.55 }, lat);
  const beam = el("linearGradient", { id: "eh-beam", x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
  el("stop", { offset: "0", "stop-color": "#bff3ea", "stop-opacity": 0.55 }, beam);
  el("stop", { offset: "1", "stop-color": "#bff3ea", "stop-opacity": 0.04 }, beam);
  const pool = el("radialGradient", { id: "eh-pool" }, defs);
  el("stop", { offset: "0", "stop-color": "#bff3ea", "stop-opacity": 0.6 }, pool);
  el("stop", { offset: "1", "stop-color": "#bff3ea", "stop-opacity": 0 }, pool);
  const upg = el("radialGradient", { id: "eh-up" }, defs);
  el("stop", { offset: "0", "stop-color": "#64bdaf", "stop-opacity": 0.7 }, upg);
  el("stop", { offset: "1", "stop-color": "#64bdaf", "stop-opacity": 0 }, upg);
  const scrg = el("linearGradient", { id: "eh-scr", x1: 0, y1: 0, x2: 1, y2: 1 }, defs);
  el("stop", { offset: "0", "stop-color": "#0f4f57" }, scrg);
  el("stop", { offset: "1", "stop-color": "#06232a" }, scrg);
  const scon = el("linearGradient", { id: "eh-scon", x1: 0, y1: 0, x2: 1, y2: 1 }, defs);
  el("stop", { offset: "0", "stop-color": "#1fa3a0" }, scon);
  el("stop", { offset: "1", "stop-color": "#0b3b43" }, scon);
  const clip = el("clipPath", { id: "eh-clip" }, defs);
  const clipPath = el("path", {}, clip);
  {
    const f = [proj(0, 0, F), proj(26, 0, F), proj(26, 19, F), proj(0, 19, F)];
    clipPath.setAttribute("d", "M" + f.map((v) => `${v[0].toFixed(1)} ${v[1].toFixed(1)}`).join("L") + "Z");
  }

  // figuras: 5 atuendos como símbolos; las personas son <use> (pocos nodos)
  OUTFITS.forEach((o, i) => {
    const sy = el("symbol", { id: `eh-p${i}`, viewBox: "-30 -104 60 108", overflow: "visible" }, defs);
    const st = { stroke: "#0d1517", "stroke-opacity": 0.45, "stroke-width": 0.7, "stroke-linejoin": "round" };
    el("ellipse", { cx: 0, cy: 0, rx: 15, ry: 4.6, fill: "#0d1517", "fill-opacity": 0.2 }, sy);
    const b = el("g", {}, sy);
    el("path", { d: "M-10 -46H-2.5V-3H-11.5Z", fill: o.pants, ...st }, b);
    el("path", { d: "M2.5 -46H10V-3H11.5Z", fill: o.pants, ...st }, b);
    el("rect", { x: -12.5, y: -4, width: 9.5, height: 4, rx: 1.5, fill: "#0d1517" }, b);
    el("rect", { x: 3, y: -4, width: 9.5, height: 4, rx: 1.5, fill: "#0d1517" }, b);
    el("path", { d: "M-15 -82Q-15 -88 -9 -88.5H9Q15 -88 15 -82L13.5 -44H-13.5Z", fill: o.top, ...st }, b);
    el("path", { d: "M-15 -83L-20.5 -52L-16 -50L-11.5 -78Z", fill: o.top, ...st }, b);
    el("path", { d: "M15 -83L20.5 -52L16 -50L11.5 -78Z", fill: o.top, ...st }, b);
    el("circle", { cx: -18.6, cy: -49, r: 3.2, fill: o.skin }, b);
    el("circle", { cx: 18.6, cy: -49, r: 3.2, fill: o.skin }, b);
    el("rect", { x: -3.2, y: -91, width: 6.4, height: 5, fill: o.skin }, b);
    el("circle", { cx: 0, cy: -95, r: 6.4, fill: o.skin, ...st }, b);
    el("path", { d: "M-6.8 -95.5A6.8 6.8 0 0 1 6.8 -95.5Q0 -99.5 -6.8 -95.5Z", fill: o.hair }, b);
  });

  const bg = el("g", { class: "eh-bg" }, svg);
  const shadowLayer = el("g", { "clip-path": "url(#eh-clip)" }, svg);
  const main = el("g", {}, svg);
  const glow = el("g", { class: "eh-glow" }, svg);
  const fg = el("g", {}, svg);

  // --- anotaciones de planificación
  const grid = el("g", {}, bg);
  const gp: string[] = [];
  for (let x = 0; x <= 26; x += 2) {
    const a = proj(x, 0, F), b = proj(x, 19, F);
    gp.push(`M${f1(a[0])} ${f1(a[1])}L${f1(b[0])} ${f1(b[1])}`);
  }
  for (let y = 0; y <= 19; y += 2) {
    const a = proj(0, y, F), b = proj(26, y, F);
    gp.push(`M${f1(a[0])} ${f1(a[1])}L${f1(b[0])} ${f1(b[1])}`);
  }
  el("path", { d: gp.join(""), fill: "none", stroke: "#0d1517", "stroke-opacity": 0.1, "stroke-width": 0.8 }, grid);
  const ann = el("g", { class: "eh-ann" }, fg);
  const rect = (x: number, y: number, w: number, d: number, dash = "4 4") => {
    const a = proj(x, y, F + 0.02), b = proj(x + w, y, F + 0.02), c = proj(x + w, y + d, F + 0.02), e = proj(x, y + d, F + 0.02);
    el("path", { d: `M${f1(a[0])} ${f1(a[1])}L${f1(b[0])} ${f1(b[1])}L${f1(c[0])} ${f1(c[1])}L${f1(e[0])} ${f1(e[1])}Z`, fill: "none", stroke: "#026472", "stroke-width": 1.1, "stroke-dasharray": dash }, ann);
  };
  const tx = (x: number, y: number, z: number, text: string, anchor = "start") => {
    const [sx, sy] = proj(x, y, z);
    el("text", { x: f1(sx), y: f1(sy), "text-anchor": anchor, class: "eh-t" }, ann).textContent = text;
  };
  const dim = (x1: number, y1: number, x2: number, y2: number) => {
    const a = proj(x1, y1, F), b = proj(x2, y2, F);
    el("path", { d: `M${f1(a[0])} ${f1(a[1])}L${f1(b[0])} ${f1(b[1])}`, fill: "none", stroke: "#026472", "stroke-width": 1 }, ann);
  };
  rect(4.2, 0.6, 17.4, 5.4); tx(12.9, 3.6, F, "ESCENARIO", "middle");
  rect(3, 7.2, 20, 11.2); tx(13, 9.2, F, "PÚBLICO", "middle");
  rect(11.2, 15.2, 3.6, 1.5); tx(13, 17.4, F, "CONTROL TÉCNICO", "middle");
  tx(13, 19.9, F, "ACCESO ▲", "middle");
  dim(0, 20.4, 26, 20.4); dim(0, 20.1, 0, 20.7); dim(26, 20.1, 26, 20.7); tx(13, 21.5, F, "FRENTE DEL SALÓN", "middle");
  dim(27.2, 0, 27.2, 19); dim(26.9, 0, 27.5, 0); dim(26.9, 19, 27.5, 19); tx(28, 9.5, F, "FONDO");

  // --- nodos
  const nodes: Node[] = [];
  const byId = new Map<string, Node>();
  let baseCount = 0;
  ELS.forEach((d, i) => {
    const g = el("g", {}) as SVGGElement;
    const m = d.mat;
    const face = (k: 0 | 1 | 2) => `fill:var(--eh-${m}-${k})`;
    const left = el("path", { style: face(1), stroke: "#0d1517", "stroke-opacity": 0.5, "stroke-width": 0.8, "stroke-linejoin": "round" }, g) as SVGPathElement;
    const right = el("path", { style: face(2), stroke: "#0d1517", "stroke-opacity": 0.5, "stroke-width": 0.8, "stroke-linejoin": "round" }, g) as SVGPathElement;
    const top = el("path", {
      style: face(0), stroke: "#0d1517", "stroke-opacity": 0.85, "stroke-width": 1.1, "stroke-linejoin": "round",
      pathLength: 1, "stroke-dasharray": "1 1.02", "stroke-dashoffset": d.base ? 1 : 0,
    }, g) as SVGPathElement;
    const n: Node = { d, g, top, left, right, idx: i, pose: d.E, key: 0, sig: "" };
    if (d.lattice) {
      n.lat = [
        el("path", { fill: "url(#eh-lat)", "fill-opacity": 0.55, stroke: "none" }, g) as SVGPathElement,
        el("path", { fill: "url(#eh-lat)", "fill-opacity": 0.55, stroke: "none" }, g) as SVGPathElement,
      ];
    }
    if (d.hatch) n.hat = el("path", { fill: "url(#eh-hatch)", stroke: "none", opacity: 0 }, g) as SVGPathElement;
    if (d.screen) {
      n.decal = el("g", {}, g) as SVGGElement;
      el("rect", { x: 0, y: 0, width: 1, height: 1, fill: "#06161a" }, n.decal);
      n.tiles = [];
      const { cols, rows } = d.screen;
      for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++) {
          const tg = el("g", {}, n.decal) as SVGGElement;
          el("rect", { x: (c + 0.04) / cols, y: (r + 0.04) / rows, width: 0.92 / cols, height: 0.92 / rows, fill: "url(#eh-scr)", stroke: "#bff3ea", "stroke-opacity": 0.12, "stroke-width": 0.004 }, tg);
          // los paneles entran en diagonal, con ligera variación
          const a = (c + (rows - 1 - r)) / (cols + rows - 2 || 1) * 0.7 + ((c * 7 + r * 13) % 5) * 0.045;
          n.tiles.push({ g: tg, cx: (c + 0.5) / cols, cy: (r + 0.5) / rows, a });
        }
      // contenido abstracto (marca ficticia + barras + onda): se enciende en las fases finales
      n.content = el("g", { opacity: 0 }, n.decal) as SVGGElement;
      const big = d.screen.cols > 4;
      if (big) {
        el("rect", { x: 0, y: 0, width: 1, height: 1, fill: "url(#eh-scon)" }, n.content);
        el("path", { d: "M0 0.78Q0.18 0.6 0.34 0.74T0.7 0.7T1 0.62V1H0Z", fill: "#2fd0c2", "fill-opacity": 0.28 }, n.content);
        [0.34, 0.5, 0.66].forEach((xx, k) => el("rect", { x: 0.45 + k * 0.0, y: 0.26 + k * 0.1, width: 0.34 - k * 0.07, height: 0.05, fill: "#bff3ea", "fill-opacity": 0.85, class: `eh-sb eh-sb${k}` }, n.content));
        n.mark = el("g", {}, n.content) as SVGGElement;
        el("use", { href: "#eh-mark", x: 0, y: 0, width: 1, height: 1 }, n.mark);
        const mw = 2.6 / d.E[2], mh = 2.6 / d.E[4];
        n.mark.setAttribute("transform", `translate(0.12 0.2) scale(${mw.toFixed(4)} ${mh.toFixed(4)})`);
      } else {
        el("rect", { x: 0, y: 0, width: 1, height: 1, fill: "url(#eh-scon)" }, n.content);
        [0.2, 0.4, 0.6, 0.8].forEach((yy, k) => el("rect", { x: 0.2, y: yy, width: 0.6, height: 0.04, fill: "#bff3ea", "fill-opacity": 0.8, class: `eh-sb eh-sb${k % 3}` }, n.content));
      }
    } else if (d.mark) {
      n.decal = el("g", {}, g) as SVGGElement;
      n.mark = el("g", {}, n.decal) as SVGGElement;
      el("use", { href: "#eh-mark", x: 0, y: 0, width: 1, height: 1 }, n.mark);
    }
    if (d.shadow) n.shadow = el("path", { fill: "#0d1517", "fill-opacity": 0.1 }, shadowLayer) as SVGPathElement;
    if (d.base) baseCount++;
    nodes.push(n);
    byId.set(d.id, n);
    main.appendChild(g);
  });
  // ventanas y puerta (calcomanías sobre los muros)
  const decalsStatic = el("g", {}, main);
  const win = (face: Face, x: number, y: number, z: number, u: number, v: number): SVGGElement => {
    const g = el("g", {}, decalsStatic) as SVGGElement;
    el("rect", { x: 0, y: 0, width: 1, height: 1, style: "fill:var(--eh-win)" }, g);
    el("path", { d: "M0.5 0V1M0 0.5H1", stroke: "#0d1517", "stroke-opacity": 0.35, "stroke-width": 0.03, fill: "none" }, g);
    el("rect", { x: 0, y: 0, width: 1, height: 1, fill: "none", stroke: "#0d1517", "stroke-opacity": 0.5, "stroke-width": 0.03 }, g);
    const o = face === "y" ? proj(x, y, z) : proj(x, y, z);
    const m = face === "y"
      ? `matrix(${(C30 * S * u).toFixed(3)} ${(0.5 * S * u).toFixed(3)} 0 ${(-S * v).toFixed(3)} ${f1(o[0])} ${f1(o[1])})`
      : `matrix(${(-C30 * S * u).toFixed(3)} ${(0.5 * S * u).toFixed(3)} 0 ${(-S * v).toFixed(3)} ${f1(o[0])} ${f1(o[1])})`;
    g.setAttribute("transform", m);
    return g;
  };
  const statics: SVGGElement[] = [];
  [2.0, 6.2, 10.4, 14.6].forEach((y) => statics.push(win("x", 0.6, y, F + 2.8, 2.4, 6.2)));
  statics.push(win("y", 22.4, 0.6, F + 0.0, 3, 6.6));
  main.appendChild(decalsStatic);

  // --- personas
  const people: PNode[] = PEOPLE.map((d) => {
    const g = el("g", { opacity: 0 }) as SVGGElement;
    const inner = el("use", { href: `#eh-p${d.sym}`, x: -30, y: -104, width: 60, height: 108, class: d.id === "pr" ? "eh-body" : "", style: `animation-delay:${(d.id.charCodeAt(1) % 5) * -0.7}s` }, g) as SVGUseElement;
    main.appendChild(g);
    return { d, g, inner, k: 0, sig: "" };
  });

  // --- haces de reflectores y luces de ambiente
  const beams: SVGPathElement[] = [];
  const pools: SVGEllipseElement[] = [];
  const lightX = [5.25, 7.45, 9.65, 11.85, 14.05, 16.25, 18.45, 20.65];
  const targets: Array<[number, number]> = [[6, 3.2], [8.5, 2.6], [10.6, 3.6], [12.9, 2.8], [14.8, 3.6], [17, 2.6], [19.4, 3.2], [12.9, 3.2]];
  lightX.forEach((x, i) => {
    beams.push(el("path", { fill: "url(#eh-beam)", opacity: 0, class: "eh-beam" }, glow) as SVGPathElement);
    pools.push(el("ellipse", { fill: "url(#eh-pool)", opacity: 0, class: "eh-pool" }, glow) as SVGEllipseElement);
    void x; void targets[i];
  });
  const ups: SVGEllipseElement[] = [3, 8, 13, 17].map(() => el("ellipse", { fill: "url(#eh-up)", opacity: 0 }, glow) as SVGEllipseElement);

  // --- cálculo
  const keyCache = new Map<string, number>();
  let lastNight = -1;
  let curStep = 0;

  const polys = (q: Pose, kind: "box" | "cyl" = "box") => {
    const [x, y, w, d, h, z] = q;
    const z1 = z + h;
    const pt = (a: number, b: number, c: number) => {
      const r = proj(a, b, c);
      return `${f1(r[0])} ${f1(r[1])}`;
    };
    if (kind === "cyl") {
      const N = 18;
      const cx = x, cy = y, r = w;
      const tp: [number, number][] = [], bp: [number, number][] = [];
      for (let i = 0; i < N; i++) {
        const a = (i / N) * Math.PI * 2;
        tp.push(proj(cx + Math.cos(a) * r, cy + Math.sin(a) * r, z1));
        bp.push(proj(cx + Math.cos(a) * r, cy + Math.sin(a) * r, z));
      }
      const top = "M" + tp.map((v) => `${f1(v[0])} ${f1(v[1])}`).join("L") + "Z";
      const side = "M" + hull([...tp, ...bp]).map((v) => `${f1(v[0])} ${f1(v[1])}`).join("L") + "Z";
      return { top, left: side, right: "" };
    }
    return {
      top: `M${pt(x, y, z1)}L${pt(x + w, y, z1)}L${pt(x + w, y + d, z1)}L${pt(x, y + d, z1)}Z`,
      left: `M${pt(x, y + d, z)}L${pt(x + w, y + d, z)}L${pt(x + w, y + d, z1)}L${pt(x, y + d, z1)}Z`,
      right: `M${pt(x + w, y, z)}L${pt(x + w, y + d, z)}L${pt(x + w, y + d, z1)}L${pt(x + w, y, z1)}Z`,
    };
  };

  function hull(pts: [number, number][]) {
    const a = [...pts].sort((p1, p2) => p1[0] - p2[0] || p1[1] - p2[1]);
    const cross = (o: [number, number], p1: [number, number], p2: [number, number]) => (p1[0] - o[0]) * (p2[1] - o[1]) - (p1[1] - o[1]) * (p2[0] - o[0]);
    const lo: [number, number][] = [];
    for (const q of a) {
      while (lo.length >= 2 && cross(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop();
      lo.push(q);
    }
    const up: [number, number][] = [];
    for (let i = a.length - 1; i >= 0; i--) {
      const q = a[i];
      while (up.length >= 2 && cross(up[up.length - 2], up[up.length - 1], q) <= 0) up.pop();
      up.push(q);
    }
    return lo.slice(0, -1).concat(up.slice(0, -1));
  }

  const matrixFor = (face: Face, q: Pose, uw: number, vh: number, u0: number, v0: number) => {
    if (face === "y") {
      const o = proj(q[0] + u0, q[1] + q[3], q[5] + v0);
      return `matrix(${(C30 * S * uw).toFixed(3)} ${(0.5 * S * uw).toFixed(3)} 0 ${(-S * vh).toFixed(3)} ${f1(o[0])} ${f1(o[1])})`;
    }
    const o = proj(q[0] + q[2], q[1] + u0, q[5] + v0);
    return `matrix(${(-C30 * S * uw).toFixed(3)} ${(0.5 * S * uw).toFixed(3)} 0 ${(-S * vh).toFixed(3)} ${f1(o[0])} ${f1(o[1])})`;
  };

  function applyNight(n: number) {
    const q = Math.round(n * 20) / 20;
    if (q === lastNight) return;
    lastNight = q;
    (Object.keys(DAY) as Mat[]).forEach((m) => {
      for (let k = 0; k < 3; k++) {
        const day = DAY[m][k];
        let c: string;
        if (m === "scr") c = mix(day, SCR_ON[k], q);
        else if (m === "dark") c = mix(day, "#0a1013", q * 0.3);
        else if (m === "banner" || m === "table") c = mix(day, "#0a1317", q * 0.32);
        else c = mix(day, "#0a1317", q * 0.5);
        svg.style.setProperty(`--eh-${m}-${k}`, c);
      }
    });
    svg.style.setProperty("--eh-win", mix("#cfe3e6", "#0e1c27", q));
  }

  function render(P: number): number {
    const night = sm(c01((P - 0.76) / 0.08));
    const liveScr = sm(c01((P - 0.79) / 0.07));
    const brand = sm(c01((P - 0.6) / 0.1));
    const planA = 1 - sm(c01((P - 0.22) / 0.1));
    applyNight(night);
    const nightQ = lastNight;
    const fillA = sm(c01((P - 0.06) / 0.12));

    let bi = 0;
    const poses = new Map<string, Pose>();
    for (const n of nodes) {
      const d = n.d;
      let q: Pose = d.E;
      let u = 1;
      let alpha = 1;
      if (!d.base) {
        const w = d.win as [number, number];
        u = sm(c01((P - w[0]) / (w[1] - w[0])));
        const f = d.from ?? d.E;
        q = [lerp(f[0], d.E[0], u), lerp(f[1], d.E[1], u), lerp(f[2], d.E[2], u), lerp(f[3], d.E[3], u), lerp(f[4], d.E[4], u), lerp(f[5], d.E[5], u)];
        if (d.fade) alpha = c01(u / d.fade);
      }
      poses.set(d.id, q);
      n.pose = q;
      const visible = d.base || (P > (d.win as [number, number])[0] && (q[4] > 0.02 || !!d.screen));
      const fa = d.base ? fillA : 1;
      // trazo progresivo del salón vacío
      const dashP = d.base ? c01((P - (0.004 + bi * 0.012)) / 0.07) : 1;
      bi += d.base ? 1 : 0;
      const sig = `${visible ? 1 : 0}|${q.map((v) => v.toFixed(2)).join(",")}|${alpha.toFixed(2)}|${fa.toFixed(2)}|${dashP.toFixed(2)}|${nightQ}|${d.screen ? `${c01((P - (d.win as [number, number])[0]) / ((d.win as [number, number])[1] - (d.win as [number, number])[0])).toFixed(3)}|${liveScr.toFixed(2)}|${brand.toFixed(2)}` : ""}|${d.hatch ? planA.toFixed(2) : ""}`;
      if (sig === n.sig) continue;
      n.sig = sig;
      n.g.style.display = visible ? "" : "none";
      if (!visible) {
        if (n.shadow) n.shadow.setAttribute("display", "none");
        continue;
      }
      const flat = q[4] < 0.03;
      const pl = polys(q, d.kind ?? "box");
      n.top.setAttribute("d", pl.top);
      if (flat || !pl.left) {
        n.left.setAttribute("display", "none");
        n.right.setAttribute("display", "none");
      } else {
        n.left.removeAttribute("display");
        n.left.setAttribute("d", pl.left);
        if (pl.right) {
          n.right.removeAttribute("display");
          n.right.setAttribute("d", pl.right);
        } else n.right.setAttribute("display", "none");
      }
      if (d.base) n.top.setAttribute("stroke-dashoffset", (1 - dashP).toFixed(3));
      const op = (fa * alpha).toFixed(2);
      n.top.setAttribute("fill-opacity", op);
      n.left.setAttribute("fill-opacity", op);
      n.right.setAttribute("fill-opacity", op);
      n.g.setAttribute("opacity", alpha < 1 ? alpha.toFixed(2) : "1");
      n.top.setAttribute("stroke-opacity", (0.85 - 0.4 * fa).toFixed(2));
      if (n.lat) {
        if (!flat) {
          n.lat[0].setAttribute("d", pl.left);
          n.lat[1].setAttribute("d", pl.right);
          n.lat[0].removeAttribute("display");
          n.lat[1].removeAttribute("display");
        } else {
          n.lat[0].setAttribute("display", "none");
          n.lat[1].setAttribute("display", "none");
        }
      }
      if (n.hat) {
        n.hat.setAttribute("d", pl.top);
        n.hat.setAttribute("opacity", (planA * (1 - fa * 0.7) * 0.9).toFixed(2));
      }
      if (n.d.screen && n.decal) {
        n.decal.setAttribute("transform", matrixFor(n.d.screen.face, q, q[2], q[4], 0, 0));
        const w = d.win as [number, number];
        const tp = c01((P - w[0]) / (w[1] - w[0]));
        n.tiles?.forEach((t) => {
          const s = sm(c01((tp - t.a * 0.6) / 0.4));
          if (s >= 1) t.g.removeAttribute("transform");
          else t.g.setAttribute("transform", `translate(${t.cx.toFixed(3)} ${t.cy.toFixed(3)}) scale(${s.toFixed(3)}) translate(${(-t.cx).toFixed(3)} ${(-t.cy).toFixed(3)})`);
          t.g.setAttribute("opacity", s.toFixed(2));
        });
        n.content?.setAttribute("opacity", (Math.max(brand * 0.55, liveScr)).toFixed(2));
      } else if (d.mark && n.decal && n.mark) {
        const m = d.mark;
        const hf = c01(q[4] / d.E[4]);
        const show = c01((u - (m.after ?? 0.8)) / (1 - (m.after ?? 0.8)));
        n.decal.setAttribute("opacity", (show * hf).toFixed(2));
        n.decal.setAttribute("transform", matrixFor(m.face, q, m.size, m.size, m.u, m.v));
      }
      if (n.shadow) {
        if (q[4] > 0.8) {
          const dx = q[4] * 0.3, dy = q[4] * 0.18;
          const base = Math.max(F, q[5] < F ? F : q[5] > F + 2 ? F : q[5]);
          const pts: [number, number][] = [];
          const cs: [number, number][] = d.kind === "cyl"
            ? Array.from({ length: 8 }, (_, i) => [q[0] + Math.cos((i / 8) * 6.2832) * q[2], q[1] + Math.sin((i / 8) * 6.2832) * q[2]] as [number, number])
            : [[q[0], q[1]], [q[0] + q[2], q[1]], [q[0] + q[2], q[1] + q[3]], [q[0], q[1] + q[3]]];
          for (const [ax, ay] of cs) pts.push(proj(ax, ay, base), proj(ax + dx, ay + dy, base));
          const h = hull(pts);
          n.shadow.setAttribute("d", "M" + h.map((v) => `${f1(v[0])} ${f1(v[1])}`).join("L") + "Z");
          n.shadow.removeAttribute("display");
          n.shadow.setAttribute("fill-opacity", (0.11 * (1 - nightQ * 0.4)).toFixed(3));
        } else n.shadow.setAttribute("display", "none");
      }
    }

    // personas: entran caminando por los pasillos; el presentador sube a la tarima
    for (const pn of people) {
      const d = pn.d;
      const t = sm(c01((P - d.win[0]) / (d.win[1] - d.win[0])));
      const pts = d.path;
      const seg: number[] = [];
      let total = 0;
      for (let i = 1; i < pts.length; i++) {
        const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
        seg.push(l);
        total += l;
      }
      let dist = t * total;
      let x = pts[0][0], y = pts[0][1], z = pts[0][2];
      for (let i = 0; i < seg.length; i++) {
        if (dist <= seg[i] || i === seg.length - 1) {
          const k = seg[i] > 0 ? c01(dist / seg[i]) : 1;
          x = lerp(pts[i][0], pts[i + 1][0], k);
          y = lerp(pts[i][1], pts[i + 1][1], k);
          z = lerp(pts[i][2], pts[i + 1][2], k);
          break;
        }
        dist -= seg[i];
      }
      const alpha = c01(t / 0.12);
      const sig = `${x.toFixed(2)},${y.toFixed(2)},${z.toFixed(2)},${alpha.toFixed(2)},${nightQ}`;
      const stageKey = 17.4 / 2 + 4.2 + 0.6 + 2.7;
      pn.k = d.stage && y < 6 ? stageKey + 0.01 : x + y + 0.35;
      if (sig === pn.sig) continue;
      pn.sig = sig;
      const c = proj(x, y, z);
      const k = (3.4 * S) / 100;
      pn.g.setAttribute("transform", `translate(${f1(c[0])} ${f1(c[1])}) scale(${k.toFixed(4)})`);
      pn.g.setAttribute("opacity", (alpha * (1 - nightQ * 0.12)).toFixed(2));
    }

    // orden de profundidad (solo si cambia)
    keyCache.clear();
    const items: Array<{ k: number; g: SVGElement; id: string }> = [];
    for (const n of nodes) {
      const q = n.pose;
      let k = q[0] + q[2] / 2 + q[1] + q[3] / 2;
      if (n.d.kind === "cyl") k = q[0] + q[1];
      if (n.d.id === "floor") k = -100;
      else if (n.d.id === "carpet") k = -99;
      else if (n.d.id === "wB" || n.d.id === "wL") k = -50;
      else if (n.d.id.startsWith("sc")) k = -49;
      else if (n.d.id.startsWith("mon")) k = byId.get("foh")!.pose[0] + byId.get("foh")!.pose[2] / 2 + byId.get("foh")!.pose[1] + byId.get("foh")!.pose[3] / 2 + 0.01;
      items.push({ k, g: n.g, id: n.d.id });
    }
    items.push({ k: -48.5, g: decalsStatic, id: "~decals" });
    for (const pn of people) items.push({ k: pn.k, g: pn.g, id: pn.d.id });
    items.sort((u, v) => u.k - v.k || (u.id < v.id ? -1 : 1));
    // reordenación mínima: solo se mueve lo que cambió de posición
    let next: Element | null = null;
    for (let i = items.length - 1; i >= 0; i--) {
      const g = items[i].g;
      if (g.nextElementSibling !== next || g.parentNode !== main) main.insertBefore(g, next);
      next = g;
    }

    // suelo para recorte de sombras, planificación y luz
    sa(grid, "opacity", (0.2 + 0.8 * planA).toFixed(2));
    const annA = sm(c01((P - 0.04) / 0.05)) * planA;
    sa(ann, "opacity", annA.toFixed(2));
    statics.forEach((g) => sa(g, "opacity", fillA.toFixed(2)));

    // reflectores y luz decorativa (fase en vivo)
    const spot = sm(c01((P - 0.82) / 0.08));
    lightX.forEach((x, i) => {
      const a = proj(x + 0.25, 5.4, BZ - 0.7);
      const t = targets[i];
      const r = 1.5;
      const b1 = proj(t[0] - r, t[1], 1.6), b2 = proj(t[0] + r, t[1], 1.6);
      sa(beams[i], "d", `M${f1(a[0] - 3)} ${f1(a[1])}L${f1(a[0] + 3)} ${f1(a[1])}L${f1(b2[0])} ${f1(b2[1])}L${f1(b1[0])} ${f1(b1[1])}Z`);
      sa(beams[i], "opacity", (spot * 0.8).toFixed(2));
      const c = proj(t[0], t[1], 1.6);
      sa(pools[i], "cx", f1(c[0]));
      sa(pools[i], "cy", f1(c[1]));
      sa(pools[i], "rx", f1(r * 1.3 * C30 * S));
      sa(pools[i], "ry", f1(r * 0.7 * S * 0.5));
      sa(pools[i], "opacity", (spot * 0.9).toFixed(2));
    });
    [3, 8, 13, 17].forEach((y, i) => {
      const u = byId.get(`up${i}`)!.pose;
      const c = proj(u[0] + 0.25, u[1] + 0.25, F + 1.6);
      sa(ups[i], "cx", f1(c[0]));
      sa(ups[i], "cy", f1(c[1]));
      sa(ups[i], "rx", "22");
      sa(ups[i], "ry", f1(2.6 * S));
      sa(ups[i], "opacity", (c01(u[4] / 0.5) * (0.25 + 0.75 * night)).toFixed(2));
      void y;
    });

    const step = P < 0.2 ? 1 : P < 0.5 ? 2 : P < 0.76 ? 3 : 4;
    curStep = step;
    return step;
  }

  void baseCount;
  return {
    render,
    step: () => curStep,
    destroy: () => {
      svg.textContent = "";
    },
  };
}
