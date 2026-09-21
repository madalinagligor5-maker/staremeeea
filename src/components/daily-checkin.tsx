"use client";
import { ArrowRight, Check, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getRecommendations, type MindState } from "@/lib/recommendations";
import { MinimumDay } from "@/components/space/minimum-day";

const states: { id: MindState; label: string; glyph: string }[] = [
  { id: "calm", label: "Calmă", glyph: "◡" }, { id: "foggy", label: "În ceață", glyph: "≈" }, { id: "agitated", label: "Agitată", glyph: "↯" }, { id: "overwhelmed", label: "Copleșită", glyph: "…" },
  { id: "focused", label: "Foarte focusată", glyph: "◎" }, { id: "sensitive", label: "Sensibilă", glyph: "♡" }, { id: "low_energy", label: "Fără energie", glyph: "−" }, { id: "well", label: "Sunt bine", glyph: "+" },
];

export function DailyCheckin({ firstName = "Ana" }: { firstName?: string }) {
  const [step, setStep] = useState<"state" | "energy" | "focus" | "done">("state");
  const [state, setState] = useState<MindState | null>(null);
  const [energy, setEnergy] = useState(3);
  const [focus, setFocus] = useState(3);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const recommendations = useMemo(() => state ? getRecommendations(state, energy, focus) : [], [state, energy, focus]);

  async function finish() {
    if (!state) return;
    setSaving(true); setError("");
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

  return <main className="container-shell py-10 sm:py-16"><div className="mb-9 flex items-end justify-between"><div><p className="text-sm font-semibold text-[var(--rose-dark)]">Bună, {firstName}.</p><h1 className="display mt-2 text-5xl font-semibold tracking-[-.04em] text-[var(--wine)] sm:text-7xl">Cum e mintea ta azi?</h1></div><p className="hidden max-w-xs text-right text-sm leading-6 text-[var(--muted)] sm:block">Nu există răspuns corect. Observăm doar de unde începem.</p></div>
    <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
      <section className="editorial-card min-h-[510px] p-5 sm:p-8">
        {step === "state" && <><p className="eyebrow">Pasul 1 din 3</p><h2 className="display mt-3 text-3xl font-semibold text-[var(--wine)]">Alege ce se apropie cel mai mult.</h2><div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">{states.map(item => <button key={item.id} onClick={() => setState(item.id)} aria-pressed={state === item.id} className={`min-h-32 rounded-2xl border p-4 text-left transition ${state === item.id ? "border-[var(--rose)] bg-[var(--blush)]" : "hairline bg-white hover:border-[rgba(183,86,104,.35)]"}`}><span className="display text-3xl text-[var(--rose)]">{item.glyph}</span><span className="mt-5 block text-sm font-bold text-[var(--wine)]">{item.label}</span></button>)}</div><div className="mt-8 flex justify-end"><button disabled={!state} onClick={() => setStep("energy")} className="button-primary disabled:cursor-not-allowed disabled:opacity-40">Continuă <ArrowRight size={17} /></button></div></>}
        {step === "energy" && <ScaleStep eyebrow="Pasul 2 din 3" title="Câtă energie ai?" value={energy} setValue={setEnergy} low="Foarte puțină" high="Multă" onBack={() => setStep("state")} onNext={() => setStep("focus")} />}
        {step === "focus" && <ScaleStep eyebrow="Pasul 3 din 3 · opțional" title="Cum este nivelul tău de focus?" value={focus} setValue={setFocus} low="Împrăștiat" high="Foarte clar" onBack={() => setStep("energy")} onNext={finish} loading={saving} />}
        {step === "done" && <div className="py-4"><div className="grid size-12 place-items-center rounded-full bg-[var(--blush)] text-[var(--rose-dark)]"><Check /></div><p className="eyebrow mt-6">Salvat pentru azi</p><h2 className="display mt-3 max-w-lg text-5xl font-semibold leading-none text-[var(--wine)]">Iată ce ar putea fi blând și util acum.</h2><div className="mt-9 grid gap-3">{recommendations.map(item => <Link href={item.href} key={item.title} className="group flex items-center justify-between rounded-2xl border hairline bg-white p-5"><div><h3 className="font-bold text-[var(--wine)]">{item.title}</h3><p className="mt-1 text-sm leading-6 text-[var(--muted)]">{item.detail} · {item.minutes} min</p></div><ArrowRight className="text-[var(--rose)] transition-transform group-hover:translate-x-1" /></Link>)}</div><button onClick={() => setStep("state")} className="mt-6 text-sm font-bold text-[var(--rose-dark)]">Modifică răspunsurile</button></div>}
        {error && <p role="alert" className="mt-5 rounded-xl bg-[#f9e5e6] p-4 text-sm text-[var(--rose-dark)]">{error}</p>}
      </section>
      <aside className="space-y-4"><div className="editorial-card bg-[var(--blush)] p-6"><p className="eyebrow">O ancoră pentru azi</p><p className="display mt-4 text-3xl font-semibold leading-tight text-[var(--wine)]">Nu trebuie să recuperezi nimic.</p><p className="mt-3 text-sm leading-6 text-[var(--muted)]">Poți începe exact de unde ești.</p><Link href="/spatiu/nu-pot-sa-incep" className="mt-5 inline-flex text-sm font-bold text-[var(--rose-dark)]">Nu pot să încep →</Link></div><MinimumDay/><div className="editorial-card p-6"><p className="text-sm font-bold text-[var(--wine)]">Mica victorie a lunii</p><p className="display mt-3 text-4xl font-semibold text-[var(--rose)]">6</p><p className="mt-1 text-sm text-[var(--muted)]">momente în care ai revenit la tine</p></div></aside>
    </div>
  </main>;
}

function ScaleStep({ eyebrow, title, value, setValue, low, high, onBack, onNext, loading }: { eyebrow: string; title: string; value: number; setValue: (n: number) => void; low: string; high: string; onBack: () => void; onNext: () => void; loading?: boolean }) {
  return <div className="flex min-h-[440px] flex-col"><p className="eyebrow">{eyebrow}</p><h2 className="display mt-4 text-4xl font-semibold text-[var(--wine)] sm:text-5xl">{title}</h2><div className="my-auto"><div className="grid grid-cols-5 gap-2">{[1,2,3,4,5].map(n => <button aria-label={`${n} din 5`} aria-pressed={value === n} key={n} onClick={() => setValue(n)} className={`grid aspect-square max-h-28 place-items-center rounded-2xl border text-xl font-bold ${value === n ? "border-[var(--rose)] bg-[var(--rose)] text-white" : "hairline bg-white text-[var(--wine)]"}`}>{n}</button>)}</div><div className="mt-3 flex justify-between text-xs text-[var(--muted)]"><span>{low}</span><span>{high}</span></div></div><div className="flex justify-between"><button className="button-secondary" onClick={onBack}><ChevronLeft size={17} /> Înapoi</button><button disabled={loading} className="button-primary disabled:opacity-50" onClick={onNext}>{loading ? "Se salvează…" : "Continuă"} {!loading && <ArrowRight size={17} />}</button></div></div>;
}
