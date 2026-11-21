import type { Metadata } from "next";
import Link from "next/link";
import { LabSwitch } from "@/components/LabSwitch";
import {
  EVENT_STEPS,
  EventDiagram,
  EXPERIENCE_STEPS,
  ExperienceDiagram,
  STAND_LAYERS,
  ServicesMap,
  StandDiagram,
} from "@/components/LabDiagrams";
import { LabLoop } from "@/components/LabLoop";
import { Reveal, RevealWords } from "@/components/Reveal";
import { SERVICES } from "@/lib/site";

export const metadata: Metadata = {
  title: "Servicios: marketing experiencial, stands y eventos",
  description:
    "Marketing experiencial y BTL; diseño, producción y montaje de stands especiales; y producción y logística de eventos en Colombia. Conoce el alcance de cada servicio de BenRed.",
  alternates: { canonical: "/servicios" },
};

const VISUALS = {
  "marketing-experiencial-btl": {
    kicker: "Diseñamos interacciones",
    node: (
      <LabSwitch mode="step" items={EXPERIENCE_STEPS} groupLabel="Pasos del diagrama de activación" caption="Diagrama conceptual · no es un proyecto real">
        <ExperienceDiagram />
      </LabSwitch>
    ),
  },
  "stands-y-montajes": {
    kicker: "Diseñamos espacios",
    node: (
      <LabSwitch mode="layer" items={STAND_LAYERS} groupLabel="Capas del módulo de exhibición" caption="Módulo conceptual · no corresponde a un stand real">
        <StandDiagram />
      </LabSwitch>
    ),
  },
  "produccion-y-logistica-de-eventos": {
    kicker: "Coordinamos experiencias",
    node: (
      <LabSwitch mode="step" items={EVENT_STEPS} groupLabel="Etapas del esquema de producción" caption="Esquema conceptual · no es un evento real">
        <EventDiagram />
      </LabSwitch>
    ),
  },
} as const;

export default function ServiciosPage() {
  return (
    <>
      <section className="grid-paper border-b border-[var(--line)]">
        <div className="mx-auto grid max-w-[1400px] items-center gap-10 px-5 pb-12 pt-6 sm:px-8 sm:py-16 lg:grid-cols-12 lg:py-24">
          <div className="lg:col-span-7">
            <p className="label text-teal-deep">Servicios · Laboratorio creativo</p>
            <h1 className="font-display mt-4 max-w-5xl text-[2.6rem] font-bold leading-[0.95] sm:text-7xl">
              Lo que diseñamos, producimos y operamos.
            </h1>
            <p className="mt-6 max-w-2xl text-xl text-ink/85">
              Tres frentes que se combinan: una activación puede incluir un stand, y un evento puede
              incluir una activación. Hablas con el mismo equipo en todos.
            </p>
          </div>
          <LabLoop className="max-lg:order-first lg:col-span-5">
            <ServicesMap />
          </LabLoop>
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-5 sm:px-8">
        {SERVICES.map((s, i) => {
          const v = VISUALS[s.slug as keyof typeof VISUALS];
          const text = (
            <>
              <p className="label text-signal">
                {s.n} · {v?.kicker}
              </p>
              <RevealWords as="h2" className="font-display mt-3 text-4xl font-bold leading-[1] sm:text-5xl" text={s.name} />
              <Reveal variant="fade">
                <p className="mt-5 text-lg text-ink/85">{s.lead}</p>
                <Link href={`/servicios/${s.slug}`} className="btn btn-ghost mt-8">
                  Ver el detalle <span aria-hidden="true">→</span>
                </Link>
              </Reveal>
            </>
          );
          const scope = (
            <Reveal variant="group" as="ul" className="space-y-3">
              {s.scope.map((x, j) => (
                <li key={x} className="rg-item flex gap-3 border-b border-[var(--line)] pb-3" style={{ ["--k" as string]: j }}>
                  <span aria-hidden="true" className="mt-2 h-2 w-2 shrink-0 bg-signal" />
                  {x}
                </li>
              ))}
            </Reveal>
          );
          const visual = <Reveal variant="fade">{v?.node}</Reveal>;
          return (
            <article key={s.slug} id={s.slug} className="scroll-mt-24 border-b border-ink py-14 lg:py-20">
              {i === 0 && (
                <div className="grid gap-10 lg:grid-cols-12">
                  <div className="lg:col-span-5">
                    {text}
                    <div className="mt-8">{scope}</div>
                  </div>
                  <div className="lg:col-span-7">{visual}</div>
                </div>
              )}
              {i === 1 && (
                <div className="grid gap-10 lg:grid-cols-12">
                  <div className="lg:order-2 lg:col-span-5">
                    {text}
                    <div className="mt-8">{scope}</div>
                  </div>
                  <div className="lg:order-1 lg:col-span-7">{visual}</div>
                </div>
              )}
              {i === 2 && (
                <div>
                  <div className="grid gap-10 lg:grid-cols-12">
                    <div className="lg:col-span-6">{text}</div>
                    <div className="lg:col-span-5 lg:col-start-8">{scope}</div>
                  </div>
                  <div className="mx-auto mt-12 max-w-4xl">{visual}</div>
                </div>
              )}
            </article>
          );
        })}
      </section>
    </>
  );
}
