"use client";
// Configurarea de la început: șase întrebări scurte, o singură dată. Din răspunsuri, Cartea își alege singură
// sertarele și modulele, tonul și culoarea. Totul se poate schimba mai târziu în Setări.
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { drawerById } from "@/lib/carte/drawers";
import {
  focusOptions, MAX_FOCUS, momentLabels, moduleLabels, paletteInfo, planFor, toneLabels, winSuggestions,
} from "@/lib/carte/profile";
import {
  applyPalette, MAX_WINS, momentIds, paletteIds, toneIds, type Focus, type Moment, type Palette, type Settings, type Tone,
} from "@/lib/carte/settings";
import { TextLine } from "./fields";

const STEPS = 6; // ultimul ecran (rezumatul) nu se numără

const card = "rounded-3xl border hairline bg-[var(--paper)] p-6 sm:p-8";
const h1 = "display text-3xl font-semibold leading-tight text-[var(--wine)] sm:text-4xl";

export function Onboarding({ initial, onDone }: { initial: Settings; onDone: (settings: Settings) => void }) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState(initial.name);
  const [focus, setFocus] = useState<Focus[]>(initial.focus);
  const [tone, setTone] = useState<Tone>(initial.tone);
  const [moment, setMoment] = useState<Moment>(initial.moment);
  const [palette, setPalette] = useState<Palette>(initial.palette);
  const [wins, setWins] = useState<string[]>(initial.wins);
  const [own, setOwn] = useState("");

  // Culoarea se vede pe loc, cât alegi.
  useEffect(() => { applyPalette(palette); }, [palette]);

  const plan = planFor(focus);
  const allWins = own.trim() !== "" && !wins.includes(own.trim()) ? [...wins, own.trim()].slice(0, MAX_WINS) : wins;

  function build(): Settings {
    return { ...initial, name: name.trim(), focus, tone, moment, palette, wins: allWins, enabled: plan.enabled, modules: plan.modules, onboarded: true };
  }

  const toggleFocus = (id: Focus) => setFocus((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : cur.length < MAX_FOCUS ? [...cur, id] : cur));
  const toggleWin = (w: string) => setWins((cur) => (cur.includes(w) ? cur.filter((x) => x !== w) : cur.length < MAX_WINS ? [...cur, w] : cur));
  const next = () => setStep((s) => Math.min(s + 1, STEPS));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  return <div className="space-y-5">
    <div className="flex items-center justify-between gap-3">
      {step > 0 ? <button type="button" onClick={back} className="inline-flex min-h-11 items-center gap-2 rounded-full px-3 text-sm font-bold text-[var(--wine)]"><ArrowLeft size={18} aria-hidden="true" />Înapoi</button> : <span />}
      {step < STEPS && <p className="text-sm font-bold text-[var(--muted)]">Pasul {step + 1} din {STEPS}</p>}
    </div>
    {step < STEPS && <div className="grid grid-cols-6 gap-1.5" aria-hidden="true">
      {Array.from({ length: STEPS }, (_, i) => <span key={i} className={`h-1.5 rounded-full ${i <= step ? "bg-[var(--rose)]" : "bg-[var(--blush)]"}`} />)}
    </div>}

    {step === 0 && <section className={card} aria-labelledby="q-nume">
      <h1 id="q-nume" className={h1}>Cum să-ți spun?</h1>
      <p className="mt-3 leading-7 text-[var(--muted)]">Durează două minute. Răspunsurile rămân pe acest dispozitiv și le poți schimba oricând. Poți lăsa numele gol.</p>
      <div className="mt-6"><TextLine id="onb-nume" label="Numele sau cum vrei să te strig" value={name} onChange={(v) => setName(v.slice(0, 40))} /></div>
      <button type="button" onClick={next} className="button-primary mt-6">Continuă</button>
    </section>}

    {step === 1 && <section className={card} aria-labelledby="q-focus">
      <h1 id="q-focus" className={h1}>Ce te apasă cel mai tare acum?</h1>
      <p className="mt-3 leading-7 text-[var(--muted)]">Alege până la {MAX_FOCUS}. Cartea își pregătește sertarele după ele; restul rămâne ascuns.</p>
      <div className="mt-6 grid gap-2" role="group" aria-label="Ce te apasă">
        {focusOptions.map((o) => {
          const on = focus.includes(o.id);
          const locked = !on && focus.length >= MAX_FOCUS;
          return <button key={o.id} type="button" aria-pressed={on} disabled={locked} onClick={() => toggleFocus(o.id)}
            className={`rounded-2xl border-2 p-4 text-left transition-colors disabled:opacity-45 ${on ? "border-[var(--wine)] bg-[var(--blush)]/60" : "border-[var(--line)] bg-white"}`}>
            <span className="block font-extrabold text-[var(--wine)]">{o.label}</span>
            <span className="mt-0.5 block text-sm text-[var(--muted)]">{o.line}</span>
          </button>;
        })}
      </div>
      <div className="mt-6 flex flex-wrap items-center gap-4">
        <button type="button" onClick={next} className="button-primary">{focus.length === 0 ? "Nu știu, merg mai departe" : "Continuă"}</button>
      </div>
    </section>}

    {step === 2 && <section className={card} aria-labelledby="q-ton">
      <h1 id="q-ton" className={h1}>Cum îți place să ți se vorbească?</h1>
      <p className="mt-3 leading-7 text-[var(--muted)]">Aceeași idee, spusă diferit. Alegi ce te liniștește.</p>
      <div className="mt-6 grid gap-2" role="radiogroup" aria-label="Ton">
        {toneIds.map((t) => <button key={t} type="button" role="radio" aria-checked={tone === t} onClick={() => setTone(t)}
          className={`rounded-2xl border-2 p-4 text-left transition-colors ${tone === t ? "border-[var(--wine)] bg-[var(--blush)]/60" : "border-[var(--line)] bg-white"}`}>
          <span className="block font-extrabold text-[var(--wine)]">{toneLabels[t].title}</span>
          <span className="mt-0.5 block text-[var(--muted)]">„{toneLabels[t].sample}”</span>
        </button>)}
      </div>
      <button type="button" onClick={next} className="button-primary mt-6">Continuă</button>
    </section>}

    {step === 3 && <section className={card} aria-labelledby="q-moment">
      <h1 id="q-moment" className={h1}>Când scrii de obicei?</h1>
      <p className="mt-3 leading-7 text-[var(--muted)]">Cartea se deschide pe pagina potrivită: Azi dimineața, Seara seara.</p>
      <div className="mt-6 grid gap-2" role="radiogroup" aria-label="Când scrii">
        {momentIds.map((m) => <button key={m} type="button" role="radio" aria-checked={moment === m} onClick={() => setMoment(m)}
          className={`rounded-2xl border-2 p-4 text-left font-extrabold text-[var(--wine)] transition-colors ${moment === m ? "border-[var(--wine)] bg-[var(--blush)]/60" : "border-[var(--line)] bg-white"}`}>{momentLabels[m]}</button>)}
      </div>
      <button type="button" onClick={next} className="button-primary mt-6">Continuă</button>
    </section>}

    {step === 4 && <section className={card} aria-labelledby="q-culoare">
      <h1 id="q-culoare" className={h1}>Ce culori te odihnesc?</h1>
      <p className="mt-3 leading-7 text-[var(--muted)]">Se schimbă pe loc, ca să vezi cum arată.</p>
      <div className="mt-6 grid grid-cols-2 gap-3" role="radiogroup" aria-label="Paletă">
        {paletteIds.map((p) => <button key={p} type="button" role="radio" aria-checked={palette === p} onClick={() => setPalette(p)}
          className={`rounded-2xl border-2 p-4 text-left transition-colors ${palette === p ? "border-[var(--wine)]" : "border-[var(--line)]"} bg-white`}>
          <span className="flex gap-1.5" aria-hidden="true">{paletteInfo[p].swatch.map((c) => <span key={c} className="size-7 rounded-full border border-black/10" style={{ backgroundColor: c }} />)}</span>
          <span className="mt-3 block font-extrabold text-[var(--wine)]">{paletteInfo[p].title}</span>
        </button>)}
      </div>
      <button type="button" onClick={next} className="button-primary mt-6">Continuă</button>
    </section>}

    {step === 5 && <section className={card} aria-labelledby="q-castiguri">
      <h1 id="q-castiguri" className={h1}>Ce e un câștig mic pentru tine?</h1>
      <p className="mt-3 leading-7 text-[var(--muted)]">Lucruri pe care le bifezi când le faci, fără scor. Alege până la {MAX_WINS} sau scrie unul al tău.</p>
      <div className="mt-6 flex flex-wrap gap-2" role="group" aria-label="Câștiguri mici">
        {[...winSuggestions, ...wins.filter((w) => !winSuggestions.includes(w))].map((w) => {
          const on = wins.includes(w);
          return <button key={w} type="button" className="chip" aria-pressed={on} disabled={!on && wins.length >= MAX_WINS} onClick={() => toggleWin(w)}>{w}</button>;
        })}
      </div>
      <div className="mt-5"><TextLine id="onb-castig" label="Al tău (opțional)" value={own} onChange={(v) => setOwn(v.slice(0, 60))} placeholder="De exemplu: Am scris o propoziție" /></div>
      <button type="button" onClick={next} className="button-primary mt-6">Gata, văd ce am ales</button>
    </section>}

    {step === STEPS && <section className={card} aria-labelledby="q-gata">
      <h1 id="q-gata" className={h1}>{name.trim() !== "" ? `Gata, ${name.trim()}.` : "Gata."} Ți-am pregătit asta:</h1>
      <ul className="mt-6 space-y-3">
        <li className="rounded-2xl bg-white p-4"><span className="block font-extrabold text-[var(--wine)]">Cartea, în tonul tău</span><span className="mt-0.5 block text-[var(--muted)]">Azi, Acum, Seara și Resetare. Ton: {toneLabels[tone].title.toLowerCase()}. {moment === "dimineata" ? "Se deschide pe Azi." : moment === "seara" ? "Se deschide pe Seara." : "Dimineața se deschide pe Azi, seara pe Seara."}</span></li>
        {plan.modules.map((m) => <li key={m} className="rounded-2xl bg-white p-4"><span className="block font-extrabold text-[var(--wine)]">{moduleLabels[m].title}</span><span className="mt-0.5 block text-[var(--muted)]">{moduleLabels[m].line}</span></li>)}
        {plan.enabled.map((d) => { const def = drawerById(d); return def ? <li key={d} className="rounded-2xl bg-white p-4"><span className="block font-extrabold text-[var(--wine)]">Sertar: {def.title}</span><span className="mt-0.5 block text-[var(--muted)]">{def.line}</span></li> : null; })}
      </ul>
      <p className="mt-4 text-sm leading-6 text-[var(--muted)]">Poți porni sau opri orice din Setări. Ce scrii rămâne pe acest dispozitiv.</p>
      <button type="button" onClick={() => onDone(build())} className="button-primary mt-6">Deschid Cartea</button>
    </section>}

    {step < STEPS && <p className="text-center"><button type="button" onClick={() => onDone({ ...initial, onboarded: true })} className="min-h-11 text-sm font-bold text-[var(--muted)] underline underline-offset-4">Sari peste, folosesc varianta simplă</button></p>}
  </div>;
}
