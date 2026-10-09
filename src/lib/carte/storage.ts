"use client";
// Stocare locală (IndexedDB). Datele nu pleacă de pe dispozitiv.
import type { DayEntry } from "./entries";

const DB_NAME = "ritualul-de-azi";
const STORE = "entries";

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => { request.result.createObjectStore(STORE, { keyPath: "date" }); };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Nu pot deschide stocarea locală."));
  });
}

async function run<T>(mode: IDBTransactionMode, work: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await open();
  try {
    return await new Promise<T>((resolve, reject) => {
      const request = work(db.transaction(STORE, mode).objectStore(STORE));
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } finally { db.close(); }
}

export const getEntry = (date: string) => run<DayEntry | undefined>("readonly", (s) => s.get(date));
export const listEntries = () => run<DayEntry[]>("readonly", (s) => s.getAll());
export const saveEntry = (entry: DayEntry) => run("readwrite", (s) => s.put(entry)).then(() => undefined);
export const clearAll = () => run("readwrite", (s) => s.clear()).then(() => undefined);

/** Cere browserului să nu șteargă datele când are puțin spațiu. Nu e garantat. */
export async function requestPersistence(): Promise<boolean> {
  try { return (await navigator.storage?.persist?.()) ?? false; } catch { return false; }
}
