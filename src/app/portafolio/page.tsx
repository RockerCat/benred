import type { Metadata } from "next";
import { PortfolioCta } from "@/components/PortfolioCta";
import { PortfolioGallery } from "@/components/PortfolioGallery";
import { Reveal, RevealWords } from "@/components/Reveal";
import { PIECES, PORTFOLIO } from "@/lib/portfolio";

export const metadata: Metadata = {
  title: "Portafolio: ideas que tomaron forma",
  description:
    "Archivo de proyectos de BenRed: diseño, producción y montaje de stands y eventos. Visualizaciones 3D de la etapa de diseño, fotografía de montaje y el Tunja Tattoo Festival, cuyas cuatro ediciones BenRed organizó y produjo de forma integral. Cada pieza indica su tipo de evidencia.",
  alternates: { canonical: "/portafolio" },
};

export default function PortafolioPage() {
  const kinds = ["Render 3D", "Fotografía", "Afiche"] as const;
  return (
    <>
      <section className="grid-paper border-b border-[var(--line)]">
        <div className="mx-auto max-w-[1400px] px-5 py-16 sm:px-8 lg:py-24">
          <Reveal variant="fade" className="flex flex-wrap items-center gap-x-4 gap-y-1 label text-teal-deep">
            <span>Portafolio</span>
            <span aria-hidden="true" className="h-px w-10 bg-teal-deep" />
            <span className="text-muted">Archivo de proyectos</span>
          </Reveal>
          <RevealWords as="h1" className="font-display mt-4 max-w-5xl text-5xl font-bold leading-[0.95] sm:text-7xl" text="Ideas que tomaron forma." />
          <Reveal variant="fade" delay={150}>
            <p className="mt-6 max-w-2xl text-xl text-ink/85">Diseño, producción y experiencias que muestran lo que hacemos.</p>
            <dl className="mt-10 flex flex-wrap gap-x-10 gap-y-4 border-t border-ink pt-4">
              <div>
                <dt className="label text-muted">Proyectos</dt>
                <dd className="font-display text-3xl font-bold">{String(PORTFOLIO.length).padStart(2, "0")}</dd>
              </div>
              <div>
                <dt className="label text-muted">Piezas</dt>
                <dd className="font-display text-3xl font-bold">{String(PIECES).padStart(2, "0")}</dd>
              </div>
              <div>
                <dt className="label text-muted">Evidencia</dt>
                <dd className="label mt-2 flex flex-wrap gap-2">
                  {kinds.map((k) => (
                    <span key={k} className="border border-ink px-1.5 py-0.5">{k}</span>
                  ))}
                </dd>
              </div>
            </dl>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-5 py-14 sm:px-8 lg:py-20">
        <PortfolioGallery />
        <p className="mt-14 max-w-2xl border-t border-[var(--line)] pt-4 text-sm text-muted">
          Cada pieza indica si es un render de diseño, una fotografía de montaje o un afiche. Los renders documentan la
          etapa de diseño de un stand y no son fotografías del resultado final; los afiches documentan las ediciones de un festival que BenRed organizó y produjo. Seguimos sumando registro fotográfico de proyectos ejecutados.
        </p>
      </section>
      <PortfolioCta />
    </>
  );
}
