"use client";
// Contul și abonamentul, pe pagina Date. Apare numai după lansare (când există conturi) și nu arată nimic din ce ai scris.
import Link from "next/link";
import { useEffect, useState } from "react";
import { launchMode } from "@/lib/launch";
import { createClient } from "@/lib/supabase/client";

type Status = { configured: boolean; signedIn?: boolean; email?: string | null; subscribed?: boolean; hasSubscription?: boolean; status?: string | null; periodEnd?: string | null };

const date = (iso: string | null | undefined) => (iso ? new Date(iso).toLocaleDateString("ro-RO", { day: "numeric", month: "long", year: "numeric" }) : null);

function describe(s: Status): string {
  const end = date(s.periodEnd);
  switch (s.status) {
    case "trialing": return end ? `Ești în perioada de probă, până pe ${end}. Dacă nu anulezi până atunci, abonamentul începe.` : "Ești în perioada de probă.";
    case "active": return end ? `Abonamentul este activ. Următoarea plată: ${end}.` : "Abonamentul este activ.";
    case "past_due": return "Ultima plată nu a trecut. Actualizează cardul din administrarea abonamentului.";
    case "canceled": case "incomplete_expired": case "unpaid": return "Abonamentul s-a încheiat. Ce ai scris rămâne al tău: îl poți citi și exporta mai sus.";
    default: return "Nu ai un abonament activ.";
  }
}

export function AccountSection() {
  const [state, setState] = useState<Status | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (launchMode === "pre") return;
    fetch("/api/account/abonament", { cache: "no-store" })
      .then(async (r) => (r.ok ? ((await r.json()) as Status) : null))
      .then((s) => setState(s))
      .catch(() => setState(null));
  }, []);

  if (launchMode === "pre" || !state?.configured) return null;

  async function manage() {
    setBusy(true); setError("");
    try {
      const r = await fetch("/api/stripe/portal", { method: "POST" });
      const d = await r.json();
      if (r.ok && d.url) { location.assign(d.url); return; }
      setError(d.error || "Nu am putut deschide administrarea. Încearcă din nou.");
    } catch { setError("Nu am putut deschide administrarea. Verifică conexiunea."); }
    setBusy(false);
  }

  async function signOut() {
    await createClient()?.auth.signOut();
    location.assign("/");
  }

  const card = "rounded-2xl border hairline bg-[var(--paper)] p-5 sm:p-6";
  return <section className={card} aria-labelledby="cont">
    <h2 id="cont" className="display text-2xl font-semibold text-[var(--wine)]">Contul și abonamentul</h2>
    {!state.signedIn
      ? <>
          <p className="mt-2 leading-7 text-[var(--muted)]">Nu ești conectată. Contul ține doar abonamentul; ce scrii nu este legat de el.</p>
          <div className="mt-4 flex flex-wrap gap-3"><Link className="button-primary" href="/autentificare?next=/carte/date">Intru în cont</Link><Link className="button-secondary" href="/preturi">Văd planurile</Link></div>
        </>
      : <>
          <p className="mt-2 text-sm text-[var(--muted)]">{state.email}</p>
          <p className="mt-2 leading-7 text-[var(--ink)]">{describe(state)}</p>
          <div className="mt-4 flex flex-wrap gap-3">
            {state.hasSubscription && <button type="button" onClick={manage} disabled={busy} className="button-primary disabled:opacity-60">{busy ? "Se deschide…" : "Administrez abonamentul"}</button>}
            {!state.subscribed && <Link className={state.hasSubscription ? "button-secondary" : "button-primary"} href="/preturi">Văd planurile</Link>}
            <button type="button" onClick={signOut} className="button-secondary">Ies din cont</button>
          </div>
          <p className="mt-3 text-sm leading-6 text-[var(--muted)]">Din administrare poți anula, schimba cardul sau trece de la lunar la anual. Anulezi oricând.</p>
          {error && <p role="alert" className="mt-3 text-sm font-bold text-[var(--wine)]">{error}</p>}
        </>}
  </section>;
}
