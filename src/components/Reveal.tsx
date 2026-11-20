"use client";

import { useEffect, useRef, type ElementType, type ReactNode } from "react";
import { register } from "@/lib/scroll-motion";

/**
 * Entrada scroll-triggered. Variantes:
 *  - up    (por defecto): opacidad + desplazamiento corto.
 *  - fade: solo opacidad (para bloques que contienen texto animado).
 *  - group: el contenedor activa a sus hijos `.rg-item` y `.rg-rule` en cascada.
 * Sin JS o con movimiento reducido todo se muestra de inmediato.
 */
export function Reveal({
  children,
  as: Tag = "div",
  delay = 0,
  className = "",
  variant = "up",
}: {
  children?: ReactNode;
  as?: ElementType;
  delay?: number;
  className?: string;
  variant?: "up" | "fade" | "group";
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    return register(el, { reveal: true });
  }, []);

  const base = variant === "up" ? "reveal" : variant === "fade" ? "reveal-fade" : "reveal-group";
  return (
    <Tag ref={ref} className={`${base} ${className}`} style={{ ["--d" as string]: `${delay}ms` }}>
      {children}
    </Tag>
  );
}

/** Titular que sube palabra por palabra dentro de una máscara. El texto no cambia. */
export function RevealWords({
  as: Tag = "h2",
  text,
  className = "",
  id,
}: {
  as?: ElementType;
  text: string;
  className?: string;
  id?: string;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    return register(el, { reveal: true });
  }, []);

  const words = text.split(" ");
  return (
    <Tag ref={ref} id={id} className={`reveal-words ${className}`}>
      {words.map((w, i) => (
        <span key={i}>
          <span className="rw">
            <span className="rw-i" style={{ ["--k" as string]: Math.min(i, 14) }}>
              {w}
            </span>
          </span>
          {i < words.length - 1 ? " " : null}
        </span>
      ))}
    </Tag>
  );
}
