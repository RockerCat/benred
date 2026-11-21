/**
 * «Un espacio, tres posibilidades»: un único stand isométrico que nace como plano, se eleva y evoluciona entre tres
 * configuraciones (abierto → esquina → gran formato). Identidad de marca ficticia y abstracta (isotipo sin texto);
 * NO es un proyecto de BenRed ni de un cliente.
 *
 * Un solo modelo paramétrico: cada elemento (prisma) tiene una pose [x, y, w, d, h, z] por configuración y el
 * motor interpola entre ellas según el progreso p (0–1) que escribe el scroll. No hay tres ilustraciones: hay un
 * conjunto de piezas que se hunden, se desplazan sobre el suelo y vuelven a elevarse, de modo que ninguna pieza
 * atraviesa a otra (solo se mueve cuando está a ras de suelo).
 *
 * Render: SVG imperativo (sin React por fotograma). Cada pieza dibuja tres caras proyectadas; se ordena por
 * profundidad solo cuando cambia el orden. Cámara fija (isométrica).
 *
 * Línea de tiempo (p):
 *   0.00–0.14  plano técnico (se dibuja)      0.14–0.30  elevación 3D     0.30–0.44  materiales, luz, visitantes
 *   0.45–0.62  abierto → esquina              0.66–0.83  esquina → gran formato      0.85–1  presentación
 */

const NS = "http://www.w3.org/2000/svg";
const C30 = 0.8660254;
const S = 28;
const OX = 440;
const OY = 300;
const F = 0.4; // altura de la tarima

type Pose = [number, number, number, number, number, number]; // x, y, w, d, h, z (suelo = 0)
type Mat = "plat" | "rug" | "wall" | "dark" | "teal" | "wood" | "glass" | "metal" | "screen";
type Face = "x" | "y";

type El = {
  id: string;
  mat: Mat;
  ord: number; // 0 (primero) … 1 (último) en la elevación
  /** "swap": se hunde, se desplaza a ras de suelo y se vuelve a elevar. "lerp": crece/cambia en su sitio. */
  mode?: "swap" | "lerp";
  win?: [number, number]; // ventana [0–1] de la transición en que cambia
  P?: [Pose | null, Pose | null, Pose | null];
  parent?: string;
  rel?: Pose; // hijo: [dx, dy, dw, dd, h, dz] respecto a la cara superior del padre
  prod?: "sphere" | "cyl" | "gem";
  hatch?: boolean;
  shadow?: boolean;
  mark?: { face: Face; u: number | "r"; v: number; size: number };
  screen?: Face;
  led?: { face: Face; edge: "top" | "bottom" };
};

const p = (x: number, y: number, w: number, d: number, h: number, z = F): Pose => [x, y, w, d, h, z];

