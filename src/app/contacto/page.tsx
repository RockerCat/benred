import type { Metadata } from "next";
import { ContactForm } from "@/components/ContactForm";
import { DEFAULT_WA_MESSAGE, SITE, whatsappLink } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contacto: cuéntanos tu proyecto",
  description:
    "Escríbele a BenRed por WhatsApp o correo y cuéntanos tu activación, stand o evento. Estamos en Boyacá, Colombia.",
  alternates: { canonical: "/contacto" },
};

export default function ContactoPage() {
  return (
    <section className="grid-paper">
      <div className="mx-auto grid max-w-[1400px] gap-14 px-5 py-16 sm:px-8 lg:grid-cols-12 lg:py-24">
        <div className="lg:col-span-5">
          <p className="label text-teal-deep">Contacto</p>
          <h1 className="font-display mt-4 text-5xl font-bold leading-[0.95] sm:text-7xl">
            Cuéntanos tu proyecto.
          </h1>
          <p className="mt-6 text-xl text-ink/85">
            Entre más claro el objetivo, la fecha y el espacio, más precisa la propuesta. Si no los
            tienes, escríbenos igual.
          </p>
          <a href={whatsappLink(DEFAULT_WA_MESSAGE)} target="_blank" rel="noopener noreferrer" className="btn btn-secondary mt-8">
            Abrir WhatsApp · {SITE.phoneDisplay}
          </a>
          <address className="mt-10 space-y-3 border-t border-ink pt-6 not-italic">
            <p><span className="label block text-muted">Correo</span>
              <a className="hover-underline break-all" href={`mailto:${SITE.emailPrimary}`}>{SITE.emailPrimary}</a><br />
              <a className="hover-underline break-all" href={`mailto:${SITE.emailAlt}`}>{SITE.emailAlt}</a></p>
            <p><span className="label block text-muted">Teléfonos</span>
              <a className="hover-underline" href={`tel:+${SITE.whatsappNumber}`}>{SITE.phoneDisplay}</a><br />
              <a className="hover-underline" href={`tel:${SITE.phoneAlt.replace(/\s/g, "")}`}>{SITE.phoneAlt}</a></p>
            <p><span className="label block text-muted">Ubicación</span>{SITE.region}, {SITE.country}</p>
          </address>
        </div>
        <div className="border border-ink bg-paper p-6 sm:p-10 lg:col-span-7">
          <ContactForm />
        </div>
      </div>
    </section>
  );
}
