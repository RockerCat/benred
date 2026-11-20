import Link from "next/link";

export default function NotFound() {
  return (
    <section className="grid-paper">
      <div className="mx-auto max-w-[1400px] px-5 py-28 sm:px-8">
        <p className="label text-signal">Error 404</p>
        <h1 className="font-display mt-4 text-6xl font-bold leading-[0.95] sm:text-8xl">Esta medida no está en el plano.</h1>
        <p className="mt-6 max-w-xl text-xl">La página que buscas no existe o cambió de lugar.</p>
        <Link href="/" className="btn btn-primary mt-8">Volver al inicio</Link>
      </div>
    </section>
  );
}
