import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowUpRight, BookOpenText, CircleDollarSign, FileText, HeartHandshake, MessageCircleHeart, Plus, Sparkles, UsersRound } from "lucide-react";
import { Logo } from "@/components/logo";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { createCalmExercise, createJournalPrompt, createResource, createTestimonial, deleteAdminItem, toggleAdminItem } from "./actions";

export const metadata: Metadata = { title: "Administrare", robots: { index: false, follow: false } };

type Resource = { id: string; title: string; resource_type: string; access: "free" | "plus"; is_published: boolean; updated_at: string };
type CalmExercise = { id: string; title: string; category: string; minutes: number; access: "free" | "plus"; is_published: boolean };
type JournalPrompt = { id: string; prompt: string; sort_order: number; is_published: boolean };
type Testimonial = { id: string; display_name: string; quote: string; is_verified: boolean; is_published: boolean };
type AdminTable = "resources" | "calm_exercises" | "journal_prompts" | "testimonials";

const nav = [["Privire de ansamblu", "#sumar"], ["Resurse", "#resurse"], ["Calm", "#calm"], ["Jurnal", "#jurnal"], ["Testimoniale", "#testimoniale"]] as const;

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ro-RO", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
}

function Status({ active, verified }: { active: boolean; verified?: boolean }) {
  return <span className={`inline-flex items-center gap-2 text-xs font-bold ${active ? "text-[#3f6f59]" : "text-[var(--muted)]"}`}><span className={`size-2 rounded-full ${active ? "bg-[#5f9378]" : "bg-[#cdbfc1]"}`} />{active ? (verified === false ? "Publicat, neverificat" : "Publicat") : "Ciornă"}</span>;
}

function RowActions({ table, id, published }: { table: AdminTable; id: string; published: boolean }) {
  return <div className="flex flex-wrap items-center gap-2"><form action={toggleAdminItem}><input type="hidden" name="table" value={table} /><input type="hidden" name="id" value={id} /><input type="hidden" name="published" value={String(!published)} /><button className="rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-xs font-bold text-[var(--wine)] transition hover:border-[rgba(183,86,104,.36)] hover:bg-[var(--blush)] active:translate-y-px">{published ? "Retrage" : "Publică"}</button></form><form action={deleteAdminItem}><input type="hidden" name="table" value={table} /><input type="hidden" name="id" value={id} /><button className="px-2 py-2 text-xs font-bold text-[var(--muted)] transition hover:text-[var(--rose-dark)]">Șterge</button></form></div>;
}

function SectionHeading({ eyebrow, title, copy }: { eyebrow: string; title: string; copy: string }) {
  return <div className="max-w-2xl"><p className="eyebrow">{eyebrow}</p><h2 className="display mt-2 text-4xl font-semibold tracking-[-.03em] text-[var(--wine)] sm:text-5xl">{title}</h2><p className="mt-3 max-w-[62ch] text-sm leading-7 text-[var(--muted)]">{copy}</p></div>;
}

function EmptyState({ children }: { children: React.ReactNode }) {
  return <p className="rounded-xl bg-[var(--ivory)] px-4 py-5 text-sm leading-6 text-[var(--muted)]">{children}</p>;
}

