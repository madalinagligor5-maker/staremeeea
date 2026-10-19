# Vercel: variabile, servicii și ordinea lansării

Site-ul rulează deja pe Vercel. Acest ghid nu schimbă configurarea proiectului din Vercel: pașii de mai jos sunt doar pentru variabile și pentru serviciile externe.

Nu am putut rula `pnpm install` sau `next build` în mediul în care am scris ghidul (registrul npm nu era accesibil), deci nu am testat build-ul. Dacă un deploy dă eroare, trimite textul din Vercel (Deployments -> Build Logs).

## 0. Planul Vercel

Conform documentației Vercel (Fair Use Guidelines, actualizată 14 septembrie 2026), planul Hobby este doar pentru uz personal necomercial, iar un site care cere sau procesează plăți cere planul Pro sau Enterprise. Verifică în Vercel, la Settings -> Billing, pe ce plan ești. Dacă ești pe Hobby, treci pe un plan plătit înainte să încasezi abonamente. Prețul actual îl vezi pe vercel.com/pricing.

## 1. Supabase

1. Creează un proiect pe supabase.com (sau folosește-l pe cel existent).
2. În SQL Editor, rulează în ordine fișierele din `supabase/migrations/` (cele deja rulate nu se repetă):
   1. `20260921090000_initial_schema.sql`
   2. `20260921095200_populate_editorial_content.sql`
   3. `20260921120000_data_api_grants.sql`
   4. `20261007120000_waitlist.sql`
3. Authentication -> URL Configuration: Site URL `https://ritualuldeazi.ro`; la Redirect URLs adaugă `https://ritualuldeazi.ro/auth/**` și adresa de previzualizare Vercel.
4. Din Project Settings -> API copiază Project URL, cheia `sb_publishable_...` și cheia `sb_secret_...`.

## 2. Stripe (începe în Test mode)

1. Cheia secretă (de preferat restricționată, `rk_...`) merge în `STRIPE_SECRET_KEY`.
2. Developers -> Webhooks -> Add endpoint: `https://ritualuldeazi.ro/api/stripe/webhook`, cu evenimentele `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`.
3. Signing secret (`whsec_...`) merge în `STRIPE_WEBHOOK_SECRET`.
4. Settings -> Billing -> Customer portal: activează anularea abonamentului și schimbarea cardului.

## 3. Resend

Verifică domeniul expeditor (înregistrările DNS cerute de Resend), apoi pune `RESEND_API_KEY` și `RESEND_FROM_EMAIL`.

## 4. Variabilele în Vercel

Deschide proiectul existent -> Settings -> Environment Variables și completează valorile din `vercel-env-template.txt`. Variabilele `NEXT_PUBLIC_*` se aplică la build, deci după ce le schimbi trebuie Redeploy.

## 5. Ordinea lansării

1. Test: `NEXT_PUBLIC_LAUNCH_MODE` gol, `CARTE_PAYWALL` gol. Verifică site-ul și `/carte`.
2. Test plată: pune `NEXT_PUBLIC_LAUNCH_MODE=carte`, Redeploy, apoi `CARTE_PAYWALL=on`. Fă un cont nou, confirmă emailul, plătește cu un card de test Stripe, verifică accesul la `/carte` și anularea din portal.
3. Live: schimbă cheile Stripe cu cele din Live mode, refă webhook-ul în Live mode și fă Redeploy.

## 6. De completat înainte de lansarea comercială

- Datele juridice ale operatorului (nume, formă juridică, CUI, adresă, email) în Termeni și Confidențialitate, în `src/app/[slug]/page.tsx`. Textul actual spune explicit că trebuie completat.
- Revizuire juridică și contabilă: Termeni, Confidențialitate, cookies, dreptul de retragere pentru conținut digital, TVA și facturare.

## 7. Ce rămâne neverificat

- Build-ul (vezi începutul documentului).
- Rate-limiting și protecția rutelor private în mediul Vercel.
- Că cele cinci evenimente Stripe sunt primite și procesate (Stripe -> Webhooks -> Events).
