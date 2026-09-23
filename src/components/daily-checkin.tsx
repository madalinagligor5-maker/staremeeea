"use client";

import { ArrowRight, Check, ChevronLeft, Clock3, Feather, RotateCcw, Sparkles } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getRecommendations, type MindState } from "@/lib/recommendations";
import { MinimumDay } from "@/components/space/minimum-day";

const states: { id: MindState; label: string; glyph: string }[] = [
  { id: "calm", label: "Calmă", glyph: "◡" }, { id: "foggy", label: "În ceață", glyph: "≈" },
  { id: "agitated", label: "Agitată", glyph: "↯" }, { id: "overwhelmed", label: "Copleșită", glyph: "…" },
  { id: "focused", label: "Focusată", glyph: "◎" }, { id: "sensitive", label: "Sensibilă", glyph: "♡" },
  { id: "low_energy", label: "Fără energie", glyph: "−" }, { id: "well", label: "Sunt bine", glyph: "+" },
];
const stepIndex = { state: 1, energy: 2, focus: 3, done: 3 } as const;

export function DailyCheckin({ firstName = "Ana" }: { firstName?: string }) {
  const [step, setStep] = useState<"state" | "energy" | "focus" | "done">("state");
  const [state, setState] = useState<MindState | null>(null);
  const [energy, setEnergy] = useState(3); const [focus, setFocus] = useState(3);
  const [saving, setSaving] = useState(false); const [error, setError] = useState("");
  const recommendations = useMemo(() => state ? getRecommendations(state, energy, focus) : [], [state, energy, focus]);
  const today = new Intl.DateTimeFormat("ro-RO", { weekday: "long", day: "numeric", month: "long" }).format(new Date());

  async function finish() {
    if (!state) return; setSaving(true); setError("");
    try {
      const supabase = createClient();
      if (supabase) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Sesiunea a expirat. Intră din nou în cont.");
        const { error: dbError } = await supabase.from("daily_checkins").upsert({ user_id: user.id, checkin_date: new Date().toISOString().slice(0, 10), state, energy, focus }, { onConflict: "user_id,checkin_date" });
        if (dbError) throw dbError;
      } else localStorage.setItem(`starea-mea-checkin-${new Date().toISOString().slice(0, 10)}`, JSON.stringify({ state, energy, focus }));
      setStep("done");
    } catch (e) { setError(e instanceof Error ? e.message : "Nu am putut salva. Încearcă din nou."); } finally { setSaving(false); }
  }

  return <main className="container-shell py-8 sm:py-12">
    <header className="dashboard-intro"><div><p className="eyebrow capitalize">{today}</p><h1 className="display mt-3 text-[clamp(3.5rem,7vw,6.6rem)] font-semibold leading-[.86] tracking-[-.055em] text-[var(--wine)]">Bună, {firstName}.<br /><em className="font-medium text-[var(--rose)]">Cum ești azi?</em></h1></div><div className="dashboard-note"><Sparkles size={18} /><p>Nu există un răspuns corect.<br />Observăm doar de unde începem.</p></div></header>
    <div className="mt-9 grid gap-5 lg:grid-cols-[minmax(0,1fr)_19rem]">
      <section className="ritual-stage">
        <div className="ritual-progress" aria-label={`Pasul ${stepIndex[step]} din 3`}>{[1, 2, 3].map(number => <span key={number} className={number <= stepIndex[step] ? "is-complete" : ""} />)}</div>
        {step === "state" && <div className="ritual-stage-inner"><p className="eyebrow">Check-in · 30 secunde</p><h2 className="display mt-3 text-4xl font-semibold leading-none text-[var(--wine)] sm:text-5xl">Ce se apropie cel mai mult?</h2><div className="mt-7 grid grid-cols-2 gap-2 sm:grid-cols-4">{states.map(item => <button key={item.id} onClick={() => setState(item.id)} aria-pressed={state === item.id} className={`state-tile ${state === item.id ? "is-selected" : ""}`}><span className="display text-3xl text-[var(--rose)]">{item.glyph}</span><span>{item.label}</span></button>)}</div><div className="mt-8 flex items-center justify-between gap-4"><p className="hidden text-xs text-[var(--muted)] sm:block">Răspunsul tău rămâne privat.</p><button disabled={!state} onClick={() => setStep("energy")} className="button-primary disabled:cursor-not-allowed disabled:opacity-40">Continuă <ArrowRight size={17} /></button></div></div>}
        {step === "energy" && <ScaleStep eyebrow="Pasul 2 din 3" title="Câtă energie ai la dispoziție?" value={energy} setValue={setEnergy} low="Foarte puțină" high="Multă" onBack={() => setStep("state")} onNext={() => setStep("focus")} />}
        {step === "focus" && <ScaleStep eyebrow="Pasul 3 din 3 · opțional" title="Cât de limpede îți este mintea?" value={focus} setValue={setFocus} low="Împrăștiată" high="Foarte clară" onBack={() => setStep("energy")} onNext={finish} loading={saving} />}
        {step === "done" && <div className="ritual-stage-inner"><div className="completion-mark"><Check /></div><p className="eyebrow mt-6">Ritual pregătit pentru tine</p><h2 className="display mt-3 max-w-2xl text-4xl font-semibold leading-[.95] text-[var(--wine)] sm:text-6xl">Astăzi nu ai nevoie de mai mult. Ai nevoie de ce ți se potrivește.</h2><div className="mt-8 grid gap-3 sm:grid-cols-2">{recommendations.map((item, index) => <Link href={item.href} key={item.title} className={`recommendation-card ${index === 0 ? "is-featured" : ""}`}><div className="flex items-center justify-between"><span className="eyebrow">{index === 0 ? "Începe aici" : "Dacă mai ai spațiu"}</span><span className="flex items-center gap-1 text-xs"><Clock3 size={13} />{item.minutes} min</span></div><h3 className="display mt-6 text-3xl font-semibold text-[var(--wine)]">{item.title}</h3><p className="mt-2 text-sm leading-6 text-[var(--muted)]">{item.detail}</p><ArrowRight className="mt-6 text-[var(--rose)]" /></Link>)}</div><button onClick={() => setStep("state")} className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[var(--rose-dark)]"><RotateCcw size={15} /> Modifică răspunsurile</button></div>}
        {error && <p role="alert" className="mx-6 mb-6 rounded-xl bg-[#f9e5e6] p-4 text-sm text-[var(--rose-dark)]">{error}</p>}
      </section>
      <aside className="grid content-start gap-4"><div className="editorial-card paper-noise overflow-hidden bg-[var(--blush)] p-6"><Feather className="text-[var(--rose)]" strokeWidth={1.5} /><p className="eyebrow mt-8">Gândul zilei</p><p className="display mt-4 text-3xl font-semibold leading-[1.05] text-[var(--wine)]">Nu trebuie să recuperezi nimic.</p><p className="mt-3 text-sm leading-6 text-[var(--muted)]">Poți începe exact de unde ești.</p></div><MinimumDay /><Link href="/spatiu/ritualuri" className="library-invite"><span><span className="eyebrow">Biblioteca ta</span><strong>6 ritualuri pentru zile reale</strong></span><ArrowRight size={18} /></Link></aside>
    </div>
  </main>;
}

