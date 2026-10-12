"use client";
// Cartea: pagina zilei. Se deschide la azi; se poate merge înainte și înapoi între zile.
// Totul se salvează automat, în IndexedDB, pe acest dispozitiv. Nimic nu se trimite pe server.
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { emptyEntry, entryTexts, type DayEntry, type PageFields } from "@/lib/carte/entries";
import { daysBetween, formatLong, isIsoDate, shiftDate, todayLocal } from "@/lib/carte/dates";
import { defaultPage, greeting, subline } from "@/lib/carte/profile";
import type { Settings } from "@/lib/carte/settings";
import { levelColors, levelLabels, type Level } from "@/lib/carte/stats";
import { overLimit, pickedForToday, placePicked } from "@/lib/carte/today";
import { getEntry, listEntries, requestPersistence, saveEntry } from "@/lib/carte/storage";
import { AcumPage, AziPage, ResetPage, SearaPage } from "./pages";

type StoredPage = "azi" | "acum" | "seara"; // pagini care au câmpuri proprii în intrarea zilei
type PageKey = StoredPage | "resetare"; // Resetarea își ține câmpurile în pagina Acum (chei reset_*)

// Dacă ultima pagină are cel puțin atâtea zile, Cartea se deschide pe Resetare.
const PAUSE_DAYS = 3;
type SaveState = "idle" | "saving" | "saved" | "error";

const tabs: { id: PageKey; label: string }[] = [
  { id: "azi", label: "Azi" },
  { id: "acum", label: "Acum" },
  { id: "seara", label: "Seara" },
  { id: "resetare", label: "Resetare" },
];

const levels: { id: Level; hint: string }[] = [
  { id: "buna", hint: "pagina întreagă" },
  { id: "obosita", hint: "trei lucruri" },
  { id: "grea", hint: "un singur lucru" },
];

