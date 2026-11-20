/**
 * Figuras humanas estilizadas para las visualizaciones isométricas (estilo "gente de arquitectura":
 * sin rostro, ~7,5 cabezas, tres cuartos de perfil, color plano con una cara en sombra).
 *
 * Módulo AISLADO: no depende de la geometría de ninguno de los dos stands. Recibe el punto de apoyo
 * ya proyectado (pies en el suelo) y la escala (px por metro), y devuelve formas SVG en coordenadas de
 * pantalla. El eje vertical de la proyección isométrica no se acorta, así que una persona de 1,78 m mide
 * 1,78 × escala px. La sombra de contacto ancla la figura al suelo.
 *
 * Silueta: piernas de dos segmentos (muslo/pantorrilla) con contrapposto, torso con hombros caídos,
 * cintura y cadera, brazos con codo, calzado con suela, cabello con volumen. Cuatro vestuarios:
 * blazer (abierto sobre camisa), abrigo largo, camiseta y vestido.
 */

export type Shape = { d: string; fill: string; fo?: number; stroke?: string; sw?: number };

/** Orientación en pantalla: t = de frente al observador, a = de espaldas; l/r = gira a izquierda/derecha. */
export type Dir = "tl" | "tr" | "al" | "ar";
export type Pose = "stand" | "talk" | "point" | "hold" | "rest";
export type Outfit = "blazer" | "coat" | "tee" | "dress";

export type FigSpec = {
  dir: Dir;
  pose: Pose;
  /** estatura en metros (por defecto 1,78) */
  h?: number;
  top: string;
  topShade: string;
  bottom: string;
  skin: string;
  hair: string;
  hairStyle?: "short" | "long" | "bun" | "wavy";
  outfit?: Outfit;
  /** camisa visible bajo el blazer / cuello */
  shirt?: string;
  /** acento: lanyard/identificación (personal de atención) o bufanda */
  accent?: string;
  /** compatibilidad: equivale a outfit "dress" */
  skirt?: boolean;
};

type P = readonly [number, number];

const r1 = (n: number) => Math.round(n * 10) / 10;

/** Paleta de vestuario/piel armonizada con el sitio (tinta, teal, menta, arena, papel). */
export const WARDROBE = {
  ink: { top: "#26363a", shade: "#16221f" },
  teal: { top: "#1b7480", shade: "#0c4f59" },
  mint: { top: "#7fcfc0", shade: "#4aa59a" },
  sand: { top: "#d9c7a2", shade: "#bba67c" },
  paper: { top: "#f1ede3", shade: "#cfc9ba" },
  graphite: { top: "#566a6e", shade: "#3a4c50" },
  signal: { top: "#ff5a2b", shade: "#cf3f17" },
  camel: { top: "#c2956b", shade: "#9d7048" },
};
export const SKIN = { a: "#efc7a3", b: "#d29b72", c: "#a8704b", d: "#7c4e33" };
export const HAIR = { black: "#1d1a18", brown: "#4a3426", chestnut: "#6b4630", blond: "#c79a62", grey: "#8a8a86" };