const ELS: El[] = [
  { id: "plat", mat: "plat", ord: 0, mode: "lerp", P: [p(0, 0, 14, 10, F, 0), p(0, 0, 14, 10, F, 0), p(0, 0, 18, 13, F, 0)] },
  { id: "rug", mat: "rug", ord: 0.1, mode: "lerp", P: [p(1.4, 1.6, 8.4, 7.2, 0.05), p(2, 4.2, 10, 5.2, 0.05), p(1.4, 3, 13.2, 9, 0.05)] },
  { id: "wBack", mat: "wall", ord: 0.2, mode: "lerp", hatch: true, shadow: true, mark: { face: "y", u: "r", v: 5.6, size: 1.2 },
    P: [p(1, 0, 9, 0.5, 7.2), p(0, 0, 14, 0.5, 7.2), p(0, 0, 18, 0.5, 7.2)] },
  { id: "wSide", mat: "wall", ord: 0.25, mode: "lerp", hatch: true, shadow: true,
    P: [p(0, 1, 0.5, 1, 0), p(0, 0.5, 0.5, 9.5, 7.2), p(0, 0.5, 0.5, 7, 7.2)] },
  { id: "totem", mat: "dark", ord: 0.3, mode: "swap", shadow: true, mark: { face: "y", u: 0.1, v: 5.2, size: 0.8 },
    P: [p(12.4, 1.2, 1, 1, 7.2), p(12.8, 1, 0.9, 0.9, 7.2), p(0.9, 10.2, 1, 1, 7.2)] },
  { id: "cnt", mat: "wall", ord: 0.35, mode: "swap", hatch: true, shadow: true, led: { face: "y", edge: "top" },
    mark: { face: "y", u: 0.45, v: 0.2, size: 1.0 },
    P: [p(4.5, 4, 4.5, 1.8, 2.2), p(2.8, 6.6, 5, 1.6, 2.2), p(7.5, 7.8, 6.4, 2, 2.2)] },
  { id: "cntTop", mat: "wood", ord: 0.4, parent: "cnt", rel: [-0.12, -0.12, 0.24, 0.24, 0.16, 0] },
  { id: "bench", mat: "wood", ord: 0.45, mode: "swap", shadow: true, P: [p(1.4, 7, 3.2, 1, 1.1), p(1.4, 8.6, 3.2, 1, 1.1), null] },
  { id: "k1", mat: "dark", ord: 0.5, mode: "swap", shadow: true, P: [null, p(8.4, 5.2, 2.6, 1.4, 1.1), p(2.4, 4.6, 2.6, 1.5, 1.1)] },
  { id: "k1Top", mat: "teal", ord: 0.5, parent: "k1", rel: [0.15, 0.15, -0.3, -0.3, 0.1, 0] },
  { id: "k2", mat: "dark", ord: 0.5, mode: "swap", shadow: true, P: [null, null, p(2.4, 8.2, 2.6, 1.5, 1.1)] },
  { id: "k2Top", mat: "teal", ord: 0.5, parent: "k2", rel: [0.15, 0.15, -0.3, -0.3, 0.1, 0] },
  { id: "p1", mat: "dark", ord: 0.55, mode: "swap", shadow: true, P: [p(10.4, 2.2, 1.5, 1.5, 1.3), p(7.4, 1.4, 1.4, 1.4, 1.3), p(8.0, 3.4, 1.6, 1.6, 1.3)] },
  { id: "p1o", mat: "dark", ord: 0.6, parent: "p1", prod: "sphere", rel: [0, 0, 0, 0, 0, 0] },
  { id: "p2", mat: "dark", ord: 0.55, mode: "swap", shadow: true, P: [p(10.4, 4.8, 1.5, 1.5, 1.9), p(9.2, 1.4, 1.4, 1.4, 1.9), p(10.2, 3.4, 1.6, 1.6, 1.9)] },
  { id: "p2o", mat: "dark", ord: 0.6, parent: "p2", prod: "cyl", rel: [0, 0, 0, 0, 0, 0] },
  { id: "p3", mat: "dark", ord: 0.55, mode: "swap", shadow: true, P: [p(10.4, 7.4, 1.5, 1.5, 1.3), p(11, 1.4, 1.4, 1.4, 1.3), p(12.4, 3.4, 1.6, 1.6, 1.3)] },
  { id: "p3o", mat: "dark", ord: 0.6, parent: "p3", prod: "gem", rel: [0, 0, 0, 0, 0, 0] },
  // vitrinas (base + producto + vidrio)
  { id: "v1", mat: "dark", ord: 0.6, mode: "swap", P: [null, p(1.2, 1.2, 1.5, 1.5, 0.9), p(14.6, 1.6, 1.6, 1.6, 0.9)] },
  { id: "v1o", mat: "dark", ord: 0.65, parent: "v1", prod: "gem", rel: [0, 0, 0, 0, 0, 0] },
  { id: "v1g", mat: "glass", ord: 0.7, parent: "v1", rel: [0, 0, 0, 0, 2.9, 0] },
  { id: "v2", mat: "dark", ord: 0.6, mode: "swap", P: [null, p(1.2, 2.95, 1.5, 1.5, 0.9), p(14.6, 3.7, 1.6, 1.6, 0.9)] },
  { id: "v2o", mat: "dark", ord: 0.65, parent: "v2", prod: "sphere", rel: [0, 0, 0, 0, 0, 0] },
  { id: "v2g", mat: "glass", ord: 0.7, parent: "v2", rel: [0, 0, 0, 0, 2.9, 0] },
  // pantallas sobre muros
  { id: "scr1", mat: "screen", ord: 0.9, mode: "lerp", parent: "wBack", screen: "y",
    P: [p(2.2, 0.5, 5.6, 0.2, 3.2, F + 2.4), p(3.6, 0.5, 6, 0.2, 3.4, F + 2.2), p(2.2, 0.5, 9.6, 0.2, 4.4, F + 2.2)] },
  { id: "scr2", mat: "screen", ord: 0.9, mode: "lerp", parent: "wSide", screen: "x",
    P: [p(0.5, 3, 0.2, 3, 0, F + 2.4), p(0.5, 4.6, 0.2, 4.6, 3.2, F + 2.2), p(0.5, 1.4, 0.2, 5, 3.8, F + 2.4)] },
  // estructura superior (solo gran formato): columnas primero, friso después
  { id: "cA", mat: "metal", ord: 0.6, mode: "lerp", win: [0, 0.65], shadow: true, P: [null, null, p(17.2, 0.8, 0.6, 0.6, 8.4)] },
  { id: "cB", mat: "metal", ord: 0.6, mode: "lerp", win: [0, 0.65], shadow: true, P: [null, null, p(17.2, 12.2, 0.6, 0.6, 8.4)] },
  { id: "cC", mat: "metal", ord: 0.6, mode: "lerp", win: [0, 0.65], shadow: true, P: [null, null, p(0.6, 12.2, 0.6, 0.6, 8.4)] },
  { id: "bL", mat: "wall", ord: 0.7, mode: "lerp", win: [0.6, 1], P: [null, null, p(0.6, 0.5, 0.6, 12.3, 1, F + 8.4)] },
  { id: "bR", mat: "wall", ord: 0.7, mode: "lerp", win: [0.6, 1], led: { face: "x", edge: "bottom" },
    mark: { face: "x", u: 3.2, v: 0.3, size: 0.65 }, P: [null, null, p(17.2, 0.8, 0.6, 12, 1, F + 8.4)] },
  { id: "bF", mat: "wall", ord: 0.7, mode: "lerp", win: [0.6, 1], led: { face: "y", edge: "bottom" },
    mark: { face: "y", u: 2.2, v: 0.3, size: 0.65 }, P: [null, null, p(0.6, 12.2, 17.2, 0.6, 1, F + 8.4)] },
];

type Person = {
  id: string;
  skin: string;
  top: string;
  pants: string;
  hair: string;
  arm?: "wave";
  /** posición (x, y) y presencia por configuración; `from` = punto de entrada cuando aún no está presente */
  at: [number, number][];
  pres: [number, number, number];
  from?: [number, number];
};

