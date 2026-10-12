"use client";
// Sertarele: pagini simple pentru ce ai nevoie, când ai nevoie. Se desenează toate din aceleași definiții.
// Totul se salvează automat, pe acest dispozitiv. Nimic nu se trimite pe server.
import { ArrowLeft, ArrowRight, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { drawerById, drawerKey, drawers, emptyDoc, formatAmount, isDrawerId, parseAmount, type DrawerDef, type DrawerDoc, type DrawerId, type Section } from "@/lib/carte/drawers";
import { formatLong, formatMonth, formatWeek, mondayOf, monthOf, shiftDate, shiftMonth, todayLocal } from "@/lib/carte/dates";
import type { DayEntry, PageFields } from "@/lib/carte/entries";
import { loadSettings, type Settings } from "@/lib/carte/settings";
import { getDoc, listEntries, saveDoc } from "@/lib/carte/storage";
import { Panel, TaskRow, TextLine } from "./fields";

type SaveState = "idle" | "saving" | "saved" | "error";

function initialPeriod(kind: DrawerDef["period"]): string {
  const today = todayLocal();
  return kind === "week" ? mondayOf(today) : kind === "month" ? monthOf(today) : "-";
}

export function DrawersView() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [active, setActive] = useState<DrawerId | null>(null);

  useEffect(() => {
    setSettings(loadSettings());
    const read = () => { const h = window.location.hash.replace(/^#/, ""); setActive(isDrawerId(h) ? h : null); };
    read();
    window.addEventListener("hashchange", read);
    return () => window.removeEventListener("hashchange", read);
  }, []);

  if (!settings) return <p className="py-10 text-center text-[var(--muted)]" aria-busy="true">Se deschide…</p>;

  const enabled = drawers.filter((d) => settings.enabled.includes(d.id));
  const def = active ? drawerById(active) : undefined;
  if (def && settings.enabled.includes(def.id)) {
    return <div className="space-y-6">
      <button type="button" onClick={() => { window.location.hash = ""; }} className="inline-flex min-h-11 items-center gap-1 text-sm font-bold text-[var(--rose)]"><ChevronLeft size={18} aria-hidden="true" />Toate sertarele</button>
      <DrawerEditor key={def.id} def={def} settings={settings} />
    </div>;
  }

  return <div className="space-y-6">
    <header>
      <h1 className="display text-3xl font-semibold leading-tight text-[var(--wine)] sm:text-4xl">Sertare</h1>
      <p className="mt-2 leading-7 text-[var(--muted)]">Pagini în plus, pe care le folosești doar dacă îți trebuie. Cele pe care nu le alegi nu apar deloc.</p>
    </header>
    {enabled.length === 0
      ? <p className="rounded-2xl border hairline bg-[var(--paper)] p-5 leading-7 text-[var(--muted)]">Nu ai ales încă niciun sertar.</p>
      : <ul className="space-y-3">
          {enabled.map((d) => <li key={d.id}>
            <a href={`#${d.id}`} className="block rounded-2xl border hairline bg-[var(--paper)] p-5 transition-colors hover:bg-[var(--blush)]/55">
              <span className="display block text-2xl font-semibold text-[var(--wine)]">{d.title}</span>
              <span className="mt-1 block text-sm leading-6 text-[var(--muted)]">{d.line}</span>
            </a>
          </li>)}
        </ul>}
    <Link href="/carte/setari" className="button-secondary inline-flex">Alege sertarele și scrie ce se repetă</Link>
  </div>;
}

function DrawerEditor({ def, settings }: { def: DrawerDef; settings: Settings }) {
  const [period, setPeriod] = useState<string>(() => initialPeriod(def.period));
  const [doc, setDoc] = useState<DrawerDoc | null>(null);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const docRef = useRef<DrawerDoc | null>(null);
  const pending = useRef<DrawerDoc | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flush = useCallback(() => {
    if (timer.current) { clearTimeout(timer.current); timer.current = null; }
    const toSave = pending.current;
    if (!toSave) return;
    pending.current = null;
    saveDoc(toSave).then(() => setSaveState("saved")).catch(() => setSaveState("error"));
  }, []);

  useEffect(() => {
    let cancelled = false;
    docRef.current = null;
    setDoc(null);
    setSaveState("idle");
    getDoc(drawerKey(def.id, period))
      .then((found) => { if (!cancelled) { const d = found ?? emptyDoc(def.id, period); docRef.current = d; setDoc(d); } })
      .catch(() => { if (!cancelled) { const d = emptyDoc(def.id, period); docRef.current = d; setDoc(d); setSaveState("error"); } });
    return () => { cancelled = true; };
  }, [def.id, period]);

  useEffect(() => {
    const onHide = () => { if (document.visibilityState === "hidden") flush(); };
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("pagehide", flush);
    return () => { document.removeEventListener("visibilitychange", onHide); window.removeEventListener("pagehide", flush); flush(); };
  }, [flush]);

  const patch = useCallback((change: PageFields) => {
    const current = docRef.current;
    if (!current) return;
    const next: DrawerDoc = { ...current, fields: { ...current.fields, ...change }, updatedAt: Date.now() };
    docRef.current = next;
    pending.current = next;
    setDoc(next);
    setSaveState("saving");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(flush, 500);
  }, [flush]);

  function move(delta: number) {
    flush();
    setPeriod((p) => (def.period === "week" ? shiftDate(p, delta * 7) : def.period === "month" ? shiftMonth(p, delta) : p));
  }

  const current = initialPeriod(def.period);
  const fields: PageFields = doc ? doc.fields : {};

  return <div className="space-y-6">
    <header className="space-y-3">
      <h1 className="display text-3xl font-semibold leading-tight text-[var(--wine)] sm:text-4xl">{def.title}</h1>
      <p className="leading-7 text-[var(--muted)]">{def.line}</p>
      {def.period !== "none" && <div className="flex items-center justify-between gap-2">
        <button type="button" onClick={() => move(-1)} aria-label={def.period === "week" ? "Săptămâna precedentă" : "Luna precedentă"} className="grid size-12 place-items-center rounded-full border hairline bg-white text-[var(--wine)]"><ArrowLeft size={20} aria-hidden="true" /></button>
        <div className="min-w-0 text-center">
          <p className="display text-xl font-semibold text-[var(--wine)] first-letter:uppercase">{def.period === "week" ? formatWeek(period) : formatMonth(period)}</p>
          {period !== current && <button type="button" onClick={() => { flush(); setPeriod(current); }} className="mt-1 text-sm font-bold text-[var(--rose)] underline underline-offset-4">{def.period === "week" ? "Înapoi la săptămâna asta" : "Înapoi la luna asta"}</button>}
        </div>
        <button type="button" onClick={() => move(1)} aria-label={def.period === "week" ? "Săptămâna următoare" : "Luna următoare"} className="grid size-12 place-items-center rounded-full border hairline bg-white text-[var(--wine)]"><ArrowRight size={20} aria-hidden="true" /></button>
      </div>}
    </header>

    <div aria-busy={!doc} className="space-y-5">
      {!doc ? <p className="py-10 text-center text-[var(--muted)]">Se deschide pagina…</p>
        : def.sections.map((section) => <SectionView key={section.id} section={section} idPrefix={`${def.id}-${section.id}`} fields={fields} patch={patch} settings={settings} />)}
    </div>

    <p role="status" aria-live="polite" className="min-h-6 text-center text-sm text-[var(--muted)]">
      {saveState === "saving" && "Se salvează pe acest dispozitiv…"}
      {saveState === "saved" && "Salvat pe acest dispozitiv."}
      {saveState === "error" && "Nu am putut salva pe acest dispozitiv. Într-o fereastră privată, ce scrii nu se păstrează."}
    </p>
  </div>;
}

const str = (fields: PageFields, key: string) => (typeof fields[key] === "string" ? (fields[key] as string) : "");
const bool = (fields: PageFields, key: string) => fields[key] === true;
const range = (n: number) => Array.from({ length: n }, (_, i) => i + 1);

function SectionView({ section, idPrefix, fields, patch, settings }: { section: Section; idPrefix: string; fields: PageFields; patch: (change: PageFields) => void; settings: Settings }) {
  const { id } = section;
  const set = (key: string, value: string | boolean) => patch({ [key]: value });

  if (section.kind === "inbox") return <InboxSection section={section} />;

  if (section.kind === "lines") {
    return <Panel title={section.title} hint={section.hint}>
      {range(section.count).map((i) => {
        const label = section.labels?.[i - 1];
        return <TextLine key={i} id={`${idPrefix}-${i}`} label={label ?? `${section.title}, rândul ${i}`} hideLabel={!label} value={str(fields, `${id}_${i}`)} onChange={(v) => set(`${id}_${i}`, v)} placeholder={section.placeholder} />;
      })}
    </Panel>;
  }

  if (section.kind === "tasks") {
    const anyDone = range(section.count).some((i) => bool(fields, `${id}_${i}_gata`));
    return <Panel title={section.title} hint={section.hint}>
      {range(section.count).map((i) => <TaskRow key={i} id={`${idPrefix}-${i}`} label={`${section.title}, rândul ${i}`} text={str(fields, `${id}_${i}`)} done={bool(fields, `${id}_${i}_gata`)} onText={(v) => set(`${id}_${i}`, v)} onDone={(v) => set(`${id}_${i}_gata`, v)} placeholder={section.placeholder} />)}
      {section.uncheck && anyDone && <button type="button" onClick={() => patch(Object.fromEntries(range(section.count).map((i) => [`${id}_${i}_gata`, false])))} className="button-secondary">Debifează tot, pentru data viitoare</button>}
    </Panel>;
  }

  if (section.kind === "pairs") {
    return <Panel title={section.title} hint={section.hint}>
      {range(section.count).map((i) => <div key={i} className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-3">
        <TextLine id={`${idPrefix}-${i}-a`} label={`${section.a}, rândul ${i}`} hideLabel value={str(fields, `${id}_${i}_a`)} onChange={(v) => set(`${id}_${i}_a`, v)} placeholder={section.a} />
        <TextLine id={`${idPrefix}-${i}-b`} label={`${section.b}, rândul ${i}`} hideLabel value={str(fields, `${id}_${i}_b`)} onChange={(v) => set(`${id}_${i}_b`, v)} placeholder={section.b} />
      </div>)}
    </Panel>;
  }

  // money
  let planned = 0;
  let spent = 0;
  for (const i of range(section.count)) {
    planned += parseAmount(str(fields, `${id}_${i}_p`)) ?? 0;
    spent += parseAmount(str(fields, `${id}_${i}_e`)) ?? 0;
  }
  const hasAny = range(section.count).some((i) => str(fields, `${id}_${i}_p`) !== "" || str(fields, `${id}_${i}_e`) !== "");
  return <Panel title={section.title} hint={section.hint}>
    <div className="grid grid-cols-[minmax(0,2fr)_minmax(0,1.5fr)_minmax(0,1.5fr)] gap-2 px-1 text-xs font-bold uppercase tracking-wide text-[var(--muted)]" aria-hidden="true"><span>Categorie</span><span>Planificat</span><span>Ieșit</span></div>
    {range(section.count).map((i) => {
      const name = settings.categories[i - 1]?.trim() || `Categoria ${i}`;
      return <div key={i} className="grid grid-cols-[minmax(0,2fr)_minmax(0,1.5fr)_minmax(0,1.5fr)] items-end gap-2">
        <p className="min-h-11 py-3 text-sm font-bold leading-5 text-[var(--wine)]">{name}</p>
        <TextLine id={`${idPrefix}-${i}-p`} label={`${name}, planificat`} hideLabel value={str(fields, `${id}_${i}_p`)} onChange={(v) => set(`${id}_${i}_p`, v)} placeholder="0" />
        <TextLine id={`${idPrefix}-${i}-e`} label={`${name}, ieșit`} hideLabel value={str(fields, `${id}_${i}_e`)} onChange={(v) => set(`${id}_${i}_e`, v)} placeholder="0" />
      </div>;
    })}
    {hasAny && <dl className="mt-2 grid grid-cols-3 gap-2 rounded-xl bg-[var(--blush)]/55 p-3 text-sm">
      <div><dt className="text-[var(--muted)]">Planificat</dt><dd className="font-bold text-[var(--wine)]">{formatAmount(planned)} {settings.currency}</dd></div>
      <div><dt className="text-[var(--muted)]">Ieșit</dt><dd className="font-bold text-[var(--wine)]">{formatAmount(spent)} {settings.currency}</dd></div>
      <div><dt className="text-[var(--muted)]">Diferența</dt><dd className="font-bold text-[var(--wine)]">{formatAmount(planned - spent)} {settings.currency}</dd></div>
    </dl>}
  </Panel>;
}

type InboxItem = { date: string; text: string };

/** Ce ai trimis la „Mai târziu” în pagina Acum. Se adună singur, doar din ce e pe acest dispozitiv. */
function InboxSection({ section }: { section: Extract<Section, { kind: "inbox" }> }) {
  const [items, setItems] = useState<InboxItem[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    listEntries().then((entries: DayEntry[]) => {
      if (cancelled) return;
      const found: InboxItem[] = [];
      for (const e of [...entries].sort((a, b) => b.date.localeCompare(a.date))) {
        for (let i = 1; i <= 8; i++) {
          const text = typeof e.acum[`rand_${i}`] === "string" ? (e.acum[`rand_${i}`] as string).trim() : "";
          if (text !== "" && e.acum[`rand_${i}_tarziu`] === true) found.push({ date: e.date, text });
        }
      }
      setItems(found.slice(0, 40));
    }).catch(() => { if (!cancelled) setItems([]); });
    return () => { cancelled = true; };
  }, []);

  return <Panel title={section.title} hint={section.hint} tone="soft">
    {items === null ? <p className="text-sm text-[var(--muted)]">Se citește…</p>
      : items.length === 0 ? <p className="text-sm leading-6 text-[var(--muted)]">Încă nu ai trimis nimic la „Mai târziu”.</p>
      : <ul className="space-y-2">{items.map((item, i) => <li key={`${item.date}-${i}`} className="rounded-xl border hairline bg-white px-4 py-3">
          <p className="leading-6 text-[var(--ink)]">{item.text}</p>
          <p className="mt-0.5 text-xs text-[var(--muted)]">din {formatLong(item.date)}</p>
        </li>)}</ul>}
  </Panel>;
}
