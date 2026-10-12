"use client";
// Stocare locală (IndexedDB). Datele nu pleacă de pe dispozitiv.
import type { DrawerDoc } from "./drawers";
import type { DayEntry } from "./entries";
import { clearSettings } from "./settings";

const DB_NAME = "ritualul-de-azi";
const STORE = "entries";
const DOCS = "drawers";

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 2);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath: "date" });
      if (!db.objectStoreNames.contains(DOCS)) db.createObjectStore(DOCS, { keyPath: "key" });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Nu pot deschide stocarea locală."));
  });
}

async function run<T>(mode: IDBTransactionMode, work: (store: IDBObjectStore) => IDBRequest<T>, storeName: string = STORE): Promise<T> {
  const db = await open();
  try {
    return await new Promise<T>((resolve, reject) => {
      const request = work(db.transaction(storeName, mode).objectStore(storeName));
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } finally { db.close(); }
}

export const getEntry = (date: string) => run<DayEntry | undefined>("readonly", (s) => s.get(date));
export const listEntries = () => run<DayEntry[]>("readonly", (s) => s.getAll());
export const saveEntry = (entry: DayEntry) => run("readwrite", (s) => s.put(entry)).then(() => undefined);
export const clearEntries = () => run("readwrite", (s) => s.clear()).then(() => undefined);

export const getDoc = (key: string) => run<DrawerDoc | undefined>("readonly", (s) => s.get(key), DOCS);
export const listDocs = () => run<DrawerDoc[]>("readonly", (s) => s.getAll(), DOCS);
export const saveDoc = (doc: DrawerDoc) => run("readwrite", (s) => s.put(doc), DOCS).then(() => undefined);
export const clearDocs = () => run("readwrite", (s) => s.clear(), DOCS).then(() => undefined);

/** Șterge tot: zilele, sertarele și setările. */
export async function clearAll(): Promise<void> {
  await clearEntries();
  await clearDocs();
  clearSettings();
}

/** Cere browserului să nu șteargă datele când are puțin spațiu. Nu e garantat. */
export async function requestPersistence(): Promise<boolean> {
  try { return (await navigator.storage?.persist?.()) ?? false; } catch { return false; }
}
