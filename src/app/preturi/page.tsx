import type { Metadata } from "next";
import Link from "next/link";
import { PricingCard } from "@/components/pricing-card";
import { PublicFooter } from "@/components/public-footer";
import { PublicHeader } from "@/components/public-header";

export const metadata: Metadata = { title: "Prețuri", description: "Ritualul de azi: 25 lei pe lună sau 225 lei pe an, cu 3 zile de probă. Anulezi oricând." };

const included = [
  "Aplicația Cartea, instalabilă pe telefon, care merge și fără internet",
  "Planere PDF completabile, pentru hârtie sau ecran",
  "Ghidul „Am mai încercat și am renunțat”, paginile de zi grea și fișa Resetarea fără vină",
];

export default async function PricingPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const cancelled = params.checkout === "cancelled";
  return <><PublicHeader /><main id="continut" className="container-shell py-16 sm:py-24">
    <div className="max-w-3xl">
      <h1 className="display text-5xl font-semibold leading-[1.02] text-[var(--wine)] sm:text-7xl">Încerci 3 zile. Apoi alegi.</h1>
      <p className="mt-6 max-w-xl text-lg leading-8 text-[var(--muted)]">Un singur pachet, fără trepte și fără reduceri inventate. Anulezi oricând din cont, iar ce ai scris rămâne al tău.</p>
      {cancelled && <p role="status" className="mt-6 rounded-2xl bg-[var(--blush)] p-4 text-[var(--wine)]">Nu s-a întâmplat nimic și nu ai plătit nimic. Poți relua oricând.</p>}
    </div>
    <div className="mt-12 grid gap-5 md:grid-cols-2">
      <PricingCard name="Lunar" price="25 lei" interval="pe lună" priceKey="monthly" features={included} />
      <PricingCard name="Anual" price="225 lei" interval="pe an" note="18,75 lei pe lună, adică trei luni gratis" priceKey="annual" recommended features={included} />
    </div>
    <section aria-labelledby="clar" className="mt-14 max-w-3xl">
      <h2 id="clar" className="display text-3xl font-semibold text-[var(--wine)]">Pe înțelesul tuturor</h2>
      <ul className="mt-5 grid gap-3 leading-7 text-[var(--ink)]">
        <li>Primele 3 zile sunt gratuite. După ele, abonamentul continuă la prețul ales, dacă nu l-ai anulat.</li>
        <li>Anulezi din cont, oricând. Nu trebuie să dai explicații.</li>
        <li>Ce scrii rămâne pe telefonul tău. Nu trimitem textul pe serverele noastre.</li>
        <li>Dacă anulezi, îți poți citi și exporta tot ce ai scris. PDF-urile descărcate rămân ale tale.</li>
        <li>Plata se face în siguranță, prin Stripe. Datele cardului nu trec prin serverele noastre.</li>
      </ul>
      <p className="mt-6 text-sm leading-6 text-[var(--muted)]">Ritualul de azi este o unealtă de organizare, nu un tratament și nu înlocuiește ajutorul unui specialist. Ți-ai anulat abonamentul? <Link className="font-bold underline underline-offset-4" href="/carte/date">Îți poți citi și exporta ce ai scris</Link>.</p>
    </section>
  </main><PublicFooter /></>;
}