function ScaleStep({ eyebrow, title, value, setValue, low, high, onBack, onNext, loading }: { eyebrow: string; title: string; value: number; setValue: (n: number) => void; low: string; high: string; onBack: () => void; onNext: () => void; loading?: boolean }) {
  return <div className="ritual-stage-inner flex min-h-[31rem] flex-col"><p className="eyebrow">{eyebrow}</p><h2 className="display mt-4 max-w-2xl text-4xl font-semibold leading-none text-[var(--wine)] sm:text-6xl">{title}</h2><div className="my-auto py-10"><div className="grid grid-cols-5 gap-2">{[1,2,3,4,5].map(n => <button aria-label={`${n} din 5`} aria-pressed={value === n} key={n} onClick={() => setValue(n)} className={`scale-choice ${value === n ? "is-selected" : ""}`}>{n}</button>)}</div><div className="mt-3 flex justify-between text-xs text-[var(--muted)]"><span>{low}</span><span>{high}</span></div></div><div className="flex justify-between"><button className="button-secondary" onClick={onBack}><ChevronLeft size={17} /> Înapoi</button><button disabled={loading} className="button-primary disabled:opacity-50" onClick={onNext}>{loading ? "Se salvează…" : "Continuă"} {!loading && <ArrowRight size={17} />}</button></div></div>;
}
