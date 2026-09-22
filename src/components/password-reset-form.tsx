"use client";

import { FormEvent, useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function PasswordResetForm({ update = false }: { update?: boolean }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const supabase = createClient();
    if (!supabase) {
      setError("Autentificarea nu este configurată.");
      setBusy(false);
      return;
    }

    if (update) {
      const password = String(form.get("password") ?? "");
      const confirmation = String(form.get("confirmation") ?? "");
      if (password !== confirmation) {
        setError("Parolele nu coincid.");
        setBusy(false);
        return;
      }
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) setError(updateError.message);
      else setMessage("Parola a fost actualizată. Poți intra în cont.");
    } else {
      const email = String(form.get("email") ?? "");
      const next = encodeURIComponent("/resetare-parola?mod=actualizare");
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${location.origin}/auth/callback?next=${next}` });
      if (resetError) setError(resetError.message);
      else setMessage("Ți-am trimis un email cu linkul de resetare. Verifică și folderul spam.");
    }
    setBusy(false);
  }

  return <form onSubmit={submit} className="mt-8 grid gap-5">
    {update ? <>
      <label className="grid gap-2 text-sm font-bold text-[var(--wine)]">Parolă nouă<input required minLength={8} type="password" name="password" autoComplete="new-password" className="min-h-12 rounded-xl border hairline bg-white px-4 font-normal outline-none focus:border-[var(--rose)]" /></label>
      <label className="grid gap-2 text-sm font-bold text-[var(--wine)]">Confirmă parola<input required minLength={8} type="password" name="confirmation" autoComplete="new-password" className="min-h-12 rounded-xl border hairline bg-white px-4 font-normal outline-none focus:border-[var(--rose)]" /></label>
    </> : <label className="grid gap-2 text-sm font-bold text-[var(--wine)]">Email<input required type="email" name="email" autoComplete="email" className="min-h-12 rounded-xl border hairline bg-white px-4 font-normal outline-none focus:border-[var(--rose)]" placeholder="numele@exemplu.ro" /></label>}
    {error && <p role="alert" className="rounded-xl bg-[#f9e4e6] p-3 text-sm text-[var(--rose-dark)]">{error}</p>}
    {message && <p role="status" className="flex gap-2 rounded-xl bg-[#edf5f0] p-4 text-sm leading-6 text-[#315c48]"><Check size={17} className="mt-0.5 shrink-0" />{message}</p>}
    <button disabled={busy || Boolean(message)} className="button-primary w-full disabled:opacity-50">{busy ? "Se procesează…" : update ? "Salvează parola nouă" : "Trimite linkul"}<ArrowRight size={17} /></button>
  </form>;
}
