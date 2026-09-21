"use client";
import { Check } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function PricingCard({ name, price, interval, features, priceKey, recommended = false }: { name: string; price: string; interval: string; features: string[]; priceKey?: "monthly" | "annual"; recommended?: boolean }) {
  const [busy, setBusy] = useState(false); const [error, setError] = useState(""); const router = useRouter();
  async function checkout() { if (!priceKey) { router.push("/inregistrare"); return; } setBusy(true); const response = await fetch("/api/stripe/checkout", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ cadence: priceKey }) }); const data = await response.json(); if (response.ok && data.url) location.assign(data.url); else { setError(data.error || "Nu am putut deschide plata."); setBusy(false); } }
  return <article className={`editorial-card relative p-7 ${recommended ? "border-[var(--rose)] bg-[var(--blush)]" : ""}`}>{recommended && <span className="absolute right-5 top-5 rounded-full bg-[var(--wine)] px-3 py-1 text-[.65rem] font-bold uppercase tracking-wider text-white">Recomandat</span>}<p className="eyebrow">{name}</p><p className="display mt-6 text-5xl font-semibold text-[var(--wine)]">{price}</p><p className="mt-1 text-sm text-[var(--muted)]">{interval}</p><ul className="mt-7 grid gap-3">{features.map(x => <li key={x} className="flex gap-2 text-sm leading-6"><Check size={16} className="mt-1 shrink-0 text-[var(--rose)]" />{x}</li>)}</ul><button onClick={checkout} disabled={busy} className={recommended ? "button-primary mt-8 w-full" : "button-secondary mt-8 w-full"}>{busy ? "Se deschide…" : name === "FREE" ? "Începe gratuit" : "Alege planul"}</button>{error && <p role="alert" className="mt-3 text-xs text-[var(--rose-dark)]">{error}</p>}</article>;
}
