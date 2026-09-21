"use client";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const [show, setShow] = useState(false); const [busy, setBusy] = useState(false); const [message, setMessage] = useState(""); const [error, setError] = useState(""); const router = useRouter();
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setBusy(true); setError(""); setMessage(""); const form = new FormData(e.currentTarget); const email = String(form.get("email")); const password = String(form.get("password")); const firstName = String(form.get("firstName") || ""); const supabase = createClient();
    if (!supabase) { setError("Configurează Supabase în .env.local pentru a activa autentificarea."); setBusy(false); return; }
    if (mode === "signup") {
      const { error: authError } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${location.origin}/auth/callback?next=/onboarding`, data: { first_name: firstName } } });
      if (authError) setError(authError.message); else setMessage("Verifică-ți inboxul pentru a confirma adresa. Apoi spațiul tău va fi pregătit.");
    } else {
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) setError("Emailul sau parola nu sunt corecte."); else { router.push("/spatiu/azi"); router.refresh(); }
    }
    setBusy(false);
  }
  return <form onSubmit={submit} className="mt-8 grid gap-5">{mode === "signup" && <label className="grid gap-2 text-sm font-bold text-[var(--wine)]">Prenume<input required name="firstName" autoComplete="given-name" className="min-h-12 rounded-xl border hairline bg-white px-4 font-normal outline-none focus:border-[var(--rose)]" placeholder="Cum vrei să îți spunem?" /></label>}<label className="grid gap-2 text-sm font-bold text-[var(--wine)]">Email<input required type="email" name="email" autoComplete="email" className="min-h-12 rounded-xl border hairline bg-white px-4 font-normal outline-none focus:border-[var(--rose)]" placeholder="numele@exemplu.ro" /></label><label className="grid gap-2 text-sm font-bold text-[var(--wine)]">Parolă<span className="relative"><input required minLength={8} type={show ? "text" : "password"} name="password" autoComplete={mode === "login" ? "current-password" : "new-password"} className="min-h-12 w-full rounded-xl border hairline bg-white px-4 pr-12 font-normal outline-none focus:border-[var(--rose)]" placeholder="Minimum 8 caractere" /><button type="button" onClick={() => setShow(!show)} aria-label={show ? "Ascunde parola" : "Arată parola"} className="absolute right-1 top-1 grid size-10 place-items-center rounded-lg">{show ? <EyeOff size={18} /> : <Eye size={18} />}</button></span></label>{mode === "signup" && <label className="flex gap-3 text-xs font-normal leading-5 text-[var(--muted)]"><input required type="checkbox" className="mt-1 size-4 accent-[var(--rose)]" />Accept <Link className="underline" href="/termeni">termenii</Link> și am citit <Link className="underline" href="/confidentialitate">politica de confidențialitate</Link>. Consimțământul de marketing se solicită separat.</label>}{error && <p role="alert" className="rounded-xl bg-[#f9e4e6] p-3 text-sm text-[var(--rose-dark)]">{error}</p>}{message && <p role="status" className="rounded-xl bg-[var(--blush)] p-4 text-sm leading-6 text-[var(--wine)]">{message}</p>}<button disabled={busy} className="button-primary w-full disabled:opacity-50">{busy ? "Te rugăm să aștepți…" : mode === "login" ? "Intră în spațiul tău" : "Creează spațiul meu"} {!busy && <ArrowRight size={17} />}</button>{mode === "login" && <Link href="/resetare-parola" className="text-center text-xs font-bold text-[var(--rose-dark)]">Ai uitat parola?</Link>}</form>;
}
