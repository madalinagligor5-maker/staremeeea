import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookHeart, Brain, CalendarDays, Check, CloudSun, Flower2, HeartHandshake, Library, NotebookPen, Sparkles, TimerReset } from "lucide-react";
import { PublicFooter } from "@/components/public-footer";
import { PublicHeader } from "@/components/public-header";
import { InstallPrompt } from "@/components/install-prompt";

const categories = [
  [Brain, "Înțelege-te", "mai bine"], [CalendarDays, "Organizează-ți", "viața"], [Flower2, "Ai grijă", "de tine"],
  [CloudSun, "Gestionează", "emoțiile"], [Library, "Descoperă resurse", "utile"], [HeartHandshake, "Povești &", "comunitate"],
] as const;

const tools = [
  [CloudSun, "Cum mă simt azi?", "Observă-ți starea fără să o judeci.", "/spatiu/azi"],
  [CalendarDays, "Planificator blând", "Vezi ce contează, pe energia pe care o ai.", "/spatiu/planificator"],
  [NotebookPen, "Jurnalul meu", "Un loc privat pentru ceea ce e al tău.", "/spatiu/jurnal"],
  [TimerReset, "Timer de focus", "Un singur lucru. Un timp potrivit.", "/spatiu/focus"],
  [Flower2, "Exerciții de calm", "Pauze scurte, ghidate cu blândețe.", "/spatiu/calm"],
  [BookHeart, "Bibliotecă de resurse", "Idei practice, scrise pe înțelesul tău.", "/resurse"],
] as const;

