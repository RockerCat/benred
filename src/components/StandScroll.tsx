"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { standProgress } from "@/lib/motion";
import { register } from "@/lib/scroll-motion";

/**
 * Motor scroll-linked del segundo stand. Recibe el SVG ya renderizado en servidor y lo anima según el
 * progreso p (0–1) que calcula el gestor de scroll compartido.
 *
 * Por qué no CSS calc() sobre `--p`: la variable hereda y obligaba a recalcular el estilo de ~1500
 * nodos por frame. Aquí cada elemento trae su ventana [a, b] (data-a/data-b/data-ea/data-eb) y solo se
 * escriben los que CAMBIARON (normalmente unas pocas decenas): sin re-renders de React.
 *
 * Estado estático (sin JS / movimiento reducido): lo define el CSS = stand terminado.
 */

type Item = {
  el: SVGElement;
  k: "dash" | "face" | "mat" | "tx" | "pp";
  v2: boolean;
  a: number;
  b: number;
  ea: number;
  eb: number;
  last: number;
};

const c01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);

export function StandScroll({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const svg = root.querySelector<SVGSVGElement>("svg.ps");
    if (!svg) return;

    // Recolecta una sola vez (sin lecturas de layout)
    const items: Item[] = [];
    svg.querySelectorAll<SVGElement>("[data-a]").forEach((el) => {
      const base = {
        el,
        v2: !!el.closest(".v2"),
        a: parseFloat(el.dataset.a!),
        b: parseFloat(el.dataset.b!),
        ea: parseFloat(el.dataset.ea ?? "0.3"),
        eb: parseFloat(el.dataset.eb ?? "0.4"),
        last: NaN,
      };
      const cl = el.classList;
      if (cl.contains("st")) items.push({ ...base, k: "dash" });
      if (cl.contains("fl")) items.push({ ...base, k: "face" });
      if (cl.contains("mt")) items.push({ ...base, k: "mat" });
      if (cl.contains("tx")) items.push({ ...base, k: "tx" });
      if (cl.contains("pp")) items.push({ ...base, k: "pp" });
    });
    const wfGroups = Array.from(svg.querySelectorAll<SVGElement>(".wfg"));
    const phases = Array.from(root.querySelectorAll<HTMLElement>(".ph"));
    const bar = root.querySelector<HTMLElement>(".stand-bar");
    let lastWf = NaN;
    const ON: Array<[number, number]> = [[-1, 0.3], [0.28, 0.54], [0.52, 0.82], [0.8, 9]];

    const apply = (p: number) => {
      for (const it of items) {
        const dr = c01((p - it.a) / (it.b - it.a));
        const er = it.v2 ? c01((p - it.ea) / (it.eb - it.ea)) : 0;
        let v: number;
        if (it.k === "dash") v = (1 - dr + er) * 1.02;
        else if (it.k === "face") v = it.v2 ? c01((p - it.a) / 0.03) * (1 - er) : c01((p - it.a) / 0.02);
        else v = it.v2 ? dr * (1 - er) : dr;
        // solo se escribe lo que cambió (siempre el primer valor y los extremos exactos)
        if (v === it.last) continue;
        if (Math.abs(v - it.last) < 0.004 && v !== 0 && v !== 1 && v !== 1.02) continue;
        it.last = v;
        const s = it.el.style;
        if (it.k === "dash") s.strokeDashoffset = v.toFixed(3);
        else s.opacity = v.toFixed(3);
        // Personas: entrada corta sobre el plano del suelo (eje x isométrico); ancladas por su sombra
        if (it.k === "pp") s.transform = `translate(${(-(1 - v) * 12).toFixed(1)}px, ${(-(1 - v) * 6).toFixed(1)}px)`;
      }
      // trazo del wireframe: se atenúa a 50 % al materializarse (8 pasos: sin escribir por frame)
      const wf = Math.round((1 - 0.5 * c01((p - 0.6) / 0.28)) * 16) / 16;
      if (wf !== lastWf) {
        lastWf = wf;
        for (const g of wfGroups) g.style.strokeOpacity = String(wf);
      }
      phases.forEach((li, i) => {
        const [s, e] = ON[i];
        const on = c01((p - s) / 0.05) * (i < 3 ? 1 - c01((p - e) / 0.05) : 1);
        li.style.opacity = (0.4 + 0.6 * on).toFixed(2);
      });
      if (bar) bar.style.transform = `scaleX(${p.toFixed(3)})`;
    };

    const off = register(root, {
      map: standProgress,
      rest: 1,
      onProgress: (p) => {
        if (!svg.classList.contains("live")) svg.classList.add("live");
        apply(p);
      },
    });
    return off;
  }, []);

  return (
    <div ref={ref} className="stand-track mt-14">
      {children}
    </div>
  );
}
