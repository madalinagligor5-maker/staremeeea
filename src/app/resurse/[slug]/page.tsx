import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight, LockKeyhole } from "lucide-react";
import { notFound } from "next/navigation";
import { PublicFooter } from "@/components/public-footer";
import { PublicHeader } from "@/components/public-header";
import { getPublicResource } from "@/lib/public-data";

const typeLabel: Record<string, string> = { article: "Articol", guide: "Ghid practic", workbook: "Workbook", audio: "Exercițiu audio", program: "Program" };

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const resource = await getPublicResource(slug);
  return resource ? { title: resource.title, description: resource.excerpt } : {};
}

export default async function ResourceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const resource = await getPublicResource(slug);
  if (!resource) notFound();
  const paragraphs = resource.body.split(/\n\n+/).filter(Boolean);

  return <><PublicHeader /><main id="continut"><article><header className="border-b hairline"><div className="container-shell py-16 sm:py-24"><Link href="/resurse" className="inline-flex items-center gap-2 text-sm font-bold text-[var(--rose-dark)]"><ArrowLeft size={16} /> Înapoi la bibliotecă</Link><div className="mt-14 grid gap-8 lg:grid-cols-[1fr_.38fr] lg:items-end"><div><p className="eyebrow">{typeLabel[resource.resource_type]} · {resource.access === "free" ? "Acces gratuit" : "Ritualul de Azi Plus"}</p><h1 className="display mt-5 max-w-5xl text-5xl font-semibold leading-[.92] tracking-[-.04em] text-[var(--wine)] sm:text-7xl">{resource.title}</h1><p className="mt-7 max-w-2xl text-lg leading-8 text-[var(--muted)]">{resource.excerpt}</p></div><div className="rounded-[18px] bg-[var(--blush)] p-6"><p className="text-xs font-bold uppercase tracking-wider text-[var(--rose-dark)]">Un ritm posibil</p><p className="display mt-3 text-2xl font-semibold text-[var(--wine)]">Citește încet. O singură idee poate fi suficientă pentru azi.</p></div></div></div></header><div className="container-shell grid gap-12 py-16 sm:py-24 lg:grid-cols-[.22fr_.62fr_.16fr]"><aside className="hidden lg:block"><p className="sticky top-32 text-xs leading-6 text-[var(--muted)]">Conținut pentru wellbeing și organizare. Nu înlocuiește evaluarea sau tratamentul oferit de un profesionist.</p></aside><div>{paragraphs.map((paragraph, index) => <p key={paragraph} className={`${index === 0 ? "first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:font-[var(--font-serif)] first-letter:text-6xl first-letter:font-semibold first-letter:text-[var(--rose)]" : ""} mb-7 text-lg leading-9 text-[var(--muted)]`}>{paragraph}</p>)}{resource.access === "plus" && <section className="mt-12 rounded-[18px] bg-[var(--wine)] p-7 text-white sm:p-9"><LockKeyhole className="text-[var(--rose-soft)]" /><h2 className="display mt-5 text-3xl font-semibold">Continuă în spațiul Plus</h2><p className="mt-3 max-w-xl text-sm leading-7 text-white/65">Materialele Plus includ pași suplimentari, exerciții și spații de reflecție pe care le poți relua în propriul ritm.</p><Link href="/preturi" className="button-primary mt-6 bg-[var(--rose-soft)] !text-[var(--wine)]">Vezi planurile <ArrowRight size={16} /></Link></section>}</div><div aria-hidden className="hidden border-l hairline lg:block" /></div></article><section className="border-t hairline bg-white/50 py-16 text-center"><p className="display text-3xl font-semibold text-[var(--wine)]">Vrei să păstrezi ideea aproape?</p><p className="mt-3 text-sm text-[var(--muted)]">Poți transforma următorul pas într-un task mic.</p><Link href="/spatiu/planificator" className="button-secondary mt-6">Deschide planificatorul <ArrowRight size={16} /></Link></section></main><PublicFooter /></>;
}