const PEOPLE: Person[] = [
  { id: "h1", skin: "#e6b99a", top: "#026472", pants: "#1a2427", hair: "#2a1c14", at: [[6.8, 3.2], [5.4, 5.4], [10.6, 6.9]], pres: [1, 1, 1] },
  { id: "h2", skin: "#c98f6b", top: "#ff5a2b", pants: "#26363b", hair: "#0d1517", at: [[6.2, 7.2], [5.2, 9.4], [10.2, 11.2]], pres: [1, 1, 1], arm: "wave" },
  { id: "h3", skin: "#8d5a3b", top: "#e9e5db", pants: "#3a4a50", hair: "#0d1517", at: [[12.6, 5.6], [9.4, 7.7], [9.6, 5.6]], pres: [1, 1, 1] },
  { id: "h4", skin: "#f0cdb0", top: "#258288", pants: "#0d1517", hair: "#6b4a2b", at: [[8, 10.4], [11.6, 7.4], [13.2, 6.4]], pres: [0, 1, 1], from: [8, 10.6] },
  { id: "h5", skin: "#d9a27c", top: "#1a2427", pants: "#5d6b70", hair: "#1a1109", at: [[4, 13.4], [4, 13.4], [5.9, 5.4]], pres: [0, 0, 1], from: [4, 13.5] },
  { id: "h6", skin: "#b47a54", top: "#64bdaf", pants: "#26363b", hair: "#0d1517", at: [[12, 13.4], [12, 13.4], [5.8, 9.2]], pres: [0, 0, 1], from: [8, 13.5] },
];

const MATS: Record<Mat, [string, string, string]> = {
  // superior, cara izquierda (+y), cara derecha (+x)
  plat: ["#dcd6c8", "#c4bdac", "#a79f8c"],
  rug: ["#bfe0d8", "#bfe0d8", "#bfe0d8"],
  wall: ["#ffffff", "#ece8de", "#cdc7b8"],
  dark: ["#33444a", "#1f2d31", "#0d1517"],
  teal: ["#3a9ea4", "#258288", "#026472"],
  wood: ["#e6cfa6", "#cfae7e", "#a98a5c"],
  glass: ["#c9ece6", "#a9ddd5", "#8cc9c0"],
  metal: ["#8e9ca1", "#6e7d82", "#4d5b60"],
  screen: ["#26363b", "#0d1517", "#0d1517"],
};

const c01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);
const sm = (t: number) => t * t * (3 - 2 * t);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const f1 = (n: number) => n.toFixed(1);
const proj = (x: number, y: number, z: number): [number, number] => [OX + (x - y) * C30 * S, OY + (x + y) * 0.5 * S - z * S];

const el = (tag: string, attrs: Record<string, string | number> = {}, parent?: Element) => {
  const e = document.createElementNS(NS, tag);
  for (const k in attrs) e.setAttribute(k, String(attrs[k]));
  parent?.appendChild(e);
  return e;
};

/** Rellena las configuraciones ausentes con la más cercana a altura 0 (la pieza crece/se hunde en su sitio). */
function fill(P: [Pose | null, Pose | null, Pose | null]): [Pose, Pose, Pose] {
  const out = [...P] as Array<Pose | null>;
  for (let i = 0; i < 3; i++) {
    if (out[i]) continue;
    let best = -1;
    for (let d = 1; d < 3 && best < 0; d++) {
      if (P[i + d]) best = i + d;
      else if (P[i - d]) best = i - d;
    }
    const src = P[best] as Pose;
    out[i] = [src[0], src[1], src[2], src[3], 0, src[5]];
  }
  return out as [Pose, Pose, Pose];
}

type Node = {
  d: El;
  P?: [Pose, Pose, Pose];
  hMax: number;
  pres: [boolean, boolean, boolean];
  g: SVGGElement;
  top: SVGPathElement;
  left: SVGPathElement;
  right: SVGPathElement;
  hat?: SVGPathElement;
  led?: SVGPathElement;
  decal?: SVGGElement;
  decalBars?: SVGGElement;
  decalMark?: SVGGElement;
  sprite?: SVGGElement;
  shadow?: SVGPathElement;
  idx: number;
  pose: Pose;
  key: number;
  lastSig: string;
};

type PNode = { d: Person; g: SVGGElement; k: number; sig: string };

