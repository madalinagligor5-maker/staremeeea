import Link from "next/link";

export function Logo({ compact = false }: { compact?: boolean }) {
  return <Link href="/" aria-label="Ritualul de Azi — pagina principală" className="inline-flex items-center gap-3 leading-none">
    <span className="brand-mark" aria-hidden>R</span>
    <span className="inline-flex flex-col">
      <span className="display text-[1.65rem] font-semibold tracking-[-.04em] text-[var(--wine)] sm:text-[1.8rem]">Ritualul de Azi</span>
      {!compact && <span className="mt-1 text-[.47rem] font-bold tracking-[.15em] text-[var(--muted)] sm:text-[.52rem]">MINTE ECHILIBRATĂ. VIAȚĂ MAI BLÂNDĂ.</span>}
    </span>
  </Link>;
}
