"use client";
import { Menu, Search, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Logo } from "./logo";
import { preLaunch } from "@/lib/launch";

const allLinks = [["Ritualuri", "/instrumente"], ["Jurnal", "/blog"], ["Resurse", "/resurse"], ["Despre", "/despre"]];
const links = preLaunch ? [["Despre", "/despre"]] : allLinks;
const cta: [string, string] = preLaunch ? ["Fii prima care află", "/#lista"] : ["Începe ritualul", "/inregistrare"];

export function PublicHeader() {
  const [open, setOpen] = useState(false);
  return <header className="sticky top-0 z-50 border-b hairline bg-[rgba(246,239,230,.92)] backdrop-blur-md">
    <div className="container-shell flex min-h-[82px] items-center justify-between gap-6">
      <Logo />
      <nav aria-label="Navigație principală" className="hidden items-center gap-6 lg:flex">
        {links.map(([label, href]) => <Link key={href} className="text-sm font-semibold text-[var(--muted)] transition-colors hover:text-[var(--rose-dark)]" href={href}>{label}</Link>)}
      </nav>
      <div className="hidden items-center gap-2 lg:flex">{!preLaunch && <Link href="/resurse" aria-label="Caută în resurse" className="grid size-11 place-items-center rounded-full hover:bg-white"><Search size={18} /></Link>}<Link className="button-primary" href={cta[1]}>{cta[0]}</Link></div>
      <button aria-expanded={open} aria-controls="mobile-nav" aria-label={open ? "Închide meniul" : "Deschide meniul"} onClick={() => setOpen(!open)} className="grid size-11 place-items-center rounded-full border hairline bg-white lg:hidden">{open ? <X /> : <Menu />}</button>
    </div>
    {open && <nav id="mobile-nav" aria-label="Navigație mobilă" className="container-shell grid gap-1 border-t hairline py-4 lg:hidden">{links.map(([label, href]) => <Link onClick={() => setOpen(false)} key={href} className="rounded-xl px-3 py-3 text-sm font-semibold hover:bg-white" href={href}>{label}</Link>)}<Link onClick={() => setOpen(false)} className="button-primary mt-2" href={cta[1]}>{cta[0]}</Link>{!preLaunch && <Link className="px-3 py-3 text-center text-sm font-semibold text-[var(--rose-dark)]" href="/autentificare">Am deja cont</Link>}</nav>}
  </header>;
}
