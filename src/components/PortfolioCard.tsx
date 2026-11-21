import Image from "next/image";
import Link from "next/link";
import { CATEGORY_LABEL, coverSrc, entryAlt, type Entry } from "@/lib/portfolio";
import { Reveal } from "./Reveal";

/**
 * Tarjeta del archivo: imagen en su proporción real (sin recortes).
 * - Proyecto confirmado (Tunja Tattoo Festival): enlaza a su página y muestra su nombre.
 * - Imagen genérica: solo imagen; abre el visor (`onOpen`). Sin títulos ni etiquetas no verificados.
 */
export function PortfolioCard({
  e,
  sizes,
  priority,
  delay = 0,
  onOpen,
}: {
  e: Entry;
  sizes: string;
  priority?: boolean;
  delay?: number;
  onOpen?: () => void;
}) {
  const p = e.cover;
  const frame = (
    <span className="pf-frame relative block overflow-hidden border border-ink bg-paper-2" style={{ aspectRatio: `${p.w} / ${p.h}` }}>
      <Image
        src={coverSrc(e)}
        alt={entryAlt(e)}
        width={p.w}
        height={p.h}
        sizes={sizes}
        priority={priority}
        className="pf-img h-full w-full object-cover"
      />
      <span aria-hidden="true" className="pf-tick pf-tl" />
      <span aria-hidden="true" className="pf-tick pf-br" />
    </span>
  );

  if (!e.role) {
    return (
      <Reveal delay={delay}>
        <button
          type="button"
          className="pf-card group block w-full text-left"
          aria-label={`Ampliar imagen: ${entryAlt(e)}`}
          aria-haspopup="dialog"
          onClick={onOpen}
        >
          {frame}
        </button>
      </Reveal>
    );
  }

  return (
    <Reveal delay={delay}>
      <Link href={`/portafolio/${e.slug}`} className="pf-card group block" aria-label={`${e.title}: explorar proyecto`}>
        {frame}
        <span className="mt-3 flex items-baseline justify-between gap-4">
          <span className="font-display text-xl font-semibold leading-tight">{e.title}</span>
        </span>
        <span className="mt-1 block text-[0.95rem] text-ink/85">BenRed: {e.role.toLowerCase()}</span>
        <span className="label mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-muted">
          <span>{CATEGORY_LABEL[e.category]}</span>
          <span className="pf-go ml-auto text-teal-deep">
            Explorar proyecto <span aria-hidden="true" className="pf-arrow inline-block">→</span>
          </span>
        </span>
      </Link>
    </Reveal>
  );
}
