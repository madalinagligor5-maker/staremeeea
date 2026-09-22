import Link from "next/link";
import { Mail } from "lucide-react";
import { Logo } from "./logo";

export function PublicFooter() {
  return <footer className="border-t hairline bg-[var(--blush)] py-14">
    <div className="container-shell grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
      <div><Logo /><p className="mt-5 max-w-sm text-sm leading-7 text-[var(--muted)]">Ritualuri mici pentru wellbeing, organizare și autocunoaștere. Poți începe din nou de aici.</p></div>
      <div><p className="eyebrow mb-4">Explorează</p><div className="grid gap-3 text-sm"><Link href="/despre">Despre noi</Link><Link href="/blog">Blog</Link><Link href="/resurse">Resurse</Link><Link href="/contact">Contact</Link></div></div>
      <div><p className="eyebrow mb-4">Informații</p><div className="grid gap-3 text-sm"><Link href="/confidentialitate">Confidențialitate</Link><Link href="/termeni">Termeni și condiții</Link><Link href="/confidentialitate#cookies">Preferințe cookies</Link><a className="inline-flex items-center gap-2" href="mailto:hello@ritualuldeazi.ro"><Mail size={16} /> hello@ritualuldeazi.ro</a></div></div>
    </div>
    <div className="container-shell mt-12 border-t hairline pt-6 text-xs leading-6 text-[var(--muted)]">Ritualul de Azi nu oferă diagnostic și nu înlocuiește evaluarea sau tratamentul oferit de un profesionist calificat. © {new Date().getFullYear()} Ritualul de Azi.</div>
  </footer>;
}
