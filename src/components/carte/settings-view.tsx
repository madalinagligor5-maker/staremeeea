"use client";
// Setări: ce sertare folosești, numele, moneda și categoriile. Le scrii o singură dată.
// Rămân pe acest dispozitiv.
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { drawers, type DrawerId } from "@/lib/carte/drawers";
import { momentLabels, moduleLabels, paletteInfo, toneLabels } from "@/lib/carte/profile";
import {
  currencies, loadSettings, MAX_WINS, momentIds, moduleIds, paletteIds, saveSettings, toneIds, type ModuleId, type Settings,
} from "@/lib/carte/settings";
import { TextLine } from "./fields";

export function SettingsView() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [state, setState] = useState<"idle" | "saved" | "error">("idle");
  const router = useRouter();

  useEffect(() => { setSettings(loadSettings()); }, []);

  if (!settings) return <p className="py-10 text-center text-[var(--muted)]" aria-busy="true">Se deschide…</p>;

  const update = (change: Partial<Settings>) => {
    const next: Settings = { ...settings, ...change };
    setSettings(next);
    setState(saveSettings(next) ? "saved" : "error");
  };

  const toggle = (id: DrawerId) => {
    const on = settings.enabled.includes(id);
    update({ enabled: drawers.map((d) => d.id).filter((x) => (x === id ? !on : settings.enabled.includes(x))) });
  };

  const toggleModule = (id: ModuleId) => {
    const on = settings.modules.includes(id);
    update({ modules: moduleIds.filter((x) => (x === id ? !on : settings.modules.includes(x))) });
  };

  const redo = () => {
    update({ onboarded: false });
    router.push("/carte");
  };

  const card = "rounded-2xl border hairline bg-[var(--paper)] p-5 sm:p-6";
  const h2 = "display text-2xl font-semibold text-[var(--wine)]";
  const bani = settings.enabled.includes("bani");

  return <div className="space-y-6">
    <header>
      <h1 className="display text-3xl font-semibold leading-tight text-[var(--wine)] sm:text-4xl">Setări</h1>
      <p className="mt-2 leading-7 text-[var(--muted)]">Le scrii o singură dată. Se salvează singure, pe acest dispozitiv.</p>
    </header>

    <p role="status" aria-live="polite" className="min-h-6 text-sm text-[var(--muted)]">
      {state === "saved" && "Salvat pe acest dispozitiv."}
      {state === "error" && "Nu am putut salva setările. Într-o fereastră privată, ele nu se păstrează."}
    </p>

    <section className={card} aria-labelledby="stil">
      <h2 id="stil" className={h2}>Cum arată și cum îți vorbește</h2>
      <div className="mt-4 space-y-5">
        <div>
          <p className="mb-2 text-sm font-bold text-[var(--wine)]">Paleta</p>
          <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label="Paletă">
            {paletteIds.map((p) => <button key={p} type="button" role="radio" aria-checked={settings.palette === p} onClick={() => update({ palette: p })}
              className={`rounded-2xl border-2 bg-white p-3 text-left transition-colors ${settings.palette === p ? "border-[var(--wine)]" : "border-[var(--line)]"}`}>
              <span className="flex gap-1.5" aria-hidden="true">{paletteInfo[p].swatch.map((c) => <span key={c} className="size-6 rounded-full border border-black/10" style={{ backgroundColor: c }} />)}</span>
              <span className="mt-2 block font-extrabold text-[var(--wine)]">{paletteInfo[p].title}</span>
            </button>)}
          </div>
        </div>
        <div>
          <p className="mb-2 text-sm font-bold text-[var(--wine)]">Tonul</p>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Ton">
            {toneIds.map((t) => <button key={t} type="button" role="radio" aria-checked={settings.tone === t} className="chip" onClick={() => update({ tone: t })}>{toneLabels[t].title}</button>)}
          </div>
          <p className="mt-2 text-sm text-[var(--muted)]">„{toneLabels[settings.tone].sample}”</p>
        </div>
        <div>
          <p className="mb-2 text-sm font-bold text-[var(--wine)]">Când scrii de obicei</p>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Când scrii">
            {momentIds.map((m) => <button key={m} type="button" role="radio" aria-checked={settings.moment === m} className="chip" onClick={() => update({ moment: m })}>{momentLabels[m]}</button>)}
          </div>
        </div>
      </div>
    </section>

    <section className={card} aria-labelledby="module">
      <h2 id="module" className={h2}>Ce apare în pagina zilei</h2>
      <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Module mici, pe care le pornești doar dacă te ajută.</p>
      <ul className="mt-4 space-y-3">
        {moduleIds.map((m) => {
          const on = settings.modules.includes(m);
          return <li key={m}>
            <button type="button" role="switch" aria-checked={on} onClick={() => toggleModule(m)}
              className={`flex w-full items-center justify-between gap-4 rounded-2xl border-2 p-4 text-left transition-colors ${on ? "border-[var(--wine)] bg-[var(--blush)]/55" : "border-[var(--line)] bg-white"}`}>
              <span className="min-w-0">
                <span className="block font-extrabold text-[var(--wine)]">{moduleLabels[m].title}</span>
                <span className="mt-0.5 block text-sm leading-5 text-[var(--muted)]">{moduleLabels[m].line}</span>
              </span>
              <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-extrabold ${on ? "bg-[var(--wine)] text-white" : "bg-[var(--blush)] text-[var(--wine)]"}`}>{on ? "Folosesc" : "Nu acum"}</span>
            </button>
          </li>;
        })}
      </ul>
    </section>

    <section className={card} aria-labelledby="castiguri">
      <h2 id="castiguri" className={h2}>Câștigurile tale mici</h2>
      <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Până la {MAX_WINS}. Apar în pagina zilei, dacă modulul e pornit. Lasă gol un rând ca să-l scoți.</p>
      <div className="mt-4 space-y-3">
        {Array.from({ length: MAX_WINS }, (_, i) => <TextLine key={i} id={`setari-castig-${i}`} label={`Câștigul ${i + 1}`} hideLabel value={settings.wins[i] ?? ""} placeholder="De exemplu: Am băut apă"
          onChange={(v) => { const next = Array.from({ length: MAX_WINS }, (_, j) => (j === i ? v.slice(0, 60) : settings.wins[j] ?? "")); update({ wins: next.filter((w, j) => w.trim() !== "" || j === i) }); }} />)}
      </div>
    </section>

    <section className={card} aria-labelledby="sertare">
      <h2 id="sertare" className={h2}>Ce folosești</h2>
      <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Cartea (Azi, Acum, Seara, Resetare) e mereu aici. Restul alegi tu. Poți schimba oricând; ce ai scris nu se pierde.</p>
      <ul className="mt-4 space-y-3">
        {drawers.map((d) => {
          const on = settings.enabled.includes(d.id);
          return <li key={d.id}>
            <button type="button" role="switch" aria-checked={on} onClick={() => toggle(d.id)}
              className={`flex w-full items-center justify-between gap-4 rounded-2xl border-2 p-4 text-left transition-colors ${on ? "border-[var(--wine)] bg-[var(--blush)]/55" : "border-[var(--line)] bg-white"}`}>
              <span className="min-w-0">
                <span className="block font-extrabold text-[var(--wine)]">{d.title}</span>
                <span className="mt-0.5 block text-sm leading-5 text-[var(--muted)]">{d.line}</span>
              </span>
              <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-extrabold ${on ? "bg-[var(--wine)] text-white" : "bg-[var(--blush)] text-[var(--wine)]"}`}>{on ? "Folosesc" : "Nu acum"}</span>
            </button>
          </li>;
        })}
      </ul>
    </section>

    <section className={card} aria-labelledby="despre">
      <h2 id="despre" className={h2}>Despre tine</h2>
      <div className="mt-4 space-y-4">
        <TextLine id="setari-nume" label="Numele tău (opțional)" value={settings.name} onChange={(v) => update({ name: v })} />
        <div>
          <label htmlFor="setari-moneda" className="mb-1.5 block text-sm font-bold text-[var(--wine)]">Moneda</label>
          <input id="setari-moneda" list="monede" value={settings.currency} onChange={(e) => update({ currency: e.target.value.slice(0, 12) })} autoComplete="off" className="min-h-11 w-full rounded-xl border hairline bg-white px-4 py-3 text-base text-[var(--ink)]" />
          <datalist id="monede">{currencies.map((c) => <option key={c} value={c} />)}</datalist>
          <p className="mt-1 text-sm text-[var(--muted)]">Alege din listă sau scrie-o pe a ta.</p>
        </div>
      </div>
    </section>

    <section className={card} aria-labelledby="categorii">
      <h2 id="categorii" className={h2}>Categoriile pentru bani</h2>
      <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{bani ? "Șase categorii, scrise o singură dată. Apar în sertarul Bani." : "Contează doar dacă folosești sertarul Bani."}</p>
      <div className="mt-4 space-y-3">
        {settings.categories.map((c, i) => <TextLine key={i} id={`setari-categorie-${i}`} label={`Categoria ${i + 1}`} hideLabel value={c} placeholder={["Casă", "Mâncare", "Transport", "Sănătate", "Timp liber", "Altele"][i]} onChange={(v) => update({ categories: settings.categories.map((x, j) => (j === i ? v.slice(0, 60) : x)) })} />)}
      </div>
    </section>

    <section className={card} aria-labelledby="refa">
      <h2 id="refa" className={h2}>Refă configurarea</h2>
      <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Răspunzi din nou la cele șase întrebări. Ce ai scris în pagini nu se șterge.</p>
      <button type="button" onClick={redo} className="button-secondary mt-4">Reiau configurarea</button>
    </section>
  </div>;
}