export function figure(spec: FigSpec, S: number, foot: P): Shape[] {
  const h = spec.h ?? 1.78;
  const u = h / 1.78;
  const away = spec.dir[0] === "a";
  const sgn = spec.dir[1] === "r" ? 1 : -1; // espejo para mirar a la izquierda
  const w = 0.86; // tres cuartos: hombros algo estrechados
  const outfit: Outfit = spec.outfit ?? (spec.skirt ? "dress" : "blazer");
  const shirt = spec.shirt ?? "#f6f3ea";

  // local (metros, y hacia arriba) → pantalla
  const X = (lx: number) => foot[0] + sgn * lx * u * S;
  const Y = (ly: number) => foot[1] - ly * u * S;
  const pt = (lx: number, ly: number): string => `${r1(X(lx))} ${r1(Y(ly))}`;
  const poly = (pts: P[]) => `M${pts.map(([a, b]) => pt(a, b)).join("L")}Z`;
  const limb = (a: P, b: P, w0: number, w1: number): P[] => {
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const L = Math.hypot(dx, dy) || 1;
    const nx = -dy / L;
    const ny = dx / L;
    return [
      [a[0] + (nx * w0) / 2, a[1] + (ny * w0) / 2],
      [b[0] + (nx * w1) / 2, b[1] + (ny * w1) / 2],
      [b[0] - (nx * w1) / 2, b[1] - (ny * w1) / 2],
      [a[0] - (nx * w0) / 2, a[1] - (ny * w0) / 2],
    ];
  };
  const ellipse = (cx: number, cy: number, rx: number, ry: number) =>
    `M${pt(cx - rx, cy)}A${r1(rx * u * S)} ${r1(ry * u * S)} 0 1 0 ${pt(cx + rx, cy)}A${r1(rx * u * S)} ${r1(ry * u * S)} 0 1 0 ${pt(cx - rx, cy)}Z`;

  const OUT = "rgb(13 21 23 / 0.58)";
  const SW = 0.75;
  const shapes: Shape[] = [];
  const add = (d: string, fill: string, o: Partial<Shape> = {}) => shapes.push({ d, fill, stroke: OUT, sw: SW, ...o });
  const shade = (d: string, fill: string, fo = 0.85) => shapes.push({ d, fill, fo });

  // Sombra de contacto (elipse isométrica) — ancla la figura al suelo
  const sr = 0.34 * u * S;
  shapes.push({
    d: `M${r1(foot[0] - sr)} ${r1(foot[1])}a${r1(sr)} ${r1(sr * 0.5)} 0 1 0 ${r1(2 * sr)} 0a${r1(sr)} ${r1(sr * 0.5)} 0 1 0 ${r1(-2 * sr)} 0Z`,
    fill: "#0d1517",
    fo: 0.22,
  });

  /* ---- piernas (muslo + pantorrilla), contrapposto: la pierna delantera recta, la trasera algo abierta ---- */
  const longDress = outfit === "dress";
  const legFill = longDress ? "#3a2f2a" : spec.bottom;
  const hipF: P = [0.07 * w, 0.93]; // delantera
  const kneeF: P = [0.085 * w + 0.01, 0.5];
  const ankF: P = [0.09 * w + 0.02, 0.07];
  const hipB: P = [-0.07 * w, 0.93];
  const kneeB: P = [-0.1 * w, 0.5];
  const ankB: P = [-0.14 * w, 0.07];
  const leg = (hip: P, knee: P, ank: P, fillc: string) => {
    add(poly(limb(hip, knee, 0.18, 0.13)), fillc);
    add(poly(limb(knee, ank, 0.13, 0.085)), fillc);
  };
  const shoe = (a: P) =>
    add(poly([[a[0] - 0.05, 0.085], [a[0] + 0.05, 0.085], [a[0] + 0.13, 0.03], [a[0] + 0.14, 0.0], [a[0] - 0.06, 0.0]]), "#14110f");
  leg(hipB, kneeB, ankB, legFill);
  shoe(ankB);
  leg(hipF, kneeF, ankF, legFill);
  if (!longDress) shade(poly(limb(hipF, kneeF, 0.18, 0.13).map(([a, b]) => [a + 0.02, b] as P)), "#0d1517", 0.14);
  shoe(ankF);

  /* ---- brazo trasero (queda detrás del torso) ---- */
  const shB: P = [-0.2 * w, 1.44];
  const shF: P = [0.2 * w, 1.44];
  const sleeveFill = outfit === "tee" ? spec.top : spec.topShade;
  add(poly(limb(shB, [-0.235 * w, 1.15], 0.085, 0.07)) + poly(limb([-0.235 * w, 1.15], [-0.215 * w, 0.9], 0.07, 0.058)), outfit === "tee" ? spec.skin : sleeveFill);
  add(ellipse(-0.212 * w, 0.86, 0.034, 0.04), spec.skin);

  /* ---- torso según vestuario ---- */
  const shoulderTop = (hem: P[]) =>
    `M${pt(-0.2 * w, 1.42)}Q${pt(-0.205 * w, 1.49)} ${pt(-0.12 * w, 1.505)}L${pt(0.12 * w, 1.505)}Q${pt(0.205 * w, 1.49)} ${pt(0.2 * w, 1.42)}L${pt(0.185 * w, 1.1)}L${pt(0.17 * w, 1.04)}${hem
      .map(([a, b]) => `L${pt(a, b)}`)
      .join("")}L${pt(-0.17 * w, 1.04)}L${pt(-0.185 * w, 1.1)}Z`;

  if (outfit === "coat") {
    const hem: P[] = [[0.25 * w, 0.52], [-0.25 * w, 0.52]];
    add(shoulderTop(hem), spec.top);
    shade(poly([[0.02, 1.505], [0.2 * w, 1.42], [0.185 * w, 1.1], [0.25 * w, 0.52], [0.02, 0.52]]), spec.topShade);
    if (!away) {
      add(poly([[-0.05, 1.505], [0.05, 1.505], [0.0, 1.2]]), shirt, { stroke: "none" });
      add(`M${pt(0, 1.2)}L${pt(0.015, 0.55)}`, "none", { stroke: "rgb(13 21 23 / 0.4)", sw: 0.7 });
    } else add(`M${pt(0, 1.45)}L${pt(0, 0.55)}`, "none", { stroke: "rgb(13 21 23 / 0.35)", sw: 0.6 });
    add(poly([[-0.17 * w, 1.06], [0.17 * w, 1.06], [0.17 * w, 1.02], [-0.17 * w, 1.02]]), spec.topShade, { stroke: "none", fo: 0.8 }); // cinturón
  } else if (outfit === "dress") {
    const hem: P[] = [[0.2 * w, 0.88], [-0.2 * w, 0.88]];
    add(shoulderTop(hem), spec.top);
    add(poly([[-0.17 * w, 1.04], [0.17 * w, 1.04], [0.24 * w, 0.5], [-0.24 * w, 0.5]]), spec.top);
    shade(poly([[0.02, 1.505], [0.2 * w, 1.42], [0.185 * w, 1.1], [0.17 * w, 1.04], [0.24 * w, 0.5], [0.02, 0.5]]), spec.topShade);
    add(poly([[-0.17 * w, 1.07], [0.17 * w, 1.07], [0.17 * w, 1.03], [-0.17 * w, 1.03]]), spec.accent ?? spec.topShade, { stroke: "none", fo: 0.9 }); // cinturón
  } else {
    // blazer / camiseta: torso hasta la cadera + pantalón visible
    const hem: P[] = [[0.185 * w, 0.88], [-0.185 * w, 0.88]];
    add(poly([[-0.17 * w, 1.04], [0.17 * w, 1.04], [0.15 * w, 0.88], [-0.15 * w, 0.88]]), spec.bottom, { stroke: "none" });
    add(shoulderTop(hem), spec.top);
    shade(poly([[0.02, 1.505], [0.2 * w, 1.42], [0.185 * w, 1.1], [0.185 * w, 0.88], [0.02, 0.88]]), spec.topShade);
    if (!away && outfit === "blazer") {
      add(poly([[-0.055, 1.505], [0.055, 1.505], [0.075 * w, 1.2], [0, 0.98], [-0.075 * w, 1.2]]), shirt, { stroke: "none" });
      add(`M${pt(-0.055, 1.505)}L${pt(-0.1 * w, 1.2)}L${pt(-0.01, 0.98)}`, "none", { stroke: "rgb(13 21 23 / 0.45)", sw: 0.7 });
      add(`M${pt(0.055, 1.505)}L${pt(0.1 * w, 1.2)}L${pt(0.01, 0.98)}`, "none", { stroke: "rgb(13 21 23 / 0.45)", sw: 0.7 });
    } else if (!away) {
      add(poly([[-0.05, 1.505], [0.05, 1.505], [0, 1.43]]), spec.skin, { stroke: "none" });
    } else add(`M${pt(0, 1.46)}L${pt(0, 0.9)}`, "none", { stroke: "rgb(13 21 23 / 0.35)", sw: 0.6 });
  }
  // identificación / bufanda
  if (spec.accent && outfit !== "dress") {
    if (!away) {
      add(poly([[-0.025, 1.5], [0.0, 1.2], [0.025, 1.5]]), spec.accent, { stroke: "none" });
      add(poly([[-0.035, 1.2], [0.055, 1.2], [0.055, 1.09], [-0.035, 1.09]]), spec.accent, { stroke: "none" });
    } else add(poly([[-0.17 * w, 1.5], [0.17 * w, 1.5], [0.15 * w, 1.4], [-0.15 * w, 1.4]]), spec.accent, { stroke: "none", fo: 0.92 });
  }

  /* ---- brazo delantero según la pose (con codo) ---- */
  const arm = (s: P, e: P, hnd: P, upW = 0.088, loW = 0.07) => {
    const f = outfit === "tee" ? spec.skin : spec.top;
    add(poly(limb(s, e, upW, upW * 0.82)) + poly(limb(e, hnd, upW * 0.82, loW * 0.75)), f);
    add(ellipse(hnd[0], hnd[1], 0.036, 0.042), spec.skin);
  };
  if (spec.pose === "talk") arm(shF, [0.31 * w, 1.17], [0.36 * w, 1.4]);
  else if (spec.pose === "point") arm(shF, [0.34 * w, 1.27], [0.6 * w, 1.33]);
  else if (spec.pose === "hold") {
    arm(shF, [0.28 * w, 1.12], [0.09 * w, 1.1]);
    add(poly([[-0.11 * w, 0.98], [0.1 * w, 0.98], [0.125 * w, 1.25], [-0.085 * w, 1.25]]), "#16221f");
    add(poly([[-0.082 * w, 1.03], [0.088 * w, 1.03], [0.103 * w, 1.21], [-0.065 * w, 1.21]]), "#9fe0d3", { stroke: "none" });
  } else if (spec.pose === "rest") arm(shF, [0.26 * w, 1.13], [0.12 * w, 0.99]);
  else arm(shF, [0.24 * w, 1.15], [0.215 * w, 0.9]);

  /* ---- cuello y cabeza ---- */
  add(poly([[-0.04, 1.52], [0.04, 1.52], [0.042, 1.44], [-0.042, 1.44]]), spec.skin, { stroke: "none" });
  const hs = spec.hairStyle ?? "short";
  if (away || hs === "long" || hs === "wavy") {
    add(ellipse(0, 1.655, 0.098, 0.118), spec.hair);
    if (hs === "long") add(poly([[-0.1, 1.64], [0.1, 1.64], [0.115, 1.34], [-0.115, 1.37]]), spec.hair, { stroke: "none" });
    if (hs === "wavy") add(poly([[-0.105, 1.64], [0.105, 1.64], [0.13, 1.42], [0.06, 1.36], [-0.12, 1.4]]), spec.hair, { stroke: "none" });
  }
  if (!away) {
    add(ellipse(0, 1.65, 0.088, 0.108), spec.skin);
    // cabello: línea del flequillo asimétrica
    add(`M${pt(-0.093, 1.64)}Q${pt(-0.1, 1.76)} ${pt(0, 1.768)}Q${pt(0.1, 1.76)} ${pt(0.093, 1.64)}Q${pt(0.06, 1.7)} ${pt(0.02, 1.695)}Q${pt(-0.03, 1.72)} ${pt(-0.093, 1.64)}Z`, spec.hair, { stroke: "none" });
  }
  if (hs === "bun") add(ellipse(-0.012, 1.79, 0.052, 0.052), spec.hair);
  return shapes;
}
