"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function WaitlistForm() {
  const router = useRouter();
  const [state, setState] = useState<{ kind: "idle" | "sending" | "error"; message?: string }>({ kind: "idle" });

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(form);
    const email = String(data.get("email") ?? "").trim();
    if (!emailPattern.test(email)) return setState({ kind: "error", message: "Verifică adresa de email, te rog." });
    if (!data.get("consent")) return setState({ kind: "error", message: "Bifează acordul ca să te putem înscrie." });
    setState({ kind: "sending", message: "Se trimite…" });
    try {
      const response = await fetch("/api/lista", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, consent: true, website: String(data.get("website") ?? "") }) });
      const json = await response.json().catch(() => ({}));
      if (response.ok) return router.push("/multumim");
      setState({ kind: "error", message: json.error ?? "Ceva n-a mers. Încearcă din nou în câteva minute." });
    } catch {
      setState({ kind: "error", message: "Ceva n-a mers. Încearcă din nou în câteva minute." });
    }
  }

  return <form onSubmit={onSubmit} noValidate className="rounded-[1.4rem] border hairline bg-white p-6 shadow-[0_18px_60px_rgba(67,45,61,.07)] sm:p-8">
    <label htmlFor="email" className="mb-2 block text-sm font-bold text-[var(--wine)]">Adresa ta de email</label>
    <input id="email" name="email" type="email" required autoComplete="email" inputMode="email" placeholder="nume@exemplu.ro" className="min-h-[52px] w-full rounded-2xl border-2 border-[var(--blush)] bg-[var(--ivory)] px-4 text-base text-[var(--ink)] placeholder:text-[var(--muted)]/70" />
    <div aria-hidden="true" className="absolute -left-[9999px] h-0 overflow-hidden"><label>Nu completa <input type="text" name="website" tabIndex={-1} autoComplete="off" /></label></div>
    <label htmlFor="consent" className="my-5 flex items-start gap-3 text-sm leading-6 text-[var(--muted)]">
      <input id="consent" name="consent" type="checkbox" required className="mt-1 size-5 shrink-0 accent-[var(--wine)]" />
      <span>Sunt de acord să primesc pe email mini-pagina „Azi” și informări despre lansarea Ritualul de azi. Mă pot dezabona oricând. Citește <a className="font-semibold text-[var(--rose)] underline underline-offset-2" href="/confidentialitate">politica de confidențialitate</a>.</span>
    </label>
    <button type="submit" disabled={state.kind === "sending"} className="button-primary w-full sm:w-auto disabled:opacity-60">Vreau să aflu prima</button>
    <p role="status" aria-live="polite" className={`mt-4 min-h-6 text-sm font-semibold ${state.kind === "error" ? "text-[#9b2c3c]" : "text-[var(--muted)]"}`}>{state.message}</p>
    <p className="mt-1 text-xs text-[var(--muted)]">Fără spam. Primești un email de confirmare, apoi doar ce ți-am promis.</p>
  </form>;
}
