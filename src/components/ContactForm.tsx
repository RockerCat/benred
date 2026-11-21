"use client";

import { useState } from "react";
import { SERVICES, SITE, whatsappLink } from "@/lib/site";

const TYPES = [...SERVICES.map((s) => s.name), "Otro / no estoy seguro"];

/**
 * Sin backend: el formulario arma el mensaje y lo abre en WhatsApp o en el cliente de correo.
 * Es explícito para quien escribe: no se guarda nada en ningún servidor.
 */
export function ContactForm() {
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [type, setType] = useState(TYPES[0]);
  const [date, setDate] = useState("");
  const [msg, setMsg] = useState("");
  const [touched, setTouched] = useState(false);

  const valid = name.trim().length > 1 && msg.trim().length > 5;

  const text = [
    `Hola BenRed, soy ${name.trim() || "[nombre]"}${company.trim() ? ` de ${company.trim()}` : ""}.`,
    `Me interesa: ${type}.`,
    date.trim() ? `Fecha o feria: ${date.trim()}.` : "",
    "",
    msg.trim(),
  ]
    .filter((l, i, a) => l !== "" || (i > 0 && a[i - 1] !== ""))
    .join("\n");

  const mailto = `mailto:${SITE.emailPrimary}?cc=${SITE.emailAlt}&subject=${encodeURIComponent(
    `Proyecto: ${type}${company.trim() ? ` · ${company.trim()}` : ""}`,
  )}&body=${encodeURIComponent(text)}`;

  const guard = (e: React.MouseEvent) => {
    if (!valid) {
      e.preventDefault();
      setTouched(true);
    }
  };

  const field =
    "w-full border border-ink bg-paper px-4 py-3 text-base outline-offset-2 placeholder:text-muted/70";

  return (
    <form
      className="grid gap-6"
      onSubmit={(e) => e.preventDefault()}
      aria-describedby="form-nota"
      noValidate
    >
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="f-nombre" className="label mb-2 block">Tu nombre *</label>
          <input id="f-nombre" name="nombre" autoComplete="name" className={field} value={name} onChange={(e) => setName(e.target.value)} aria-invalid={touched && name.trim().length < 2} />
        </div>
        <div>
          <label htmlFor="f-empresa" className="label mb-2 block">Empresa o marca</label>
          <input id="f-empresa" name="empresa" autoComplete="organization" className={field} value={company} onChange={(e) => setCompany(e.target.value)} />
        </div>
        <div>
          <label htmlFor="f-tipo" className="label mb-2 block">¿Qué necesitas?</label>
          <select id="f-tipo" name="tipo" className={field} value={type} onChange={(e) => setType(e.target.value)}>
            {TYPES.map((t) => (<option key={t}>{t}</option>))}
          </select>
        </div>
        <div>
          <label htmlFor="f-fecha" className="label mb-2 block">Fecha, feria o evento</label>
          <input id="f-fecha" name="fecha" className={field} placeholder="Ej.: feria en marzo, Bogotá" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
      </div>
      <div>
        <label htmlFor="f-mensaje" className="label mb-2 block">Cuéntanos el proyecto *</label>
        <textarea id="f-mensaje" name="mensaje" rows={5} className={field} placeholder="Qué quieres lograr, para cuándo y cualquier detalle que ya tengas." value={msg} onChange={(e) => setMsg(e.target.value)} aria-invalid={touched && msg.trim().length < 6} />
      </div>

      {touched && !valid && (
        <p role="alert" className="font-medium text-[#b3260f]">
          Escribe tu nombre y una breve descripción para poder armar el mensaje.
        </p>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <a data-cta-primary className="btn btn-primary justify-center" href={whatsappLink(text)} target="_blank" rel="noopener noreferrer" onClick={guard}>
          Enviar por WhatsApp
        </a>
        <a className="btn btn-ghost justify-center" href={mailto} onClick={guard}>
          Enviar por correo
        </a>
      </div>
      <p id="form-nota" className="label text-muted">
        Se abre WhatsApp o tu correo con el mensaje listo. No guardamos nada en este sitio.
      </p>
    </form>
  );
}
