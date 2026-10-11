"use client";
// Statistici blânde: calendarul lunii, câte zile din fiecare fel, cuvintele care revin. Fără serii de zile și fără scoruri.
import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { monthNames } from "@/lib/carte/dates";
import { entryTexts, type DayEntry } from "@/lib/carte/entries";
import { levelColors, levelCounts, levelLabels, monthGrid, topWords, type Level } from "@/lib/carte/stats";
import { listEntries } from "@/lib/carte/storage";

const weekdays = ["L", "M", "M", "J", "V", "S", "D"];
const order: Level[] = ["buna", "obosita", "grea"];

export function StatsView() {
  const [entries, setEntries] = useState<DayEntry[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [view, setView] = useState<{ year: number; month: number } | null>(null);

  useEffect(() => {
    const now = new Date();
    setView({ year: now.getFullYear(), month: now.getMonth() + 1 });
    listEntries().then(setEntries).catch(() => { setFailed(true); setEntries([]); });
  }, []);

  const weeks = useMemo(() => (view && entries ? monthGrid(view.year, view.month, entries) : []), [view, entries]);
  const prefix = view ? `${view.year}-${String(view.month).padStart(2, "0")}-` : "";
  const inMonth = useMemo(() => (entries ?? []).filter((e) => e.date.startsWith(prefix)), [entries, prefix]);
  const monthCounts = levelCounts(inMonth);
  const totalCounts = levelCounts(entries ?? []);
  const words = useMemo(() => topWords((entries ?? []).flatMap(entryTexts), 10), [entries]);

  if (!view || !entries) return <p className="py-10 text-center text-[var(--muted)]" aria-busy="true">Se deschide…</p>;

  function shift(delta: number) {
    setView((v) => {
      if (!v) return v;
      const index = v.year * 12 + (v.month - 1) + delta;
      return { year: Math.floor(index / 12), month: (index % 12) + 1 };
    });
  }

  const withLevel = (entries ?? []).filter((e) => e.level).length;

  return <div className="space-y-8">
    <header>
      <h1 className="display text-3xl font-semibold leading-tight text-[var(--wine)] sm:text-4xl">Statistici</h1>
      <p className="mt-2 leading-7 text-[var(--muted)]">Doar ce ai scris tu, calculat pe acest dispozitiv. Nu contează câte zile la rând. Contează că ai o imagine a lor.</p>
    </header>
    {failed && <p role="alert" className="rounded-2xl border hairline bg-[var(--paper)] p-4 text-sm text-[var(--muted)]">Nu am putut citi datele de pe acest dispozitiv. Într-o fereastră privată, ce scrii nu se păstrează.</p>}

    <section aria-labelledby="calendar" className="rounded-2xl border hairline bg-[var(--paper)] p-5 sm:p-6">
      <div className="flex items-center justify-between gap-2">
        <button type="button" onClick={() => shift(-1)} aria-label="Luna precedentă" className="grid size-11 place-items-center rounded-full border hairline bg-white text-[var(--wine)]"><ArrowLeft size={18} aria-hidden="true" /></button>
        <h2 id="calendar" className="display text-2xl font-semibold capitalize text-[var(--wine)]">{monthNames[view.month - 1]} {view.year}</h2>
        <button type="button" onClick={() => shift(1)} aria-label="Luna următoare" className="grid size-11 place-items-center rounded-full border hairline bg-white text-[var(--wine)]"><ArrowRight size={18} aria-hidden="true" /></button>
      </div>
      <div className="mt-4 grid grid-cols-7 gap-1.5 text-center text-xs font-bold text-[var(--muted)]" aria-hidden="true">{weekdays.map((d, i) => <span key={i}>{d}</span>)}</div>
      <div className="mt-1.5 space-y-1.5">
        {weeks.map((week, wi) => <div key={wi} className="grid grid-cols-7 gap-1.5">
          {week.map((cell, ci) => cell
            ? <Link key={ci} href={`/carte#${cell.date}`} aria-label={`${cell.day} ${monthNames[view.month - 1]}${cell.level ? `, ${levelLabels[cell.level]}` : ""}`}
                style={cell.level ? { backgroundColor: levelColors[cell.level].bg, color: levelColors[cell.level].fg } : undefined}
                className={`grid aspect-square place-items-center rounded-xl text-sm font-bold ${cell.level ? "" : "border hairline bg-white text-[var(--muted)]"}`}>{cell.day}</Link>
            : <span key={ci} aria-hidden="true" />)}
        </div>)}
      </div>
      <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-[var(--muted)]">
        {order.map((l) => <li key={l} className="flex items-center gap-2"><span aria-hidden="true" className="size-4 rounded-md border hairline" style={{ backgroundColor: levelColors[l].bg }} />{levelLabels[l]}</li>)}
      </ul>
    </section>

    <section aria-labelledby="zile" className="rounded-2xl border hairline bg-[var(--paper)] p-5 sm:p-6">
      <h2 id="zile" className="display text-2xl font-semibold text-[var(--wine)]">Cum au fost zilele</h2>
      {withLevel === 0
        ? <p className="mt-3 leading-7 text-[var(--muted)]">Încă nu ai ales niciun nivel. Când o faci, le vei vedea aici.</p>
        : <div className="mt-4 overflow-x-auto"><table className="w-full text-left text-base">
            <caption className="sr-only">Numărul de zile pe niveluri, în luna aleasă și în total</caption>
            <thead><tr className="text-sm text-[var(--muted)]"><th scope="col" className="pb-2 font-bold">Nivel</th><th scope="col" className="pb-2 text-right font-bold capitalize">{monthNames[view.month - 1]}</th><th scope="col" className="pb-2 text-right font-bold">În total</th></tr></thead>
            <tbody>{order.map((l) => <tr key={l} className="border-t hairline"><th scope="row" className="py-2.5 font-bold text-[var(--wine)]">{levelLabels[l]}</th><td className="py-2.5 text-right">{monthCounts[l]}</td><td className="py-2.5 text-right">{totalCounts[l]}</td></tr>)}</tbody>
          </table></div>}
    </section>

    <section aria-labelledby="cuvinte" className="rounded-2xl border hairline bg-[var(--paper)] p-5 sm:p-6">
      <h2 id="cuvinte" className="display text-2xl font-semibold text-[var(--wine)]">Cuvintele care revin</h2>
      {words.length === 0
        ? <p className="mt-3 leading-7 text-[var(--muted)]">Când vei fi scris câteva zile, vei vedea aici ce cuvinte se repetă în paginile tale.</p>
        : <ul className="mt-4 flex flex-wrap gap-2">{words.map((w) => <li key={w.word} className="rounded-full border hairline bg-white px-4 py-2 text-sm font-bold text-[var(--wine)]">{w.word} <span className="font-normal text-[var(--muted)]">{w.count}</span></li>)}</ul>}
      <p className="mt-4 text-sm text-[var(--muted)]">Sunt doar cuvinte numărate. Ce înseamnă pentru tine, hotărăști tu.</p>
    </section>
  </div>;
}
