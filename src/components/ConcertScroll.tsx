"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { concertProgress } from "@/lib/motion";
import { register } from "@/lib/scroll-motion";

/**
 * Motor scroll-linked del escenario. Recibe el SVG ya renderizado en servidor y aplica el progreso p (0–1)
 * del gestor de scroll compartido solo a lo que cambia: trazos, opacidades, figuras y el AMBIENTE.
 *
 * Ambiente día → noche: cada degradado de material tiene su color de día y de noche (data-day/data-night);
 * se interpolan (24 pasos) junto con el fondo y el color de las líneas de estructura. Así no hay una capa
 * oscura superpuesta que rompa la oclusión, y las pantallas y haces (colores propios) quedan encendidos.
 *
 * Sin JS o con movimiento reducido el CSS deja la escena final (concierto, de noche).
 */

type Item = { el: SVGElement; k: "dash" | "op" | "pp" | "tx"; a: number; b: number; ea: number; eb: number; hasE: boolean; dx: number; dy: number; last: number };
type Stop = { el: SVGElement; day: [number, number, number]; night: [number, number, number] };

const c01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);
const hex = (s: string): [number, number, number] => [parseInt(s.slice(1, 3), 16), parseInt(s.slice(3, 5), 16), parseInt(s.slice(5, 7), 16)];
const mix = (a: [number, number, number], b: [number, number, number], t: number) => `rgb(${Math.round(a[0] + (b[0] - a[0]) * t)} ${Math.round(a[1] + (b[1] - a[1]) * t)} ${Math.round(a[2] + (b[2] - a[2]) * t)})`;


const NIGHT: [number, number] = [0.46, 0.8]; // = NIGHT en concert-model.ts (se duplica para no cargar el modelo)

export function ConcertScroll({ ready, children }: { ready: boolean; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root || !ready) return;
    const svg = root.querySelector<SVGSVGElement>("svg.cs");
    if (!svg || !svg.querySelector("[data-a]")) return;
    const night = NIGHT;

    const items: Item[] = [];
    svg.querySelectorAll<SVGElement>("[data-a]").forEach((el) => {
      const cl = el.classList;
      const base = {
        el,
        a: parseFloat(el.dataset.a!),
        b: parseFloat(el.dataset.b!),
        ea: parseFloat(el.dataset.ea ?? "0"),
        eb: parseFloat(el.dataset.eb ?? "0"),
        hasE: el.dataset.ea !== undefined,
        dx: parseFloat(el.dataset.dx ?? "0"),
        dy: parseFloat(el.dataset.dy ?? "0"),
        last: NaN,
      };
      if (cl.contains("st")) items.push({ ...base, k: "dash" });
      else if (cl.contains("pp")) items.push({ ...base, k: "pp" });
      else if (cl.contains("tx")) items.push({ ...base, k: "tx" });
      else if (cl.contains("mt")) items.push({ ...base, k: "op" });
    });
    const stops: Stop[] = [];
    svg.querySelectorAll<SVGElement>("stop[data-day]").forEach((el) => stops.push({ el, day: hex(el.dataset.day!), night: hex(el.dataset.night!) }));
    const phases = Array.from(root.querySelectorAll<HTMLElement>(".ph"));
    const bar = root.querySelector<HTMLElement>(".cs-bar");
    let lastNight = NaN;
    const ON: Array<[number, number]> = [[-1, 0.24], [0.22, 0.5], [0.48, 0.76], [0.74, 9]];

    const apply = (p: number) => {
      for (const it of items) {
        const dr = c01((p - it.a) / (it.b - it.a));
        const er = it.hasE ? c01((p - it.ea) / (it.eb - it.ea)) : 0;
        const v = it.k === "dash" ? (1 - dr + er) * 1.02 : it.k === "tx" ? dr * (1 - er) : dr;
        if (v === it.last) continue;
        if (Math.abs(v - it.last) < 0.004 && v !== 0 && v !== 1 && v !== 1.02) continue;
        it.last = v;
        const s = it.el.style;
        if (it.k === "dash") s.strokeDashoffset = v.toFixed(3);
        else {
          s.opacity = v.toFixed(3);
          // figuras y público: entrada corta (las figuras hacia su sitio sobre el suelo; el público sube)
          if (it.k === "pp") s.transform = `translate(${(-(1 - v) * it.dx).toFixed(1)}px, ${((1 - v) * it.dy).toFixed(1)}px)`;
        }
      }
      // ambiente
      const nv = Math.round(c01((p - night[0]) / (night[1] - night[0])) * 24) / 24;
      if (nv !== lastNight) {
        lastNight = nv;
        for (const s of stops) s.el.setAttribute("stop-color", mix(s.day, s.night, nv));
      }
      phases.forEach((li, i) => {
        const [s, e] = ON[i];
        const on = c01((p - s) / 0.05) * (i < 3 ? 1 - c01((p - e) / 0.05) : 1);
        li.style.opacity = (0.4 + 0.6 * on).toFixed(2);
      });
      if (bar) bar.style.transform = `scaleX(${p.toFixed(3)})`;
    };

    return register(root, {
      map: concertProgress,
      rest: 1,
      onProgress: (p) => {
        if (!svg.classList.contains("live")) svg.classList.add("live");
        apply(p);
      },
    });
  }, [ready]);

  return (
    <div ref={ref} className="cs-track mt-10">
      {children}
    </div>
  );
}
