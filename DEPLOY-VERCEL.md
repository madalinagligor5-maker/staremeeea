# Publicare pe Vercel: ghid pas cu pas

Aplicația este Next.js 16 standard și nu depinde de Cloudflare în cod. `vercel.json` îi spune lui Vercel să folosească `pnpm`. Publicarea pe Cloudflare (`npm run deploy`) rămâne disponibilă.

Nu am putut rula `pnpm install` sau `next build` în mediul în care am pregătit acest ghid (registrul npm nu era accesibil). Primul build pe Vercel este deci primul test real. Dacă dă eroare, trimite textul erorii din Vercel (Deployments -> Build Logs).

## 0. Atenție la planul Vercel

Conform documentației Vercel (Fair Use Guidelines, actualizată 14 septembrie 2026), planul gratuit Hobby este pentru uz personal necomercial. Orice site care cere sau procesează plăți cere planul Pro sau Enterprise. Cartea cu abonament intră în această categorie, deci pentru vânzare ai nevoie de un plan plătit. Prețul actual îl vezi pe vercel.com/pricing. Pentru teste, fără plăți reale, poți folosi Hobby.

## 1. Supabase

1. Creează un proiect pe supabase.com.
2. În SQL Editor, rulează în ordine fișierele din `supabase/migrations/`:
   1. `20260921090000_initial_schema.sql`
   2. `20260921095200_populate_editorial_content.sql`
   3. `20260921120000_data_api_grants.sql`
   4. `20261007120000_waitlist.sql`
3. Authentication -> URL Configuration: pune în Site URL domeniul tău (`https://ritualuldeazi.ro`) și adaugă același domeniu, cu `/auth/**`, la Redirect URLs. Adaugă și adresa de previzualizare Vercel, ca să poți testa.
4. Authentication -> Emails: verifică șabloanele de confirmare și de resetare a parolei (sunt în română?).
5. Copiază din Project Settings -> API: Project URL, cheia `sb_publishable_...` și cheia `sb_secret_...`.

## 2. Stripe (începe în Test mode)

1. Copiază cheia secretă (de preferat una restricționată `rk_...`) în `STRIPE_SECRET_KEY`.
2. Developers -> Webhooks -> Add endpoint: `https://DOMENIUL-TAU/api/stripe/webhook`, cu evenimentele:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
3. Copiază Signing secret (`whsec_...`) în `STRIPE_WEBHOOK_SECRET`.
4. Settings -> Billing -> Customer portal: activează anularea abonamentului și schimbarea cardului.
5. Când testele merg, repetă cu cheile din Live mode.

## 3. Resend

Verifică domeniul expeditor (înregistrările DNS cerute de Resend), apoi pune `RESEND_API_KEY` și `RESEND_FROM_EMAIL`.

## 4. Vercel

1. vercel.com -> Add New -> Project -> importă repo-ul `staremeeea` din GitHub.
2. Framework: Next.js (detectat singur). Nu schimba comenzile.
3. Environment Variables: lipește blocul din `vercel-env-template.txt`, după ce l-ai completat.
4. Deploy.
5. Settings -> Domains: adaugă `ritualuldeazi.ro` și urmează instrucțiunile DNS. Cât timp DNS-ul nu e schimbat, site-ul actual rămâne pe Cloudflare.
6. Păstrează `NEXT_PUBLIC_SITE_URL` identic cu domeniul final.

## 5. Ordinea lansării (ca în README)

1. Test: `NEXT_PUBLIC_LAUNCH_MODE` gol, `CARTE_PAYWALL` gol. Verifică site-ul și `/carte`.
2. Test plată: pune `NEXT_PUBLIC_LAUNCH_MODE=carte`, redeploy, apoi `CARTE_PAYWALL=on`. Fă un cont nou, confirmă emailul, plătește cu un card de test Stripe, verifică accesul la `/carte` și anularea din portal.
3. Live: schimbă cheile Stripe cu cele Live, refă webhook-ul în Live mode și redeploy.

## 6. De completat înainte de lansarea comercială

- Datele juridice ale operatorului (nume, formă juridică, CUI, adresă, email) în paginile Termeni și Confidențialitate, în `src/app/[slug]/page.tsx`. Textul actual spune explicit că trebuie completat.
- Revizuire juridică pentru Termeni, Confidențialitate, cookies, dreptul de retragere pentru conținut digital și TVA/facturare (jurist și contabil).
- Pagina de Confidențialitate numește acum Vercel ca furnizor de găzduire. Este corect numai după ce site-ul chiar rulează pe Vercel.

## 7. Ce rămâne neverificat

- Build-ul (vezi începutul documentului).
- Rate-limiting și protecția rutelor private în mediul Vercel.
- Faptul că cele cinci evenimente Stripe ajung și sunt procesate (se verifică în Stripe -> Webhooks -> Events).