export default async function AdminPage() {
  const supabase = await createClient();
  if (!supabase) redirect("/autentificare");
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/autentificare?next=/admin");
  if (auth.user.app_metadata?.role !== "admin") redirect("/spatiu/azi");

  const db = createAdminClient();
  const [profiles, activeSubscriptions, resourcesResult, calmResult, promptsResult, testimonialsResult] = await Promise.all([
    db.from("profiles").select("id", { count: "exact", head: true }),
    db.from("subscriptions").select("id", { count: "exact", head: true }).in("status", ["active", "trialing"]),
    db.from("resources").select("id,title,resource_type,access,is_published,updated_at").order("updated_at", { ascending: false }).limit(12),
    db.from("calm_exercises").select("id,title,category,minutes,access,is_published").order("updated_at", { ascending: false }).limit(12),
    db.from("journal_prompts").select("id,prompt,sort_order,is_published").order("sort_order").limit(20),
    db.from("testimonials").select("id,display_name,quote,is_verified,is_published").order("sort_order").limit(12),
  ]);
  const resources = (resourcesResult.data ?? []) as Resource[];
  const calmExercises = (calmResult.data ?? []) as CalmExercise[];
  const prompts = (promptsResult.data ?? []) as JournalPrompt[];
  const testimonials = (testimonialsResult.data ?? []) as Testimonial[];
  const publishedCount = resources.filter((item) => item.is_published).length + calmExercises.filter((item) => item.is_published).length + prompts.filter((item) => item.is_published).length;
  const stats = [
    { label: "Utilizatoare", value: profiles.count ?? 0, note: "conturi create", icon: UsersRound },
    { label: "Abonamente Plus", value: activeSubscriptions.count ?? 0, note: "active sau în trial", icon: CircleDollarSign },
    { label: "Conținut publicat", value: publishedCount, note: "în modulele principale", icon: BookOpenText },
    { label: "În lucru", value: resources.length + calmExercises.length + prompts.length - publishedCount, note: "ciorne de revizuit", icon: FileText },
  ];

  return <div className="min-h-[100dvh] bg-[var(--ivory)]">
    <header className="sticky top-0 z-40 border-b hairline bg-[rgba(251,246,244,.92)] backdrop-blur-xl"><div className="container-shell flex min-h-20 items-center justify-between gap-5"><div className="flex items-center gap-5"><Logo compact /><span className="hidden h-6 w-px bg-[var(--line)] sm:block" /><span className="hidden text-xs font-bold tracking-[.12em] text-[var(--muted)] sm:block">ADMIN</span></div><div className="flex items-center gap-3"><span className="hidden max-w-56 truncate text-xs text-[var(--muted)] md:block">{auth.user.email}</span><Link href="/" className="button-secondary !min-h-10 !px-4 !py-2 text-xs">Vezi site-ul <ArrowUpRight size={15} /></Link></div></div></header>
    <nav aria-label="Secțiuni administrare" className="border-b hairline bg-white/45"><div className="container-shell flex gap-1 overflow-x-auto py-3 [scrollbar-width:none]">{nav.map(([label, href]) => <a key={href} href={href} className="shrink-0 rounded-lg px-3 py-2 text-xs font-bold text-[var(--muted)] transition hover:bg-white hover:text-[var(--wine)]">{label}</a>)}</div></nav>

    <main className="container-shell pb-24 pt-12 sm:pt-16">
      <section id="sumar" className="scroll-mt-32">
        <div className="grid items-end gap-8 lg:grid-cols-[1fr_auto]"><div><p className="eyebrow">Panoul Starea Mea</p><h1 className="display mt-3 max-w-3xl text-5xl font-semibold leading-[.95] tracking-[-.045em] text-[var(--wine)] sm:text-7xl">Conținutul tău, într-un loc <em className="font-medium text-[var(--rose)]">liniștit.</em></h1><p className="mt-6 max-w-2xl text-sm leading-7 text-[var(--muted)] sm:text-base">Publică resurse, ajustează exercițiile și păstrează experiența coerentă. Schimbările apar în aplicație imediat după publicare.</p></div><div className="rounded-[18px] border border-[rgba(95,147,120,.22)] bg-[#edf5f0] px-5 py-4 text-sm text-[#315c48]"><span className="mr-2 inline-block size-2 rounded-full bg-[#5f9378]" /> Sistem operațional</div></div>
        <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{stats.map(({ label, value, note, icon: Icon }, index) => <article key={label} className={`rounded-[18px] p-6 ${index === 1 ? "bg-[var(--wine)] text-white" : "border border-[var(--line)] bg-[rgba(255,250,248,.78)]"}`}><div className="flex items-start justify-between gap-4"><p className={`text-xs font-bold ${index === 1 ? "text-[var(--rose-soft)]" : "text-[var(--muted)]"}`}>{label}</p><Icon size={18} className={index === 1 ? "text-[var(--rose-soft)]" : "text-[var(--rose)]"} /></div><p className="mt-8 font-mono text-4xl font-semibold tabular-nums">{value}</p><p className={`mt-2 text-xs ${index === 1 ? "text-white/65" : "text-[var(--muted)]"}`}>{note}</p></article>)}</div>
      </section>

      <section id="resurse" className="mt-20 scroll-mt-32 border-t hairline pt-16">
        <SectionHeading eyebrow="Bibliotecă" title="Resurse și articole" copy="Creează materiale care pot fi oferite gratuit sau incluse în abonamentul Plus. Salvează mai întâi ca ciornă, apoi publică atunci când textul este pregătit." />
        <div className="mt-9 grid gap-5 xl:grid-cols-[.78fr_1.22fr]">
          <form action={createResource} className="editorial-card self-start p-6 sm:p-7"><div className="flex items-center gap-3 text-[var(--wine)]"><Plus size={18} /><h3 className="font-bold">Resursă nouă</h3></div><div className="mt-6 grid gap-4"><label className="grid gap-2 text-xs font-bold text-[var(--muted)]">Titlu<input required name="title" maxLength={160} className="min-h-12 rounded-xl border hairline bg-white px-4 text-sm text-[var(--ink)]" placeholder="Ex. Cum îți pregătești o dimineață mai blândă" /></label><label className="grid gap-2 text-xs font-bold text-[var(--muted)]">Rezumat<textarea name="excerpt" maxLength={320} rows={3} className="rounded-xl border hairline bg-white px-4 py-3 text-sm leading-6 text-[var(--ink)]" placeholder="Două-trei propoziții despre material." /></label><div className="grid grid-cols-2 gap-3"><label className="grid gap-2 text-xs font-bold text-[var(--muted)]">Tip<select name="resource_type" className="min-h-12 rounded-xl border hairline bg-white px-3 text-sm text-[var(--ink)]"><option value="article">Articol</option><option value="guide">Ghid</option><option value="workbook">Workbook</option><option value="audio">Audio</option><option value="program">Program</option></select></label><label className="grid gap-2 text-xs font-bold text-[var(--muted)]">Acces<select name="access" className="min-h-12 rounded-xl border hairline bg-white px-3 text-sm text-[var(--ink)]"><option value="free">Gratuit</option><option value="plus">Plus</option></select></label></div><button className="button-primary mt-2 w-full"><Plus size={16} /> Salvează ciorna</button></div></form>
          <div className="editorial-card overflow-hidden">{resources.length === 0 ? <div className="p-6"><EmptyState>Nu există încă resurse. Prima ciornă creată va apărea aici.</EmptyState></div> : resources.map((item, index) => <article key={item.id} className={`grid gap-4 p-5 sm:grid-cols-[1fr_auto] sm:items-center sm:p-6 ${index ? "border-t hairline" : ""}`}><div className="min-w-0"><div className="flex flex-wrap items-center gap-3"><Status active={item.is_published} /><span className="text-[.68rem] font-bold uppercase tracking-wider text-[var(--rose-dark)]">{item.resource_type} · {item.access}</span></div><h3 className="mt-2 truncate font-semibold text-[var(--wine)]">{item.title}</h3><p className="mt-1 text-xs text-[var(--muted)]">Actualizat {formatDate(item.updated_at)}</p></div><RowActions table="resources" id={item.id} published={item.is_published} /></article>)}</div>
        </div>
      </section>

      <section id="calm" className="mt-20 scroll-mt-32 border-t hairline pt-16">
        <SectionHeading eyebrow="Biblioteca de calm" title="Exerciții scurte, pentru zile reale" copy="Adaugă intervenții de 1–10 minute. Limbajul rămâne orientativ și blând, fără promisiuni medicale sau interpretări diagnostice." />
        <div className="mt-9 grid gap-5 xl:grid-cols-[.78fr_1.22fr]">
          <form action={createCalmExercise} className="editorial-card self-start p-6 sm:p-7"><div className="flex items-center gap-3 text-[var(--wine)]"><HeartHandshake size={18} /><h3 className="font-bold">Exercițiu nou</h3></div><div className="mt-6 grid gap-4"><label className="grid gap-2 text-xs font-bold text-[var(--muted)]">Titlu<input required name="title" maxLength={140} className="min-h-12 rounded-xl border hairline bg-white px-4 text-sm text-[var(--ink)]" placeholder="Ex. Pauză pentru umeri" /></label><label className="grid gap-2 text-xs font-bold text-[var(--muted)]">Categorie<input required name="category" maxLength={100} className="min-h-12 rounded-xl border hairline bg-white px-4 text-sm text-[var(--ink)]" placeholder="Ex. Sunt copleșită" /></label><label className="grid gap-2 text-xs font-bold text-[var(--muted)]">Instrucțiuni<textarea required name="body" maxLength={4000} rows={5} className="rounded-xl border hairline bg-white px-4 py-3 text-sm leading-6 text-[var(--ink)]" placeholder="Scrie pașii simpli ai exercițiului." /></label><div className="grid grid-cols-2 gap-3"><label className="grid gap-2 text-xs font-bold text-[var(--muted)]">Durată<select name="minutes" className="min-h-12 rounded-xl border hairline bg-white px-3 text-sm text-[var(--ink)]"><option value="1">1 minut</option><option value="3">3 minute</option><option value="5">5 minute</option><option value="10">10 minute</option></select></label><label className="grid gap-2 text-xs font-bold text-[var(--muted)]">Acces<select name="access" className="min-h-12 rounded-xl border hairline bg-white px-3 text-sm text-[var(--ink)]"><option value="free">Gratuit</option><option value="plus">Plus</option></select></label></div><button className="button-primary mt-2 w-full"><Plus size={16} /> Salvează exercițiul</button></div></form>
          <div className="grid gap-3 sm:grid-cols-2">{calmExercises.length === 0 ? <EmptyState>Nu există încă exerciții de calm.</EmptyState> : calmExercises.map((item) => <article key={item.id} className="editorial-card flex min-h-52 flex-col p-6"><div className="flex items-center justify-between gap-3"><Status active={item.is_published} /><span className="font-mono text-xs text-[var(--muted)]">{item.minutes} min</span></div><Sparkles className="mt-7 text-[var(--rose)]" size={21} /><h3 className="mt-3 font-semibold text-[var(--wine)]">{item.title}</h3><p className="mt-1 text-xs text-[var(--muted)]">{item.category} · {item.access}</p><div className="mt-auto pt-6"><RowActions table="calm_exercises" id={item.id} published={item.is_published} /></div></article>)}</div>
        </div>
      </section>

      <section id="jurnal" className="mt-20 scroll-mt-32 border-t hairline pt-16">
        <SectionHeading eyebrow="Jurnal ghidat" title="Întrebări care deschid, nu presează" copy="Prompturile publicate apar în jurnalul ghidat. Ordinea mică înseamnă o poziție mai sus în listă." />
        <div className="mt-9 grid gap-5 lg:grid-cols-[.7fr_1.3fr]">
          <form action={createJournalPrompt} className="editorial-card self-start p-6 sm:p-7"><div className="flex items-center gap-3 text-[var(--wine)]"><MessageCircleHeart size={18} /><h3 className="font-bold">Prompt nou</h3></div><label className="mt-6 grid gap-2 text-xs font-bold text-[var(--muted)]">Întrebare<textarea required name="prompt" maxLength={300} rows={4} className="rounded-xl border hairline bg-white px-4 py-3 text-sm leading-6 text-[var(--ink)]" placeholder="Ex. De ce ai avea nevoie ca ziua să fie cu 5% mai ușoară?" /></label><label className="mt-4 grid gap-2 text-xs font-bold text-[var(--muted)]">Poziție<input name="sort_order" type="number" min="0" defaultValue={prompts.length + 1} className="min-h-12 rounded-xl border hairline bg-white px-4 text-sm text-[var(--ink)]" /></label><button className="button-primary mt-5 w-full"><Plus size={16} /> Salvează promptul</button></form>
          <div className="editorial-card p-3 sm:p-4">{prompts.length === 0 ? <EmptyState>Nu există încă prompturi.</EmptyState> : prompts.map((item) => <article key={item.id} className="grid gap-4 rounded-xl px-4 py-4 transition hover:bg-white sm:grid-cols-[auto_1fr_auto] sm:items-center"><span className="grid size-9 place-items-center rounded-lg bg-[var(--blush)] font-mono text-xs font-bold text-[var(--rose-dark)]">{item.sort_order}</span><div><p className="text-sm font-semibold leading-6 text-[var(--wine)]">{item.prompt}</p><div className="mt-1"><Status active={item.is_published} /></div></div><RowActions table="journal_prompts" id={item.id} published={item.is_published} /></article>)}</div>
        </div>
      </section>

      <section id="testimoniale" className="mt-20 scroll-mt-32 border-t hairline pt-16">
        <SectionHeading eyebrow="Încredere" title="Testimoniale verificate" copy="Publică doar mărturii pentru care ai acordul persoanei. Marcajul de verificare este separat de publicare." />
        <div className="mt-9 grid gap-5 xl:grid-cols-[.78fr_1.22fr]">
          <form action={createTestimonial} className="editorial-card self-start p-6 sm:p-7"><div className="flex items-center gap-3 text-[var(--wine)]"><MessageCircleHeart size={18} /><h3 className="font-bold">Testimonial nou</h3></div><div className="mt-6 grid gap-4"><label className="grid gap-2 text-xs font-bold text-[var(--muted)]">Nume afișat<input required name="display_name" maxLength={100} className="min-h-12 rounded-xl border hairline bg-white px-4 text-sm text-[var(--ink)]" placeholder="Ex. Ana M." /></label><label className="grid gap-2 text-xs font-bold text-[var(--muted)]">Mărturie<textarea required name="quote" maxLength={1000} rows={5} className="rounded-xl border hairline bg-white px-4 py-3 text-sm leading-6 text-[var(--ink)]" placeholder="Textul aprobat pentru publicare." /></label><label className="flex items-center gap-3 rounded-xl bg-[var(--ivory)] p-4 text-xs font-semibold text-[var(--wine)]"><input name="is_verified" value="true" type="checkbox" className="size-4 accent-[var(--rose)]" /> Confirm că am acordul persoanei</label><button className="button-primary w-full"><Plus size={16} /> Salvează testimonialul</button></div></form>
          <div className="grid gap-3">{testimonials.length === 0 ? <EmptyState>Nu există încă testimoniale.</EmptyState> : testimonials.map((item) => <article key={item.id} className="editorial-card p-6"><div className="flex flex-wrap items-center justify-between gap-3"><Status active={item.is_published} verified={item.is_verified} /><span className={`text-xs font-bold ${item.is_verified ? "text-[#3f6f59]" : "text-[var(--rose-dark)]"}`}>{item.is_verified ? "Acord confirmat" : "Necesită verificare"}</span></div><blockquote className="display mt-5 text-2xl font-medium leading-snug text-[var(--wine)]">„{item.quote}”</blockquote><p className="mt-4 text-xs font-bold text-[var(--muted)]">— {item.display_name}</p><div className="mt-5"><RowActions table="testimonials" id={item.id} published={item.is_published} /></div></article>)}</div>
        </div>
      </section>
    </main>
  </div>;
}
