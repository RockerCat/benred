import Image from "next/image";
import Link from "next/link";
import { DEFAULT_WA_MESSAGE, NAV, SERVICES, SITE, whatsappLink } from "@/lib/site";

export function Footer() {
  return (
    <footer className="grid-paper-dark bg-ink text-paper">
      <div className="mx-auto grid max-w-[1400px] gap-12 px-5 py-16 sm:px-8 md:grid-cols-12">
        <div className="md:col-span-5">
          <div className="inline-block bg-paper p-5">
            <Image
              src="/brand/benred-logo-color.svg"
              alt="BenRed"
              width={300}
              height={264}
              unoptimized
              className="h-36 w-auto"
            />
          </div>
          <p className="font-display mt-8 max-w-md text-3xl font-semibold leading-tight">
            ¿Tienes una marca, una fecha y una idea? Nosotros la llevamos al piso.
          </p>
          <a
            href={whatsappLink(DEFAULT_WA_MESSAGE)}
            target="_blank"
            rel="noopener noreferrer"
            data-cta-primary
            className="btn btn-primary mt-8"
          >
            Cuéntanos tu proyecto
          </a>
        </div>

        <nav aria-label="Pie de página" className="md:col-span-3 md:col-start-7">
          <p className="label text-mint">Sitio</p>
          <ul className="mt-4 space-y-2">
            {NAV.map((i) => (
              <li key={i.href}>
                <Link href={i.href} className="hover-underline">{i.label}</Link>
              </li>
            ))}
          </ul>
          <p className="label mt-8 text-mint">Servicios</p>
          <ul className="mt-4 space-y-2">
            {SERVICES.map((s) => (
              <li key={s.slug}>
                <Link href={`/servicios/${s.slug}`} className="hover-underline">{s.name}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="md:col-span-3">
          <p className="label text-mint">Contacto</p>
          <address className="mt-4 space-y-2 not-italic">
            <p>{SITE.region}, {SITE.country}</p>
            <p><a className="hover-underline" href={`tel:+${SITE.whatsappNumber}`}>{SITE.phoneDisplay}</a></p>
            <p><a className="hover-underline" href={`tel:${SITE.phoneAlt.replace(/\s/g, "")}`}>{SITE.phoneAlt}</a></p>
            <p><a className="hover-underline break-all" href={`mailto:${SITE.emailPrimary}`}>{SITE.emailPrimary}</a></p>
            <p><a className="hover-underline break-all" href={`mailto:${SITE.emailAlt}`}>{SITE.emailAlt}</a></p>
          </address>
          <p className="label mt-8 text-mint">Redes</p>
          <ul className="mt-4 space-y-2">
            <li><a className="hover-underline" href={SITE.social.instagram} target="_blank" rel="noopener noreferrer">Instagram</a></li>
            <li><a className="hover-underline" href={SITE.social.facebook} target="_blank" rel="noopener noreferrer">Facebook</a></li>
            <li><a className="hover-underline" href={SITE.social.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <p className="label mx-auto max-w-[1400px] px-5 py-5 text-paper/60 sm:px-8">
          © BenRed · Boyacá, Colombia
        </p>
      </div>
    </footer>
  );
}
