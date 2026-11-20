import Image from "next/image";
import { workSrc, type Project } from "@/lib/site";
import { ScrollLinked } from "./ScrollLinked";

/**
 * Tarjeta de trabajo. Movimiento:
 *  - Entrada (scroll-triggered): la imagen se revela con un recorte que se abre y la etiqueta sube.
 *  - Paralaje interno (scroll-linked, solo `cover`): ±2,5 % de la imagen, ampliada 6 %.
 *  - Hover: ampliación de 3 % y etiqueta que se invierte.
 * `contain` (afiches) conserva su proporción completa: solo revelado.
 */
export function WorkCard({
  p,
  sizes,
  priority,
  className = "",
  fit = "cover",
}: {
  p: Project;
  sizes: string;
  priority?: boolean;
  className?: string;
  fit?: "cover" | "contain";
}) {
  const cover = fit === "cover";
  return (
    <ScrollLinked
      as="figure"
      map={cover ? "parallax" : undefined}
      reveal
      className={`card-reveal group relative overflow-hidden bg-ink-2 ${className}`}
    >
      <div className="h-full w-full overflow-hidden transition-transform duration-700 ease-out group-hover:scale-[1.03]">
        <Image
          src={workSrc(p, "lg")}
          alt={`${p.kind}: ${p.title}`}
          width={p.w}
          height={p.h}
          sizes={sizes}
          priority={priority}
          className={`h-full w-full ${cover ? "parallax-img object-cover" : "object-contain"}`}
        />
      </div>
      <figcaption className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 bg-gradient-to-t from-ink/85 to-transparent p-4 pt-10 text-paper">
        <span className="font-display text-lg font-semibold leading-tight">{p.title}</span>
        <span className="card-tag label shrink-0 border border-paper/60 px-2 py-1">{p.kind}</span>
      </figcaption>
    </ScrollLinked>
  );
}
