import type { CSSProperties } from "react";
import { DRAWING2, GRADS, type E2, type G2, type Grad, type T2 } from "@/lib/stand2-model";
import { StandScroll } from "./StandScroll";

/**
 * Segundo stand ilustrativo, vinculado al scroll (no a un temporizador).
 * Componente de SERVIDOR: el modelo y los trazos se renderizan en HTML y el modelo NO viaja al cliente.
 * Cada elemento lleva su ventana de progreso en data-a/data-b (y data-ea/data-eb para el borrado del
 * plano). `StandScroll` (cliente) aplica el progreso del scroll solo a los elementos que cambian.
 * Estado estático (sin JS o con movimiento reducido): lo define el CSS = stand terminado.
 * Esquema conceptual: no corresponde a un proyecto real de BenRed.
 */

const num = (n: number) => n.toFixed(3);

function Defs() {
  return (
    <defs>
      {GRADS.map((g: Grad) =>
        g.kind === "radial" ? (
          <radialGradient key={g.id} id={g.id} cx={g.cx ?? 0.5} cy={g.cy ?? 0.5} r="0.7">
            {g.stops.map(([o, c], i) => (
              <stop key={i} offset={o} stopColor={c} />
            ))}
          </radialGradient>
        ) : (
          <linearGradient key={g.id} id={g.id} x1="0" y1="0" x2={g.v ? 0 : 1} y2={g.v ? 1 : 0}>
            {g.stops.map(([o, c], i) => (
              <stop key={i} offset={o} stopColor={c} />
            ))}
          </linearGradient>
        ),
      )}
    </defs>
  );
}

function Path({ e }: { e: E2 }) {
  const style = { ["--w" as string]: e.w ?? 1.6 } as CSSProperties;
  const win = {
    "data-a": num(e.a),
    "data-b": num(e.b),
    ...(e.ea !== undefined && e.eb !== undefined ? { "data-ea": num(e.ea), "data-eb": num(e.eb) } : {}),
  };
  if (e.kind === "deco") {
    return (
      <g id={`s2-${e.id}`} className="mt br" {...win}>
        {e.parts?.map((p, i) =>
          p.t === "text" ? (
            <text
              key={i}
              className="br-t"
              transform={`matrix(${p.mx.map((n) => Math.round(n * 1000) / 1000).join(" ")})`}
              fontSize={p.size}
              fontWeight={p.weight ?? 400}
              fontFamily={p.display ? "var(--font-display)" : "var(--font-mono)"}
              textAnchor={p.anchor ?? "start"}
              letterSpacing={p.ls}
              fill={p.fill}
            >
              {p.text}
            </text>
          ) : (
            <path key={i} d={p.d} fill={p.fill ?? "none"} fillOpacity={p.fo} stroke={p.stroke ?? "none"} strokeWidth={p.w} strokeLinejoin="round" />
          ),
        )}
      </g>
    );
  }
  if (e.kind === "person") {
    return (
      <g id={`s2-${e.id}`} className="pp" {...win}>
        {e.shapes?.map((s, i) => (
          <path key={i} d={s.d} fill={s.fill} fillOpacity={s.fo} stroke={s.stroke ?? "none"} strokeWidth={s.sw} strokeLinejoin="round" />
        ))}
      </g>
    );
  }
  if (e.kind === "mat") {
    return (
      <path
        id={`s2-${e.id}`}
        d={e.path}
        className={`mt${e.minor ? " minor" : ""}`}
        style={style}
        {...win}
        fill={e.fill ?? "none"}
        fillOpacity={e.fo}
        stroke={e.stroke ?? "none"}
        strokeWidth={e.w}
        strokeLinecap="round"
      />
    );
  }
  const cls = e.kind === "line" ? "st" : e.kind === "face" ? "st fl" : "fl";
  return (
    <path
      id={`s2-${e.id}`}
      d={e.path}
      pathLength={1}
      className={`${cls}${e.minor ? " minor" : ""}`}
      style={style}
      {...win}
      fill={e.fill ?? "none"}
      fillOpacity={e.fo}
      stroke={e.kind === "tint" ? "none" : (e.stroke ?? "var(--ink)")}
      strokeLinejoin="miter"
    />
  );
}

function Text({ t }: { t: T2 }) {
  const win = {
    "data-a": num(t.a),
    "data-b": num(t.b),
    ...(t.ea !== undefined && t.eb !== undefined ? { "data-ea": num(t.ea), "data-eb": num(t.eb) } : {}),
  };
  return (
    <g id={`s2-${t.id}`} className={`tx${t.id.includes("cota") ? " ctx" : ""}`} {...win}>
      {t.bg && <rect x={t.bg.x} y={t.bg.y} width={t.bg.w} height={t.bg.h} fill="var(--paper-2)" />}
      <text
        x={t.x}
        y={t.y}
        fontFamily="var(--font-mono)"
        fontSize={t.size ?? 14}
        fontWeight={t.weight ?? 400}
        textAnchor={t.anchor ?? "start"}
        fill={t.fill ?? "var(--ink)"}
        transform={t.rotate ? `rotate(${t.rotate} ${t.x} ${t.y - 6})` : undefined}
      >
        {t.text}
      </text>
    </g>
  );
}

function Groups({ groups }: { groups: G2[] }) {
  return (
    <>
      {groups.map((g) => (
        <g key={g.id} id={`s2-${g.id}`} className={[g.lg ? "lg" : "", g.wf ? "wfg" : ""].filter(Boolean).join(" ") || undefined}>
          {g.els.map((e) => (
            <Path key={e.id} e={e} />
          ))}
          {g.txs.map((t) => (
            <Text key={t.id} t={t} />
          ))}
        </g>
      ))}
    </>
  );
}

const PHASES = ["Plano", "Estructura 3D", "Materiales", "Listo para operar"];

export function ProcessStand() {
  return (
    <StandScroll>
      <figure className="stand-stage m-0">
        <div className="stand-frame">
          <svg
            viewBox="0 8 790 512"
            role="img"
            aria-label="Esquema conceptual de un stand de feria de 9 por 6 metros con video wall, recepción, zona de reuniones, plataforma de exhibición, pórtico y tótem. Al desplazarte pasa de plano técnico a estructura isométrica, a materiales y a stand terminado."
            className="ps"
          >
            <Defs />
            <g id="stand2-planta" className="v2">
              <Groups groups={DRAWING2.plan} />
            </g>
            <g id="stand2-isometrica" className="v3">
              <Groups groups={DRAWING2.iso} />
            </g>
            <g id="stand2-leyenda">
              <Groups groups={[DRAWING2.legend]} />
            </g>
          </svg>
        </div>
        <figcaption className="stand-cap">
          <p className="label text-muted">Esquema conceptual · no corresponde a un proyecto real</p>
          <ol className="stand-phases" aria-label="Etapas del esquema">
            {PHASES.map((n, i) => (
              <li key={n} className={`ph ph-${i + 1}`}>
                <span className="label">0{i + 1}</span> {n}
              </li>
            ))}
          </ol>
          <span aria-hidden="true" className="stand-bar" />
        </figcaption>
      </figure>
      <div className="stand-spacer" aria-hidden="true" />
    </StandScroll>
  );
}
