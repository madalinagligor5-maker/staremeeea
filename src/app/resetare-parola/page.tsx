import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { PasswordResetForm } from "@/components/password-reset-form";

export const metadata: Metadata = { title: "Resetare parolă", robots: { index: false, follow: false } };

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ mod?: string }> }) {
  const { mod } = await searchParams;
  const update = mod === "actualizare";
  return <main className="grid min-h-[100dvh] place-items-center p-6"><section className="w-full max-w-md"><Logo /><p className="eyebrow mt-12">{update ? "Alege o parolă nouă" : "Resetare parolă"}</p><h1 className="display mt-3 text-5xl font-semibold leading-none text-[var(--wine)]">{update ? "Un nou început." : "Se mai întâmplă."}</h1><p className="mt-4 leading-7 text-[var(--muted)]">{update ? "Folosește cel puțin opt caractere și evită o parolă pe care o folosești în altă parte." : "Introdu emailul contului. Îți trimitem un link sigur pentru alegerea unei parole noi."}</p><PasswordResetForm update={update} /><Link href="/autentificare" className="mt-6 block text-center text-sm font-bold text-[var(--rose-dark)]">Înapoi la autentificare</Link></section></main>;
}
