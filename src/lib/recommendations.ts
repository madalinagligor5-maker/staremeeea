export type MindState = "calm" | "foggy" | "agitated" | "overwhelmed" | "focused" | "sensitive" | "low_energy" | "well";
export type Recommendation = { title: string; detail: string; href: string; minutes: number };

const actions = {
  breathe: { title: "Respiră puțin", detail: "O pauză ghidată, fără să repari nimic.", href: "/spatiu/calm", minutes: 2 },
  dump: { title: "Eliberează-ți mintea", detail: "Pune gândurile pe hârtie, fără să le ordonezi încă.", href: "/spatiu/brain-dump", minutes: 5 },
  one: { title: "Alege un singur lucru", detail: "Un pas mic este un plan suficient pentru acum.", href: "/spatiu/planificator", minutes: 5 },
  shortFocus: { title: "Focus blând", detail: "Încearcă doar cinci minute, apoi alegi din nou.", href: "/spatiu/focus", minutes: 5 },
  longFocus: { title: "Folosește energia de acum", detail: "O sesiune de focus de 25 de minute.", href: "/spatiu/focus", minutes: 25 },
  plan: { title: "Privește planul", detail: "Alege ce se potrivește energiei tale.", href: "/spatiu/planificator", minutes: 10 },
  rest: { title: "Odihna este o alegere validă", detail: "Lasă azi doar ce este esențial.", href: "/spatiu/calm", minutes: 3 },
};

export function getRecommendations(state: MindState, energy: number, focus?: number): Recommendation[] {
  if (state === "overwhelmed" && energy <= 2) return [actions.breathe, actions.dump, actions.one];
  if (state === "low_energy" || energy <= 1) return [actions.rest, actions.one];
  if (state === "foggy") return [actions.dump, actions.shortFocus, actions.one];
  if (energy >= 4 && (state === "focused" || (focus ?? 0) >= 4)) return [actions.plan, actions.longFocus];
  if (state === "agitated" || state === "sensitive") return [actions.breathe, actions.dump];
  return [actions.one, actions.shortFocus, actions.plan];
}
