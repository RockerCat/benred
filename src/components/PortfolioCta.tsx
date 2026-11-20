import Link from "next/link";
import { Reveal } from "./Reveal";

/** Cierre comercial del archivo (portafolio y fichas). Usa la ruta de contacto existente. */
export function PortfolioCta() {
  return (
    <section className="bg-ink text-paper">
      <Reveal variant="group" className="mx-auto grid max-w-[1400px] items-end gap-8 px-5 py-16 sm:px-8 lg:grid-cols-12 lg:py-24">
        <div className="lg:col-span-8">
          <p className="rg-item label text-mint">Siguiente proyecto</p>
          <h2 className="rg-item font-display mt-4 text-4xl font-bold leading-[1] sm:text-6xl" style={{ ["--k" as string]: 1 }}>
            ¿Tienes una idea en mente?
          </h2>
          <p className="rg-item mt-5 max-w-xl text-lg text-paper/80" style={{ ["--k" as string]: 2 }}>
            Cuéntanos qué necesitas y exploremos cómo llevarlo del concepto a la realidad.
          </p>
        </div>
        <div className="rg-item lg:col-span-4 lg:justify-self-end" style={{ ["--k" as string]: 3 }}>
          <Link href="/contacto" className="btn btn-primary">
            Cuéntanos tu proyecto <span aria-hidden="true">→</span>
          </Link>
        </div>
      </Reveal>
    </section>
  );
}
