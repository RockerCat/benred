import Image from "next/image";
import Link from "next/link";
import { CATEGORY_LABEL, coverSrc, entryAlt, type Entry } from "@/lib/portfolio";
import { Reveal } from "./Reveal";

/** Tarjeta del archivo: imagen en su proporción real (sin recortes) + ficha siempre visible (no depende del hover). */
export function PortfolioCard({
  e,
  sizes,
  priority,
  delay = 0,
}: {
  e: Entry;
  sizes: string;
  priority?: boolean;
  delay?: number;
}) {
  const p = e.cover;
  return (
    <Reveal delay={delay}>
      <Link href={`/portafolio/${e.slug}`} className="pf-card group block" aria-label={`${e.title}: explorar proyecto`}>
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
        <span className="mt-3 flex items-baseline justify-between gap-4">
          <span className="font-display text-xl font-semibold leading-tight">{e.title}</span>
          <span className="label shrink-0 text-muted">{String(e.n).padStart(2, "0")}</span>
        </span>
        {e.role && <span className="mt-1 block text-[0.95rem] text-ink/85">BenRed: {e.role.toLowerCase()}</span>}
        <span className="label mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-muted">
          <span>{CATEGORY_LABEL[e.category]}</span>
          <span aria-hidden="true">·</span>
          <span className="border border-ink px-1.5 py-0.5 text-ink">{e.label}</span>
          <span className="pf-go ml-auto text-teal-deep">
            Explorar proyecto <span aria-hidden="true" className="pf-arrow inline-block">→</span>
          </span>
        </span>
      </Link>
    </Reveal>
  );
}
