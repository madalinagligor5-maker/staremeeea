"use client";
// Cadrul aplicației Cartea: antet simplu și navigație (sus pe ecran mare, jos pe telefon).
import { BarChart3, BookOpen, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { InstallPrompt } from "@/components/install-prompt";
import { Logo } from "@/components/logo";

const nav = [
  [BookOpen, "Carte", "/carte"],
  [BarChart3, "Statistici", "/carte/statistici"],
  [ShieldCheck, "Date", "/carte/date"],
] as const;

export function CarteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return <div className="min-h-[100dvh] bg-[var(--ivory)] pb-28 md:pb-0">
    <a href="#continut" className="skip-link">Sari la conținut</a>
    <header className="app-header"><div className="container-shell flex min-h-20 items-center justify-between gap-5">
      <Logo compact />
      <nav aria-label="Navigația Cărții" className="hidden items-center gap-1 md:flex">
        {nav.map(([Icon, label, href]) => { const active = pathname === href; return <Link aria-current={active ? "page" : undefined} className={`app-nav-link ${active ? "is-active" : ""}`} href={href} key={href}><Icon size={16} strokeWidth={1.7} aria-hidden="true" />{label}</Link>; })}
      </nav>
    </div></header>
    <main id="continut" className="mx-auto w-full max-w-2xl px-4 py-8 sm:py-10">{children}</main>
    <nav aria-label="Navigația Cărții, pe telefon" className="mobile-dock" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
      {nav.map(([Icon, label, href]) => { const active = pathname === href; return <Link aria-current={active ? "page" : undefined} className={`mobile-dock-link ${active ? "is-active" : ""}`} href={href} key={href}><Icon size={19} strokeWidth={active ? 2.2 : 1.6} aria-hidden="true" /><span>{label}</span></Link>; })}
    </nav>
    <InstallPrompt />
  </div>;
}
