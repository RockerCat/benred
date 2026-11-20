import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PortfolioCard } from "@/components/PortfolioCard";
import { PortfolioCta } from "@/components/PortfolioCta";
import { ProjectGallery } from "@/components/ProjectGallery";
import { Reveal } from "@/components/Reveal";
import { CATEGORY_LABEL, coverSrc, entryAlt, entryBySlug, KIND_NOTE, PORTFOLIO } from "@/lib/portfolio";
import { workSrc } from "@/lib/site";

export function generateStaticParams() {
  return PORTFOLIO.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: PageProps<"/portafolio/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const e = entryBySlug(slug);
  if (!e) return {};
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
  if (!e) notFound();

  const idx = PORTFOLIO.findIndex((x) => x.slug === e.slug);
  const prev = PORTFOLIO[(idx - 1 + PORTFOLIO.length) % PORTFOLIO.length];
  const next = PORTFOLIO[(idx + 1) % PORTFOLIO.length];
  const related = PORTFOLIO.filter((x) => x.category === e.category && x.slug !== e.slug).slice(0, 3);
  const multi = e.images.length > 1;
  const c = e.cover;
  const total = String(PORTFOLIO.length).padStart(2, "0");

  return (
    <>
      <section className="grid-paper border-b border-[var(--line)]">
        <div className="mx-auto max-w-[1400px] px-5 py-12 sm:px-8 lg:py-16">
          <nav aria-label="Ruta" className="label text-muted">
            <Link href="/portafolio" className="hover-underline">← Portafolio</Link>
          </nav>
          <div className="mt-6 grid gap-6 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-8">
              <p className="label text-signal">Proyecto {String(e.n).padStart(2, "0")} / {total}</p>
              <h1 className="font-display mt-3 text-5xl font-bold leading-[0.95] sm:text-7xl">{e.title}</h1>
            </div>
            <dl className="grid grid-cols-2 gap-4 border-t border-ink pt-3 lg:col-span-4">
              <div>
                <dt className="label text-muted">Categoría</dt>
                <dd className="mt-1">{CATEGORY_LABEL[e.category]}</dd>
              </div>
              <div>
                <dt className="label text-muted">{e.projectType ? "Tipo de proyecto" : "Tipo de material"}</dt>
                <dd className="mt-1">{e.projectType ? e.label : e.material}</dd>
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
        <div className="mx-auto grid max-w-[1400px] sm:grid-cols-2">
          <Link href={`/portafolio/${prev.slug}`} className="group flex flex-col gap-1 border-b border-[var(--line)] px-5 py-8 hover:bg-paper-2 sm:border-b-0 sm:border-r sm:px-8">
            <span className="label text-muted">← Proyecto anterior</span>
            <span className="font-display text-2xl font-semibold">{prev.title}</span>
          </Link>
          <Link href={`/portafolio/${next.slug}`} className="group flex flex-col gap-1 px-5 py-8 text-left hover:bg-paper-2 sm:px-8 sm:text-right">
            <span className="label text-muted">Proyecto siguiente →</span>
            <span className="font-display text-2xl font-semibold">{next.title}</span>
          </Link>
        </div>
      </section>

      {related.length > 0 && (
        <section className="bg-paper-2">
          <div className="mx-auto max-w-[1400px] px-5 py-14 sm:px-8 lg:py-20">
            <h2 className="label text-muted">Más de {CATEGORY_LABEL[e.category].toLowerCase()}</h2>
            <ul className="mt-6 grid items-start gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((r, i) => (
                <li key={r.slug}>
                  <PortfolioCard e={r} delay={i * 70} sizes="(min-width:1024px) 30vw, (min-width:640px) 45vw, 100vw" />
                </li>
              ))}
            </ul>
            <Link href="/portafolio" className="btn btn-ghost mt-10">Ver todo el portafolio</Link>
          </div>
        </section>
      )}

      <PortfolioCta />
    </>
  );
}
