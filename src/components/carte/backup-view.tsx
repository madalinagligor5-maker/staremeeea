"use client";
// Datele tale: copie de rezervă, restaurare, ștergere. Totul rămâne pe acest dispozitiv.
import { useEffect, useRef, useState } from "react";
import { makeBackup, mergeEntries, parseBackup } from "@/lib/carte/entries";
import { clearAll, listEntries, requestPersistence, saveEntry } from "@/lib/carte/storage";

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
      const backup = makeBackup(entries);
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

  async function importData(file: File | undefined) {
    if (!file) return;
    try {
      const incoming = parseBackup(await file.text());
      const existing = await listEntries();
      const merged = mergeEntries(existing, incoming);
      const have = new Map(existing.map((e) => [e.date, e.updatedAt]));
      const changed = merged.filter((e) => have.get(e.date) !== e.updatedAt);
      for (const e of changed) await saveEntry(e);
      setNotice({ kind: "ok", text: changed.length === 0 ? "Totul din fișier era deja aici." : `Am adus ${changed.length} ${changed.length === 1 ? "zi" : "zile"}. Pentru aceeași zi rămâne varianta mai recentă.` });
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
      <p className="mt-2 leading-7 text-[var(--muted)]">Salvează un fișier cu toate zilele tale. Dacă schimbi telefonul sau ștergi datele browserului, îl poți aduce înapoi. Merită făcută o dată pe lună.</p>
      <div className="mt-4 flex flex-wrap gap-3">
        <button type="button" onClick={exportData} className="button-primary">Salvează o copie</button>
        <button type="button" onClick={() => fileRef.current?.click()} className="button-secondary">Aduc o copie înapoi</button>
        <input ref={fileRef} type="file" accept="application/json,.json" className="sr-only" tabIndex={-1} aria-label="Alege fișierul cu copia de rezervă" onChange={(e) => void importData(e.target.files?.[0])} />
      </div>
    </section>

    <section className={card} aria-labelledby="ecran">
      <h2 id="ecran" className={h2}>Pe ecranul telefonului</h2>
      <p className="mt-2 leading-7 text-[var(--muted)]">Pe Android, din meniul browserului alegi „Instalează aplicația”. Pe iPhone, în Safari apeși butonul de partajare, apoi „Adaugă pe ecranul principal”. Se deschide apoi ca orice aplicație și funcționează și fără internet.</p>
    </section>

    <section className={card} aria-labelledby="sterge">
      <h2 id="sterge" className={h2}>Șterge tot</h2>
      <p className="mt-2 leading-7 text-[var(--muted)]">Șterge toate zilele de pe acest dispozitiv. Nu se poate desface, decât dacă ai o copie de rezervă.</p>
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
