"use client";

import { useId, useState, type ReactNode } from "react";

/**
 * Control de un diagrama técnico de "Laboratorio creativo".
 * El SVG lo renderiza el servidor (children); aquí solo se guarda qué capa/paso está activo en `data-cur`
 * y el CSS (.lab) atenúa u oculta lo demás. Sin JS el diagrama completo queda visible.
 *  - mode "layer": resalta una capa (o "all").
 *  - mode "step": acumulativo; muestra los pasos hasta el elegido.
 */
export type LabItem = { id: string; label: string; hint: string };

export function LabSwitch({
  mode,
  items,
  groupLabel,
  caption,
  children,
}: {
  mode: "layer" | "step";
  items: LabItem[];
  groupLabel: string;
  caption: string;
  children: ReactNode;
}) {
  const [cur, setCur] = useState(items[mode === "step" ? items.length - 1 : 0].id);
  const hintId = useId();
  const item = items.find((i) => i.id === cur) ?? items[0];

  return (
    <figure className="lab m-0" data-cur={cur}>
      {children}
      <div role="group" aria-label={groupLabel} aria-describedby={hintId} className="mt-4 flex flex-wrap gap-2">
        {items.map((i, k) => (
          <button
            key={i.id}
            type="button"
            aria-pressed={i.id === cur}
            onClick={() => setCur(i.id)}
            className="lab-btn"
          >
            {mode === "step" ? <span className="lab-btn-n">{k + 1}</span> : null}
            {i.label}
          </button>
        ))}
      </div>
      <p id={hintId} aria-live="polite" className="mt-3 min-h-[3.2em] text-[0.95rem] text-ink/85">
        {item.hint}
      </p>
      <figcaption className="label mt-3 border-t border-[var(--line)] pt-2 text-muted">{caption}</figcaption>
    </figure>
  );
}
