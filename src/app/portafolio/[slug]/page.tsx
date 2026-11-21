import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PortfolioCta } from "@/components/PortfolioCta";
import { ProjectGallery } from "@/components/ProjectGallery";
import { Reveal } from "@/components/Reveal";
import { CATEGORY_LABEL, coverSrc, entryAlt, entryBySlug, KIND_NOTE, PORTFOLIO } from "@/lib/portfolio";
import { workSrc } from "@/lib/site";

export function generateStaticParams() {
  // Única ficha individual: Tunja Tattoo Festival. Las demás rutas antiguas se redirigen en next.config.ts.
  return PORTFOLIO.filter((e) => e.role).map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: PageProps<"/portafolio/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const e = entryBySlug(slug);
  if (!e?.role) return {};
  const desc = e.service
    ? `${e.title}: ${e.status ? `proyecto de ${e.service.toLowerCase()} realizado por BenRed` : "proyecto de stand de BenRed, que diseña, produce y monta stands"}. ${e.kind === "Render 3D" ? "La imagen es el render 3D de la etapa de diseño." : "La imagen es una fotografía del montaje."}`
    : e.role
    ? `${e.title}: festival de cuatro ediciones organizado y producido de forma integral por BenRed. El portafolio reúne el afiche oficial de cada edición.`
    : `${e.title}: ${e.kind.toLowerCase()} de ${CATEGORY_LABEL[e.category].toLowerCase()} en el portafolio de BenRed. ${KIND_NOTE[e.kind]}`;
  return {
    title: `${e.title} · Portafolio`,
    description: desc,
    alternates: { canonical: `/portafolio/${e.slug}` },
    openGraph: { title: `${e.title} · BenRed`, description: desc, images: [{ url: coverSrc(e), width: e.cover.w, height: e.cover.h, alt: entryAlt(e) }] },
  };
}

/**
 * Con `partialPrefetching`, leer `params` en la raíz de la página ata el App Shell a una URL concreta
 * (aviso "URL data outside of Suspense"). El shell estático queda fuera y la lectura de `params` va
 * dentro de <Suspense>; las 10 fichas siguen prerenderizadas por generateStaticParams.
 */
export default function ProyectoPage({ params }: PageProps<"/portafolio/[slug]">) {
  return (
    <Suspense fallback={<div className="grid-paper min-h-[60svh] border-b border-[var(--line)]" aria-busy="true" />}>
      <Proyecto params={params} />
    </Suspense>
  );
}

async function Proyecto({ params }: Pick<PageProps<"/portafolio/[slug]">, "params">) {
  const { slug } = await params;
  const e = entryBySlug(slug);
  if (!e?.role) notFound();

  const multi = e.images.length > 1;
  const c = e.cover;

  return (
    <>
      <section className="grid-paper border-b border-[var(--line)]">
        <div className="mx-auto max-w-[1400px] px-5 py-12 sm:px-8 lg:py-16">
          <nav aria-label="Ruta" className="label text-muted">
            <Link href="/portafolio" className="hover-underline">← Portafolio</Link>
          </nav>
          <div className="mt-6 grid gap-6 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-8">
              <p className="label text-signal">Proyecto</p>
              <h1 className="font-display mt-3 text-5xl font-bold leading-[0.95] sm:text-7xl">{e.title}</h1>
            </div>
            <dl className="grid grid-cols-2 gap-4 border-t border-ink pt-3 lg:col-span-4">
              <div>
                <dt className="label text-muted">Categoría</dt>
                <dd className="mt-1">{CATEGORY_LABEL[e.category]}</dd>
              </div>
              <div>
                <dt className="label text-muted">{e.projectType ? "Tipo de proyecto" : e.service ? "Servicio" : "Tipo de material"}</dt>
                <dd className="mt-1">{e.projectType ? e.label : e.service ?? e.material}</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-5 py-12 sm:px-8 lg:py-16">
        <Reveal variant="fade">
          {multi ? (
            <>
            {e.editions && <h2 className="font-display mb-6 text-3xl font-bold sm:text-4xl">Cuatro ediciones, una misma experiencia.</h2>}
            <ProjectGallery
              labels={e.editions ? e.images.map((p) => p.title.replace(`${e.title} · `, "")) : undefined}
              title={e.title}
              images={e.images.map((p) => ({ src: workSrc(p, "lg"), alt: `${p.kind}: ${p.title}`, w: p.w, h: p.h }))}
            />
            </>
          ) : (
            <figure className="m-0">
              <div className="mx-auto" style={{ maxWidth: c.hasLarge ? undefined : `${c.w}px` }}>
                <Image
                  src={coverSrc(e)}
                  alt={entryAlt(e)}
                  width={c.w}
                  height={c.h}
                  sizes="(min-width:1400px) 1336px, 94vw"
                  priority
                  className="h-auto w-full border border-ink bg-paper-2"
                />
              </div>
            </figure>
          )}
        </Reveal>

        <div className="mt-12 grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <h2 className="label text-muted">{e.role || e.description ? "Sobre el proyecto" : "Sobre este material"}</h2>
            {e.description && <p className="mt-3 max-w-2xl text-xl text-ink/90">{e.description}</p>}
            {(e.note ?? KIND_NOTE[e.kind]) !== "" && (
              <p className={`max-w-2xl ${e.description ? "mt-4 text-ink/75" : "mt-3 text-xl text-ink/90"}`}>{e.note ?? KIND_NOTE[e.kind]}</p>
            )}
          </div>
          <dl className="grid grid-cols-2 gap-4 border-t border-ink pt-3 lg:col-span-4 lg:col-start-9">
            <div>
              <dt className="label text-muted">Servicio</dt>
              <dd className="mt-1">{e.service ?? CATEGORY_LABEL[e.category]}</dd>
            </div>
            <div>
              <dt className="label text-muted">{e.role ? "Tipo de proyecto" : e.service ? "Material visual" : "Evidencia"}</dt>
              <dd className="mt-1">{e.role ? e.projectType : e.kind}</dd>
            </div>
            {e.status && (
              <div>
                <dt className="label text-muted">Estado</dt>
                <dd className="mt-1">{e.status}</dd>
              </div>
            )}
            {e.role && (
              <div className="col-span-2">
                <dt className="label text-muted">Rol de BenRed</dt>
                <dd className="mt-1">{e.role}</dd>
              </div>
            )}
            {e.editions && (
              <div>
                <dt className="label text-muted">Ediciones</dt>
                <dd className="mt-1">{e.editions}</dd>
              </div>
            )}
            {e.role && (
              <div className="col-span-2">
                <dt className="label text-muted">Material visual disponible</dt>
                <dd className="mt-1">{e.material}</dd>
              </div>
            )}
            <div className="col-span-2">
              <dt className="label text-muted">Origen</dt>
              <dd className="mt-1">{e.role ? "Proyecto de BenRed; material publicado por BenRed" : "Material publicado por BenRed"}</dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="border-t border-ink">
        <div className="mx-auto max-w-[1400px] px-5 py-10 sm:px-8">
          <Link href="/portafolio" className="btn btn-ghost">← Ver todo el portafolio</Link>
        </div>
      </section>

      <PortfolioCta />
    </>
  );
}
