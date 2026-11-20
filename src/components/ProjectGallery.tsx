"use client";

import Image from "next/image";
import { useRef, useState } from "react";

export type GalleryImage = { src: string; alt: string; w: number; h: number };

/**
 * Galería de un proyecto con varias piezas + visor ampliado.
 * El visor usa <dialog> nativo: Escape cierra, el foco queda atrapado y vuelve al botón que lo abrió.
 * Flechas del teclado y botones para navegar. Sin carruseles automáticos ni dependencias.
 */
export function ProjectGallery({ images, title, labels }: { images: GalleryImage[]; title: string; labels?: string[] }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [i, setI] = useState(0);
  const n = images.length;
  const go = (d: number) => setI((v) => (v + d + n) % n);
  const cur = images[i];

  return (
    <>
      <ul className="grid grid-cols-2 items-end gap-4 lg:grid-cols-4">
        {images.map((im, k) => (
          <li key={im.src}>
            <button
              type="button"
              className="pf-card group block w-full text-left"
              aria-label={`Ampliar: ${im.alt}`}
              onClick={() => {
                setI(k);
                ref.current?.showModal();
              }}
            >
              <span className="pf-frame relative block overflow-hidden border border-ink bg-paper-2" style={{ aspectRatio: `${im.w} / ${im.h}` }}>
                <Image src={im.src} alt={im.alt} width={im.w} height={im.h} sizes="(min-width:1024px) 22vw, 45vw" className="pf-img h-full w-full object-cover" />
                <span aria-hidden="true" className="pf-tick pf-tl" />
                <span aria-hidden="true" className="pf-tick pf-br" />
              </span>
              <span className="label mt-2 flex justify-between text-muted">
                <span>{labels?.[k] ?? `${String(k + 1).padStart(2, "0")} / ${String(n).padStart(2, "0")}`}</span>
                <span className="text-teal-deep">Ampliar</span>
              </span>
            </button>
          </li>
        ))}
      </ul>

      <dialog
        ref={ref}
        aria-label={`Visor: ${title}`}
        className="pf-dialog"
        onClick={(e) => {
          if (e.target === ref.current) ref.current?.close();
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") go(1);
          if (e.key === "ArrowLeft") go(-1);
        }}
      >
        <div className="flex max-h-[92svh] max-w-[94vw] flex-col gap-3 bg-paper p-3 sm:p-4">
          <div className="flex items-center justify-between gap-4">
            <p className="label text-muted" aria-live="polite">
              {title} · {labels?.[i] ?? `${i + 1} / ${n}`}
            </p>
            <button type="button" className="btn btn-ghost !min-h-11 !px-4 !py-2" onClick={() => ref.current?.close()} autoFocus>
              Cerrar <span aria-hidden="true">✕</span>
            </button>
          </div>
          <div className="flex min-h-0 flex-1 items-center justify-center overflow-hidden bg-paper-2">
            {/* tamaño natural como máximo: no se amplía por encima de la resolución disponible */}
            <Image
              key={cur.src}
              src={cur.src}
              alt={cur.alt}
              width={cur.w}
              height={cur.h}
              sizes="94vw"
              className="h-auto max-h-[72svh] w-auto max-w-full object-contain"
              style={{ maxWidth: `min(100%, ${cur.w}px)` }}
            />
          </div>
          {n > 1 && (
            <div className="flex justify-between gap-3">
              <button type="button" className="btn btn-ghost !min-h-11 !px-4 !py-2" onClick={() => go(-1)}>
                <span aria-hidden="true">←</span> Anterior
              </button>
              <button type="button" className="btn btn-ghost !min-h-11 !px-4 !py-2" onClick={() => go(1)}>
                Siguiente <span aria-hidden="true">→</span>
              </button>
            </div>
          )}
        </div>
      </dialog>
    </>
  );
}
