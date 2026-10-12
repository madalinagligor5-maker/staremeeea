"use client";
// Modulele mici din pagina zilei. Se activează din Setări sau din configurarea de la început.
// Nimic aici nu numără, nu punctează și nu cere ceva zilnic.
import { Pause, Play, RotateCcw, Wind } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { PageFields } from "@/lib/carte/entries";
import { minutesFor } from "@/lib/carte/profile";
import type { Level } from "@/lib/carte/stats";
import { Panel } from "./fields";

type FieldProps = { fields: PageFields; set: (key: string, value: string | boolean) => void };

const text = (fields: PageFields, key: string) => (typeof fields[key] === "string" ? (fields[key] as string) : "");
const splitList = (value: string) => value.split(", ").filter((x) => x !== "");

const feelings = ["Tensiune", "Oboseală", "Neliniște", "Frică", "Ceață", "Greutate", "Liniște", "Altceva"];
const states = ["Liniște", "Claritate", "Blândețe", "Răbdare", "Curaj mic"];

/** Un minut de respirație, în ritm lent: 4 secunde inspir, 6 expir, de 6 ori. */
export function BreathingPause() {
  const [tick, setTick] = useState<number | null>(null);
  useEffect(() => {
    if (tick === null || tick >= 60) return;
    const id = setTimeout(() => setTick((t) => (t === null ? null : t + 1)), 1000);
    return () => clearTimeout(id);
  }, [tick]);

  const running = tick !== null && tick < 60;
  const inhale = running && (tick as number) % 10 < 4;
  const label = tick === null ? "Un minut, în ritm lent." : tick >= 60 ? "Gata. Poți rămâne aici cât vrei." : inhale ? "Inspiră" : "Expiră încet";
  const scale = running ? (inhale ? 1 : 0.62) : 0.78;

  return <div className="flex flex-col items-center gap-4 rounded-2xl bg-[var(--blush)]/60 p-5 text-center">
    <div className="grid size-40 place-items-center" aria-hidden="true">
      <div className="breath" style={{ transform: `scale(${scale})`, transition: `transform ${inhale ? 4 : 6}s ease-in-out` }} />
    </div>
    <p role="status" aria-live="polite" className="min-h-6 font-bold text-[var(--wine)]">{label}</p>
    {!running && <button type="button" onClick={() => setTick(0)} className="button-secondary"><Wind size={18} aria-hidden="true" />{tick === null ? "Începe pauza" : "Încă o dată"}</button>}
    {running && <button type="button" onClick={() => setTick(null)} className="text-sm font-bold text-[var(--rose)] underline underline-offset-4">Opresc</button>}
  </div>;
}

/** Check-in de 30 de secunde: ce simt în corp și în ce stare aleg să intru. */
export function BodyCheckin({ fields, set }: FieldProps) {
  const feel = splitList(text(fields, "corp_simt"));
  const into = text(fields, "corp_intru");
  const [pause, setPause] = useState(false);
  const toggleFeel = (label: string) => set("corp_simt", (feel.includes(label) ? feel.filter((x) => x !== label) : [...feel, label]).join(", "));
  return <Panel title="Cum sunt în corp" hint="Treizeci de secunde. Alegi ce se potrivește, nu trebuie să explici.">
    <p className="text-sm font-bold text-[var(--wine)]">Ce simt acum</p>
    <div className="flex flex-wrap gap-2" role="group" aria-label="Ce simt acum">
      {feelings.map((f) => <button key={f} type="button" className="chip" aria-pressed={feel.includes(f)} onClick={() => toggleFeel(f)}>{f}</button>)}
    </div>
    <p className="pt-2 text-sm font-bold text-[var(--wine)]">În ce stare aleg să intru</p>
    <div className="flex flex-wrap gap-2" role="group" aria-label="În ce stare aleg să intru">
      {states.map((s) => <button key={s} type="button" className="chip" aria-pressed={into === s} onClick={() => set("corp_intru", into === s ? "" : s)}>{s}</button>)}
    </div>
    <div className="pt-3">
      {!pause
        ? <button type="button" onClick={() => setPause(true)} className="button-secondary"><Wind size={18} aria-hidden="true" />O pauză de un minut</button>
        : <BreathingPause />}
    </div>
  </Panel>;
}

