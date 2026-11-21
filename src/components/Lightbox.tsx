"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

export type LightboxImage = { src: string; alt: string; w: number; h: number };

/**
 * Visor ampliado sobre <dialog> nativo (mismo mecanismo que ProjectGallery): Escape cierra, el foco queda dentro
 * del diálogo y el navegador lo devuelve al elemento que lo abrió. Sin dependencias.
 * `index === null` = cerrado. Flechas del teclado, botones y deslizamiento horizontal para navegar.
 */
export function Lightbox({
  images,
  index,
  onIndex,
  onClose,
}: {
  images: LightboxImage[];
  index: number | null;
  onIndex: (i: number) => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const touch = useRef<{ x: number; y: number } | null>(null);
  const n = images.length;
  const open = index !== null && index < n;
  const cur = open ? images[index] : null;
  const go = (d: number) => {
    if (index === null || n < 2) return;
    onIndex((index + d + n) % n);
  };

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  // Bloqueo del scroll de fondo mientras el visor está abierto (se restaura al cerrar o desmontar)
  useEffect(() => {
    if (!open) return;
    const html = document.documentElement;
    const prev = html.style.overflow;
    html.style.overflow = "hidden";
    return () => {
      html.style.overflow = prev;
    };
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-label="Visor de imágenes"
      className="lb-dialog m-0 h-[100svh] max-h-none w-[100vw] max-w-none border-0 bg-ink p-0 text-paper backdrop:bg-ink open:flex"
      onClose={onClose}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") go(1);
        if (e.key === "ArrowLeft") go(-1);
      }}
    >
      <div
        className="flex h-full w-full flex-col pb-[max(1rem,env(safe-area-inset-bottom))] pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] pt-[max(1rem,env(safe-area-inset-top))]"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div className="flex items-center justify-between gap-4">
          <p className="label text-paper/70" aria-live="polite">
            {open && n > 1 ? `${String(index + 1).padStart(2, "0")} / ${String(n).padStart(2, "0")}` : ""}
          </p>
          <button
            type="button"
            className="label inline-flex min-h-11 min-w-11 items-center justify-center gap-2 border border-paper/50 px-4 hover:bg-paper hover:text-ink"
            onClick={onClose}
            autoFocus
            aria-label="Cerrar visor"
          >
            Cerrar <span aria-hidden="true">✕</span>
          </button>
        </div>

        <div
          className="relative flex min-h-0 flex-1 touch-pan-y items-center justify-center gap-2 overflow-hidden"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
          onTouchStart={(e) => {
            const t = e.touches[0];
            touch.current = { x: t.clientX, y: t.clientY };
          }}
          onTouchEnd={(e) => {
            const s = touch.current;
            touch.current = null;
            if (!s) return;
            const t = e.changedTouches[0];
            const dx = t.clientX - s.x;
            if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(t.clientY - s.y) * 1.5) go(dx < 0 ? 1 : -1);
          }}
        >
          {n > 1 && (
            <button type="button" className="lb-nav hidden sm:inline-flex" onClick={() => go(-1)} aria-label="Imagen anterior">
              <span aria-hidden="true">←</span>
            </button>
          )}
          {cur && (
            <Image
              key={cur.src}
              src={cur.src}
              alt={cur.alt}
              width={cur.w}
              height={cur.h}
              sizes="100vw"
              className="lb-img h-auto max-h-[calc(100svh-9rem)] w-auto min-w-0 max-w-full object-contain"
            />
          )}
          {n > 1 && (
            <button type="button" className="lb-nav hidden sm:inline-flex" onClick={() => go(1)} aria-label="Imagen siguiente">
              <span aria-hidden="true">→</span>
            </button>
          )}
        </div>

        {n > 1 && (
          <div className="mt-3 flex justify-between gap-3 sm:hidden">
            <button type="button" className="lb-nav" onClick={() => go(-1)} aria-label="Imagen anterior">
              <span aria-hidden="true">←</span>
            </button>
            <button type="button" className="lb-nav" onClick={() => go(1)} aria-label="Imagen siguiente">
              <span aria-hidden="true">→</span>
            </button>
          </div>
        )}
      </div>
    </dialog>
  );
}
