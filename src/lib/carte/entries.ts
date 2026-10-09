// Intrările Cărții. Totul rămâne pe dispozitivul utilizatorului; nimic nu se trimite pe server.
import type { Level } from "./stats";

export type PageFields = Record<string, string | boolean>;

export type DayEntry = {
  date: string; // YYYY-MM-DD
  level: Level | null;
  azi: PageFields;
  acum: PageFields;
  seara: PageFields;
  updatedAt: number; // ms
};

export type Backup = { app: "ritualul-de-azi"; version: 1; exportedAt: string; entries: DayEntry[] };

const dateRe = /^\d{4}-\d{2}-\d{2}$/;
const levels = new Set(["buna", "obosita", "grea"]);

function isFields(value: unknown): value is PageFields {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  return Object.values(value).every((v) => typeof v === "string" ? v.length <= 20000 : typeof v === "boolean");
}

export function isDayEntry(value: unknown): value is DayEntry {
  if (typeof value !== "object" || value === null) return false;
  const e = value as Record<string, unknown>;
  return typeof e.date === "string" && dateRe.test(e.date)
    && (e.level === null || (typeof e.level === "string" && levels.has(e.level)))
    && isFields(e.azi) && isFields(e.acum) && isFields(e.seara)
    && typeof e.updatedAt === "number" && Number.isFinite(e.updatedAt);
}

export function emptyEntry(date: string, now = Date.now()): DayEntry {
  return { date, level: null, azi: {}, acum: {}, seara: {}, updatedAt: now };
}

export function makeBackup(entries: readonly DayEntry[], now = new Date()): Backup {
  return { app: "ritualul-de-azi", version: 1, exportedAt: now.toISOString(), entries: [...entries].sort((a, b) => a.date.localeCompare(b.date)) };
}

/** Citește un fișier de rezervă. Aruncă o eroare cu mesaj clar dacă nu e valid. */
export function parseBackup(text: string): DayEntry[] {
  let data: unknown;
  try { data = JSON.parse(text); } catch { throw new Error("Fișierul nu este o copie de rezervă validă."); }
  const b = data as Partial<Backup> | null;
  if (!b || b.app !== "ritualul-de-azi" || b.version !== 1 || !Array.isArray(b.entries)) throw new Error("Fișierul nu este o copie de rezervă a Cărții.");
  if (!b.entries.every(isDayEntry)) throw new Error("Copia de rezervă conține intrări care nu pot fi citite.");
  return b.entries;
}

/** Combină intrările: pentru aceeași zi rămâne cea mai recentă. */
export function mergeEntries(existing: readonly DayEntry[], incoming: readonly DayEntry[]): DayEntry[] {
  const byDate = new Map(existing.map((e) => [e.date, e]));
  for (const e of incoming) {
    const current = byDate.get(e.date);
    if (!current || e.updatedAt > current.updatedAt) byDate.set(e.date, e);
  }
  return [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date));
}

/** Textul scris de utilizator, pentru statistica de cuvinte. */
export function entryTexts(entry: DayEntry): string[] {
  return [entry.azi, entry.acum, entry.seara].flatMap((page) => Object.values(page).filter((v): v is string => typeof v === "string" && v.trim() !== ""));
}
