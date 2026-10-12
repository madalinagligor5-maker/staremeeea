import type { Metadata } from "next";
import { RequireAccess } from "@/components/carte/require-access";
import { bonusuri } from "@/lib/bonusuri";
import { planere } from "@/lib/planere";

export const metadata: Metadata = { title: "Bonusuri și planere" };

function Item({ nume, descriere, crem, alb }: { nume: string; descriere: string; crem: string; alb: string }) {
  return <li className="rounded-2xl border hairline bg-[var(--paper)] p-5">
    <p className="display text-xl font-semibold text-[var(--wine)]">{nume}</p>
    <p className="mt-1 leading-7 text-[var(--muted)]">{descriere}</p>
    <p className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm font-bold">
      <a className="min-h-11 content-center text-[var(--rose)] underline underline-offset-4" href={crem} download>Pentru ecran (PDF)</a>
      <a className="min-h-11 content-center text-[var(--rose)] underline underline-offset-4" href={alb} download>Pentru tipărit (PDF)</a>
    </p>
  </li>;
}

export default function BonusuriPage() {
  return <RequireAccess next="/carte/bonusuri"><div className="space-y-8">
    <header>
      <h1 className="display text-3xl font-semibold leading-tight text-[var(--wine)] sm:text-4xl">Bonusuri și planere</h1>
      <p className="mt-2 leading-7 text-[var(--muted)]">Se completează direct în PDF, pe telefon sau calculator, sau le tipărești. Ce descarci rămâne al tău, chiar dacă anulezi abonamentul.</p>
    </header>
    <section aria-labelledby="bonusuri"><h2 id="bonusuri" className="display text-2xl font-semibold text-[var(--wine)]">Cele trei bonusuri</h2><ul className="mt-4 space-y-4">{bonusuri.map((b) => <Item key={b.nume} {...b} />)}</ul></section>
    <section aria-labelledby="planere"><h2 id="planere" className="display text-2xl font-semibold text-[var(--wine)]">Planere</h2><ul className="mt-4 space-y-4">{planere.map((p) => <Item key={p.nume} nume={p.nume} descriere={p.descriere} crem={p.crem} alb={p.alb} />)}</ul></section>
  </div></RequireAccess>;
}
