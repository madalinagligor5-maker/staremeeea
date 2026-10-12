// Tot ce ai scris, într-un text pe care îl poți citi fără aplicație. Pentru cine vrea să păstreze paginile
// și după ce nu mai are abonament. Se creează pe dispozitiv; nu pleacă nicăieri.
import { formatLong, formatMonth, formatWeek } from "./dates";
import { drawerById, type DrawerDoc, type Section } from "./drawers";
import type { DayEntry, PageFields } from "./entries";
import type { Settings } from "./settings";
import { levelLabels } from "./stats";

const str = (f: PageFields, k: string): string => (typeof f[k] === "string" ? (f[k] as string).trim() : "");
const on = (f: PageFields, k: string): boolean => f[k] === true;
const range = (n: number): number[] => Array.from({ length: n }, (_, i) => i + 1);
const choiceLabel = { azi: "azi", tarziu: "mai târziu", nu: "nu mai port" } as const;

function block(title: string, lines: string[]): string[] {
  return lines.length === 0 ? [] : ["", title, ...lines];
}

function task(label: string, text: string, done: boolean): string | null {
  if (text === "") return null;
  return `- ${label}${text}${done ? " (gata)" : ""}`;
}

/** O zi din Carte, ca text, fără câmpuri goale. `empty` e true dacă nu s-a scris nimic în ea (doar, eventual, nivelul). */
function dayParts(entry: DayEntry, settings?: Pick<Settings, "wins"> | null): { text: string; empty: boolean } {
  const { azi, acum, seara } = entry;
  const head: string[] = [`== ${formatLong(entry.date)} ==`];
  if (entry.level) head.push(levelLabels[entry.level]);
  const out: string[] = [];

  const aziLines: string[] = [];
  const push = (line: string | null) => { if (line) aziLines.push(line); };
  push(task("Un singur lucru: ", str(azi, "grea_lucru"), on(azi, "grea_gata")));
  for (const i of range(3)) push(task("", str(azi, `esential_${i}`), on(azi, `esential_${i}_gata`)));
  if (str(azi, "pot_astepta") !== "") aziLines.push(`Pot aștepta: ${str(azi, "pot_astepta")}`);
  for (const i of range(4)) { const ora = str(azi, `ora_${i}`); const prog = str(azi, `program_${i}`); if (ora !== "" || prog !== "") aziLines.push(`${ora}${ora !== "" && prog !== "" ? "  " : ""}${prog}`); }
  for (const i of range(2)) push(task("Pentru alții: ", str(azi, `alti_${i}`), on(azi, `alti_${i}_gata`)));
  if (str(azi, "corp_simt") !== "") aziLines.push(`În corp: ${str(azi, "corp_simt")}`);
  if (str(azi, "corp_intru") !== "") aziLines.push(`Stare aleasă: ${str(azi, "corp_intru")}`);
  const wins = range(6).filter((i) => on(azi, `castig_${i - 1}`)).map((i) => settings?.wins[i - 1] ?? `Câștig ${i}`);
  if (wins.length > 0) aziLines.push(`Câștiguri mici: ${wins.join(", ")}`);
  out.push(...block("Azi", aziLines));

  const acumLines: string[] = [];
  if (str(acum, "descarcare") !== "") acumLines.push(str(acum, "descarcare"));
  for (const i of range(8)) {
    const text = str(acum, `rand_${i}`);
    if (text === "") continue;
    const choice = (["azi", "tarziu", "nu"] as const).find((c) => on(acum, `rand_${i}_${c}`));
    acumLines.push(`- ${text}${choice ? ` (${choiceLabel[choice]})` : ""}`);
  }
  out.push(...block("Acum", acumLines));

  const resetLines: string[] = [];
  if (str(acum, "reset_ce") !== "") resetLines.push(`Ce s-a întâmplat: ${str(acum, "reset_ce")}`);
  if (str(acum, "reset_jos") !== "") resetLines.push(`Ce las jos: ${str(acum, "reset_jos")}`);
  if (str(acum, "reset_unu") !== "") resetLines.push(`Un singur lucru: ${str(acum, "reset_unu")}`);
  out.push(...block("Resetare", resetLines));

  const searaLines: string[] = [];
  if (str(seara, "a_mers") !== "") searaLines.push(`Ce a mers: ${str(seara, "a_mers")}`);
  if (str(seara, "cum_a_fost") !== "") searaLines.push(`Cum a fost ziua: ${str(seara, "cum_a_fost")}`);
  if (str(seara, "las_aici") !== "") searaLines.push(`Ce las aici: ${str(seara, "las_aici")}`);
  out.push(...block("Seara", searaLines));

  return { text: [...head, ...out].join("\n"), empty: out.length === 0 };
}

