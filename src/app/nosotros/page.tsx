import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Nosotros",
  description:
    "BenRed es una agencia colombiana de marketing experiencial, stands y producción de eventos. Conoce nuestra misión, visión y forma de trabajar.",
  alternates: { canonical: "/nosotros" },
};

export default function NosotrosPage() {
  return (
    <>
      <section className="grid-paper border-b border-[var(--line)]">
        <div className="mx-auto grid max-w-[1400px] items-center gap-10 px-5 py-16 sm:px-8 lg:grid-cols-12 lg:py-24">
          <div className="lg:col-span-8">
            <p className="label text-teal-deep">Nosotros</p>
            <h1 className="font-display mt-4 text-5xl font-bold leading-[0.95] sm:text-7xl">
              Agencia integral para marcas que quieren verse y sentirse en persona.
            </h1>
            <p className="mt-6 max-w-2xl text-xl text-ink/85">
              BenRed es una agencia de Boyacá, Colombia. Planeamos, diseñamos, producimos y operamos
              eventos, stands y activaciones. Llevamos más de diez años en el oficio y nos encargamos
              de cada detalle para que tú te concentres en tu público.
            </p>
          </div>
          <div className="lg:col-span-4 lg:justify-self-end">
            <Image src="/brand/benred-logo-color.svg" alt="Logo de BenRed" width={300} height={264} unoptimized className="h-56 w-auto" />
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1400px] gap-12 px-5 py-16 sm:px-8 lg:grid-cols-2 lg:py-24">
        <div className="border-t-2 border-ink pt-6">
          <p className="label text-signal">01 · Misión</p>
          <p className="font-display mt-4 text-3xl font-semibold leading-tight">
            Crear experiencias de marca memorables, a través del marketing experiencial, la
            producción de eventos y el diseño de stands, que generen conexiones reales entre las
            marcas y su público.
          </p>
          <p className="mt-5 text-ink/80">
            Ofrecemos soluciones creativas, personalizadas y eficientes que cumplan, y si es posible
            superen, lo que cada cliente espera.
          </p>
        </div>
        <div className="border-t-2 border-ink pt-6">
          <p className="label text-signal">02 · Visión</p>
          <p className="font-display mt-4 text-3xl font-semibold leading-tight">
            Ser en 2030 una agencia reconocida de marketing experiencial y producción de eventos en
            América Latina.
          </p>
          <p className="mt-5 text-ink/80">
            Por innovación, calidad de servicio y relaciones de largo plazo entre marcas y audiencias.
          </p>
        </div>
      </section>

      <section className="bg-ink text-paper">
        <div className="mx-auto flex max-w-[1400px] flex-col items-start justify-between gap-6 px-5 py-16 sm:px-8 md:flex-row md:items-center">
          <p className="font-display max-w-2xl text-4xl font-bold leading-tight">
            Conoce lo que hacemos o cuéntanos de una vez tu proyecto.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/servicios" className="btn btn-ghost-light">Ver servicios</Link>
            <Link href="/contacto" data-cta-primary className="btn btn-primary">Contacto</Link>
          </div>
        </div>
      </section>
    </>
  );
}
