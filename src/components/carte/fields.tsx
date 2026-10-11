"use client";
// Elemente mici, folosite pe toate paginile Cărții. Ținte mari de atins, text clar, nimic care acuză.
import { Check } from "lucide-react";

const inputClass = "w-full rounded-xl border hairline bg-white px-4 py-3 text-base leading-6 text-[var(--ink)] placeholder:text-[var(--muted)]/60 focus:border-[var(--rose)]";

export function Tick({ checked, onChange, label }: { checked: boolean; onChange: (value: boolean) => void; label: string }) {
  return <button type="button" role="checkbox" aria-checked={checked} aria-label={label} onClick={() => onChange(!checked)}
    className={`grid size-11 shrink-0 place-items-center rounded-xl border-2 transition-colors ${checked ? "border-[var(--wine)] bg-[var(--wine)] text-white" : "border-[var(--rose)] bg-white text-transparent"}`}>
    <Check size={22} strokeWidth={3} aria-hidden="true" />
  </button>;
}

export function TextLine({ id, label, value, onChange, placeholder, hideLabel = false }: { id: string; label: string; value: string; onChange: (value: string) => void; placeholder?: string; hideLabel?: boolean }) {
  return <div className="min-w-0 flex-1">
    <label htmlFor={id} className={hideLabel ? "sr-only" : "mb-1.5 block text-sm font-bold text-[var(--wine)]"}>{label}</label>
    <input id={id} type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} autoComplete="off" maxLength={500} className={`${inputClass} min-h-11`} />
  </div>;
}

export function TextArea({ id, label, value, onChange, placeholder, rows = 4, hideLabel = false }: { id: string; label: string; value: string; onChange: (value: string) => void; placeholder?: string; rows?: number; hideLabel?: boolean }) {
  return <div>
    <label htmlFor={id} className={hideLabel ? "sr-only" : "mb-1.5 block text-sm font-bold text-[var(--wine)]"}>{label}</label>
    <textarea id={id} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={rows} maxLength={20000} className={`${inputClass} resize-y`} />
  </div>;
}

/** Un rând cu bifă și text, ca pe paginile Azi. */
export function TaskRow({ id, label, text, done, onText, onDone, placeholder }: { id: string; label: string; text: string; done: boolean; onText: (value: string) => void; onDone: (value: boolean) => void; placeholder?: string }) {
  return <div className="flex items-end gap-3">
    <Tick checked={done} onChange={onDone} label={`Gata: ${label}`} />
    <div className={`min-w-0 flex-1 transition-opacity ${done ? "opacity-60" : ""}`}><TextLine id={id} label={label} hideLabel value={text} onChange={onText} placeholder={placeholder} /></div>
  </div>;
}

export function Panel({ title, hint, children, tone = "plain" }: { title: string; hint?: string; children: React.ReactNode; tone?: "plain" | "soft" }) {
  return <section className={`rounded-2xl border hairline p-5 sm:p-6 ${tone === "soft" ? "bg-[var(--blush)]/55" : "bg-[var(--paper)]"}`}>
    <h2 className="display text-2xl font-semibold leading-tight text-[var(--wine)]">{title}</h2>
    {hint && <p className="mt-1 text-sm leading-6 text-[var(--muted)]">{hint}</p>}
    <div className="mt-4 space-y-3">{children}</div>
  </section>;
}
