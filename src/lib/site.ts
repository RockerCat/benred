/**
 * Fuente única de datos del sitio.
 * Todo lo que aparece aquí proviene de benred.co (consultado 2026-11-20) o es copy redactado
 * a partir de lo que BenRed publica. Ver RESEARCH.md para el detalle de verificación.
 */

export const SITE = {
  name: "BenRed",
  legalHint: "B EN RED",
  url: "https://benred.co",
  tagline: "Marketing experiencial, stands y eventos",
  region: "Boyacá",
  country: "Colombia",
  whatsappNumber: "573144598008",
  phoneDisplay: "+57 314 459 8008",
  phoneAlt: "+57 321 203 2529",
  emailPrimary: "jpduarte@benred.co",
  emailAlt: "dbolivar@benred.co",
  social: {
    instagram: "https://www.instagram.com/benredsas.oficial/",
    facebook: "https://www.facebook.com/eventosymercadeo",
    linkedin: "https://www.linkedin.com/in/benred-sas-87bb4415a/",
  },
} as const;

export function whatsappLink(message: string) {
  return `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

export const DEFAULT_WA_MESSAGE =
  "Hola BenRed, quiero contarles mi proyecto: ";

export const NAV = [
  { href: "/servicios", label: "Servicios" },
  { href: "/portafolio", label: "Portafolio" },
  { href: "/nosotros", label: "Nosotros" },
  { href: "/contacto", label: "Contacto" },
] as const;

export type Service = {
  slug: string;
  n: string;
  name: string;
  short: string;
  headline: string;
  lead: string;
  scope: string[];
  bring: string[];
  seoTitle: string;
  seoDescription: string;
  waHint: string;
};

export const SERVICES: Service[] = [
  {
    slug: "marketing-experiencial-btl",
    n: "01",
    name: "Marketing experiencial y BTL",
    short: "Activaciones que ponen tu marca frente a la gente, en persona.",
    headline: "Activaciones BTL que la gente vive, no solo ve.",
    lead: "Diseñamos y ejecutamos experiencias de marca en las que el público participa: eventos inmersivos, activaciones en punto y dinámicas pensadas para conectar con tu audiencia objetivo.",
    scope: [
      "Concepto y estrategia de la activación",
      "Eventos inmersivos y dinámicas de participación",
      "Activaciones en espacios públicos y comerciales",
      "Producción de piezas y ambientación",
      "Operación en sitio",
    ],
    bring: [
      "El objetivo: lanzar, posicionar, captar leads",
      "El público al que quieres llegar",
      "Fechas, ciudad y presupuesto de referencia",
    ],
    seoTitle: "Marketing experiencial y BTL en Colombia",
    seoDescription:
      "Activaciones de marca, eventos inmersivos y estrategias BTL en Colombia. BenRed diseña y ejecuta experiencias que conectan marcas con personas.",
    waHint: "una activación de marketing experiencial / BTL",
  },
  {
    slug: "stands-y-montajes",
    n: "02",
    name: "Diseño, producción y montaje de stands",
    short: "Del render al piso de feria: diseñamos, producimos y montamos tu stand.",
    headline: "Tu stand, diseñado en 3D y montado en feria.",
    lead: "Un solo equipo se encarga de diseñar el stand, producirlo y montarlo. Trabajamos a la medida de cada marca, entidad o evento, desde stands comerciales hasta espacios institucionales.",
    scope: [
      "Diseño y renders 3D del stand",
      "Producción de estructura, mobiliario y gráfica",
      "Montaje y desmontaje en el recinto",
      "Integración de pantallas, iluminación y exhibición de producto",
      "Coordinación con el organizador de la feria",
    ],
    bring: [
      "Feria o evento, fecha y recinto",
      "Metros cuadrados y ubicación del espacio",
      "Marca, productos y qué quieres comunicar",
    ],
    seoTitle: "Diseño, producción y montaje de stands en Colombia",
    seoDescription:
      "Diseño 3D, producción y montaje de stands para ferias y eventos en Colombia. BenRed lleva tu marca del render al piso de feria.",
    waHint: "el diseño y montaje de un stand",
  },
  {
    slug: "produccion-y-logistica-de-eventos",
    n: "03",
    name: "Producción y logística de eventos",
    short: "Planeación, proveedores y coordinación en sitio para que el evento salga como se diseñó.",
    headline: "Eventos que se ejecutan como se planearon.",
    lead: "Nos encargamos de la planificación integral, la gestión de proveedores, la coordinación en sitio y la parte técnica de tu evento corporativo, para que tú te concentres en tus invitados.",
    scope: [
      "Planificación integral del evento",
      "Gestión y coordinación de proveedores",
      "Montaje, ambientación y producción técnica",
      "Coordinación en el lugar el día del evento",
      "Eventos corporativos, institucionales y de entretenimiento",
    ],
    bring: [
      "Tipo de evento y número de asistentes",
      "Fecha, ciudad y lugar (o si necesitas ayuda para elegirlo)",
      "Qué debe lograr el evento",
    ],
    seoTitle: "Producción y logística de eventos corporativos en Colombia",
    seoDescription:
      "Planificación, proveedores, montaje y coordinación en sitio de eventos corporativos en Colombia. BenRed produce eventos que salen como se diseñaron.",
    waHint: "la producción de un evento",
  },
];

export type Project = {
  id: string;
  title: string;
  category: "stand" | "evento";
  kind: "Render 3D" | "Fotografía" | "Afiche";
  /** archivos en /public/work, sin sufijo ni extensión */
  file: string;
  w: number;
  h: number;
  hasLarge: boolean;
  note?: string;
};

/**
 * Material publicado por BenRed en benred.co (carga de septiembre/octubre 2024).
 * Los stands son renders de diseño, salvo "Stand Tunja" que es fotografía de montaje.
 */
export const PROJECTS: Project[] = [
  { id: "tunja", title: "Stand de Tunja", category: "stand", kind: "Fotografía", file: "stand-tunja", w: 1600, h: 1200, hasLarge: true },
  { id: "fne-b", title: "Stand Fedesmeraldas", category: "stand", kind: "Render 3D", file: "stand-fne-b", w: 1280, h: 720, hasLarge: true },
  { id: "usana", title: "Stand USANA", category: "stand", kind: "Render 3D", file: "stand-usana", w: 800, h: 600, hasLarge: false },
  { id: "boyaca", title: "Stand Boyacá “Creemos”", category: "stand", kind: "Render 3D", file: "stand-boyaca", w: 1600, h: 864, hasLarge: true },
  { id: "villa", title: "Stand Villa de Leiva 450 años", category: "stand", kind: "Render 3D", file: "stand-villa-de-leiva", w: 1280, h: 720, hasLarge: true },
  { id: "aipa", title: "Stand Aipa", category: "stand", kind: "Render 3D", file: "stand-aipa", w: 1200, h: 900, hasLarge: false },
  { id: "verde", title: "Stand Corpoboyacá", category: "stand", kind: "Render 3D", file: "stand-verde", w: 1536, h: 830, hasLarge: true },
  { id: "fne-a", title: "Stand FNE de dos niveles", category: "stand", kind: "Render 3D", file: "stand-fne-a", w: 1280, h: 720, hasLarge: true },
  { id: "banquete", title: "Montaje de evento corporativo", category: "evento", kind: "Fotografía", file: "evento-banquete", w: 1600, h: 1200, hasLarge: true },
];

export const TATTOO_POSTERS: Project[] = [
  { id: "t1", title: "Tunja Tattoo Festival · 2017", category: "evento", kind: "Afiche", file: "tattoo-2017", w: 993, h: 1280, hasLarge: false },
  { id: "t2", title: "Tunja Tattoo Festival · Vol. 2", category: "evento", kind: "Afiche", file: "tattoo-vol2", w: 621, h: 960, hasLarge: false },
  { id: "t3", title: "Tunja Tattoo Festival · 3.ª edición", category: "evento", kind: "Afiche", file: "tattoo-3er", w: 394, h: 598, hasLarge: false },
  { id: "t4", title: "Tunja Tattoo Festival · 4.ª edición, 2022", category: "evento", kind: "Afiche", file: "tattoo-4to", w: 700, h: 875, hasLarge: false },
];

export function workSrc(p: Project, size: "sm" | "lg" = "sm") {
  const s = size === "lg" && p.hasLarge ? 1280 : 640;
  return `/work/${p.file}-${s}.webp`;
}
