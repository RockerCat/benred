"use client";

import { useMemo, useState } from "react";
import { PIECES, PORTFOLIO, type Entry } from "@/lib/portfolio";
import { coverSrc, entryAlt } from "@/lib/portfolio";
import { Lightbox } from "./Lightbox";
import { PortfolioCard } from "./PortfolioCard";

const FILTERS = [
  { id: "todo", label: "Todo" },
  { id: "stand", label: "Stands" },
  { id: "evento", label: "Eventos" },
] as const;

/** Filas editoriales 2 · 2 · 3 (se repite). Una fila suelta final se une a la anterior. */
const PATTERN = [2, 2, 3];
function toRows(items: Entry[]): Entry[][] {
  const rows: Entry[][] = [];
  let i = 0;
  let k = 0;
  while (i < items.length) {
    const n = PATTERN[k++ % PATTERN.length];
    rows.push(items.slice(i, i + n));
    i += n;
  }
  if (rows.length > 1 && rows[rows.length - 1].length === 1) rows[rows.length - 2].push(...(rows.pop() as Entry[]));
  return rows;
}
const ratio = (e: Entry) => e.cover.w / e.cover.h;
const TARGET = 3.1; // suma de proporciones a partir de la cual la fila ocupa todo el ancho

export function PortfolioGallery() {
  const [f, setF] = useState<(typeof FILTERS)[number]["id"]>("todo");
  const items = useMemo(() => PORTFOLIO.filter((e) => f === "todo" || e.category === f), [f]);
  const pieces = f === "todo" ? PIECES : items.reduce((a, e) => a + e.images.length, 0);
  const rows = toRows(items);

  // Secuencia del visor: solo imágenes genéricas del filtro activo, en el orden visible (Tunja Tattoo Festival abre su página)
  const seq = useMemo(() => items.filter((e) => !e.role), [items]);
  const [open, setOpen] = useState<number | null>(null);
  const images = useMemo(
    () => seq.map((e) => ({ src: coverSrc(e), alt: entryAlt(e), w: e.cover.w, h: e.cover.h })),
    [seq],
  );

  return (
    <div>
      <div role="group" aria-label="Filtrar proyectos por servicio" className="flex flex-wrap items-center gap-2">
        {FILTERS.map((x) => (
          <button
            key={x.id}
            type="button"
            aria-pressed={f === x.id}
            onClick={() => {
              setOpen(null);
              setF(x.id);
            }}
            className={`label min-h-11 border border-ink px-5 transition-colors ${f === x.id ? "bg-ink text-paper" : "hover:bg-ink/10"}`}
          >
            {f === x.id ? <span aria-hidden="true" className="mr-2 text-signal">●</span> : null}
            {x.label}
          </button>
        ))}
        <p className="label ml-auto text-muted" aria-live="polite">
          {items.length} proyectos · {pieces} piezas
        </p>
      </div>

      <div key={f} className="pf-fade mt-8 space-y-10 lg:space-y-14">
        {rows.map((row, ri) => {
          const sum = row.reduce((a, e) => a + ratio(e), 0);
          const pct = Math.min(100, (sum / TARGET) * 100);
          return (
            <div
              key={ri}
              className="flex flex-col gap-x-5 gap-y-10 lg:max-w-[var(--rw)] lg:flex-row lg:items-start"
              style={{ ["--rw" as string]: `${pct.toFixed(1)}%` }}
            >
              {row.map((e, ci) => (
                <div
                  key={e.slug}
                  className="min-w-0 lg:[flex:var(--a)_1_0%]"
                  style={{ ["--a" as string]: ratio(e).toFixed(3) }}
                >
                  <PortfolioCard
                    e={e}
                    delay={ci * 70}
                    priority={ri === 0}
                    onOpen={() => setOpen(seq.indexOf(e))}
                    sizes={`(min-width:1024px) ${Math.round((100 * ratio(e)) / Math.max(sum, TARGET))}vw, 100vw`}
                  />
                </div>
              ))}
            </div>
          );
        })}
      </div>
      <Lightbox images={images} index={open} onIndex={setOpen} onClose={() => setOpen(null)} />
    </div>
  );
}
