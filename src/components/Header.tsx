"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { DEFAULT_WA_MESSAGE, NAV, whatsappLink } from "@/lib/site";

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  // Estado inicial coherente con el SSR: en páginas con CTA principal arriba del pliegue el
  // header arranca en verde petróleo; el observer lo corrige en cuanto mide la visibilidad real.
  const initialTone = pathname === "/" || pathname.startsWith("/servicios/") ? "secondary" : "primary";
  const [tone, setTone] = useState<"primary" | "secondary">(initialTone);

  // Un solo IntersectionObserver para todos los [data-cta-primary] de la página:
  // si alguno está visible, el CTA del header pasa a verde petróleo; si ninguno, naranja.
  useEffect(() => {
    const visible = new Set<Element>();
    const seen = new WeakSet<Element>();
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) visible.add(e.target);
        else visible.delete(e.target);
      }
      setTone(visible.size > 0 ? "secondary" : "primary");
    });
    const scan = () => {
      document.querySelectorAll("[data-cta-primary]").forEach((el) => {
        if (!seen.has(el)) {
          seen.add(el);
          io.observe(el);
        }
      });
    };
    scan();
    // Página sin CTA principal en su contenido: el header queda naranja.
    const first = requestAnimationFrame(() => {
      if (!document.querySelector("[data-cta-primary]")) setTone("primary");
    });
    // Contenido que llega después (streaming / Suspense): re-escanea sin escuchar scroll.
    let raf = 0;
    const mo = new MutationObserver(() => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(scan);
    });
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      cancelAnimationFrame(raf);
      cancelAnimationFrame(first);
      mo.disconnect();
      io.disconnect();
    };
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        btnRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--line)] bg-paper/92 backdrop-blur">
      <div className="mx-auto flex h-[72px] max-w-[1400px] items-center justify-between px-5 sm:px-8">
        <Link href="/" aria-label="BenRed, inicio" className="flex items-center gap-2.5 sm:gap-3">
          <Image
            src="/brand/benred-mark-color.svg"
            alt=""
            width={56}
            height={50}
            priority
            unoptimized
            className="h-11 w-auto"
          />
          <Image
            src="/brand/benred-texto.png"
            alt=""
            width={300}
            height={61}
            priority
            unoptimized
            className="h-[18px] w-auto shrink-0 sm:h-[22px]"
          />
          <span className="sr-only">BenRed</span>
          <span aria-hidden="true" className="label hidden border-l border-[var(--line-strong)] pl-3 leading-tight text-muted xl:block">
            Marketing experiencial
            <br />
            Stands · Eventos
          </span>
        </Link>

        <nav aria-label="Principal" className="hidden items-center gap-9 md:flex">
          {NAV.map((i) => (
            <Link
              key={i.href}
              href={i.href}
              aria-current={isActive(i.href) ? "page" : undefined}
              className={`hover-underline py-1 font-medium ${isActive(i.href) ? "text-teal-deep" : ""}`}
            >
              {i.label}
            </Link>
          ))}
          <a
            href={whatsappLink(DEFAULT_WA_MESSAGE)}
            target="_blank"
            rel="noopener noreferrer"
            data-tone={tone}
            className="btn btn-primary btn-header !min-h-11 !px-5"
          >
            Cuéntanos tu proyecto
          </a>
        </nav>

        <button
          ref={btnRef}
          type="button"
          className="flex h-11 w-11 items-center justify-center border border-ink md:hidden"
          aria-expanded={open}
          aria-controls="menu-movil"
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          onClick={() => setOpen((v) => !v)}
        >
          <span aria-hidden="true" className="relative block h-3.5 w-5">
            <span className={`absolute left-0 top-0 h-[2px] w-5 bg-ink transition-transform ${open ? "translate-y-[6px] rotate-45" : ""}`} />
            <span className={`absolute left-0 top-[6px] h-[2px] w-5 bg-ink transition-opacity ${open ? "opacity-0" : ""}`} />
            <span className={`absolute left-0 top-3 h-[2px] w-5 bg-ink transition-transform ${open ? "-translate-y-[6px] -rotate-45" : ""}`} />
          </span>
        </button>
      </div>

      {open && (
        <div
          id="menu-movil"
          className="grid-paper fixed inset-x-0 bottom-0 top-[72px] z-50 flex flex-col justify-between bg-paper px-5 pb-8 pt-6 md:hidden"
        >
          <nav aria-label="Menú móvil" className="flex flex-col">
            {NAV.map((i, idx) => (
              <Link
                key={i.href}
                href={i.href}
                onClick={() => setOpen(false)}
                className="font-display flex items-baseline gap-4 border-b border-[var(--line)] py-5 text-4xl font-semibold"
              >
                <span className="label text-muted">0{idx + 1}</span>
                {i.label}
              </Link>
            ))}
          </nav>
          <a
            href={whatsappLink(DEFAULT_WA_MESSAGE)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary justify-center"
          >
            Cuéntanos tu proyecto
          </a>
        </div>
      )}
    </header>
  );
}
