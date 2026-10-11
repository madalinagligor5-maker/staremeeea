"use client";
// Cele trei pagini ale zilei: Azi (se adaptează nivelului), Acum (descărcare din cap) și Seara.
import type { PageFields } from "@/lib/carte/entries";
import type { Level } from "@/lib/carte/stats";
import { Panel, TaskRow, TextArea, TextLine } from "./fields";

export type PageProps = {
  fields: PageFields;
  set: (key: string, value: string | boolean) => void;
  setMany: (patch: PageFields) => void;
};

function reader(fields: PageFields) {
  return {
    s: (key: string) => (typeof fields[key] === "string" ? (fields[key] as string) : ""),
    b: (key: string) => fields[key] === true,
  };
}

export function AziPage({ fields, set, level }: PageProps & { level: Level | null }) {
  const { s, b } = reader(fields);
  if (!level) {
    return <p className="rounded-2xl border hairline bg-[var(--paper)] p-5 leading-7 text-[var(--muted)]">Alege mai sus cum ești azi. Pagina se adaptează: cu cât ziua e mai grea, cu atât cere mai puțin.</p>;
  }
  const tired = level === "obosita" || level === "buna";
  const good = level === "buna";
  return <div className="space-y-5">
    <Panel title="Un singur lucru pentru azi" hint={level === "grea" ? "O bifă și un singur lucru. Atât. Restul poate rămâne gol." : "Dacă ar rămâne doar unul."}>
      <TaskRow id="azi-grea" label="Un singur lucru pentru azi" text={s("grea_lucru")} done={b("grea_gata")} onText={(v) => set("grea_lucru", v)} onDone={(v) => set("grea_gata", v)} placeholder="Ce contează cel mai mult azi?" />
    </Panel>
    {tired && <Panel title="Cele 3 lucruri care contează" hint="Trei lucruri, nu mai mult. Restul poate aștepta.">
      {[1, 2, 3].map((i) => <TaskRow key={i} id={`azi-esential-${i}`} label={`Lucrul ${i} din 3`} text={s(`esential_${i}`)} done={b(`esential_${i}_gata`)} onText={(v) => set(`esential_${i}`, v)} onDone={(v) => set(`esential_${i}_gata`, v)} />)}
      <div className="pt-2"><TextLine id="azi-pot-astepta" label="Pot aștepta" value={s("pot_astepta")} onChange={(v) => set("pot_astepta", v)} placeholder="Ce las conștient pe mâine" /></div>
    </Panel>}
    {good && <>
      <Panel title="Programul zilei" hint="Pagina completă, doar dacă ai energie.">
        {[1, 2, 3, 4].map((i) => <div key={i} className="flex items-end gap-3">
          <div className="w-24 shrink-0"><TextLine id={`azi-ora-${i}`} label={`Ora, rândul ${i}`} hideLabel value={s(`ora_${i}`)} onChange={(v) => set(`ora_${i}`, v)} placeholder="09:00" /></div>
          <TextLine id={`azi-program-${i}`} label={`Programul, rândul ${i}`} hideLabel value={s(`program_${i}`)} onChange={(v) => set(`program_${i}`, v)} />
        </div>)}
      </Panel>
      <Panel title="Pentru alții" hint="Ce porți azi pentru ceilalți, la vedere.">
        {[1, 2].map((i) => <TaskRow key={i} id={`azi-alti-${i}`} label={`Pentru alții, rândul ${i}`} text={s(`alti_${i}`)} done={b(`alti_${i}_gata`)} onText={(v) => set(`alti_${i}`, v)} onDone={(v) => set(`alti_${i}_gata`, v)} />)}
      </Panel>
    </>}
    <p className="px-1 text-sm text-[var(--muted)]">Folosește cât poți. Te poți opri oricând.</p>
  </div>;
}

const choices = [
  { id: "azi", label: "Azi" },
  { id: "tarziu", label: "Mai târziu" },
  { id: "nu", label: "Nu mai port" },
] as const;

export function AcumPage({ fields, set, setMany }: PageProps) {
  const { s, b } = reader(fields);
  function choose(row: number, which: (typeof choices)[number]["id"]) {
    const on = b(`rand_${row}_${which}`);
    setMany({ [`rand_${row}_azi`]: false, [`rand_${row}_tarziu`]: false, [`rand_${row}_nu`]: false, [`rand_${row}_${which}`]: !on });
  }
  return <div className="space-y-5">
    <Panel title="Pune jos ce porți" hint="Idei, griji, liste, ce ai uitat. Nu trebuie să fie în ordine.">
      <TextArea id="acum-descarcare" label="Ce porți acum" hideLabel value={s("descarcare")} onChange={(v) => set("descarcare", v)} rows={7} />
    </Panel>
    <Panel title="Apoi alegi ce rămâne" hint="Pentru fiecare lucru: azi, mai târziu sau nu mai port." tone="soft">
      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => <div key={i} className="space-y-2">
        <TextLine id={`acum-rand-${i}`} label={`Lucrul ${i}`} hideLabel value={s(`rand_${i}`)} onChange={(v) => set(`rand_${i}`, v)} />
        <div className="flex flex-wrap gap-2" role="group" aria-label={`Ce faci cu lucrul ${i}`}>
          {choices.map((c) => {
            const on = b(`rand_${i}_${c.id}`);
            return <button key={c.id} type="button" aria-pressed={on} onClick={() => choose(i, c.id)}
              className={`min-h-10 rounded-full border px-4 text-sm font-bold transition-colors ${on ? "border-[var(--wine)] bg-[var(--wine)] text-white" : "border-[var(--line)] bg-white text-[var(--wine)]"}`}>{c.label}</button>;
          })}
        </div>
      </div>)}
    </Panel>
    <p className="px-1 text-sm text-[var(--muted)]">Ce ai lăsat aici nu mai e doar în capul tău.</p>
  </div>;
}

export function SearaPage({ fields, set }: PageProps) {
  const { s } = reader(fields);
  return <div className="space-y-5">
    <Panel title="Ce a mers azi" hint="Chiar și puțin. Chiar și un singur lucru.">
      <TextArea id="seara-a-mers" label="Ce a mers azi" hideLabel value={s("a_mers")} onChange={(v) => set("a_mers", v)} rows={3} />
    </Panel>
    <Panel title="Cum a fost ziua" hint="În câteva cuvinte.">
      <TextLine id="seara-cum" label="Cum a fost ziua" hideLabel value={s("cum_a_fost")} onChange={(v) => set("cum_a_fost", v)} />
    </Panel>
    <Panel title="Ce las aici și nu mai port" hint="Ce nu mai vrei să duci în noaptea asta.">
      <TextArea id="seara-las" label="Ce las aici" hideLabel value={s("las_aici")} onChange={(v) => set("las_aici", v)} rows={3} />
    </Panel>
    <p className="px-1 text-sm text-[var(--muted)]">Poți lăsa totul gol. Și asta e o seară.</p>
  </div>;
}
