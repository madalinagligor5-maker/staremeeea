"use client";

import { ArrowLeft, ArrowRight, Brain, Check, Clock3, Feather, Flower2, MoonStar, Play, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";

const rituals = [
  { id: "reset", title: "Reset pentru mintea plină", need: "Copleșire", minutes: 3, icon: Brain, tone: "rose", body: "Închide pentru o clipă toate listele. Așază tălpile pe podea și numește trei lucruri pe care le poți lăsa pentru mai târziu." },
  { id: "breath", title: "Respirația în patru colțuri", need: "Calm", minutes: 4, icon: Flower2, tone: "sage", body: "Inspiră blând până la patru. Fă o pauză scurtă. Expiră până la patru. Repetă de patru ori, fără să forțezi ritmul." },
  { id: "one", title: "Un singur lucru", need: "Focus", minutes: 5, icon: Sparkles, tone: "plum", body: "Scrie lucrul care ar face ziua puțin mai ușoară. Împarte-l în primul pas care încape în cinci minute. Doar acel pas contează acum." },
  { id: "soft", title: "Încheiere blândă de zi", need: "Somn", minutes: 7, icon: MoonStar, tone: "rose", body: "Notează ce ai dus astăzi, chiar dacă a rămas neterminat. Alege un gând pe care îl lași aici până mâine." },
  { id: "ground", title: "Înapoi în corp", need: "Anxietate", minutes: 2, icon: Feather, tone: "sage", body: "Observă cinci lucruri pe care le vezi, patru pe care le atingi și trei pe care le auzi. Nu trebuie să schimbi nimic." },
  { id: "kind", title: "Mesaj pentru mine", need: "Grijă de sine", minutes: 6, icon: Feather, tone: "plum", body: "Scrie-ți trei propoziții așa cum i-ai vorbi unei persoane dragi care trece prin aceeași zi." },
] as const;
const filters = ["Toate", "Calm", "Focus", "Copleșire", "Anxietate", "Somn", "Grijă de sine"];

export function RitualLibrary() {
  const [filter, setFilter] = useState("Toate");
  const [selected, setSelected] = useState<(typeof rituals)[number] | null>(null);
  const [complete, setComplete] = useState(false);
  const visible = useMemo(() => filter === "Toate" ? rituals : rituals.filter(item => item.need === filter), [filter]);

  if (selected) {
    const Icon = selected.icon;
    return <main className="ritual-reader"><div className="ritual-reader-inner"><button onClick={() => { setSelected(null); setComplete(false); }} className="inline-flex items-center gap-2 text-sm font-bold text-[var(--rose-dark)]"><ArrowLeft size={16} /> Biblioteca de ritualuri</button>{complete ? <div className="py-16 text-center"><span className="completion-mark mx-auto"><Check /></span><p className="eyebrow mt-7">Este suficient pentru acum</p><h1 className="display mx-auto mt-3 max-w-2xl text-6xl font-semibold leading-none text-[var(--wine)]">Ai făcut loc pentru tine.</h1><button onClick={() => { setSelected(null); setComplete(false); }} className="button-primary mt-9">Alege alt ritual</button></div> : <div className="py-12 sm:py-16"><Icon className="text-[var(--rose)]" size={30} strokeWidth={1.4} /><p className="eyebrow mt-7">{selected.need} · {selected.minutes} minute</p><h1 className="display mt-4 max-w-3xl text-5xl font-semibold leading-[.95] text-[var(--wine)] sm:text-7xl">{selected.title}</h1><p className="mt-9 max-w-2xl text-lg leading-9 text-[var(--muted)]">{selected.body}</p><div className="mt-10 flex flex-wrap gap-3"><button onClick={() => setComplete(true)} className="button-primary"><Play size={17} /> Am făcut ritualul</button><button onClick={() => setSelected(null)} className="button-secondary">Păstrează pentru mai târziu</button></div></div>}</div></main>;
  }

  return <main className="container-shell py-10 sm:py-14"><div className="library-hero"><div><p className="eyebrow">Biblioteca ta</p><h1 className="display mt-4 max-w-4xl text-[clamp(4rem,8vw,7.5rem)] font-semibold leading-[.82] tracking-[-.055em] text-[var(--wine)]">Un ritual pentru<br /><em className="font-medium text-[var(--rose)]">momentul de acum.</em></h1></div><p>Alege după ce ai nevoie, nu după cât crezi că ar trebui să faci. Fiecare ritual este scurt, ghidat și poate fi oprit oricând.</p></div><div className="filter-row" aria-label="Filtrează ritualurile">{filters.map(item => <button key={item} aria-pressed={filter === item} onClick={() => setFilter(item)} className={filter === item ? "is-active" : ""}>{item}</button>)}</div><div className="ritual-grid">{visible.map((item, index) => { const Icon = item.icon; return <button onClick={() => setSelected(item)} key={item.id} className={`ritual-card tone-${item.tone} ${index === 0 ? "is-large" : ""}`}><div className="flex items-start justify-between"><Icon size={25} strokeWidth={1.4} /><span className="flex items-center gap-1 text-xs font-semibold"><Clock3 size={13} />{item.minutes} min</span></div><div className="mt-auto text-left"><p className="eyebrow">{item.need}</p><h2 className="display mt-3 text-3xl font-semibold leading-none sm:text-4xl">{item.title}</h2><span className="mt-6 inline-flex items-center gap-2 text-sm font-bold">Deschide ritualul <ArrowRight size={16} /></span></div></button>; })}</div></main>;
}
