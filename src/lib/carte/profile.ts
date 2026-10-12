// Personalizarea: din ce spune utilizatorul că îl apasă, aplicația își alege singură sertarele și modulele.
// Logică pură, fără acces la browser, ca să poată fi verificată ușor.
import type { DrawerId } from "./drawers";
import type { Focus, ModuleId, Moment, Palette, Tone } from "./settings";
import type { Level } from "./stats";

export type FocusOption = { id: Focus; label: string; line: string; drawers: DrawerId[]; modules: ModuleId[] };

export const focusOptions: readonly FocusOption[] = [
  { id: "minte", label: "Mintea aglomerată", line: "Prea multe gânduri deodată", drawers: ["idei"], modules: [] },
  { id: "sarcini", label: "Prea multe de făcut", line: "Nu știu de unde să încep", drawers: ["saptamana", "idei"], modules: ["cronometru"] },
  { id: "energie", label: "Energie puțină", line: "Zilele în care nu merge nimic", drawers: [], modules: ["castiguri", "cronometru"] },
  { id: "emotii", label: "Emoții grele", line: "Mă copleșește ce simt", drawers: [], modules: ["corp"] },
  { id: "bani", label: "Banii", line: "Nu mai știu unde se duc", drawers: ["bani"], modules: [] },
  { id: "casa", label: "Casa și mesele", line: "Mâncare, cumpărături, ordine", drawers: ["masa", "repeta"], modules: [] },
  { id: "termene", label: "Termene și programări", line: "Uit ce trebuie făcut până când", drawers: ["programari", "luna"], modules: [] },
];

export const MAX_FOCUS = 3;

export const winSuggestions: readonly string[] = [
  "Am mâncat ceva", "Am băut apă", "Am luat o pauză", "Am ieșit puțin afară", "Am răspuns la un mesaj",
  "M-am mișcat puțin", "Am făcut un duș", "Am cerut ajutor", "Am spus nu la ceva", "Am mers la culcare la timp",
];

/** Sertarele și modulele potrivite pentru ce a ales utilizatorul. Idei și liste rămâne mereu, ca loc de parcare. */
export function planFor(focus: readonly Focus[]): { enabled: DrawerId[]; modules: ModuleId[] } {
  const drawers = new Set<DrawerId>(["idei"]);
  const modules = new Set<ModuleId>();
  for (const id of focus) {
    const option = focusOptions.find((o) => o.id === id);
    if (!option) continue;
    option.drawers.forEach((d) => drawers.add(d));
    option.modules.forEach((m) => modules.add(m));
  }
  // Fără nicio alegere, primește varianta simplă: cele trei module mici.
  if (focus.length === 0) (["corp", "castiguri", "cronometru"] as ModuleId[]).forEach((m) => modules.add(m));
  return { enabled: [...drawers], modules: [...modules] };
}

export const moduleLabels: Record<ModuleId, { title: string; line: string }> = {
  corp: { title: "Cum sunt în corp", line: "Un check-in de 30 de secunde și o pauză de un minut." },
  castiguri: { title: "Câștiguri mici", line: "Lucrurile mici pe care le-ai făcut pentru tine, la vedere." },
  cronometru: { title: "Zece minute", line: "Un cronometru blând, pentru un singur lucru." },
};

export const toneLabels: Record<Tone, { title: string; sample: string }> = {
  bland: { title: "Blând", sample: "Trei lucruri ajung azi. Restul poate aștepta." },
  direct: { title: "Direct", sample: "Trei lucruri. Restul așteaptă." },
};

export const momentLabels: Record<Moment, string> = { dimineata: "Dimineața", seara: "Seara", variaza: "Variază" };

export const paletteInfo: Record<Palette, { title: string; swatch: [string, string, string] }> = {
  prune: { title: "Prună", swatch: ["#432D3D", "#86495E", "#E8DCCB"] },
  salvie: { title: "Salvie", swatch: ["#263A2E", "#55705A", "#DFE5D9"] },
  nisip: { title: "Nisip", swatch: ["#4A2D22", "#A2573A", "#ECDCC3"] },
  mare: { title: "Mare", swatch: ["#1F3347", "#3F6785", "#D9E2EA"] },
};

export function greetingWord(hour: number): string {
  if (hour >= 5 && hour < 11) return "Bună dimineața";
  if (hour >= 11 && hour < 18) return "Bună ziua";
  if (hour >= 18 && hour < 22) return "Bună seara";
  return "E târziu";
}

export function greeting(name: string, hour: number): string {
  const n = name.trim();
  return n === "" ? greetingWord(hour) : `${greetingWord(hour)}, ${n}`;
}

/** Rândul de sub salut: răspunde nivelului ales, în tonul ales. Nu judecă și nu promite nimic. */
export function subline(level: Level | null, tone: Tone, yesterday: Level | null): string {
  if (level === null) {
    if (yesterday === "grea") return tone === "bland" ? "Ieri a fost o zi grea. Azi poți începe mic." : "Ieri a fost greu. Începe mic azi.";
    return tone === "bland" ? "Alege cum ești azi. Restul se adaptează." : "Alege nivelul. Restul se adaptează.";
  }
  const lines: Record<Level, Record<Tone, string>> = {
    buna: { bland: "O zi cu mai multă energie. Nu trebuie să o consumi toată.", direct: "Zi bună. Ține-te de ce contează." },
    obosita: { bland: "Trei lucruri ajung azi. Restul poate aștepta.", direct: "Trei lucruri. Restul așteaptă." },
    grea: { bland: "Azi contează un singur lucru. Și dacă nu iese, ai încercat.", direct: "Un singur lucru. Atât." },
  };
  return lines[level][tone];
}

/** Pagina cu care se deschide ziua, după ritmul ales și ora. */
export function defaultPage(moment: Moment, hour: number): "azi" | "seara" {
  if (moment === "dimineata") return "azi";
  if (moment === "seara") return "seara";
  return hour >= 18 ? "seara" : "azi";
}

/** Câte minute propune cronometrul, după nivelul zilei. */
export function minutesFor(level: Level | null): number {
  if (level === "grea") return 5;
  if (level === "buna") return 25;
  return 10;
}

/** Câte lucruri alese pentru azi sunt de ajuns, după nivel. */
export function todayLimit(level: Level | null): number {
  return level === "grea" ? 1 : 3;
}
