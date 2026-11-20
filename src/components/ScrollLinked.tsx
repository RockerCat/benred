"use client";

import { useEffect, useRef, type CSSProperties, type ElementType, type ReactNode } from "react";
import { MAPS, REST, type MapName } from "@/lib/motion";
import { register } from "@/lib/scroll-motion";

/**
 * Contenedor con progreso de scroll en la variable CSS `--p` (0..1) y, opcionalmente,
 * entrada tipo "reveal" (clase `is-in`). No re-renderiza al hacer scroll.
 * Sin JS, `--p` queda sin definir y el CSS usa su valor de reposo (ver globals.css).
 */
export function ScrollLinked({
  as: Tag = "div",
  map,
  reveal = false,
  className = "",
  style,
  children,
}: {
  as?: ElementType;
  map?: MapName;
  reveal?: boolean;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    return register(el, { map: map ? MAPS[map] : undefined, rest: map ? REST[map] : 0, reveal });
  }, [map, reveal]);

  return (
    <Tag ref={ref} className={className} style={style}>
      {children}
    </Tag>
  );
}
