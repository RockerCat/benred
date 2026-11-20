"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { ConcertScroll } from "./ConcertScroll";

/**
 * Escenario conceptual de concierto ("De la idea al escenario"), vinculado al scroll.
 *
 * Carga diferida: el HTML inicial lleva solo un marcador estable (mismo tamaño, descripción accesible);
 * la escena SVG y su modelo se descargan cuando la sección está a ~1 pantalla de distancia. Sin saltos de
 * layout: el marco tiene altura propia. Con movimiento reducido o tras cargar, el CSS muestra el concierto
 * terminado (sin animación); con JS y movimiento normal, ConcertScroll anima según el scroll.
 * Visualización conceptual: no corresponde a un evento real ni al Tunja Tattoo Festival.
 */

const Scene = dynamic(() => import("./ConcertScene"), { ssr: false });

const LABEL =
  "Visualización conceptual de un escenario de concierto: tarima con estructura truss, torres, pantalla LED central y laterales, altavoces, luminarias, artistas y público. Al desplazarte pasa de plano técnico a montaje, a producción y a concierto nocturno.";
const PHASES = ["Concepto", "Montaje", "Producción", "Espectáculo"];

export function ConcertStage() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);
  const [mounted, setMounted] = useState(false);
  const onReady = useCallback(() => setMounted(true), []);

  useEffect(() => {
    const el = rootRef.current;
    if (!el || near) return;
    if (typeof IntersectionObserver === "undefined") return; // sin soporte: se queda el marcador (con su descripción)
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setNear(true);
          io.disconnect();
        }
      },
      { rootMargin: "100% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [near]);

  return (
    <div ref={rootRef}>
      <ConcertScroll ready={mounted}>
        <figure className="cs-stage m-0">
          <div className="cs-frame">
            {near ? (
              <Scene onReady={onReady} />
            ) : (
              <svg viewBox="0 0 800 520" role="img" aria-label={LABEL} className="cs cs-ph">
                <rect width="800" height="520" fill="#0d1517" />
              </svg>
            )}
          </div>
          <figcaption className="cs-cap">
            <p className="label text-muted">Visualización conceptual · no corresponde a un evento real</p>
            <ol className="cs-phases" aria-label="Fases de la visualización">
              {PHASES.map((n, i) => (
                <li key={n} className="ph">
                  <span className="label">0{i + 1}</span> {n}
                </li>
              ))}
            </ol>
            <span aria-hidden="true" className="cs-bar" />
          </figcaption>
        </figure>
        <div className="cs-spacer" aria-hidden="true" />
      </ConcertScroll>
    </div>
  );
}
