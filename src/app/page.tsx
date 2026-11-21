import Image from "next/image";
import Link from "next/link";
import { BlueprintHero } from "@/components/BlueprintHero";
import { Reveal, RevealWords } from "@/components/Reveal";
import { ConcertStage } from "@/components/ConcertStage";
import { ProcessStand } from "@/components/ProcessStand";
import { ScrollLinked } from "@/components/ScrollLinked";
import { WorkCard } from "@/components/WorkCard";
import {
  DEFAULT_WA_MESSAGE,
  PROJECTS,
  SERVICES,
  SITE,
  TATTOO_POSTERS,
  whatsappLink,
} from "@/lib/site";

const byId = (id: string) => PROJECTS.find((p) => p.id === id)!;

const STEPS = [
  { t: "Brief", d: "Nos cuentas la marca, la fecha, el espacio y qué debe lograr el proyecto." },
  { t: "Diseño", d: "Planos y renders 3D para que veas el resultado antes de producir nada." },
  { t: "Producción", d: "Estructura, mobiliario, gráfica y piezas fabricadas a la medida." },
  { t: "Montaje y operación", d: "Instalación en el recinto y coordinación en sitio durante el evento." },
];

export default function Home() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "BenRed",
    alternateName: "B EN RED",
    url: SITE.url,
    description:
      "Agencia de marketing experiencial, BTL, diseño y montaje de stands y producción de eventos en Colombia.",
    email: SITE.emailPrimary,
    telephone: `+${SITE.whatsappNumber}`,
    areaServed: "CO",
    address: { "@type": "PostalAddress", addressRegion: "Boyacá", addressCountry: "CO" },
    sameAs: Object.values(SITE.social),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* HERO */}
      <section className="grid-paper relative overflow-hidden border-b border-[var(--line)]">
        <div className="mx-auto grid max-w-[1400px] items-center gap-10 px-5 pb-14 pt-6 sm:px-8 sm:pt-10 lg:grid-cols-12 lg:gap-6 lg:pb-20 lg:pt-16">
          <div className="lg:col-span-6">
            <h1 className="font-display text-[clamp(3rem,8.6vw,7.4rem)] font-bold leading-[0.92]">
              <span className="label mb-6 block !tracking-[0.12em] text-teal-deep">
                Marketing experiencial · Stands · Eventos
              </span>
              Tu marca,
              <br />
              a escala <span className="text-teal-deep">real.</span>
            </h1>
            <p className="mt-7 max-w-xl text-xl leading-snug text-ink/85">
              Diseñamos, producimos y montamos activaciones, stands y eventos en Colombia.
              Del plano al piso, con un solo equipo.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <a
                href={whatsappLink(DEFAULT_WA_MESSAGE)}
                target="_blank"
                rel="noopener noreferrer"
                data-cta-primary
                className="btn btn-primary justify-center"
              >
                Cuéntanos tu proyecto <span aria-hidden="true">→</span>
              </a>
              <Link href="/portafolio" className="btn btn-ghost justify-center">
                Ver trabajo publicado
              </Link>
            </div>
            <dl className="mt-12 grid max-w-xl grid-cols-[auto_auto_1fr] gap-x-8 border-t border-ink pt-5">
              <div>
                <dt className="label text-muted">Experiencia</dt>
                <dd className="font-display text-2xl font-bold sm:text-3xl">+10 años</dd>
              </div>
              <div>
                <dt className="label text-muted">Frentes</dt>
                <dd className="font-display text-2xl font-bold sm:text-3xl">3</dd>
              </div>
              <div>
                <dt className="label text-muted">Base</dt>
                <dd className="font-display text-2xl font-bold sm:text-3xl">Boyacá</dd>
              </div>
            </dl>
          </div>
          {/* En móvil la animación va primero (order); en desktop conserva la columna derecha */}
          <div className="max-lg:order-first lg:col-span-6">
            <BlueprintHero />
          </div>
        </div>
      </section>

      {/* SERVICIOS */}
      <section className="mx-auto max-w-[1400px] px-5 py-20 sm:px-8 lg:py-28" aria-labelledby="h-servicios">
        <Reveal variant="fade" className="grid gap-6 lg:grid-cols-12">
          <p className="label text-teal-deep lg:col-span-3">Qué hacemos</p>
          <RevealWords id="h-servicios" className="font-display text-4xl font-bold leading-[1] sm:text-6xl lg:col-span-9" text="Tres frentes, una sola responsabilidad: que tu marca se vea y se sienta como la pensaste." />
        </Reveal>
        <ul className="mt-14">
          {SERVICES.map((s, i) => (
            <Reveal as="li" variant="group" key={s.slug} delay={i * 120} className="relative">
              {i === 0 && <span aria-hidden="true" className="rg-rule absolute inset-x-0 top-0 h-px bg-ink" />}
              <Link
                href={`/servicios/${s.slug}`}
                className="group grid items-start gap-3 py-8 lg:grid-cols-12 lg:gap-6 lg:py-10"
              >
                <span className="row-n rg-item label text-muted lg:col-span-1" style={{ ["--k" as string]: 0 }}>{s.n}</span>
                <h3 className="rg-item font-display text-3xl font-semibold leading-tight sm:text-4xl lg:col-span-5" style={{ ["--k" as string]: 1 }}>
                  <span className="hover-underline">{s.name}</span>
                </h3>
                <p className="rg-item max-w-md text-ink/80 lg:col-span-4" style={{ ["--k" as string]: 2 }}>{s.short}</p>
                <span
                  aria-hidden="true"
                  className="rg-item lg:col-span-2 lg:justify-self-end"
                  style={{ ["--k" as string]: 3 }}
                >
                  <span className="row-arrow font-display block text-4xl">→</span>
                </span>
              </Link>
              <span aria-hidden="true" className="rg-rule absolute inset-x-0 bottom-0 h-px bg-ink" />
            </Reveal>
          ))}
        </ul>
      </section>

      {/* PROCESO */}
      <section className="bg-paper-2" aria-labelledby="h-proceso">
        <div className="mx-auto max-w-[1400px] px-5 py-20 sm:px-8 lg:py-28">
          <Reveal variant="fade" className="grid gap-6 lg:grid-cols-12">
            <p className="label text-teal-deep lg:col-span-3">Cómo trabajamos</p>
            <RevealWords id="h-proceso" className="font-display text-4xl font-bold leading-[1] sm:text-6xl lg:col-span-9" text="Del plano al piso de feria." />
          </Reveal>
          <ol className="mt-14 grid gap-0 border-l border-ink sm:grid-cols-2 sm:border-l-0 lg:grid-cols-4">
            {STEPS.map((s, i) => (
              <ScrollLinked
                as="li"
                map="step"
                key={s.t}
                className="step relative border-ink pb-10 pl-8 sm:border-l sm:pb-0 sm:pl-6 sm:pr-4 lg:pb-4"
                style={{ ["--i" as string]: i }}
              >
                <span className="step-n label absolute -left-[0.55rem] top-1 bg-paper-2 px-1 text-signal sm:static sm:block sm:bg-transparent sm:px-0">
                  0{i + 1}
                </span>
                <h3 className="step-title font-display mt-1 text-2xl font-semibold sm:mt-3">{s.t}</h3>
                <p className="step-desc mt-2 text-ink/80">{s.d}</p>
              </ScrollLinked>
            ))}
          </ol>
          <ProcessStand />
          <div className="mt-14 grid gap-4 md:grid-cols-5">
            <div className="md:col-span-3"><WorkCard p={byId("fne-b")} sizes="(min-width:768px) 60vw, 100vw" className="aspect-[16/10]" /></div>
            <div className="md:col-span-2"><WorkCard p={byId("tunja")} sizes="(min-width:768px) 40vw, 100vw" className="aspect-[4/3] md:h-full md:aspect-auto" /></div>
          </div>
        </div>
      </section>

      {/* TRABAJO */}
      <section className="grid-paper-dark bg-ink text-paper" aria-labelledby="h-trabajo">
        <div className="mx-auto max-w-[1400px] px-5 py-20 sm:px-8 lg:py-28">
          <Reveal variant="fade" className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <p className="label text-mint">Trabajo publicado</p>
              <RevealWords id="h-trabajo" className="font-display mt-4 text-4xl font-bold leading-[1] sm:text-6xl" text="Stands que ya tienen forma." />
            </div>
            <Link href="/portafolio" className="btn btn-ghost-light self-start">
              Ver todo el portafolio <span aria-hidden="true">→</span>
            </Link>
          </Reveal>
          <div className="mt-12 grid gap-4 md:grid-cols-6">
            <div className="md:col-span-4"><WorkCard p={byId("boyaca")} sizes="(min-width:768px) 66vw, 100vw" className="aspect-[16/9]" /></div>
            <div className="md:col-span-2"><WorkCard p={byId("usana")} sizes="(min-width:768px) 33vw, 100vw" className="aspect-[4/3] md:h-full md:aspect-auto" /></div>
            <div className="md:col-span-2"><WorkCard p={byId("villa")} sizes="(min-width:768px) 33vw, 100vw" className="aspect-[16/10]" /></div>
            <div className="md:col-span-2"><WorkCard p={byId("aipa")} sizes="(min-width:768px) 33vw, 100vw" className="aspect-[16/10]" /></div>
            <div className="md:col-span-2"><WorkCard p={byId("banquete")} sizes="(min-width:768px) 33vw, 100vw" className="aspect-[16/10]" /></div>
          </div>
          <p className="label mt-6 text-paper/60">
            “Render 3D” es la visualización del diseño previa a la construcción; “Fotografía” es registro del montaje.
          </p>
        </div>
      </section>

      {/* TUNJA TATTOO */}
      <section className="mx-auto max-w-[1400px] px-5 py-20 sm:px-8 lg:py-28" aria-labelledby="h-tattoo">
        <div className="grid gap-10 lg:grid-cols-12">
          <Reveal variant="fade" className="lg:col-span-4">
            <p className="label text-teal-deep">Eventos</p>
            <RevealWords id="h-tattoo" className="font-display mt-4 text-4xl font-bold leading-[1] sm:text-5xl" text="Tunja Tattoo Festival." />
            <p className="mt-6 text-lg text-ink/85">
              BenRed fue el organizador y productor integral de las cuatro ediciones del festival.
              Aquí, el afiche de cada una. El de la Vol. 2 anunciaba más de 160 tatuadores,
              suspensiones, videojuegos, arte, zona de comidas y DJs: una producción con identidad
              propia, año tras año.
            </p>
            <Link href="/portafolio" className="btn btn-ghost mt-8">Ver en el portafolio</Link>
          </Reveal>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:col-span-8">
            {TATTOO_POSTERS.map((p, i) => (
              <li key={p.id}>
                <Reveal delay={i * 70}>
                  <Image
                    src={`/work/${p.file}-640.webp`}
                    alt={p.title}
                    width={p.w}
                    height={p.h}
                    sizes="(min-width:1024px) 16vw, 45vw"
                    className="aspect-[3/4] w-full border border-ink object-cover"
                  />
                  <p className="label mt-2 text-muted">{p.title.replace("Tunja Tattoo Festival · ", "")}</p>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>

      </section>

      {/* Demostración conceptual independiente (no es un evento ejecutado por BenRed): superficie oscura continua */}
      <section className="cs-section bg-ink text-paper" aria-labelledby="h-concierto">
        <div className="mx-auto max-w-[1400px] px-5 pb-16 pt-14 sm:px-8 lg:pb-20 lg:pt-16">
          <div className="grid gap-6 lg:grid-cols-12">
            <p className="label text-mint lg:col-span-3">Visualización conceptual de producción de eventos</p>
            <h3 id="h-concierto" className="font-display text-4xl font-bold leading-[1] sm:text-5xl lg:col-span-9">De la idea al escenario.</h3>
          </div>
          <ConcertStage />
        </div>
      </section>

      {/* POR QUÉ */}
      <section className="border-t border-ink bg-paper-2" aria-labelledby="h-porque">
        <div className="mx-auto grid max-w-[1400px] gap-10 px-5 py-20 sm:px-8 lg:grid-cols-12 lg:py-24">
          <Reveal variant="fade" className="lg:col-span-4">
            <p className="label text-teal-deep">Por qué BenRed</p>
            <RevealWords id="h-porque" className="font-display mt-4 text-4xl font-bold leading-[1] sm:text-5xl" text="Menos intermediarios, menos sorpresas." />
          </Reveal>
          <div className="grid gap-8 sm:grid-cols-3 lg:col-span-8">
            {[
              ["Un solo equipo", "Diseño, producción y montaje bajo la misma responsabilidad, no en tres proveedores distintos."],
              ["Lo ves antes de construirlo", "Renders 3D del stand para validar medidas, flujo y marca antes de producir."],
              ["Ejecución en sitio", "Coordinamos proveedores y operación el día del evento para que lo planeado ocurra."],
            ].map(([t, d], i) => (
              <Reveal key={t} variant="group" delay={i * 120} className="relative pt-4">
                <span aria-hidden="true" className="rg-rule absolute inset-x-0 top-0 h-[2px] bg-signal" />
                <h3 className="rg-item font-display text-2xl font-semibold" style={{ ["--k" as string]: 0 }}>{t}</h3>
                <p className="rg-item mt-3 text-ink/80" style={{ ["--k" as string]: 1 }}>{d}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-teal-deep text-paper" aria-labelledby="h-cta">
        <div className="mx-auto grid max-w-[1400px] items-end gap-8 px-5 py-20 sm:px-8 lg:grid-cols-12 lg:py-24">
          <RevealWords id="h-cta" className="font-display text-5xl font-bold leading-[0.95] sm:text-7xl lg:col-span-8" text="¿Qué vas a presentar en tu próximo evento?" />
          <div className="flex flex-col gap-3 lg:col-span-4">
            <a href={whatsappLink(DEFAULT_WA_MESSAGE)} target="_blank" rel="noopener noreferrer" className="btn btn-on-teal justify-center">
              Escríbenos por WhatsApp
            </a>
            <Link href="/contacto" className="btn btn-ghost-light justify-center">Usar el formulario</Link>
          </div>
        </div>
      </section>
    </>
  );
}
