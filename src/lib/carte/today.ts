// Din Acum în Azi: ce a ales utilizatorul „pentru azi” se mută în pagina zilei, fără rescris.
import type { DayEntry } from "./entries";
import type { Level } from "./stats";
import { todayLimit } from "./profile";

export const ROWS = 8;

const filled = (v: unknown): v is string => typeof v === "string" && v.trim() !== "";

/** Textele marcate „Azi”, în ordinea rândurilor. */
export function pickedForToday(entry: DayEntry): string[] {
  const out: string[] = [];
  for (let i = 1; i <= ROWS; i++) {
    const text = entry.acum[`rand_${i}`];
    if (entry.acum[`rand_${i}_azi`] === true && filled(text)) out.push(text.trim());
  }
  return out;
}

/** Cât a ales peste ce ajunge pentru nivelul zilei (0 = în limită). */
export function overLimit(entry: DayEntry, level: Level | null = entry.level): number {
  return Math.max(0, pickedForToday(entry).length - todayLimit(level));
}

/**
 * Pune lucrurile alese în Azi. Nu șterge nimic scris deja: umple doar locurile goale.
 * Fără nivel ales, o alegere devine „zi grea” (un lucru), mai multe devin „zi obosită” (trei lucruri).
 */
export function placePicked(entry: DayEntry): DayEntry {
  const picked = pickedForToday(entry);
  if (picked.length === 0) return entry;
  const level: Level = entry.level ?? (picked.length > 1 ? "obosita" : "grea");
  const azi = { ...entry.azi };
  const slots = level === "grea" ? ["grea_lucru"] : ["esential_1", "esential_2", "esential_3"];
  const free = slots.filter((k) => !filled(azi[k]));
  const already = new Set(slots.filter((k) => filled(azi[k])).map((k) => String(azi[k]).trim()));
  const todo = picked.filter((p) => !already.has(p));
  free.forEach((slot, i) => { if (todo[i] !== undefined) azi[slot] = todo[i]; });
  return { ...entry, level, azi };
}
