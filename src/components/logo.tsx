import Link from "next/link";

export function Logo({ compact = false }: { compact?: boolean }) {
  return <Link href="/" aria-label="Starea Mea — pagina principală" className="inline-flex flex-col leading-none">
    <span className="display text-[1.75rem] font-semibold tracking-[-.04em] text-[var(--wine)]">Starea Mea</span>
    {!compact && <span className="mt-1 text-[.54rem] font-bold tracking-[.18em] text-[var(--muted)]">MINTE ECHILIBRATĂ. VIAȚĂ MAI BLÂNDĂ.</span>}
  </Link>;
}