function dateFromHash(): string {
  const hash = window.location.hash.replace(/^#/, "");
  return isIsoDate(hash) ? hash : todayLocal();
}

export function DayBook({ settings }: { settings: Settings }) {
  const [date, setDate] = useState<string>("");
  const [entry, setEntry] = useState<DayEntry | null>(null);
  const [page, setPage] = useState<PageKey>(() => defaultPage(settings.moment, new Date().getHours()));
  const [yesterday, setYesterday] = useState<Level | null>(null);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [pauseDays, setPauseDays] = useState<number | null>(null);
  const entryRef = useRef<DayEntry | null>(null);
  const pending = useRef<DayEntry | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Scrie pe dispozitiv ce a rămas nesalvat.
  const flush = useCallback(() => {
    if (timer.current) { clearTimeout(timer.current); timer.current = null; }
    const toSave = pending.current;
    if (!toSave) return;
    pending.current = null;
    saveEntry(toSave).then(() => setSaveState("saved")).catch(() => setSaveState("error"));
  }, []);

  // Ziua de pornire: din adresă (#2026-10-09) sau azi.
  useEffect(() => {
    setDate(dateFromHash());
    const onHash = () => { flush(); setDate(dateFromHash()); };
    window.addEventListener("hashchange", onHash);
    void requestPersistence();
    return () => window.removeEventListener("hashchange", onHash);
  }, [flush]);

  // După o pauză, Cartea se deschide pe Resetare, o singură dată și doar pe ziua de azi.
  useEffect(() => {
    let cancelled = false;
    listEntries().then((all) => {
      if (cancelled) return;
      const today = todayLocal();
      const prev = all.find((e) => e.date === shiftDate(today, -1));
      setYesterday(prev ? prev.level : null);
      const used = all.filter((e) => e.date < today && (e.level !== null || entryTexts(e).length > 0)).map((e) => e.date).sort();
      const last = used[used.length - 1];
      if (!last) return;
      const gap = daysBetween(last, today);
      if (gap >= PAUSE_DAYS) {
        setPauseDays(gap);
        if (dateFromHash() === today) setPage("resetare");
      }
    }).catch(() => { /* fără istoric, nu apare Resetarea singură */ });
    return () => { cancelled = true; };
  }, []);

  // Încarcă intrarea zilei alese.
  useEffect(() => {
    if (!date) return;
    let cancelled = false;
    entryRef.current = null;
    setEntry(null);
    setSaveState("idle");
    getEntry(date)
      .then((found) => { if (!cancelled) { const e = found ?? emptyEntry(date); entryRef.current = e; setEntry(e); } })
      .catch(() => { if (!cancelled) { const e = emptyEntry(date); entryRef.current = e; setEntry(e); setSaveState("error"); } });
    return () => { cancelled = true; };
  }, [date]);

  // Nu pierde ce ai scris când închizi sau ascunzi aplicația.
  useEffect(() => {
    const onHide = () => { if (document.visibilityState === "hidden") flush(); };
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("pagehide", flush);
    return () => { document.removeEventListener("visibilitychange", onHide); window.removeEventListener("pagehide", flush); flush(); };
  }, [flush]);

  const apply = useCallback((change: (current: DayEntry) => DayEntry) => {
    const current = entryRef.current;
    if (!current) return;
    const next: DayEntry = { ...change(current), updatedAt: Date.now() };
    entryRef.current = next;
    pending.current = next;
    setEntry(next);
    setSaveState("saving");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(flush, 500);
  }, [flush]);

  const patchPage = (which: StoredPage, patch: PageFields) => apply((e) => ({ ...e, [which]: { ...e[which], ...patch } }) as DayEntry);
  const setLevel = (level: Level) => apply((e) => ({ ...e, level: e.level === level ? null : level }));

  function startFromReset() {
    apply((e) => {
      const one = typeof e.acum.reset_unu === "string" ? e.acum.reset_unu.trim() : "";
      const hasOne = typeof e.azi.grea_lucru === "string" && e.azi.grea_lucru.trim() !== "";
      return { ...e, level: "grea", azi: one !== "" && !hasOne ? { ...e.azi, grea_lucru: one } : e.azi };
    });
    setPage("azi");
  }

  function sendToToday() {
    apply((e) => placePicked(e));
    setPage("azi");
  }

  function go(next: string) {
    if (!isIsoDate(next) || next === date) return;
    flush();
    window.history.replaceState(null, "", `#${next}`);
    setDate(next);
  }

  if (!date) return <div className="min-h-[60vh]" aria-busy="true" />;
  const today = todayLocal();
  const fieldsFor = (which: StoredPage): PageFields => (entry ? entry[which] : {});
  const common = (which: StoredPage) => ({
    fields: fieldsFor(which),
    set: (key: string, value: string | boolean) => patchPage(which, { [key]: value }),
    setMany: (patch: PageFields) => patchPage(which, patch),
  });

  const isToday = date === today;
  const level = entry?.level ?? null;
  const title = isToday ? greeting(settings.name, new Date().getHours()) : formatLong(date);

  return <div className="space-y-6">
    <section className="day-hero" aria-label="Ziua">
      <div className="relative z-10 flex items-center gap-4">
        <div className="min-w-0 flex-1">
          {isToday && <p className="text-sm font-bold text-[var(--rose-dark)] first-letter:uppercase">{formatLong(date)}</p>}
          <h1 className="display mt-1 text-3xl font-semibold leading-tight text-[var(--wine)] first-letter:uppercase sm:text-4xl">{title}</h1>
          <p className="mt-2 leading-7 text-[var(--muted)]">{subline(level, settings.tone, isToday ? yesterday : null)}</p>
        </div>
        <div className="orb" aria-hidden="true"><div className="orb-core" data-level={level ?? "none"} /></div>
      </div>
      <div className="relative z-10 mt-5 flex items-center justify-between gap-2">
        <button type="button" onClick={() => go(shiftDate(date, -1))} aria-label="Ziua precedentă" className="grid size-12 place-items-center rounded-full border hairline bg-white text-[var(--wine)]"><ArrowLeft size={20} aria-hidden="true" /></button>
        <div className="flex min-w-0 flex-col items-center gap-1">
          {!isToday && <button type="button" onClick={() => go(today)} className="text-sm font-bold text-[var(--rose)] underline underline-offset-4">Înapoi la azi</button>}
          <label className="flex items-center gap-2 text-sm text-[var(--muted)]">Mergi la o zi
            <input type="date" value={date} onChange={(e) => go(e.target.value)} className="min-h-10 rounded-lg border hairline bg-white px-2 text-[var(--ink)]" />
          </label>
        </div>
        <button type="button" onClick={() => go(shiftDate(date, 1))} aria-label="Ziua următoare" className="grid size-12 place-items-center rounded-full border hairline bg-white text-[var(--wine)]"><ArrowRight size={20} aria-hidden="true" /></button>
      </div>
    </section>

    <div role="radiogroup" aria-label="Cum ești azi?" className="space-y-2">
      <p className="text-sm font-bold text-[var(--wine)]">Cum ești azi?</p>
      <div className="grid grid-cols-3 gap-2">
        {levels.map(({ id, hint }) => {
          const on = entry?.level === id;
          const colors = levelColors[id];
          return <button key={id} type="button" role="radio" aria-checked={on} disabled={!entry} onClick={() => setLevel(id)}
            style={on ? { backgroundColor: colors.bg, color: colors.fg, borderColor: "var(--wine)" } : undefined}
            className={`flex min-h-20 flex-col items-center justify-center rounded-2xl border-2 px-2 py-3 text-center transition-colors ${on ? "" : "border-[var(--line)] bg-white text-[var(--wine)]"}`}>
            <span className="text-sm font-extrabold">{levelLabels[id]}</span>
            <span className={`mt-0.5 text-xs ${on ? "opacity-90" : "text-[var(--muted)]"}`}>{hint}</span>
          </button>;
        })}
      </div>
    </div>

    <div role="tablist" aria-label="Paginile zilei" className="grid grid-cols-4 gap-1 rounded-full bg-[var(--blush)] p-1">
      {tabs.map((t) => <button key={t.id} type="button" role="tab" id={`tab-${t.id}`} aria-selected={page === t.id} aria-controls="pagina-zilei" onClick={() => setPage(t.id)}
        className={`min-h-11 rounded-full px-1 text-xs font-extrabold transition-colors sm:text-sm ${page === t.id ? "bg-[var(--wine)] text-white" : "text-[var(--wine)]"}`}>{t.label}</button>)}
    </div>

    <div id="pagina-zilei" role="tabpanel" aria-labelledby={`tab-${page}`} aria-busy={!entry}>
      {!entry ? <p className="py-10 text-center text-[var(--muted)]">Se deschide pagina…</p>
        : page === "azi" ? <AziPage {...common("azi")} level={entry.level} modules={settings.modules} wins={settings.wins.filter((w) => w.trim() !== "")} />
        : page === "acum" ? <AcumPage {...common("acum")} level={entry.level} picked={pickedForToday(entry).length} over={overLimit(entry)} onSend={sendToToday} />
        : page === "resetare" ? <ResetPage {...common("acum")} pauseDays={pauseDays} onStart={startFromReset} />
        : <SearaPage {...common("seara")} />}
    </div>

    <p role="status" aria-live="polite" className="min-h-6 text-center text-sm text-[var(--muted)]">
      {saveState === "saving" && "Se salvează pe acest dispozitiv…"}
      {saveState === "saved" && "Salvat pe acest dispozitiv."}
      {saveState === "error" && "Nu am putut salva pe acest dispozitiv. Într-o fereastră privată, ce scrii nu se păstrează."}
    </p>
  </div>;
}
