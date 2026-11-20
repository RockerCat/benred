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
        <Link href="/" aria-label="BenRed, inicio" className="flex items-center gap-3">
          <Image
            src="/brand/benred-mark-color.svg"
            alt=""
            width={56}
            height={50}
            priority
            unoptimized
            className="h-11 w-auto"
          />
          <span className="sr-only">BenRed</span>
          <span aria-hidden="true" className="label hidden border-l border-[var(--line-strong)] pl-3 leading-tight text-muted sm:block">
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
            className="btn btn-primary !min-h-11 !px-5"
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
