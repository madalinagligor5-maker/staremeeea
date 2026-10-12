"use client";
// Setări: ce sertare folosești, numele, moneda și categoriile. Le scrii o singură dată.
// Rămân pe acest dispozitiv.
import { useEffect, useState } from "react";
import { drawers, type DrawerId } from "@/lib/carte/drawers";
import { currencies, loadSettings, saveSettings, type Settings } from "@/lib/carte/settings";
import { TextLine } from "./fields";

export function SettingsView() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [state, setState] = useState<"idle" | "saved" | "error">("idle");

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
  </div>;
}
