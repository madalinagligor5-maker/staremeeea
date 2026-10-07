import Image from "next/image";
import Link from "next/link";

export function Logo({ compact = false }: { compact?: boolean }) {
  return <Link href="/" aria-label="Ritualul de azi — pagina principală" className="inline-flex items-center gap-3 leading-none">
    <Image src="/images/ritualul-de-azi-monograma.svg" alt="" width={48} height={49} priority unoptimized className="h-12 w-auto shrink-0" />
    <span className="inline-flex flex-col">
      <span className="display text-[1.5rem] font-semibold tracking-[-.02em] text-[var(--wine)] sm:text-[1.65rem]">Ritualul de azi</span>
      {!compact && <span className="mt-1 text-[.55rem] font-bold tracking-[.15em] text-[var(--muted)]">MAI PUȚIN DE PURTAT.</span>}
    </span>
  </Link>;
}
