// Statistici pentru Carte. Totul se calculează din textul utilizatorului, fără servicii externe.

export type Level = "buna" | "obosita" | "grea";

export const levelLabels: Record<Level, string> = { buna: "Zi bună", obosita: "Zi obosită", grea: "Zi grea" };

// Nuanțe din brand, de la plin (zi bună) la deschis (zi grea).
export const levelColors: Record<Level, { bg: string; fg: string }> = {
  buna: { bg: "#86495E", fg: "#F6EFE6" },
  obosita: { bg: "#C99AA5", fg: "#432D3D" },
  grea: { bg: "#EBD6DA", fg: "#432D3D" },
};

const stopwords = new Set(
  ("a ai al ale am ar as asa asta astazi at ati au aveam avea azi b ba bine c ca cam cand care cat catre ce cei cel cele cu cum da dar de deci deja desi din dintre doar dupa e el ea ei ele era esti este eu fi fie fost i ii il imi in inca intr intre la le li lor lui m ma mai mi mie mult multa multe multi n ne nici nimic noi nu o or ori pe peste pana poate prea pot s sa sau se si sunt te ti tot toti toata toate tu u un una unde unei unui unor va vei voi vor x z zi zile").split(" "),
);

function fold(word: string) {
  return word.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[șş]/g, "s").replace(/[țţ]/g, "t").toLowerCase();
}

export type WordCount = { word: string; count: number };

/** Cuvintele cele mai folosite, fără cuvinte de legătură. Diacriticele nu schimbă gruparea. */
export function topWords(texts: readonly string[], limit = 10, minLength = 3): WordCount[] {
  const groups = new Map<string, { count: number; forms: Map<string, number> }>();
  for (const text of texts) {
    for (const match of text.matchAll(/\p{L}+/gu)) {
      const original = match[0].toLowerCase();
      const key = fold(original);
      if (key.length < minLength || stopwords.has(key)) continue;
      const group = groups.get(key) ?? { count: 0, forms: new Map() };
      group.count += 1;
      group.forms.set(original, (group.forms.get(original) ?? 0) + 1);
      groups.set(key, group);
    }
  }
  return [...groups.values()]
    .map((g) => ({ word: [...g.forms.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0][0], count: g.count }))
    .sort((a, b) => b.count - a.count || a.word.localeCompare(b.word, "ro"))
    .slice(0, limit);
}

export function levelCounts(entries: readonly { level: Level | null }[]): Record<Level, number> {
  const counts: Record<Level, number> = { buna: 0, obosita: 0, grea: 0 };
  for (const e of entries) if (e.level) counts[e.level] += 1;
  return counts;
}

export type MonthCell = { date: string; day: number; level: Level | null } | null;

function iso(y: number, m: number, d: number) {
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

/** Calendarul unei luni (luna 1–12), pe săptămâni care încep luni. Celulele goale sunt null. */
export function monthGrid(year: number, month: number, entries: readonly { entry_date: string; level: Level | null }[]): MonthCell[][] {
  const byDate = new Map(entries.map((e) => [e.entry_date, e.level]));
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const offset = (new Date(Date.UTC(year, month - 1, 1)).getUTCDay() + 6) % 7;
  const cells: MonthCell[] = Array.from({ length: offset }, () => null);
  for (let d = 1; d <= daysInMonth; d++) {
    const date = iso(year, month, d);
    cells.push({ date, day: d, level: byDate.get(date) ?? null });
  }
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks: MonthCell[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}
