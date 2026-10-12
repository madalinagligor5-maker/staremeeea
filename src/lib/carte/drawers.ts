// Sertarele Cărții: pagini simple, pe care le activezi doar dacă îți trebuie.
// Fiecare sertar e descris prin date; o singură componentă le desenează pe toate.
import type { PageFields } from "./entries";

export type DrawerId = "saptamana" | "luna" | "bani" | "masa" | "programari" | "idei" | "repeta";

export const drawerIds: readonly DrawerId[] = ["saptamana", "luna", "bani", "masa", "programari", "idei", "repeta"];

export type PeriodKind = "week" | "month" | "none";

export type Section =
  | { id: string; kind: "lines"; title: string; hint?: string; count: number; labels?: readonly string[]; placeholder?: string }
  | { id: string; kind: "tasks"; title: string; hint?: string; count: number; placeholder?: string; uncheck?: boolean }
  | { id: string; kind: "pairs"; title: string; hint?: string; count: number; a: string; b: string }
  | { id: string; kind: "money"; title: string; hint?: string; count: number }
  | { id: string; kind: "inbox"; title: string; hint?: string };

export type DrawerDef = { id: DrawerId; title: string; line: string; period: PeriodKind; sections: readonly Section[] };

export type DrawerDoc = { key: string; drawer: DrawerId; period: string; fields: PageFields; updatedAt: number };

const days = ["Luni", "Marți", "Miercuri", "Joi", "Vineri", "Sâmbătă", "Duminică"] as const;

export const drawers: readonly DrawerDef[] = [
  {
    id: "saptamana", title: "Săptămâna", line: "Trei lucruri ajung. Restul poate aștepta.", period: "week",
    sections: [
      { id: "prioritati", kind: "tasks", title: "Cele 3 priorități", hint: "Trei lucruri pentru toată săptămâna, nu mai mult.", count: 3 },
      { id: "nu_fac", kind: "lines", title: "Ce nu fac săptămâna asta", hint: "Scrie ce lași deoparte, fără vină.", count: 2 },
      { id: "zile", kind: "lines", title: "Pe zile", hint: "Doar dacă te ajută. Poate rămâne gol.", count: 7, labels: days },
    ],
  },
  {
    id: "luna", title: "Luna", line: "Vezi luna dintr-o privire, fără să o porți în cap.", period: "month",
    sections: [
      { id: "evenimente", kind: "pairs", title: "Ce se întâmplă luna asta", hint: "Data și ce e. Doar ce nu vrei să uiți.", count: 8, a: "Data", b: "Ce e" },
      { id: "tinut", kind: "lines", title: "De ținut minte", count: 5 },
      { id: "viitoare", kind: "lines", title: "Pentru luna viitoare", hint: "Ce mutăm încolo, ca să nu se adune acum.", count: 5 },
    ],
  },
  {
    id: "bani", title: "Bani", line: "Doar ce a ieșit. Fără judecăți.", period: "month",
    sections: [
      { id: "venituri", kind: "lines", title: "Ce a intrat luna asta", count: 1, placeholder: "Suma" },
      { id: "categorii", kind: "money", title: "Pe categorii", hint: "Numele categoriilor le scrii o singură dată, în Setări.", count: 6 },
    ],
  },
  {
    id: "masa", title: "Masa și casa", line: "Nu trebuie să arate ca pe rețele. Trebuie să se întâmple.", period: "none",
    sections: [
      { id: "meniu", kind: "lines", title: "Mâncăm săptămâna asta", hint: "Un rând pe zi, oricât de simplu.", count: 7, labels: days },
      { id: "grele", kind: "lines", title: "Mâncare de zile grele", hint: "Lucruri care nu cer gătit sau aproape deloc.", count: 5 },
      { id: "cumparaturi", kind: "tasks", title: "Lista de cumpărături", uncheck: true, count: 12 },
      { id: "minim", kind: "tasks", title: "Minimul de casă", hint: "Trei lucruri, nu treizeci. Ce ține casa în picioare.", count: 3 },
    ],
  },
  {
    id: "programari", title: "Programări și acte", line: "Scrie o dată și nu mai ține minte.", period: "none",
    sections: [
      { id: "programari", kind: "pairs", title: "Programări", count: 8, a: "Când", b: "Ce e" },
      { id: "nastere", kind: "pairs", title: "Zile de naștere", hint: "Ziua și luna, fără an.", count: 10, a: "Ziua", b: "Cine" },
      { id: "acte", kind: "pairs", title: "Acte care expiră", count: 6, a: "Act", b: "Expiră la" },
    ],
  },
  {
    id: "idei", title: "Idei și liste", line: "Aici așteaptă. Nu trebuie să faci nimic cu ele azi.", period: "none",
    sections: [
      { id: "inbox", kind: "inbox", title: "Din Acum: mai târziu", hint: "Ce ai trimis la „Mai târziu” apare aici singur." },
      { id: "idei", kind: "lines", title: "Idei", count: 12 },
    ],
  },
  {
    id: "repeta", title: "Liste care se repetă", line: "Scrie o dată, folosește de fiecare dată.", period: "none",
    sections: [
      { id: "iesit", kind: "tasks", title: "Ieșit din casă", uncheck: true, count: 8 },
      { id: "calatorie", kind: "tasks", title: "Călătorie", uncheck: true, count: 10 },
      { id: "inceput", kind: "tasks", title: "Început de săptămână", uncheck: true, count: 6 },
    ],
  },
];

