import { CalendarDays, Focus, House, NotebookPen, UserRound } from "lucide-react";
import Link from "next/link";
import { Logo } from "./logo";

const nav = [[House, "Azi", "/spatiu/azi"], [CalendarDays, "Plan", "/spatiu/planificator"], [Focus, "Focus", "/spatiu/focus"], [NotebookPen, "Jurnal", "/spatiu/jurnal"], [UserRound, "Eu", "/spatiu/profil"]] as const;

export function AppShell({ children, demo = false }: { children: React.ReactNode; demo?: boolean }) {
  return <div className="min-h-[100dvh] bg-[#f8f1ef] pb-24 md:pb-0"><header className="border-b hairline bg-[rgba(251,246,244,.94)]"><div className="container-shell flex min-h-20 items-center justify-between"><Logo compact /><nav className="hidden gap-2 md:flex">{nav.map(([Icon, label, href]) => <Link className="flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-semibold text-[var(--muted)] hover:bg-white hover:text-[var(--rose-dark)]" href={href} key={href}><Icon size={17} />{label}</Link>)}</nav><Link href="/spatiu/profil" className="grid size-10 place-items-center rounded-full bg-[var(--rose-soft)] text-sm font-bold text-[var(--wine)]">SM</Link></div></header>{demo && <div className="bg-[var(--wine)] px-4 py-2 text-center text-xs text-white">Mod demo local — conectează Supabase pentru persistență și autentificare.</div>}<div>{children}</div><nav aria-label="Navigația spațiului personal" className="fixed inset-x-3 bottom-3 z-50 grid grid-cols-5 rounded-2xl border hairline bg-white/95 p-2 shadow-[0_14px_50px_rgba(86,55,62,.14)] backdrop-blur md:hidden">{nav.map(([Icon, label, href]) => <Link className="flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl text-[.65rem] font-semibold text-[var(--muted)]" href={href} key={href}><Icon size={19} />{label}</Link>)}</nav></div>;
}
