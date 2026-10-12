"use client";
// Datele tale: copie de rezervă, restaurare, ștergere. Totul rămâne pe acest dispozitiv.
import { useEffect, useRef, useState } from "react";
import { mergeDocs } from "@/lib/carte/drawers";
import { makeBackup, mergeEntries, parseBackupContents } from "@/lib/carte/entries";
import { exportReadable } from "@/lib/carte/readable";
import { loadSettings, saveSettings } from "@/lib/carte/settings";
import { clearAll, listDocs, listEntries, requestPersistence, saveDoc, saveEntry } from "@/lib/carte/storage";
import { AccountSection } from "./account-section";

type Notice = { kind: "ok" | "error"; text: string } | null;

export function BackupView() {
  const [count, setCount] = useState<number | null>(null);
  const [persisted, setPersisted] = useState<boolean | null>(null);
  const [notice, setNotice] = useState<Notice>(null);
  const [confirming, setConfirming] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function refresh() {
    try { setCount((await listEntries()).length); } catch { setCount(null); setNotice({ kind: "error", text: "Nu am putut citi datele de pe acest dispozitiv." }); }
  }

  useEffect(() => {
    void refresh();
    (async () => {
      try {
        const already = await navigator.storage?.persisted?.();
        setPersisted(already ? true : await requestPersistence());
      } catch { setPersisted(false); }
    })();
  }, []);

  async function exportData() {
    try {
      const entries = await listEntries();
      const docs = await listDocs();
      const settings = loadSettings();
      const backup = makeBackup(entries, new Date(), { drawers: docs, settings: settings.updatedAt > 0 ? settings : null });
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ritualul-de-azi-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setNotice({ kind: "ok", text: `Copia de rezervă are ${entries.length} ${entries.length === 1 ? "zi" : "zile"}. Păstrează fișierul într-un loc sigur.` });
    } catch { setNotice({ kind: "error", text: "Nu am putut crea copia de rezervă." }); }
  }

  async function exportText() {
    try {
      const [entries, docs] = await Promise.all([listEntries(), listDocs()]);
      const settings = loadSettings();
      const text = exportReadable(entries, docs, settings.updatedAt > 0 ? settings : null);
      const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ritualul-de-azi-text-${new Date().toISOString().slice(0, 10)}.txt`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setNotice({ kind: "ok", text: "Am creat un fișier text cu tot ce ai scris. Îl poți deschide în orice aplicație, fără Cartea." });
    } catch { setNotice({ kind: "error", text: "Nu am putut crea fișierul text." }); }
  }

  async function importData(file: File | undefined) {
    if (!file) return;
    try {
      const incoming = parseBackupContents(await file.text());
      const existing = await listEntries();
      const merged = mergeEntries(existing, incoming.entries);
      const have = new Map(existing.map((e) => [e.date, e.updatedAt]));
      const changed = merged.filter((e) => have.get(e.date) !== e.updatedAt);
      for (const e of changed) await saveEntry(e);
      const existingDocs = await listDocs();
      const mergedDocs = mergeDocs(existingDocs, incoming.drawers);
      const haveDocs = new Map(existingDocs.map((d) => [d.key, d.updatedAt]));
      const changedDocs = mergedDocs.filter((d) => haveDocs.get(d.key) !== d.updatedAt);
      for (const d of changedDocs) await saveDoc(d);
      let settingsBrought = false;
      if (incoming.settings && incoming.settings.updatedAt > loadSettings().updatedAt) { saveSettings(incoming.settings); settingsBrought = true; }
      const total = changed.length + changedDocs.length;
      setNotice({ kind: "ok", text: total === 0 && !settingsBrought ? "Totul din fișier era deja aici." : `Am adus ${changed.length} ${changed.length === 1 ? "zi" : "zile"}${changedDocs.length > 0 ? `, ${changedDocs.length} ${changedDocs.length === 1 ? "pagină de sertar" : "pagini de sertar"}` : ""}${settingsBrought ? " și setările" : ""}. Pentru aceeași pagină rămâne varianta mai recentă.` });
      await refresh();
    } catch (error) {
      setNotice({ kind: "error", text: error instanceof Error ? error.message : "Nu am putut citi fișierul." });
    } finally { if (fileRef.current) fileRef.current.value = ""; }
  }

  async function wipe() {
    try { await clearAll(); setConfirming(false); setNotice({ kind: "ok", text: "Am șters tot de pe acest dispozitiv." }); await refresh(); }
    catch { setNotice({ kind: "error", text: "Nu am putut șterge. Încearcă din nou." }); }
  }

  const card = "rounded-2xl border hairline bg-[var(--paper)] p-5 sm:p-6";
  const h2 = "display text-2xl font-semibold text-[var(--wine)]";
  return <div className="space-y-6">
    <header>
      <h1 className="display text-3xl font-semibold leading-tight text-[var(--wine)] sm:text-4xl">Datele tale</h1>
      <p className="mt-2 leading-7 text-[var(--muted)]">Ce scrii rămâne pe acest dispozitiv. Nu se trimite pe serverele noastre.</p>
    </header>

    <p role="status" aria-live="polite" className={`min-h-6 text-sm ${notice?.kind === "error" ? "font-bold text-[var(--wine)]" : "text-[var(--muted)]"}`}>{notice?.text}</p>

    <section className={card} aria-labelledby="stare">
      <h2 id="stare" className={h2}>Ce ai acum</h2>
      <p className="mt-2 leading-7 text-[var(--muted)]">{count === null ? "Se citește…" : count === 0 ? "Încă nu ai nicio zi salvată." : `${count} ${count === 1 ? "zi salvată" : "zile salvate"} pe acest dispozitiv.`}</p>
      <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{persisted === true ? "Browserul a promis să nu șteargă aceste date când are puțin spațiu." : persisted === false ? "Browserul nu a promis că păstrează datele. De aceea merită o copie de rezervă din când în când." : ""}</p>
    </section>

    <section className={card} aria-labelledby="rezerva">
      <h2 id="rezerva" className={h2}>Copie de rezervă</h2>
      <p className="mt-2 leading-7 text-[var(--muted)]">Salvează un fișier cu toate zilele, sertarele și setările tale. Dacă schimbi telefonul sau ștergi datele browserului, îl poți aduce înapoi. Merită făcută o dată pe lună. „Descarc ca text” creează un fișier simplu, pe care îl citești oricând, chiar și fără Cartea.</p>
      <div className="mt-4 flex flex-wrap gap-3">
        <button type="button" onClick={exportData} className="button-primary">Salvează o copie</button>
        <button type="button" onClick={exportText} className="button-secondary">Descarc ca text</button>
        <button type="button" onClick={() => fileRef.current?.click()} className="button-secondary">Aduc o copie înapoi</button>
        <input ref={fileRef} type="file" accept="application/json,.json" className="sr-only" tabIndex={-1} aria-label="Alege fișierul cu copia de rezervă" onChange={(e) => void importData(e.target.files?.[0])} />
      </div>
    </section>

    <AccountSection />

    <section className={card} aria-labelledby="ecran">
      <h2 id="ecran" className={h2}>Pe ecranul telefonului</h2>
      <p className="mt-2 leading-7 text-[var(--muted)]">Pe Android, din meniul browserului alegi „Instalează aplicația”. Pe iPhone, în Safari apeși butonul de partajare, apoi „Adaugă pe ecranul principal”. Se deschide apoi ca orice aplicație și funcționează și fără internet.</p>
    </section>

    <section className={card} aria-labelledby="sterge">
      <h2 id="sterge" className={h2}>Șterge tot</h2>
      <p className="mt-2 leading-7 text-[var(--muted)]">Șterge toate zilele, sertarele și setările de pe acest dispozitiv. Nu se poate desface, decât dacă ai o copie de rezervă.</p>
      {!confirming
        ? <button type="button" onClick={() => setConfirming(true)} className="button-secondary mt-4">Vreau să șterg tot</button>
        : <div className="mt-4 space-y-3" role="group" aria-label="Confirmare ștergere">
            <p className="font-bold text-[var(--wine)]">Sigur? Salvează întâi o copie dacă vrei să păstrezi ceva.</p>
            <div className="flex flex-wrap gap-3">
              <button type="button" onClick={wipe} className="button-primary">Da, șterge tot</button>
              <button type="button" onClick={() => setConfirming(false)} className="button-secondary">Nu, las cum e</button>
            </div>
          </div>}
    </section>
  </div>;
}