/** Lucruri mici făcute pentru tine, la vedere. Fără total, fără procent. */
export function Wins({ wins, fields, set }: FieldProps & { wins: readonly string[] }) {
  return <Panel title="Câștiguri mici" hint="Contează și lucrurile mici. Bifează ce ai făcut azi pentru tine.">
    {wins.length === 0
      ? <p className="text-sm text-[var(--muted)]">Nu ai ales încă niciun câștig. Le scrii în Setări.</p>
      : <div className="flex flex-wrap gap-2" role="group" aria-label="Câștiguri mici">
        {wins.map((w, i) => <button key={`${i}-${w}`} type="button" className="chip" aria-pressed={fields[`castig_${i}`] === true} onClick={() => set(`castig_${i}`, fields[`castig_${i}`] !== true)}>{w}</button>)}
      </div>}
  </Panel>;
}

const pad2 = (n: number) => String(n).padStart(2, "0");
const R = 44;
const C = 2 * Math.PI * R;

/** Cronometru blând pentru un singur lucru. Fără sunet. La final, doar un mesaj și, dacă telefonul poate, o vibrație scurtă. */
export function FocusTimer({ level, task }: { level: Level | null; task: string }) {
  const [minutes, setMinutes] = useState(() => minutesFor(level));
  const [chosen, setChosen] = useState(false);
  const [left, setLeft] = useState(() => minutesFor(level) * 60000);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const endsAt = useRef(0);
  const runningRef = useRef(false);
  runningRef.current = running;

  // Până alege singură durata, ea urmează nivelul zilei. O pauză nu resetează nimic.
  useEffect(() => {
    if (chosen || runningRef.current) return;
    const m = minutesFor(level);
    setMinutes(m);
    setLeft(m * 60000);
    setDone(false);
  }, [level, chosen]);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      const rest = endsAt.current - Date.now();
      if (rest <= 0) {
        clearInterval(id);
        setLeft(0);
        setRunning(false);
        setDone(true);
        try { navigator.vibrate?.(200); } catch { /* fără vibrație */ }
      } else setLeft(rest);
    }, 250);
    return () => clearInterval(id);
  }, [running]);

  function start() {
    const from = left > 0 ? left : minutes * 60000;
    endsAt.current = Date.now() + from;
    setLeft(from);
    setDone(false);
    setRunning(true);
  }
  function reset(m: number) {
    setRunning(false);
    setDone(false);
    setMinutes(m);
    setLeft(m * 60000);
  }
  function more() {
    endsAt.current = Date.now() + 5 * 60000;
    setLeft(5 * 60000);
    setDone(false);
    setRunning(true);
  }

  const secs = Math.ceil(left / 1000);
  const progress = Math.max(0, Math.min(1, left / (minutes * 60000)));
  const options = [5, 10, 25];

  return <Panel title={`${minutes} minute pentru un singur lucru`} hint={task.trim() !== "" ? task.trim() : "Alegi lucrul de mai sus, apoi pornești. Te poți opri oricând."}>
    <div className="flex items-center gap-5">
      <div className="relative size-28 shrink-0">
        <svg viewBox="0 0 100 100" className="size-full -rotate-90" aria-hidden="true">
          <circle cx="50" cy="50" r={R} fill="none" stroke="var(--blush)" strokeWidth="8" />
          <circle cx="50" cy="50" r={R} fill="none" stroke="var(--rose)" strokeWidth="8" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - progress)} />
        </svg>
        <span className="absolute inset-0 grid place-items-center font-extrabold tabular-nums text-[var(--wine)]" role="timer" aria-label={`Au rămas ${Math.floor(secs / 60)} minute și ${secs % 60} secunde`}>{pad2(Math.floor(secs / 60))}:{pad2(secs % 60)}</span>
      </div>
      <div className="min-w-0 space-y-3">
        <div className="flex flex-wrap gap-2">
          {!running
            ? <button type="button" onClick={start} className="button-primary"><Play size={18} aria-hidden="true" />{left > 0 && left < minutes * 60000 ? "Continuă" : "Pornesc"}</button>
            : <button type="button" onClick={() => setRunning(false)} className="button-primary"><Pause size={18} aria-hidden="true" />Pauză</button>}
          <button type="button" onClick={() => reset(minutes)} className="button-secondary" aria-label="De la capăt"><RotateCcw size={18} aria-hidden="true" /></button>
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Cât timp">
          {options.map((m) => <button key={m} type="button" className="chip" aria-pressed={minutes === m} disabled={running} onClick={() => { setChosen(true); reset(m); }}>{m} min</button>)}
        </div>
      </div>
    </div>
    {done && <div role="status" className="rounded-2xl bg-[var(--blush)]/70 p-4">
      <p className="font-bold text-[var(--wine)]">Ai ajuns până aici. Poți opri acum.</p>
      <button type="button" onClick={more} className="mt-2 text-sm font-bold text-[var(--rose)] underline underline-offset-4">Încă 5 minute</button>
    </div>}
  </Panel>;
}
