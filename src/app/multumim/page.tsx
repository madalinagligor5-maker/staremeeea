import type { Metadata } from "next";
import Link from "next/link";
import { PublicFooter } from "@/components/public-footer";
import { PublicHeader } from "@/components/public-header";
import { planere } from "@/lib/planere";

export const metadata: Metadata = { title: "Mulțumim", robots: { index: false, follow: false } };

const variants = {
  default: ["Mulțumim. Verifică-ți emailul.", "Ți-am trimis un mesaj de confirmare. Apasă pe linkul din el ca să ne spui că ești tu. Dacă nu-l vezi în câteva minute, uită-te și în Spam sau Promoții."],
  confirmat: ["Ești pe listă. Mulțumim.", "Adresa ta e confirmată. Te anunțăm când Ritualul de azi este gata."],
  dezabonat: ["Te-ai dezabonat.", "Nu-ți mai trimitem nimic. Dacă te răzgândești, te poți înscrie oricând din prima pagină."],
  eroare: ["Linkul nu mai e valabil.", "Încearcă să te înscrii din nou din prima pagină și îți trimitem un link nou."],
} as const;

export default async function ThanksPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const key = params.confirmat ? "confirmat" : params.dezabonat ? "dezabonat" : params.eroare ? "eroare" : "default";
  const [title, copy] = variants[key];
  return <><PublicHeader /><main id="continut" className="container-shell max-w-2xl py-24 sm:py-32">
    <h1 className="display text-5xl font-semibold leading-[1.05] tracking-[-.03em] text-[var(--wine)] sm:text-6xl">{title}</h1>
    <p className="mt-6 text-lg leading-8 text-[var(--muted)]">{copy}</p>
    {key === "confirmat" && <section className="mt-10 rounded-3xl border border-[var(--line)] bg-[var(--blush)]/40 p-6 sm:p-8" aria-labelledby="planere-titlu">
      <h2 id="planere-titlu" className="display text-2xl font-semibold text-[var(--wine)]">Până atunci, încearcă două pagini și agenda</h2>
      <p className="mt-2 text-[var(--muted)]">Se completează direct în PDF, pe calculator sau pe tabletă. Sau le tipărești.</p>
      <ul className="mt-5 space-y-4">{planere.map((p) => <li key={p.nume}>
        <p className="font-semibold text-[var(--wine)]">{p.nume} <span className="font-normal text-[var(--muted)]">· {p.descriere}</span></p>
        <p className="mt-1 flex flex-wrap gap-x-5 gap-y-1 text-sm"><a className="underline underline-offset-4 text-[var(--rose)]" href={p.crem} download>Pentru ecran (PDF)</a><a className="underline underline-offset-4 text-[var(--rose)]" href={p.alb} download>Pentru tipărit (PDF)</a></p>
      </li>)}</ul>
    </section>}
    <Link className="button-primary mt-9" href="/">Înapoi la prima pagină</Link>
  </main><PublicFooter /></>;
}
