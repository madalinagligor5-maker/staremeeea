"use client";
/* eslint-disable react-hooks/set-state-in-effect */
import { Check, Heart, X } from "lucide-react";
import { useEffect, useState } from "react";

const items = ["Am mâncat ceva", "Am băut apă", "Am făcut un lucru important", "Am făcut ceva pentru mine"];
export function MinimumDay() {
  const [open,setOpen]=useState(false); const [done,setDone]=useState<string[]>([]);
  useEffect(()=>{const saved=localStorage.getItem(`minimum-day-${new Date().toISOString().slice(0,10)}`);if(saved)setDone(JSON.parse(saved));},[]);
  function toggle(item:string){const next=done.includes(item)?done.filter(x=>x!==item):[...done,item];setDone(next);localStorage.setItem(`minimum-day-${new Date().toISOString().slice(0,10)}`,JSON.stringify(next));}
  if(!open)return <button onClick={()=>setOpen(true)} className="editorial-card w-full p-6 text-left transition-transform hover:-translate-y-0.5"><Heart size={20} className="text-[var(--rose)]"/><p className="mt-4 font-bold text-[var(--wine)]">Am nevoie de o zi minimă</p><p className="mt-2 text-sm leading-6 text-[var(--muted)]">Patru lucruri. Fără obiective în plus.</p></button>;
  return <section className="editorial-card bg-[var(--blush)] p-6"><div className="flex items-start justify-between"><div><p className="eyebrow">Ziua minimă</p><h2 className="display mt-2 text-3xl font-semibold text-[var(--wine)]">Astăzi este suficient.</h2></div><button aria-label="Închide" onClick={()=>setOpen(false)} className="grid size-10 place-items-center rounded-full bg-white"><X size={18}/></button></div><div className="mt-6 grid gap-2">{items.map(item=><button key={item} onClick={()=>toggle(item)} className="flex min-h-12 items-center gap-3 rounded-xl bg-white px-4 text-left text-sm font-semibold"><span className={`grid size-6 place-items-center rounded-full border ${done.includes(item)?"border-[var(--rose)] bg-[var(--rose)] text-white":"hairline"}`}>{done.includes(item)&&<Check size={14}/>}</span>{item}</button>)}</div><p className="mt-5 text-xs leading-5 text-[var(--muted)]">Nu există serie de păstrat. Ce ai bifat rămâne o mică victorie.</p></section>;
}