export function drawerById(id: string): DrawerDef | undefined {
  return drawers.find((d) => d.id === id);
}

export function isDrawerId(value: unknown): value is DrawerId {
  return typeof value === "string" && (drawerIds as readonly string[]).includes(value);
}

export const drawerKey = (drawer: DrawerId, period: string) => `${drawer}:${period}`;

export function emptyDoc(drawer: DrawerId, period: string, now = Date.now()): DrawerDoc {
  return { key: drawerKey(drawer, period), drawer, period, fields: {}, updatedAt: now };
}

export function isDrawerDoc(value: unknown): value is DrawerDoc {
  if (typeof value !== "object" || value === null) return false;
  const d = value as Record<string, unknown>;
  if (typeof d.key !== "string" || !isDrawerId(d.drawer) || typeof d.period !== "string" || typeof d.updatedAt !== "number" || !Number.isFinite(d.updatedAt)) return false;
  if (typeof d.fields !== "object" || d.fields === null || Array.isArray(d.fields)) return false;
  return Object.values(d.fields).every((v) => (typeof v === "string" ? v.length <= 20000 : typeof v === "boolean"));
}

/** Combină sertarele: pentru aceeași pagină rămâne varianta cea mai recentă. */
export function mergeDocs(existing: readonly DrawerDoc[], incoming: readonly DrawerDoc[]): DrawerDoc[] {
  const byKey = new Map(existing.map((d) => [d.key, d]));
  for (const d of incoming) {
    const current = byKey.get(d.key);
    if (!current || d.updatedAt > current.updatedAt) byKey.set(d.key, d);
  }
  return [...byKey.values()].sort((a, b) => a.key.localeCompare(b.key));
}

/** Citește o sumă scrisă de om („1.250,50”, „300”, „12,5”). Returnează null dacă nu e un număr. */
export function parseAmount(text: string): number | null {
  const cleaned = text.replace(/\s/g, "").replace(/[^\d.,-]/g, "");
  if (cleaned === "" || cleaned === "-") return null;
  const lastComma = cleaned.lastIndexOf(",");
  const lastDot = cleaned.lastIndexOf(".");
  let normalized = cleaned;
  if (lastComma > -1 && lastDot > -1) {
    normalized = lastComma > lastDot ? cleaned.replace(/\./g, "").replace(",", ".") : cleaned.replace(/,/g, "");
  } else if (lastComma > -1) {
    normalized = /,\d{1,2}$/.test(cleaned) ? cleaned.replace(",", ".") : cleaned.replace(/,/g, "");
  } else if (lastDot > -1 && !/\.\d{1,2}$/.test(cleaned)) {
    normalized = cleaned.replace(/\./g, "");
  }
  const n = Number.parseFloat(normalized);
  return Number.isFinite(n) ? n : null;
}

export function formatAmount(n: number): string {
  return new Intl.NumberFormat("ro-RO", { maximumFractionDigits: 2 }).format(n);
}
