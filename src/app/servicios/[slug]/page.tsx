import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LabFlow, StandSheet, TouchpointMap } from "@/components/LabDiagrams";
import { Reveal } from "@/components/Reveal";
import { WorkCard } from "@/components/WorkCard";
import { PROJECTS, SERVICES, whatsappLink } from "@/lib/site";

export function generateStaticParams() {
  return SERVICES.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: PageProps<"/servicios/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const s = SERVICES.find((x) => x.slug === slug);
  if (!s) return {};
  return {
    title: s.seoTitle,
    description: s.seoDescription,
    alternates: { canonical: `/servicios/${s.slug}` },
  };
}

export default async function ServicioPage({ params }: PageProps<"/servicios/[slug]">) {
  const { slug } = await params;
  const s = SERVICES.find((x) => x.slug === slug);
  if (!s) notFound();

  const related =
    s.slug === "stands-y-montajes"
      ? PROJECTS.filter((p) => p.category === "stand").slice(0, 3)
      : s.slug === "produccion-y-logistica-de-eventos"
        ? PROJECTS.filter((p) => p.category === "evento")
        : [];

  const others = SERVICES.filter((x) => x.slug !== s.slug);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: s.name,
    description: s.seoDescription,
    areaServed: "CO",
    provider: { "@type": "Organization", name: "BenRed" },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section className="grid-paper border-b border-[var(--line)]">
        <div className="mx-auto max-w-[1400px] px-5 py-16 sm:px-8 lg:py-24">
          <nav aria-label="Ruta" className="label text-muted">
            <Link href="/servicios" className="hover-underline">Servicios</Link> / {s.n}
          </nav>
          <h1 className="font-display mt-5 max-w-5xl text-5xl font-bold leading-[0.95] sm:text-7xl">
            {s.headline}
          </h1>
          <p className="mt-6 max-w-2xl text-xl text-ink/85">{s.lead}</p>
          <a
            href={whatsappLink(`Hola BenRed, quiero cotizar ${s.waHint}. `)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary mt-9"
          >
            Cotizar este servicio <span aria-hidden="true">→</span>
          </a>
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-5 py-14 sm:px-8 lg:py-20" aria-label="Visualización técnica del servicio">
        {s.slug === "marketing-experiencial-btl" && (
          <div className="grid items-center gap-8 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <p className="label text-signal">Puntos de contacto</p>
              <h2 className="font-display mt-3 text-3xl font-bold sm:text-4xl">Una activación se diseña desde la interacción.</h2>
              <p className="mt-4 text-ink/85">
                El mapa muestra, de forma conceptual, los frentes que reúne el servicio alrededor de la marca y su público.
              </p>
            </div>
            <Reveal variant="fade" className="lg:col-span-7">
              <figure className="lab m-0">
                <TouchpointMap nodes={s.scope} />
                <figcaption className="label mt-3 border-t border-[var(--line)] pt-2 text-muted">Diagrama conceptual · no es un proyecto real</figcaption>
              </figure>
            </Reveal>
          </div>
        )}
        {s.slug === "stands-y-montajes" && (
          <div className="grid gap-10">
            <div className="grid items-center gap-8 lg:grid-cols-12">
              <Reveal variant="fade" className="lg:col-span-7">
                <figure className="lab m-0">
                  <StandSheet />
                  <figcaption className="label mt-3 border-t border-[var(--line)] pt-2 text-muted">Hoja técnica conceptual · no corresponde a un stand real</figcaption>
                </figure>
              </Reveal>
              <div className="lg:col-span-5">
                <p className="label text-signal">Del plano al montaje</p>
                <h2 className="font-display mt-3 text-3xl font-bold sm:text-4xl">Un solo equipo, del diseño al piso de feria.</h2>
                <p className="mt-4 text-ink/85">
                  Planta y alzado definen el espacio; la producción y el montaje lo llevan a la feria.
                </p>
              </div>
            </div>
            <Reveal variant="fade">
              <LabFlow
                steps={[
                  { title: "Diseño", text: s.scope[0] },
                  { title: "Producción", text: s.scope[1] },
                  { title: "Integración", text: s.scope[3] },
                  { title: "Montaje", text: `${s.scope[2]}. ${s.scope[4]}` },
                ]}
              />
            </Reveal>
          </div>
        )}
        {s.slug === "produccion-y-logistica-de-eventos" && (
          <div className="grid gap-10">
            <div className="max-w-3xl">
              <p className="label text-signal">Planificación, producción y operación</p>
              <h2 className="font-display mt-3 text-3xl font-bold sm:text-4xl">Un evento es un sistema que se coordina.</h2>
              <p className="mt-4 text-ink/85">
                Corporativo, institucional o de entretenimiento: el servicio cubre desde el plan hasta el día del evento.
              </p>
            </div>
            <Reveal variant="fade">
              <LabFlow
                steps={[
                  { title: "Planificación", text: s.scope[0] },
                  { title: "Infraestructura", text: s.scope[2] },
                  { title: "Coordinación", text: s.scope[1] },
                  { title: "Operación", text: s.scope[3] },
                ]}
              />
            </Reveal>
            <p className="label text-muted">{s.scope[4]}</p>
          </div>
        )}
      </section>

      <section className="mx-auto grid max-w-[1400px] gap-12 px-5 py-16 sm:px-8 lg:grid-cols-12 lg:py-24">
        <div className="lg:col-span-6">
          <h2 className="font-display text-3xl font-bold sm:text-4xl">Qué incluye</h2>
          <ul className="mt-6 space-y-3">
            {s.scope.map((x) => (
              <li key={x} className="flex gap-3 border-b border-[var(--line)] pb-3">
                <span aria-hidden="true" className="mt-2 h-2 w-2 shrink-0 bg-signal" />
                {x}
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-ink p-8 text-paper lg:col-span-5 lg:col-start-8">
          <h2 className="font-display text-3xl font-bold">Para cotizar, cuéntanos</h2>
          <ul className="mt-6 space-y-3">
            {s.bring.map((x) => (
              <li key={x} className="flex gap-3">
                <span aria-hidden="true" className="mt-2 h-2 w-2 shrink-0 bg-mint" />
                {x}
              </li>
            ))}
          </ul>
          <p className="mt-6 text-paper/70">
            Si aún no tienes todo definido, también sirve: lo armamos contigo.
          </p>
        </div>
      </section>

      {related.length > 0 && (
        <section className="bg-paper-2">
          <div className="mx-auto max-w-[1400px] px-5 py-16 sm:px-8">
            <h2 className="font-display text-3xl font-bold sm:text-4xl">Trabajo publicado</h2>
            <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => (
                <li key={p.id}>
                  <WorkCard p={p} sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw" className="aspect-[4/3]" />
                </li>
              ))}
            </ul>
            <Link href="/portafolio" className="btn btn-ghost mt-8">Ver portafolio completo</Link>
          </div>
        </section>
      )}

      <section className="mx-auto max-w-[1400px] px-5 py-16 sm:px-8">
        <h2 className="label text-muted">También hacemos</h2>
        <ul className="mt-5 grid gap-4 md:grid-cols-2">
          {others.map((o) => (
            <li key={o.slug}>
              <Link href={`/servicios/${o.slug}`} className="group flex items-center justify-between border border-ink p-6 hover:bg-ink hover:text-paper">
                <span className="font-display text-2xl font-semibold">{o.name}</span>
                <span aria-hidden="true" className="text-3xl transition-transform group-hover:translate-x-1">→</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
