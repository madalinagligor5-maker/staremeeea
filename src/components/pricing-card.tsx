"use client";
import { Check } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function PricingCard({ name, price, interval, note, features, priceKey, recommended = false }: { name: string; price: string; interval: string; note?: string; features: string[]; priceKey: "monthly" | "annual"; recommended?: boolean }) {
  const [busy, setBusy] = useState(false); const [error, setError] = useState(""); const router = useRouter();
  async function checkout() {
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/stripe/checkout", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ cadence: priceKey }) });
      const data = await response.json();
      if (response.status === 401) { router.push("/inregistrare"); return; }
      if (response.ok && data.url) { location.assign(data.url); return; }
      setError(data.error || "Nu am putut deschide plata. Încearcă din nou.");
    } catch {
      setError("Nu am putut deschide plata. Verifică conexiunea și încearcă din nou.");
    }
    setBusy(false);
  }
  return <article className={`editorial-card relative p-7 ${recommended ? "border-[var(--rose)] bg-[var(--blush)]" : ""}`}>
    {recommended && <span className="absolute right-5 top-5 rounded-full bg-[var(--wine)] px-3 py-1 text-xs font-bold text-white">Costă mai puțin</span>}
    <h2 className="text-sm font-bold text-[var(--rose-dark)]">{name}</h2>
    <p className="display mt-5 text-5xl font-semibold text-[var(--wine)]">{price}</p>
    <p className="mt-1 text-sm text-[var(--muted)]">{interval}</p>
    {note && <p className="mt-2 text-sm font-bold text-[var(--wine)]">{note}</p>}
    <ul className="mt-6 grid gap-3">{features.map((x) => <li key={x} className="flex gap-2 text-sm leading-6"><Check size={16} className="mt-1 shrink-0 text-[var(--rose)]" aria-hidden="true" />{x}</li>)}</ul>
    <button onClick={checkout} disabled={busy} className={`${recommended ? "button-primary" : "button-secondary"} mt-8 w-full disabled:opacity-60`}>{busy ? "Se deschide…" : "Încep cele 3 zile de probă"}</button>
    {error && <p role="alert" className="mt-3 text-sm text-[var(--rose-dark)]">{error}</p>}
  </article>;
}
