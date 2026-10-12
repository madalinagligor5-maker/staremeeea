// Setările Cărții: ce sertare folosești, numele, moneda și categoriile. Se scriu o singură dată.
// Rămân pe dispozitiv (localStorage), ca restul datelor.
import { drawerIds, isDrawerId, type DrawerId } from "./drawers";

export type Settings = {
  name: string;
  currency: string;
  categories: string[]; // 6 categorii pentru Bani
  enabled: DrawerId[];
  updatedAt: number;
};

const KEY = "ritualul-de-azi-setari";

export const currencies = ["RON", "EUR", "GBP", "USD", "MDL"] as const;

export function defaultSettings(): Settings {
  return { name: "", currency: "RON", categories: ["", "", "", "", "", ""], enabled: ["idei"], updatedAt: 0 };
}

export function normalizeSettings(value: unknown): Settings {
  const base = defaultSettings();
  if (typeof value !== "object" || value === null) return base;
  const v = value as Record<string, unknown>;
  const categories = Array.isArray(v.categories) ? v.categories.slice(0, 6).map((c) => (typeof c === "string" ? c.slice(0, 60) : "")) : [];
  while (categories.length < 6) categories.push("");
  const enabled = Array.isArray(v.enabled) ? drawerIds.filter((id) => (v.enabled as unknown[]).some((x) => isDrawerId(x) && x === id)) : base.enabled;
  return {
    name: typeof v.name === "string" ? v.name.slice(0, 60) : "",
    currency: typeof v.currency === "string" && v.currency.trim() !== "" ? v.currency.trim().slice(0, 12) : "RON",
    categories,
    enabled,
    updatedAt: typeof v.updatedAt === "number" && Number.isFinite(v.updatedAt) ? v.updatedAt : 0,
  };
}

export function loadSettings(): Settings {
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? normalizeSettings(JSON.parse(raw)) : defaultSettings();
  } catch {
    return defaultSettings();
  }
}

/** Returnează false dacă browserul nu a lăsat scrierea (de ex. fereastră privată). */
export function saveSettings(settings: Settings): boolean {
  try {
    window.localStorage.setItem(KEY, JSON.stringify({ ...settings, updatedAt: Date.now() }));
    return true;
  } catch {
    return false;
  }
}

export function clearSettings() {
  try { window.localStorage.removeItem(KEY); } catch { /* nimic de șters */ }
}