export default function HomePage() {
  return <main><PublicHeader /><InstallPrompt />
    <section className="overflow-hidden border-b hairline">
      <div className="container-shell grid min-h-[calc(100dvh-82px)] items-center gap-10 py-12 lg:grid-cols-[.88fr_1.12fr] lg:py-16">
        <div className="relative z-10 max-w-xl">
          <p className="eyebrow mb-6">Ritualuri pentru o zi mai blândă</p>
          <h1 className="display text-[clamp(4rem,7.5vw,7.4rem)] font-semibold leading-[.82] tracking-[-.055em] text-[var(--wine)]">Fă loc<br /><em className="inline-block pb-2 font-medium text-[var(--rose)]">pentru tine.</em></h1>
          <p className="mt-7 max-w-[52ch] text-base leading-8 text-[var(--muted)]">Ritualuri mici pentru organizare, emoții, focus și wellbeing — create pentru zile reale, fără presiune și fără judecată.</p>
          <div className="mt-8 flex flex-wrap items-center gap-4"><Link className="button-primary" href="/inregistrare">Începe ritualul <ArrowRight size={17} /></Link><span className="text-sm text-[var(--muted)]">Poți începe gratuit. Fără card.</span></div>
          <p className="display mt-9 rotate-[-2deg] text-2xl italic text-[var(--rose-dark)]">Minte echilibrată. Viață mai blândă.</p>
        </div>
        <div className="relative min-h-[540px] lg:min-h-[680px]">
          <div className="absolute inset-0 translate-x-8 rotate-[2deg] rounded-[48%_48%_18px_18px] bg-[var(--blush)]" />
          <div className="absolute inset-4 overflow-hidden rounded-[48%_48%_18px_18px] border-[10px] border-white/60 shadow-[0_30px_80px_rgba(86,55,62,.12)]">
            <Image src="/images/hero-journal.png" alt="Jurnal deschis, cafea și flori într-un spațiu cald și liniștit" fill loading="eager" sizes="(max-width: 1024px) 100vw, 56vw" className="object-cover" />
          </div>
          <div className="absolute bottom-2 left-0 max-w-[230px] rounded-2xl border hairline bg-white/95 p-5 shadow-[0_16px_50px_rgba(86,55,62,.12)]"><Sparkles size={18} className="text-[var(--rose)]" /><p className="mt-2 display text-xl font-semibold text-[var(--wine)]">Poți reveni oricând.</p><p className="mt-1 text-xs leading-5 text-[var(--muted)]">Nicio serie pierdută. Nicio zi ratată.</p></div>
        </div>
      </div>
    </section>

    <section aria-label="Ce găsești în Ritualul de Azi" className="border-b hairline bg-white/50 py-8">
      <div className="container-shell grid grid-cols-2 gap-y-8 sm:grid-cols-3 lg:grid-cols-6">{categories.map(([Icon, a, b]) => <div key={a} className="flex items-center gap-3 px-3 lg:border-r lg:last:border-0 hairline"><Icon aria-hidden size={24} strokeWidth={1.5} className="shrink-0 text-[var(--rose)]" /><p className="text-xs font-semibold leading-5 text-[var(--wine)]">{a}<br />{b}</p></div>)}</div>
    </section>

    <section className="py-24 sm:py-32" id="instrumente">
      <div className="container-shell">
        <div className="grid items-end gap-6 md:grid-cols-[1fr_.72fr]"><div><p className="eyebrow">Ritualuri pentru ziua ta</p><h2 className="display mt-4 max-w-3xl text-5xl font-semibold leading-[.95] tracking-[-.04em] text-[var(--wine)] sm:text-7xl">Ritualuri mici,<br /><em className="font-medium text-[var(--rose)]">în ritmul tău.</em></h2></div><div><p className="leading-7 text-[var(--muted)]">Instrumente simple și intuitive, create special pentru tine. Folosește-le direct în browser sau instalează Ritualul de Azi pe telefon.</p><Link href="/instrumente" className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[var(--rose-dark)]">Descoperă ritualurile <ArrowRight size={16} /></Link></div></div>
        <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{tools.map(([Icon, title, copy, href], i) => <Link key={title} href={href} className={`editorial-card group relative min-h-[250px] overflow-hidden p-7 transition-transform hover:-translate-y-1 ${i === 0 || i === 5 ? "bg-[var(--blush)]" : ""}`}><span className="grid size-11 place-items-center rounded-full bg-white text-[var(--rose-dark)]"><Icon strokeWidth={1.5} /></span><div className="absolute inset-x-7 bottom-7"><h3 className="display text-3xl font-semibold text-[var(--wine)]">{title}</h3><p className="mt-2 max-w-[34ch] text-sm leading-6 text-[var(--muted)]">{copy}</p><ArrowRight className="absolute bottom-0 right-0 text-[var(--rose)] transition-transform group-hover:translate-x-1" /></div></Link>)}</div>
      </div>
    </section>

    <section className="bg-[var(--wine)] py-8 text-white sm:py-12"><div className="container-shell grid overflow-hidden rounded-[18px] bg-[#6e4750] lg:grid-cols-[1.1fr_.9fr]">
      <div className="relative min-h-[480px]"><Image src="/images/hero-journal.png" alt="Spațiu de jurnal într-o lumină calmă" fill sizes="(max-width: 1024px) 100vw, 55vw" className="object-cover object-[50%_38%]" /><div className="absolute inset-0 bg-gradient-to-t from-[rgba(86,55,62,.55)] to-transparent" /><p className="display absolute bottom-8 left-8 max-w-xs rotate-[-2deg] text-3xl italic">O versiune mai blândă a ta este posibilă.</p></div>
      <div className="flex flex-col justify-center p-8 sm:p-14"><p className="display text-4xl font-medium leading-tight sm:text-6xl">„Nu trebuie să faci tot azi.<br /><em className="text-[var(--rose-soft)]">Doar un pas contează.</em>”</p><div className="mt-10 grid grid-cols-2 gap-4">{["mai focusată", "mai calmă", "mai încrezătoare", "mai tu"].map(x => <div key={x} className="flex items-center gap-2 border-t border-white/20 pt-4 text-sm"><Check size={16} className="text-[var(--rose-soft)]" />{x}</div>)}</div></div>
    </div></section>

    <section className="paper-noise py-24 text-center sm:py-32"><div className="container-shell"><p className="display text-3xl italic text-[var(--rose)]">Astăzi începe cu tine.</p><h2 className="display mx-auto mt-4 max-w-4xl text-5xl font-semibold leading-none text-[var(--wine)] sm:text-7xl">Un pas mic este suficient.</h2><p className="mt-6 text-[var(--muted)]">Minte echilibrată. Viață mai blândă.</p><Link className="button-primary mt-8" href="/inregistrare">Începe ritualul <ArrowRight size={17} /></Link></div></section>
    <PublicFooter />
  </main>;
}
