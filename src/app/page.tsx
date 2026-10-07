import { Check } from "lucide-react";
import { PublicFooter } from "@/components/public-footer";
import { PublicHeader } from "@/components/public-header";
import { WaitlistForm } from "@/components/waitlist-form";

const levels = [
  ["Zi bună", "Pagina completă: ce contează azi, ce lași pe mâine și un loc pentru tot ce îți vine în minte."],
  ["Zi obosită", "Doar cele trei lucruri esențiale. Restul poate aștepta."],
  ["Zi grea", "O bifă și un singur lucru. Nimic de scris. Și asta e destul."],
] as const;

const manifesto = [
  "Nu ești în urmă. Porți prea mult.",
  "Nu-ți cerem să faci mai mult. Îți cerem să pui jos ce poți.",
  "Azi ajunge un lucru. Iar dacă nici asta nu se poate, ajunge o bifă.",
];

export default function HomePage() {
  return <><PublicHeader /><main id="continut">
    <section className="container-shell py-16 sm:py-24">
      <div className="max-w-3xl">
        <h1 className="display text-[clamp(3.2rem,9vw,6.4rem)] font-semibold leading-[1.02] tracking-[-.035em] text-[var(--wine)]">Mai puțin de purtat.</h1>
        <p className="mt-7 max-w-[34em] text-xl leading-9 text-[var(--ink)]">Ritualul de azi este un sistem de organizare pentru zilele grele. Un singur loc pentru tot ce porți, cu trei niveluri de efort, ca să-l poți folosi și când nu mai ai putere.</p>
        <a className="button-primary mt-9 !min-h-[52px] !px-7 !text-base" href="#lista">Vreau să aflu prima</a>
        <p className="mt-4 text-sm text-[var(--muted)]">Lansăm în curând. Primești gratuit mini-pagina „Azi”.</p>
      </div>
    </section>

    <section aria-labelledby="niveluri" className="container-shell pb-20 sm:pb-24">
      <h2 id="niveluri" className="display max-w-2xl text-3xl font-semibold leading-tight tracking-[-.02em] text-[var(--wine)] sm:text-4xl">Trei niveluri de efort. Alegi dimineața care e al tău.</h2>
      <ul className="mt-9 grid max-w-3xl gap-4">
        {levels.map(([title, copy]) => <li key={title} className="flex items-start gap-4 rounded-[1.2rem] border hairline bg-white/70 p-5 sm:p-6">
          <span aria-hidden="true" className="mt-1 grid size-8 shrink-0 place-items-center rounded-full border-2 border-[var(--rose)] text-[var(--rose)]"><Check size={16} strokeWidth={2.6} /></span>
          <div><h3 className="display text-2xl font-semibold text-[var(--wine)]">{title}</h3><p className="mt-1 leading-7 text-[var(--muted)]">{copy}</p></div>
        </li>)}
      </ul>
    </section>

    <section aria-label="Manifest" className="bg-[var(--wine)] py-16 text-[var(--ivory)] sm:py-20">
      <div className="container-shell max-w-3xl">
        {manifesto.map((line) => <p key={line} className="display mb-5 text-2xl leading-[1.4] sm:text-[1.9rem]">{line}</p>)}
        <p className="display text-2xl leading-[1.4] text-[var(--rose-soft)] sm:text-[1.9rem]">Ritualul de azi: mai puțin de purtat.</p>
      </div>
    </section>

    <section id="lista" aria-labelledby="lista-titlu" className="container-shell max-w-2xl scroll-mt-24 py-20 sm:py-24">
      <h2 id="lista-titlu" className="display text-3xl font-semibold tracking-[-.02em] text-[var(--wine)] sm:text-4xl">Fii prima care află.</h2>
      <p className="mb-7 mt-3 leading-7 text-[var(--muted)]">Lasă-ți adresa de email. Îți trimitem mini-pagina „Azi” gratuită și un singur mesaj când Ritualul de azi este gata.</p>
      <WaitlistForm />
    </section>
  </main><PublicFooter /></>;
}
