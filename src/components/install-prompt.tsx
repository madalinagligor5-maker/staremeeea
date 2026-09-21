"use client";
import { Download, X } from "lucide-react";
import { useEffect, useState } from "react";

type InstallEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: "accepted" | "dismissed" }> };
export function InstallPrompt() {
  const [event, setEvent] = useState<InstallEvent | null>(null); const [visible, setVisible] = useState(false);
  useEffect(() => { const visits = Number(localStorage.getItem("starea-mea-visits") || 0) + 1; localStorage.setItem("starea-mea-visits", String(visits)); const handler = (e: Event) => { e.preventDefault(); setEvent(e as InstallEvent); if (visits >= 2 && !localStorage.getItem("starea-mea-install-dismissed")) setVisible(true); }; window.addEventListener("beforeinstallprompt", handler); return () => window.removeEventListener("beforeinstallprompt", handler); }, []);
  if (!visible || !event) return null;
  return <aside className="fixed bottom-4 left-1/2 z-50 flex w-[min(calc(100%-2rem),520px)] -translate-x-1/2 items-center gap-4 rounded-2xl border hairline bg-white p-4 shadow-[0_20px_60px_rgba(86,55,62,.18)]"><span className="grid size-10 shrink-0 place-items-center rounded-full bg-[var(--blush)] text-[var(--rose-dark)]"><Download size={18} /></span><div className="min-w-0 flex-1"><p className="text-sm font-bold text-[var(--wine)]">Instalează Starea Mea</p><p className="text-xs leading-5 text-[var(--muted)]">Păstrează spațiul aproape, fără să întrerupem prima vizită.</p></div><button className="button-primary !min-h-10 !px-4 text-xs" onClick={async () => { await event.prompt(); const choice = await event.userChoice; if (choice.outcome === "accepted") setVisible(false); }}>Instalează</button><button aria-label="Închide" className="grid size-9 place-items-center" onClick={() => { localStorage.setItem("starea-mea-install-dismissed", "1"); setVisible(false); }}><X size={17} /></button></aside>;
}