export function mountStandMorph(svg: SVGSVGElement) {
  svg.textContent = "";
  const defs = el("defs", {}, svg);
  // símbolo de marca ficticia (isotipo abstracto, sin texto)
  const mark = el("symbol", { id: "sm-mark", viewBox: "0 0 100 100" }, defs);
  el("circle", { cx: 50, cy: 50, r: 46, fill: "#ff5a2b" }, mark);
  el("path", { d: "M50 17L83 50L50 83L17 50Z", fill: "#ffffff" }, mark);
  el("circle", { cx: 50, cy: 50, r: 11, fill: "#0d1517" }, mark);
  const hatch = el("pattern", { id: "sm-hatch", width: 5, height: 5, patternUnits: "userSpaceOnUse", patternTransform: "rotate(45)" }, defs);
  el("line", { x1: 0, y1: 0, x2: 0, y2: 5, stroke: "#0d1517", "stroke-width": 0.8, "stroke-opacity": 0.5 }, hatch);
  const glow = el("radialGradient", { id: "sm-glow" }, defs);
  el("stop", { offset: "0", "stop-color": "#64bdaf", "stop-opacity": 0.55 }, glow);
  el("stop", { offset: "1", "stop-color": "#64bdaf", "stop-opacity": 0 }, glow);
  const scr = el("linearGradient", { id: "sm-scr", x1: 0, y1: 0, x2: 1, y2: 1 }, defs);
  el("stop", { offset: "0", "stop-color": "#0d3a40" }, scr);
  el("stop", { offset: "1", "stop-color": "#0d1517" }, scr);

  const bg = el("g", { class: "sm-bg" }, svg);
  const clip = el("clipPath", { id: "sm-clip" }, defs);
  const clipPath = el("path", {}, clip);
  const shadowLayer = el("g", { class: "sm-shadows", "clip-path": "url(#sm-clip)" }, svg);
  const main = el("g", { class: "sm-main" }, svg);
  const fg = el("g", { class: "sm-fg" }, svg);

  // --- anotaciones del plano (se desvanecen al elevarse)
  const grid = el("g", { class: "sm-grid" }, bg);
  const gp: string[] = [];
  for (let x = 0; x <= 18; x += 2) {
    const a = proj(x, 0, F), b = proj(x, 13, F);
    gp.push(`M${f1(a[0])} ${f1(a[1])}L${f1(b[0])} ${f1(b[1])}`);
  }
  for (let y = 0; y <= 13; y += 2) {
    const a = proj(0, y, F), b = proj(18, y, F);
    gp.push(`M${f1(a[0])} ${f1(a[1])}L${f1(b[0])} ${f1(b[1])}`);
  }
  el("path", { d: gp.join(""), fill: "none", stroke: "#0d1517", "stroke-opacity": 0.12, "stroke-width": 0.8 }, grid);
  const ann = el("g", { class: "sm-ann" }, fg);
  const tx = (x: number, y: number, z: number, text: string, anchor = "start") => {
    const [sx, sy] = proj(x, y, z);
    const t = el("text", { x: f1(sx), y: f1(sy), "text-anchor": anchor, class: "sm-t" }, ann);
    t.textContent = text;
  };
  const line = (x1: number, y1: number, x2: number, y2: number, z = F) => {
    const a = proj(x1, y1, z), b = proj(x2, y2, z);
    el("path", { d: `M${f1(a[0])} ${f1(a[1])}L${f1(b[0])} ${f1(b[1])}`, fill: "none", stroke: "#ff5a2b", "stroke-width": 1, "stroke-opacity": 0.9 }, ann);
  };
  // cotas del perímetro de la configuración inicial
  line(0, 11.2, 14, 11.2); line(0, 10.9, 0, 11.5); line(14, 10.9, 14, 11.5);
  tx(7, 12.7, F, "FRENTE", "middle");
  line(15.2, 0, 15.2, 10); line(14.9, 0, 15.5, 0); line(14.9, 10, 15.5, 10);
  tx(16.4, 5.2, F, "FONDO");
  // accesos
  tx(7, 10.2, F, "ACCESO ▼", "middle");
  tx(14.4, 5.6, F, "ACCESO ▶");
  // referencias de zona
  tx(4.5, 3.6, F, "ATENCIÓN");
  tx(10.2, 1.6, F, "EXHIBICIÓN");
  tx(3.5, -0.8, F, "PANTALLA");
  tx(-0.9, 5, F, "PANEL", "end");
  // norte
  const nt = proj(-3, 2, F);
  el("path", { d: `M${f1(nt[0])} ${f1(nt[1] + 14)}L${f1(nt[0])} ${f1(nt[1] - 14)}M${f1(nt[0] - 5)} ${f1(nt[1] - 7)}L${f1(nt[0])} ${f1(nt[1] - 14)}L${f1(nt[0] + 5)} ${f1(nt[1] - 7)}`, fill: "none", stroke: "#0d1517", "stroke-width": 1, "stroke-opacity": 0.6 }, ann);

  // brillo de suelo frente a la pantalla principal
  const floorGlow = el("ellipse", { class: "sm-fglow", fill: "url(#sm-glow)", opacity: 0 }, bg);

  // --- nodos
  const nodes: Node[] = [];
  const byId = new Map<string, Node>();
  ELS.forEach((d, i) => {
    const g = el("g", { class: "sm-el" }) as SVGGElement;
    const [m0, m1, m2] = MATS[d.mat];
    const left = el("path", { fill: m1, stroke: "#0d1517", "stroke-opacity": 0.5, "stroke-width": 0.8, "stroke-linejoin": "round" }, g) as SVGPathElement;
    const right = el("path", { fill: m2, stroke: "#0d1517", "stroke-opacity": 0.5, "stroke-width": 0.8, "stroke-linejoin": "round" }, g) as SVGPathElement;
    const glass = d.mat === "glass";
    if (glass) {
      left.setAttribute("fill-opacity", "0.3");
      right.setAttribute("fill-opacity", "0.3");
    }
    const top = el("path", {
      fill: m0, stroke: "#0d1517", "stroke-opacity": 0.85, "stroke-width": 1.1, "stroke-linejoin": "round",
      pathLength: 1, "stroke-dasharray": "1 1.02", "stroke-dashoffset": 1, ...(glass ? { "fill-opacity": 0.3 } : {}),
    }, g) as SVGPathElement;
    const n: Node = {
      d, g, top, left, right, idx: i, pose: [0, 0, 0, 0, 0, 0], key: 0, lastSig: "",
      P: d.P ? fill(d.P) : undefined,
      hMax: d.P ? Math.max(...fill(d.P).map((q) => q[4])) : d.rel ? d.rel[4] : 0,
      pres: d.P ? (d.P.map((q) => !!q && q[4] > 0) as [boolean, boolean, boolean]) : [true, true, true],
    };
    if (d.hatch) n.hat = el("path", { fill: "url(#sm-hatch)", stroke: "none", opacity: 0 }, g) as SVGPathElement;
    if (d.led) n.led = el("path", { fill: "none", stroke: "#64bdaf", "stroke-width": 2.2, "stroke-linecap": "round", opacity: 0 }, g) as SVGPathElement;
    if (d.screen) {
      n.decal = el("g", { class: "sm-decal", opacity: 0 }, g) as SVGGElement;
      el("rect", { x: 0, y: 0, width: 1, height: 1, fill: "url(#sm-scr)" }, n.decal);
      n.decalBars = el("g", { class: "sm-sbs" }, n.decal) as SVGGElement;
      [0.16, 0.3, 0.44].forEach((yy, k) =>
        el("rect", { x: 0.06, y: yy, width: 0.5 - k * 0.1, height: 0.07, fill: "#64bdaf", "fill-opacity": 0.85, class: `sm-sb sm-sb${k}` }, n.decalBars),
      );
      n.decalMark = el("g", {}, n.decal) as SVGGElement;
      el("use", { href: "#sm-mark", x: 0, y: 0, width: 1, height: 1 }, n.decalMark);
    } else if (d.mark) {
      n.decal = el("g", { class: "sm-decal", opacity: 0 }, g) as SVGGElement;
      n.decalMark = el("g", {}, n.decal) as SVGGElement;
      el("use", { href: "#sm-mark", x: 0, y: 0, width: 1, height: 1 }, n.decalMark);
    }
    if (d.prod) {
      n.sprite = el("g", { opacity: 0 }, g) as SVGGElement;
      if (d.prod === "sphere") {
        el("circle", { cx: 0, cy: -9, r: 9, fill: "#258288", stroke: "#0d1517", "stroke-opacity": 0.5, "stroke-width": 0.8 }, n.sprite);
        el("circle", { cx: -3, cy: -12, r: 3, fill: "#fff", "fill-opacity": 0.45 }, n.sprite);
      } else if (d.prod === "cyl") {
        el("path", { d: "M-7 -6V-20A7 3 0 0 1 7 -20V-6A7 3 0 0 1 -7 -6Z", fill: "#ff5a2b", stroke: "#0d1517", "stroke-opacity": 0.5, "stroke-width": 0.8 }, n.sprite);
        el("ellipse", { cx: 0, cy: -20, rx: 7, ry: 3, fill: "#ff8a63" }, n.sprite);
      } else {
        el("path", { d: "M0 -22L9 -12L0 -2L-9 -12Z", fill: "#64bdaf", stroke: "#0d1517", "stroke-opacity": 0.5, "stroke-width": 0.8 }, n.sprite);
        el("path", { d: "M-9 -12L0 -12L0 -2ZM0 -22L0 -12L9 -12Z", fill: "#fff", "fill-opacity": 0.3 }, n.sprite);
      }
    }
    if (d.shadow) n.shadow = el("path", { fill: "#0d1517", "fill-opacity": 0.1 }, shadowLayer) as SVGPathElement;
    nodes.push(n);
    byId.set(d.id, n);
    main.appendChild(g);
  });

  // --- personas (figuras vectoriales proporcionadas: altura 100 unidades locales ≈ 1,7 m)
  const people: PNode[] = PEOPLE.map((d) => {
    const g = el("g", { class: "sm-p", opacity: 0 }) as SVGGElement;
    el("ellipse", { cx: 0, cy: 0, rx: 15, ry: 4.6, fill: "#0d1517", "fill-opacity": 0.18 }, g);
    const body = el("g", { class: "sm-body", style: `animation-delay:${(d.id.charCodeAt(1) % 5) * -0.7}s` }, g);
    const st = { stroke: "#0d1517", "stroke-opacity": 0.45, "stroke-width": 0.7, "stroke-linejoin": "round" };
    el("path", { d: "M-10 -46H-2.5V-3H-11.5Z", fill: d.pants, ...st }, body);
    el("path", { d: "M2.5 -46H10V-3H11.5Z", fill: d.pants, ...st }, body);
    el("rect", { x: -12.5, y: -4, width: 9.5, height: 4, rx: 1.5, fill: "#0d1517" }, body);
    el("rect", { x: 3, y: -4, width: 9.5, height: 4, rx: 1.5, fill: "#0d1517" }, body);
    el("path", { d: "M-15 -82Q-15 -88 -9 -88.5H9Q15 -88 15 -82L13.5 -44H-13.5Z", fill: d.top, ...st }, body);
    el("path", { d: "M-15 -83L-20.5 -52L-16 -50L-11.5 -78Z", fill: d.top, ...st }, body);
    el("circle", { cx: -18.6, cy: -49, r: 3.2, fill: d.skin }, body);
    if (d.arm === "wave") {
      const arm = el("g", { class: "sm-wave" }, body);
      el("path", { d: "M15 -83L25 -68L21 -65L11.5 -78Z", fill: d.top, ...st }, arm);
      el("circle", { cx: 23.8, cy: -68.5, r: 3.2, fill: d.skin }, arm);
    } else {
      el("path", { d: "M15 -83L20.5 -52L16 -50L11.5 -78Z", fill: d.top, ...st }, body);
      el("circle", { cx: 18.6, cy: -49, r: 3.2, fill: d.skin }, body);
    }
    el("rect", { x: -3.2, y: -91, width: 6.4, height: 5, fill: d.skin }, body);
    el("circle", { cx: 0, cy: -95, r: 6.4, fill: d.skin, ...st }, body);
    el("path", { d: "M-6.8 -95.5A6.8 6.8 0 0 1 6.8 -95.5Q0 -99.5 -6.8 -95.5Z", fill: d.hair }, body);
    main.appendChild(g);
    return { d, g, k: 0, sig: "" };
  });

  // --- cálculo
  const sortKeys = new Map<string, number>();
  let order = "";
  let curStep = 0;
  let curPoseCache: Pose[] = [];

  function configAt(P: number): { a: number; b: number; s: number } {
    if (P < 0.45) return { a: 0, b: 0, s: 0 };
    if (P < 0.62) return { a: 0, b: 1, s: sm((P - 0.45) / 0.17) };
    if (P < 0.66) return { a: 1, b: 1, s: 0 };
    if (P < 0.83) return { a: 1, b: 2, s: sm((P - 0.66) / 0.17) };
    return { a: 2, b: 2, s: 0 };
  }

  function poseOf(n: Node, cfg: { a: number; b: number; s: number }, P: number): Pose {
    const d = n.d;
    const A = (n.P as [Pose, Pose, Pose])[cfg.a];
    const B = (n.P as [Pose, Pose, Pose])[cfg.b];
    // elevación inicial (plano → volumen): la altura crece escalonada por orden
    const es = 0.14 + d.ord * 0.04;
    const e = sm(c01((P - es) / 0.12));
    if (cfg.a === cfg.b) return [A[0], A[1], A[2], A[3], A[4] * e, A[5]];
    const w = d.win ?? [0, 1];
    const s = sm(c01((cfg.s - w[0]) / (w[1] - w[0])));
    const moved = Math.abs(A[0] - B[0]) > 0.01 || Math.abs(A[1] - B[1]) > 0.01 || Math.abs(A[2] - B[2]) > 0.01 || Math.abs(A[3] - B[3]) > 0.01;
    if (d.mode === "swap" && moved) {
      if (s < 0.3) return [A[0], A[1], A[2], A[3], A[4] * (1 - sm(s / 0.3)), A[5]];
      if (s < 0.62) {
        const t = sm((s - 0.3) / 0.32);
        return [lerp(A[0], B[0], t), lerp(A[1], B[1], t), lerp(A[2], B[2], t), lerp(A[3], B[3], t), 0, lerp(A[5], B[5], t)];
      }
      return [B[0], B[1], B[2], B[3], B[4] * sm((s - 0.62) / 0.38), B[5]];
    }
    return [lerp(A[0], B[0], s), lerp(A[1], B[1], s), lerp(A[2], B[2], s), lerp(A[3], B[3], s), lerp(A[4], B[4], s), lerp(A[5], B[5], s)];
  }

  function polys(q: Pose) {
    const [x, y, w, d, h, z] = q;
    const z1 = z + h;
    const pt = (a: number, b: number, c: number) => {
      const r = proj(a, b, c);
      return `${f1(r[0])} ${f1(r[1])}`;
    };
    return {
      top: `M${pt(x, y, z1)}L${pt(x + w, y, z1)}L${pt(x + w, y + d, z1)}L${pt(x, y + d, z1)}Z`,
      left: `M${pt(x, y + d, z)}L${pt(x + w, y + d, z)}L${pt(x + w, y + d, z1)}L${pt(x, y + d, z1)}Z`,
      right: `M${pt(x + w, y, z)}L${pt(x + w, y + d, z)}L${pt(x + w, y + d, z1)}L${pt(x + w, y, z1)}Z`,
    };
  }

  const matrixFor = (face: Face, x: number, y: number, w: number, d: number, z: number, uw: number, vh: number, u0: number, v0: number) => {
    // origen de la cara (esquina inferior izquierda según la vista) y ejes u (a lo largo) y v (arriba)
    if (face === "y") {
      const o = proj(x + u0, y + d, z + v0);
      return `matrix(${(C30 * S * uw).toFixed(3)} ${(0.5 * S * uw).toFixed(3)} 0 ${(-S * vh).toFixed(3)} ${f1(o[0])} ${f1(o[1])})`;
    }
    const o = proj(x + w, y + u0, z + v0);
    return `matrix(${(-C30 * S * uw).toFixed(3)} ${(0.5 * S * uw).toFixed(3)} 0 ${(-S * vh).toFixed(3)} ${f1(o[0])} ${f1(o[1])})`;
  };

  const hull = (pts: [number, number][]) => {
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
  };

  function render(P: number): number {
    const cfg = configAt(P);
    const lit = sm(c01((P - 0.3) / 0.12));
    const planA = 1 - sm(c01((P - 0.15) / 0.12));
    const N = nodes.length;

    // 1) poses (padres antes que hijos)
    const poses = new Map<string, Pose>();
    const vis = new Map<string, number>();
    for (const n of nodes) {
      if (!n.d.parent || n.P) {
        poses.set(n.d.id, poseOf(n, cfg, P));
      }
    }
    for (const n of nodes) {
      if (n.d.rel && !n.P) {
        const par = nodes.find((m) => m.d.id === n.d.parent) as Node;
        const pp = poses.get(par.d.id) as Pose;
        const f = par.hMax > 0 ? c01(pp[4] / par.hMax) : 0;
        const r = n.d.rel;
        poses.set(n.d.id, [pp[0] + r[0], pp[1] + r[1], pp[2] + r[2], pp[3] + r[3], r[4] * f, pp[5] + pp[4] + r[5]]);
        vis.set(n.d.id, f);
      }
    }

    // existencia: una pieza se dibuja si está en la configuración de origen o de destino (los hijos siguen al padre)
    const exists = new Map<string, boolean>();
    for (const n of nodes) if (n.P) exists.set(n.d.id, n.pres[cfg.a] || n.pres[cfg.b]);
    for (const n of nodes) if (!n.P) exists.set(n.d.id, exists.get(n.d.parent as string) ?? false);

    // 2) dibujo
    let i = 0;
    for (const n of nodes) {
      const q = poses.get(n.d.id) as Pose;
      n.pose = q;
      const flat = q[4] < 0.03;
      const sig = q.map((v) => v.toFixed(2)).join(",") + "|" + P.toFixed(3);
      // plano: trazo progresivo por pieza
      const dp = c01((P - (0.004 + (i * 0.07) / N)) / 0.07);
      i++;
      const fa = n.d.id === "plat" || n.d.id === "rug" ? sm(c01((P - 0.2) / 0.1)) : sm(c01((P - (0.2 + n.d.ord * 0.05)) / 0.1));
      const present = exists.get(n.d.id) as boolean;
      if (sig === n.lastSig) continue;
      n.lastSig = sig;
      const pl = polys(q);
      const isGlass = n.d.mat === "glass";
      const hidden = n.d.rel ? (n.d.prod ? (vis.get(n.d.id) ?? 0) < 0.02 : q[4] < 0.02) : false;
      // pieza ausente en esta configuración: sin dibujo
      n.g.style.display = hidden || !present ? "none" : "";
      if (hidden || !present) {
        if (n.shadow) n.shadow.setAttribute("display", "none");
        continue;
      }
      n.top.setAttribute("d", pl.top);
      if (flat) {
        n.left.setAttribute("display", "none");
        n.right.setAttribute("display", "none");
      } else {
        n.left.removeAttribute("display");
        n.right.removeAttribute("display");
        n.left.setAttribute("d", pl.left);
        n.right.setAttribute("d", pl.right);
      }
      if (P < 0.16) n.top.setAttribute("stroke-dashoffset", String((1 - dp).toFixed(3)));
      else if (n.top.getAttribute("stroke-dashoffset") !== "0") n.top.setAttribute("stroke-dashoffset", "0");
      const fo = n.d.rel ? 1 : fa;
      if (isGlass) {
        n.top.setAttribute("fill-opacity", (0.3 * fo).toFixed(2));
        n.left.setAttribute("fill-opacity", (0.3 * fo).toFixed(2));
        n.right.setAttribute("fill-opacity", (0.3 * fo).toFixed(2));
      } else {
        n.top.setAttribute("fill-opacity", fo.toFixed(2));
        n.left.setAttribute("fill-opacity", fo.toFixed(2));
        n.right.setAttribute("fill-opacity", fo.toFixed(2));
      }
      const so = (0.85 - 0.4 * fo).toFixed(2);
      n.top.setAttribute("stroke-opacity", so);
      if (n.hat) {
        n.hat.setAttribute("d", pl.top);
        n.hat.setAttribute("opacity", (planA * (flat ? 1 : 0.5) * (1 - fo)).toFixed(2));
      }
      if (n.d.led && n.led) {
        const l = n.d.led;
        const z = l.edge === "top" ? q[5] + q[4] : q[5];
        const a = l.face === "y" ? proj(q[0], q[1] + q[3], z) : proj(q[0] + q[2], q[1], z);
        const b = l.face === "y" ? proj(q[0] + q[2], q[1] + q[3], z) : proj(q[0] + q[2], q[1] + q[3], z);
        n.led.setAttribute("d", `M${f1(a[0])} ${f1(a[1])}L${f1(b[0])} ${f1(b[1])}`);
        n.led.setAttribute("opacity", (lit * c01(q[4] / Math.max(n.hMax, 0.01))).toFixed(2));
      }
      // pantallas y marcas (calcomanías proyectadas sobre la cara)
      if (n.decal) {
        const hf = n.hMax > 0 ? c01(q[4] / n.hMax) : 1;
        if (n.d.screen) {
          const face = n.d.screen;
          const u = face === "y" ? q[2] : q[3];
          const par = q[4];
          n.decal.setAttribute("transform", matrixFor(face, q[0], q[1], q[2], q[3], q[5], u, par, 0, 0));
          n.decal.setAttribute("opacity", (lit * hf).toFixed(2));
          const ms = Math.min(u * 0.15, par * 0.3);
          n.decalMark?.setAttribute("transform", `translate(${(1 - (ms * 1.2) / u).toFixed(3)} ${(0.1).toFixed(3)}) scale(${(ms / u).toFixed(4)} ${(ms / par).toFixed(4)})`);
          n.decalBars?.setAttribute("transform", "");
        } else if (n.d.mark) {
          const m = n.d.mark;
          const along = m.face === "y" ? q[2] : q[3];
          const u0 = m.u === "r" ? Math.max(0.2, along - m.size - 0.6) : m.u;
          const vv = m.v;
          // las marcas viven en la cara de la pieza; solo si caben
          const fits = u0 + m.size <= along + 0.001 && vv + m.size <= q[4] + 0.001;
          n.decal.setAttribute("opacity", fits ? (lit * hf).toFixed(2) : "0");
          n.decal.setAttribute("transform", matrixFor(m.face, q[0], q[1], q[2], q[3], q[5], m.size, m.size, u0, vv));
        }
      }
      if (n.sprite) {
        const f = vis.get(n.d.id) ?? 0;
        const c = proj(q[0] + q[2] / 2, q[1] + q[3] / 2, q[5]);
        const k = (S / 26) * (0.55 + 0.45 * f);
        n.sprite.setAttribute("transform", `translate(${f1(c[0])} ${f1(c[1])}) scale(${k.toFixed(3)})`);
        n.sprite.setAttribute("opacity", (lit * f > 0.02 ? lit * f : 0).toFixed(2));
      }
      if (n.shadow) {
        if (q[4] > 0.5) {
          const dx = q[4] * 0.32, dy = q[4] * 0.2;
          const base = q[5] >= F ? F : q[5];
          const pts: [number, number][] = [];
          for (const [ax, ay] of [[q[0], q[1]], [q[0] + q[2], q[1]], [q[0] + q[2], q[1] + q[3]], [q[0], q[1] + q[3]]]) {
            pts.push(proj(ax, ay, base), proj(ax + dx, ay + dy, base));
          }
          const h = hull(pts);
          n.shadow.setAttribute("d", "M" + h.map((v) => `${f1(v[0])} ${f1(v[1])}`).join("L") + "Z");
          n.shadow.setAttribute("display", "");
          n.shadow.setAttribute("fill-opacity", (0.11 * lit * c01(q[4] / n.hMax)).toFixed(3));
        } else n.shadow.setAttribute("display", "none");
      }
    }

    // 3) personas
    for (const pn of people) {
      const a = cfg.a, b = cfg.b, s = cfg.s;
      const t = sm(c01((s - 0.3) / 0.45)); // se desplazan mientras las piezas están a ras de suelo
      const posA = pn.d.pres[a] > 0 ? pn.d.at[a] : pn.d.from ?? pn.d.at[a];
      const posB = pn.d.pres[b] > 0 ? pn.d.at[b] : pn.d.from ?? pn.d.at[b];
      const x = lerp(posA[0], posB[0], t), y = lerp(posA[1], posB[1], t);
      const arrive = a === b ? 1 : sm(c01((s - 0.2) / 0.5));
      const pres = a === b ? pn.d.pres[a] : lerp(pn.d.pres[a], pn.d.pres[b], arrive);
      const alpha = pres * lit;
      const sig = `${x.toFixed(2)},${y.toFixed(2)},${alpha.toFixed(2)}`;
      pn.k = x + y + 0.35;
      if (sig === pn.sig) continue;
      pn.sig = sig;
      const c = proj(x, y, F);
      const k = (3.4 * S) / 100;
      pn.g.setAttribute("transform", `translate(${f1(c[0])} ${f1(c[1])}) scale(${k.toFixed(4)})`);
      pn.g.setAttribute("opacity", alpha.toFixed(2));
    }

    // 4) orden de profundidad (solo si cambia)
    sortKeys.clear();
    const keyOf = (n: Node): number => {
      const cached = sortKeys.get(n.d.id);
      if (cached !== undefined) return cached;
      let k: number;
      if (n.d.parent) {
        const par = nodes.find((m) => m.d.id === n.d.parent) as Node;
        k = keyOf(par) + 0.001 * (n.idx + 1) / 100 + 0.0001;
        if (n.d.id === "plat" || n.d.id === "rug") k = -100;
      } else k = n.pose[0] + n.pose[2] / 2 + n.pose[1] + n.pose[3] / 2;
      if (n.d.id === "plat") k = -100;
      else if (n.d.id === "rug") k = -99;
      sortKeys.set(n.d.id, k);
      return k;
    };
    const items: Array<{ k: number; g: SVGGElement; id: string }> = [];
    for (const n of nodes) items.push({ k: keyOf(n), g: n.g, id: n.d.id });
    for (const pn of people) items.push({ k: pn.k, g: pn.g, id: pn.d.id });
    items.sort((u, v) => u.k - v.k || (u.id < v.id ? -1 : 1));
    const sigOrder = items.map((it) => it.id).join(",");
    if (sigOrder !== order) {
      order = sigOrder;
      for (const it of items) main.appendChild(it.g);
    }

    // 5) plano y ambiente
    {
      const pq = poses.get("plat") as Pose;
      clipPath.setAttribute("d", polys([pq[0], pq[1], pq[2], pq[3], 0, pq[4]]).top);
    }
    grid.setAttribute("opacity", (0.25 + 0.75 * planA).toFixed(2));
    const annA = sm(c01((P - 0.06) / 0.05)) * planA;
    ann.setAttribute("opacity", annA.toFixed(2));
    const sc = poses.get("scr1") as Pose;
    const gf = proj(sc[0] + sc[2] / 2, sc[1] + 4, F);
    floorGlow.setAttribute("cx", f1(gf[0]));
    floorGlow.setAttribute("cy", f1(gf[1]));
    floorGlow.setAttribute("rx", f1(sc[2] * 22));
    floorGlow.setAttribute("ry", f1(sc[2] * 8));
    floorGlow.setAttribute("opacity", (lit * c01(sc[4] / 3)).toFixed(2));
    curPoseCache = [];

    const step = P < 0.3 ? 1 : P < 0.54 ? 2 : P < 0.74 ? 3 : 4;
    curStep = step;
    return step;
  }

  return {
    render,
    step: () => curStep,
    destroy: () => {
      void curPoseCache;
      svg.textContent = "";
    },
  };
}
