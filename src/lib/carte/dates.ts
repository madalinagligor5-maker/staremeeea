// Date calendaristice locale (YYYY-MM-DD), fără fusuri orare ascunse. Totul se calculează pe dispozitiv.

export const monthNames = ["ianuarie", "februarie", "martie", "aprilie", "mai", "iunie", "iulie", "august", "septembrie", "octombrie", "noiembrie", "decembrie"] as const;

export function pad(n: number) {
  return String(n).padStart(2, "0");
}

/** Ziua de azi, după ceasul dispozitivului. */
export function todayLocal(now: Date = new Date()): string {
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

function parts(date: string): [number, number, number] {
  const [y, m, d] = date.split("-").map(Number);
  return [y, m, d];
}

export function isIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [y, m, d] = parts(value);
  const t = new Date(Date.UTC(y, m - 1, d));
  return t.getUTCFullYear() === y && t.getUTCMonth() === m - 1 && t.getUTCDate() === d;
}

/** Mută o dată cu un număr de zile (negativ = înapoi). */
export function shiftDate(date: string, days: number): string {
  const [y, m, d] = parts(date);
  const t = new Date(Date.UTC(y, m - 1, d + days));
  return `${t.getUTCFullYear()}-${pad(t.getUTCMonth() + 1)}-${pad(t.getUTCDate())}`;
}

/** „duminică, 11 octombrie 2026” */
export function formatLong(date: string): string {
  const [y, m, d] = parts(date);
  return new Intl.DateTimeFormat("ro-RO", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(Date.UTC(y, m - 1, d)));
}

/** „11 octombrie” */
export function formatShort(date: string): string {
  const [, m, d] = parts(date);
  return `${d} ${monthNames[m - 1]}`;
}
