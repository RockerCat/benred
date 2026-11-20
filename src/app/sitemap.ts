import type { MetadataRoute } from "next";
import { PORTFOLIO } from "@/lib/portfolio";
import { SERVICES, SITE } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", "/servicios", "/portafolio", "/nosotros", "/contacto"];
  return [
    ...pages.map((p) => ({ url: `${SITE.url}${p}`, priority: p === "" ? 1 : 0.8 })),
    ...SERVICES.map((s) => ({ url: `${SITE.url}/servicios/${s.slug}`, priority: 0.9 })),
    ...PORTFOLIO.map((e) => ({ url: `${SITE.url}/portafolio/${e.slug}`, priority: 0.6 })),
  ];
}
