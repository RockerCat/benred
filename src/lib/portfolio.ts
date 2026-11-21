import { PROJECTS, TATTOO_POSTERS, projectAlt, workSrc, type Project } from "./site";

/**
 * Archivo de proyectos. Fuente de verdad: PROJECTS y TATTOO_POSTERS de site.ts (no se duplican datos).
 * Aquí solo se define la presentación editorial: slug, orden, destacados y agrupaciones respaldadas por los datos
 * (el Tunja Tattoo Festival es un proyecto de eventos con cuatro ediciones, documentado con un afiche por edición;
 * BenRed fue su organizador y productor integral, dato confirmado por BenRed).
 * No hay cliente, año, ciudad ni descripción verificados para ninguna pieza: por eso no se muestran.
 */
export type Evidence = Project["kind"];

export type Entry = {
  slug: string;
  n: number; // posición editorial (1…N)
  title: string;
  category: Project["category"];
  kind: Evidence;
  cover: Project; // pieza principal
  images: Project[]; // todas las piezas del proyecto
  featured: boolean;
  /** Tipo de proyecto mostrado en etiquetas (distinto del material que lo documenta). */
  label: string;
  /** Material disponible para documentarlo, p. ej. "Afiches · 4 piezas". */
  material: string;
  /** Rol confirmado de BenRed, si existe. */
  role?: string;
  /** Tipo de proyecto (distinto de la categoría y del material), p. ej. "Festival". */
  projectType?: string;
  /** Número de ediciones, si aplica. */
  editions?: number;
  /** Descripción del proyecto confirmada por BenRed. */
  description?: string;
  /** Servicio prestado (distinto del material visual), p. ej. en stands. */
  service?: string;
  /** "Ejecutado" solo cuando la ejecución física está confirmada. */
  status?: string;
  /** Aclaración sobre qué documenta el material visual (sustituye la nota genérica del tipo de material). */
  note?: string;
};

const byId = new Map<string, Project>([...PROJECTS, ...TATTOO_POSTERS].map((p) => [p.id, p]));
const get = (id: string) => {
  const p = byId.get(id);
  if (!p) throw new Error(`Portafolio: pieza desconocida ${id}`);
  return p;
};

/** Orden editorial y destacados (selección explícita: calidad de imagen y diversidad de evidencia). */
type Extra = {
  label: string;
  projectType: string;
  role: string;
  editions: number;
  material: string;
  description: string;
  note: string;
};
const FESTIVAL: Extra = {
  label: "Festival · 4 ediciones",
  projectType: "Festival",
  role: "Organización y producción integral",
  editions: 4,
  material: "Afiches oficiales de las cuatro ediciones",
  description:
    "BenRed estuvo a cargo de la organización y producción integral de las cuatro ediciones del Tunja Tattoo Festival, desarrollando un proyecto de entretenimiento que reunió distintas expresiones del arte del tatuaje y la cultura alternativa.",
  note: "Los afiches documentan visualmente cada edición. No representan el alcance total del trabajo de BenRed, que fue la organización y producción integral del festival.",
};
const CONFIG: Array<{ slug: string; ids: string[]; title?: string; cover?: string; featured?: boolean; extra?: Extra; executed?: boolean }> = [
  { slug: "stand-tunja", ids: ["tunja"], featured: true, executed: true },
  { slug: "stand-boyaca-creemos", ids: ["boyaca"], featured: true },
  { slug: "stand-fedesmeraldas", ids: ["fne-b"] },
  { slug: "stand-villa-de-leiva-450-anos", ids: ["villa"] },
  { slug: "tunja-tattoo-festival", ids: ["t1", "t2", "t3", "t4"], title: "Tunja Tattoo Festival", cover: "t1", featured: true, extra: FESTIVAL },
  { slug: "stand-usana", ids: ["usana"], executed: true },
  { slug: "stand-aipa", ids: ["aipa"] },
  { slug: "montaje-evento-corporativo", ids: ["banquete"], featured: true },
  { slug: "stand-corpoboyaca", ids: ["verde"] },
  { slug: "stand-fne-dos-niveles", ids: ["fne-a"] },
];

/**
 * Stands: el servicio es diseñar, producir y montar; el render es solo el material visual de la etapa de diseño.
 * `executed` (confirmado por BenRed) habilita el estado "Ejecutado" y el lenguaje de proyecto realizado. Los demás
 * renders conservan una descripción neutral: su ejecución física está pendiente de confirmación.
 */
const STAND_SERVICE = "Diseño, producción y montaje de stands especiales";
function standCopy(kind: Evidence, executed: boolean): string {
  if (kind === "Fotografía") return "Proyecto de stand de BenRed. La imagen es una fotografía del montaje físico.";
  return executed
    ? "Proyecto de diseño, producción y montaje de stand realizado por BenRed. La imagen corresponde a la visualización 3D utilizada durante la etapa de diseño, previa a su construcción física."
    : "Proyecto de stand de BenRed, que diseña, produce y monta stands. La imagen es la visualización 3D de la etapa de diseño, previa a la construcción.";
}

/** Denominación neutral (sin cliente inferido) para proyectos sin nombre confirmado. */
const neutralCount: Record<string, number> = {};
function neutralTitle(category: Project["category"]): string {
  const n = (neutralCount[category] = (neutralCount[category] ?? 0) + 1);
  return `Proyecto de ${category} ${String(n).padStart(2, "0")}`;
}

export const PORTFOLIO: Entry[] = CONFIG.map((c, i) => {
  const images = c.ids.map(get);
  const cover = get(c.cover ?? c.ids[0]);
  return {
    slug: c.slug,
    n: i + 1,
    title: c.title ?? neutralTitle(cover.category),
    category: cover.category,
    kind: cover.kind,
    cover,
    images,
    featured: !!c.featured,
    label: c.extra?.label ?? cover.kind,
    material: c.extra?.material ?? (images.length > 1 ? `${cover.kind} · ${images.length} piezas` : cover.kind),
    role: c.extra?.role,
    projectType: c.extra?.projectType,
    editions: c.extra?.editions,
    description: c.extra?.description ?? (cover.category === "stand" ? standCopy(cover.kind, !!c.executed) : undefined),
    note: c.extra?.note ?? (cover.category === "stand" ? "" : undefined),
    service: cover.category === "stand" ? STAND_SERVICE : undefined,
    status: cover.category === "stand" && c.executed ? "Ejecutado" : undefined,
  };
});

export const PIECES = PORTFOLIO.reduce((a, e) => a + e.images.length, 0);

export const CATEGORY_LABEL = { stand: "Stands", evento: "Eventos" } as const;
export const KIND_LABEL: Record<Evidence, string> = {
  "Render 3D": "Render 3D",
  Fotografía: "Fotografía",
  Afiche: "Afiche",
};

/** Transparencia: qué demuestra cada tipo de evidencia (y qué no). */
export const KIND_NOTE: Record<Evidence, string> = {
  "Render 3D":
    "Render 3D de la etapa de diseño, previa a la construcción. No es una fotografía del resultado final.",
  Fotografía: "Fotografía de montaje publicada por BenRed.",
  Afiche:
    "Pieza gráfica publicada: muestra la identidad gráfica de un evento.",
};

export const entryBySlug = (slug: string) => PORTFOLIO.find((e) => e.slug === slug);
export const coverSrc = (e: Entry) => workSrc(e.cover, "lg");
export const entryAlt = (e: Entry) =>
  e.images.length > 1 ? `${e.kind}s: ${e.title}` : projectAlt(e.cover);
