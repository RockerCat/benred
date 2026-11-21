import Image from "next/image";
import { projectAlt, workSrc, type Project } from "@/lib/site";
import { ScrollLinked } from "./ScrollLinked";

/**
 * Tarjeta de trabajo. Movimiento:
 *  - Entrada (scroll-triggered): la imagen se revela con un recorte que se abre.
 *  - Paralaje interno (scroll-linked, solo `cover`): ±2,5 % de la imagen, ampliada 6 %.
 *  - Hover: ampliación de 3 %.
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
          alt={projectAlt(p)}
          width={p.w}
          height={p.h}
          sizes={sizes}
          priority={priority}
          className={`h-full w-full ${cover ? "parallax-img object-cover" : "object-contain"}`}
        />
      </div>
    </ScrollLinked>
  );
}
