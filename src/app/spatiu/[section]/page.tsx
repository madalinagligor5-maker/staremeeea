import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { BrainDump } from "@/components/space/brain-dump";
import { CalmLibrary } from "@/components/space/calm-library";
import { CantStart } from "@/components/space/cant-start";
import { FocusTimer } from "@/components/space/focus-timer";
import { Journal } from "@/components/space/journal";
import { Patterns } from "@/components/space/patterns";
import { Planner } from "@/components/space/planner";
import { Profile } from "@/components/space/profile";

const tools: Record<string, React.ComponentType> = { planificator: Planner, "brain-dump": BrainDump, "nu-pot-sa-incep": CantStart, focus: FocusTimer, calm: CalmLibrary, jurnal: Journal, patterns: Patterns, profil: Profile };

export default async function SpaceSection({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  const Component = tools[section];
  if (Component) return <Component />;
  if (section !== "resurse") notFound();
  return <main className="container-shell py-12"><Link href="/spatiu/azi" className="inline-flex items-center gap-2 text-sm font-bold text-[var(--rose-dark)]"><ArrowLeft size={16} /> Înapoi la azi</Link><div className="editorial-card mt-8 p-10"><p className="eyebrow">Biblioteca ta</p><h1 className="display mt-3 text-6xl font-semibold text-[var(--wine)]">Resurse pentru zile reale.</h1><p className="mt-5 text-[var(--muted)]">Articolele și programele publicate din admin vor apărea aici.</p></div></main>;
}
