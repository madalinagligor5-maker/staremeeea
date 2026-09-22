import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { notFound } from "next/navigation";
import { BrainDump } from "@/components/space/brain-dump";
import { CalmLibrary } from "@/components/space/calm-library";
import { CantStart } from "@/components/space/cant-start";
import { FocusTimer } from "@/components/space/focus-timer";
import { Journal } from "@/components/space/journal";
import { Patterns } from "@/components/space/patterns";
import { Planner } from "@/components/space/planner";
import { Profile } from "@/components/space/profile";
import { getPublicResources } from "@/lib/public-data";

const tools: Record<string, React.ComponentType> = { planificator: Planner, "brain-dump": BrainDump, "nu-pot-sa-incep": CantStart, focus: FocusTimer, calm: CalmLibrary, jurnal: Journal, patterns: Patterns, profil: Profile };

export default async function SpaceSection({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  const Component = tools[section];
  if (Component) return <Component />;
  if (section !== "resurse") notFound();
  const resources = await getPublicResources();
  return <main className="container-shell py-12"><Link href="/spatiu/azi" className="inline-flex items-center gap-2 text-sm font-bold text-[var(--rose-dark)]"><ArrowLeft size={16} /> Înapoi la azi</Link><div className="mt-8 max-w-3xl"><p className="eyebrow">Biblioteca ta</p><h1 className="display mt-3 text-6xl font-semibold leading-none text-[var(--wine)]">Resurse pentru zile reale.</h1><p className="mt-5 max-w-xl leading-7 text-[var(--muted)]">Alege un material după nevoia de acum. Nu trebuie să termini tot ca să fie util.</p></div><div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{resources.map((resource) => <Link href={`/resurse/${resource.slug}`} key={resource.slug} className="editorial-card group flex min-h-64 flex-col p-6 transition-transform hover:-translate-y-1"><div className="flex items-center justify-between gap-3 text-xs font-bold text-[var(--rose-dark)]"><span>{resource.resource_type}</span><span>{resource.access === "free" ? "Gratuit" : "Plus"}</span></div><h2 className="display mt-7 text-3xl font-semibold leading-tight text-[var(--wine)]">{resource.title}</h2><p className="mt-3 text-sm leading-6 text-[var(--muted)]">{resource.excerpt}</p><ArrowRight size={17} className="mt-auto pt-6 box-content text-[var(--rose)] transition-transform group-hover:translate-x-1" /></Link>)}</div></main>;
}
