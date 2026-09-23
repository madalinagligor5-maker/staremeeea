"use client";

import { CalendarDays, Flower2, House, NotebookPen, UserRound } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./logo";

const nav = [
  [House, "Azi", "/spatiu/azi"],
  [Flower2, "Ritualuri", "/spatiu/ritualuri"],
  [CalendarDays, "Plan", "/spatiu/planificator"],
  [NotebookPen, "Jurnal", "/spatiu/jurnal"],
  [UserRound, "Eu", "/spatiu/profil"],
] as const;

export function AppShell({ children, demo = false }: { children: React.ReactNode; demo?: boolean }) {
  const pathname = usePathname();
  return <div className="min-h-[100dvh] bg-[var(--ivory)] pb-24 md:pb-0">
    <a href="#continut" className="skip-link">Sari la conținut</a>
    <header className="app-header"><div className="container-shell flex min-h-20 items-center justify-between gap-5">
      <Logo compact />
      <nav aria-label="Navigația spațiului personal" className="hidden items-center gap-1 md:flex">
        {nav.map(([Icon, label, href]) => { const active = pathname === href; return <Link aria-current={active ? "page" : undefined} className={`app-nav-link ${active ? "is-active" : ""}`} href={href} key={href}><Icon size={16} strokeWidth={1.7} />{label}</Link>; })}
      </nav>
      <Link href="/spatiu/profil" aria-label="Deschide profilul" className="profile-seal">RA</Link>
    </div></header>
    {demo && <div className="bg-[var(--wine)] px-4 py-2 text-center text-xs text-white">Mod demonstrativ — conectează Supabase pentru sincronizare între dispozitive.</div>}
    <div id="continut">{children}</div>
    <nav aria-label="Navigația mobilă" className="mobile-dock">
      {nav.map(([Icon, label, href]) => { const active = pathname === href; return <Link aria-current={active ? "page" : undefined} className={`mobile-dock-link ${active ? "is-active" : ""}`} href={href} key={href}><Icon size={19} strokeWidth={active ? 2.2 : 1.6} /><span>{label}</span></Link>; })}
    </nav>
  </div>;
}