export function dayToText(entry: DayEntry, settings?: Pick<Settings, "wins"> | null): string {
  return dayParts(entry, settings).text;
}

function sectionLines(section: Section, f: PageFields, settings?: Pick<Settings, "categories"> | null): string[] {
  const id = section.id;
  const lines: string[] = [];
  if (section.kind === "lines") {
    for (const i of range(section.count)) { const t = str(f, `${id}_${i}`); if (t !== "") lines.push(`- ${section.labels?.[i - 1] ? `${section.labels[i - 1]}: ` : ""}${t}`); }
  } else if (section.kind === "tasks") {
    for (const i of range(section.count)) { const t = str(f, `${id}_${i}`); if (t !== "") lines.push(`- [${on(f, `${id}_${i}_gata`) ? "x" : " "}] ${t}`); }
  } else if (section.kind === "pairs") {
    for (const i of range(section.count)) { const a = str(f, `${id}_${i}_a`); const b = str(f, `${id}_${i}_b`); if (a !== "" || b !== "") lines.push(`- ${a}${a !== "" && b !== "" ? " — " : ""}${b}`); }
  } else if (section.kind === "money") {
    for (const i of range(section.count)) {
      const p = str(f, `${id}_${i}_p`); const e = str(f, `${id}_${i}_e`);
      if (p === "" && e === "") continue;
      lines.push(`- ${settings?.categories[i - 1]?.trim() || `Categoria ${i}`}: planificat ${p || "—"}, ieșit ${e || "—"}`);
    }
  }
  return lines;
}

/** O pagină de sertar, ca text. */
export function docToText(doc: DrawerDoc, settings?: Pick<Settings, "categories"> | null): string {
  const def = drawerById(doc.drawer);
  if (!def) return "";
  const period = def.period === "week" ? ` — ${formatWeek(doc.period)}` : def.period === "month" ? ` — ${formatMonth(doc.period)}` : "";
  const out: string[] = [];
  for (const section of def.sections) {
    const lines = sectionLines(section, doc.fields, settings);
    if (lines.length > 0) out.push("", section.title, ...lines);
  }
  return out.length === 0 ? "" : [`== ${def.title}${period} ==`, ...out].join("\n");
}

/** Toate paginile și sertarele, în ordine cronologică. Zilele fără nimic scris sunt omise. */
export function exportReadable(entries: readonly DayEntry[], docs: readonly DrawerDoc[], settings: Settings | null, now = new Date()): string {
  const days = [...entries].sort((a, b) => a.date.localeCompare(b.date)).map((e) => dayParts(e, settings)).filter((d) => !d.empty).map((d) => d.text);
  const drawerTexts = [...docs].sort((a, b) => a.key.localeCompare(b.key)).map((d) => docToText(d, settings)).filter((t) => t !== "");
  const head = [`Ritualul de azi — ce ai scris`, `Exportat pe ${now.toISOString().slice(0, 10)}`, "Acest text a fost creat pe dispozitivul tău. Nu a trecut prin serverele noastre."];
  return [head.join("\n"), ...days, ...drawerTexts].join("\n\n\n") + "\n";
}
