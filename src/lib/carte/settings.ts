// Setările Cărții: profilul, ce sertare și module folosești, ton, paletă, numele, moneda și categoriile.
// Rămân pe dispozitiv (localStorage), ca restul datelor.
import { drawerIds, isDrawerId, type DrawerId } from "./drawers";

export type Tone = "bland" | "direct";
export type Palette = "prune" | "salvie" | "nisip" | "mare";
export type Moment = "dimineata" | "seara" | "variaza";
export type ModuleId = "corp" | "castiguri" | "cronometru";
export type Focus = "minte" | "sarcini" | "energie" | "emotii" | "bani" | "casa" | "termene";

export const toneIds: readonly Tone[] = ["bland", "direct"];
export const paletteIds: readonly Palette[] = ["prune", "salvie", "nisip", "mare"];
export const momentIds: readonly Moment[] = ["dimineata", "seara", "variaza"];
export const moduleIds: readonly ModuleId[] = ["corp", "castiguri", "cronometru"];
export const focusIds: readonly Focus[] = ["minte", "sarcini", "energie", "emotii", "bani", "casa", "termene"];

export const MAX_WINS = 6;

export type Settings = {
  name: string;
  currency: string;
  categories: string[]; // 6 categorii pentru Bani
  enabled: DrawerId[];
  modules: ModuleId[]; // module opționale din pagina zilei
  focus: Focus[]; // ce a spus utilizatorul că îl apasă cel mai tare
  tone: Tone;
  palette: Palette;
  moment: Moment; // când scrie de obicei: decide pagina cu care se deschide ziua
  wins: string[]; // micro-câștigurile proprii (maxim MAX_WINS)
  onboarded: boolean;
  updatedAt: number;
};

const KEY = "ritualul-de-azi-setari";
export const SETTINGS_EVENT = "carte:settings";

export const currencies = ["RON", "EUR", "GBP", "USD", "MDL"] as const;

export const defaultWins: readonly string[] = ["Am mâncat ceva", "Am băut apă", "Am luat o pauză", "Am ieșit puțin afară", "Am răspuns la un mesaj"];

export function defaultSettings(): Settings {
  return {
    name: "", currency: "RON", categories: ["", "", "", "", "", ""], enabled: ["idei"],
    modules: ["corp", "castiguri", "cronometru"], focus: [], tone: "bland", palette: "prune", moment: "variaza",
    wins: [...defaultWins], onboarded: false, updatedAt: 0,
  };
}

function pick<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  return typeof value === "string" && (allowed as readonly string[]).includes(value) ? (value as T) : fallback;
}

function pickMany<T extends string>(value: unknown, allowed: readonly T[], fallback: T[]): T[] {
  if (!Array.isArray(value)) return fallback;
  return allowed.filter((id) => value.some((x) => x === id));
}

export function normalizeSettings(value: unknown): Settings {
  const base = defaultSettings();
  if (typeof value !== "object" || value === null) return base;
  const v = value as Record<string, unknown>;
  const categories = Array.isArray(v.categories) ? v.categories.slice(0, 6).map((c) => (typeof c === "string" ? c.slice(0, 60) : "")) : [];
  while (categories.length < 6) categories.push("");
  const enabled = Array.isArray(v.enabled) ? drawerIds.filter((id) => (v.enabled as unknown[]).some((x) => isDrawerId(x) && x === id)) : base.enabled;
  const wins = Array.isArray(v.wins)
    ? v.wins.filter((w): w is string => typeof w === "string").map((w) => w.trim().slice(0, 60)).filter((w) => w !== "").slice(0, MAX_WINS)
    : base.wins;
  return {
    name: typeof v.name === "string" ? v.name.slice(0, 60) : "",
    currency: typeof v.currency === "string" && v.currency.trim() !== "" ? v.currency.trim().slice(0, 12) : "RON",
    categories,
    enabled,
    modules: pickMany(v.modules, moduleIds, base.modules),
    focus: pickMany(v.focus, focusIds, base.focus),
    tone: pick(v.tone, toneIds, base.tone),
    palette: pick(v.palette, paletteIds, base.palette),
    moment: pick(v.moment, momentIds, base.moment),
    wins,
    onboarded: v.onboarded === true,
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

/** Returnează false dacă browserul nu a lăsat scrierea (de ex. fereastră privată). Anunță restul aplicației (tema se schimbă pe loc). */
export function saveSettings(settings: Settings): boolean {
  let ok = true;
  try {
    window.localStorage.setItem(KEY, JSON.stringify({ ...settings, updatedAt: Date.now() }));
  } catch {
    ok = false;
  }
  try { window.dispatchEvent(new CustomEvent(SETTINGS_EVENT, { detail: settings })); } catch { /* fără anunț, tema rămâne cea veche */ }
  return ok;
}

export function clearSettings() {
  try { window.localStorage.removeItem(KEY); } catch { /* nimic de șters */ }
  try { window.dispatchEvent(new CustomEvent(SETTINGS_EVENT, { detail: defaultSettings() })); } catch { /* nimic de anunțat */ }
}

/** Pune paleta aleasă pe pagină. Paleta „prune” este cea din CSS, fără atribut. */
export function applyPalette(palette: Palette) {
  const root = document.documentElement;
  if (palette === "prune") root.removeAttribute("data-theme");
  else root.setAttribute("data-theme", palette);
}
