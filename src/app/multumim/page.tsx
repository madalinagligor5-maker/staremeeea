import type { Metadata } from "next";
import Link from "next/link";
import { PublicFooter } from "@/components/public-footer";
import { PublicHeader } from "@/components/public-header";

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
    <Link className="button-primary mt-9" href="/">Înapoi la prima pagină</Link>
  </main><PublicFooter /></>;
}
