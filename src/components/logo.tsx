import Link from "next/link";

// Semn provizoriu (R cu bifă), până la fișierul SVG final de la designer.
export function Logo({ compact = false }: { compact?: boolean }) {
  return <Link href="/" aria-label="Ritualul de azi — pagina principală" className="inline-flex items-center gap-3 leading-none">
    <span aria-hidden className="grid size-11 shrink-0 place-items-center rounded-xl bg-[var(--wine)]">
      <svg width="30" height="30" viewBox="0 0 26 26"><text x="3" y="21" fontFamily="Georgia,serif" fontSize="22" fontWeight="700" fill="#F6EFE6">R</text><path d="M13 12l3 3.6 5.4-6.6" stroke="#C99AA5" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
    </span>
    <span className="inline-flex flex-col">
      <span className="display text-[1.5rem] font-semibold tracking-[-.02em] text-[var(--wine)] sm:text-[1.65rem]">Ritualul de azi</span>
      {!compact && <span className="mt-1 text-[.55rem] font-bold tracking-[.15em] text-[var(--muted)]">MAI PUȚIN DE PURTAT.</span>}
    </span>
  </Link>;
}
