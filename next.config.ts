import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  // Fichas individuales genéricas retiradas: el portafolio es una galería con visor. Solo se conserva
  // /portafolio/tunja-tattoo-festival.
  async redirects() {
    const legacy = [
      "stand-tunja",
      "stand-tunia",
      "stand-boyaca-creemos",
      "stand-fedesmeraldas",
      "stand-villa-de-leiva-450-anos",
      "stand-usana",
      "stand-aipa",
      "montaje-evento-corporativo",
      "stand-corpoboyaca",
      "stand-fne-dos-niveles",
    ];
    return legacy.map((slug) => ({ source: `/portafolio/${slug}`, destination: "/portafolio", permanent: true }));
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
