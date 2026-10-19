# Publicare pe Cloudflare: ghid pas cu pas

Site-ul rulează deja pe Cloudflare Workers (`wrangler.jsonc`, comanda `npm run deploy`, care face `vinext build && vinext deploy`). Nu e nimic de mutat. Ce rămâne este configurarea serviciilor și publicarea versiunii de vânzare.

Limită: nu am putut rula `pnpm install`, `next build` sau `vinext deploy` în mediul în care am scris acest ghid (registrul npm nu era accesibil). Pașii de mai jos urmează README-ul existent și nu sunt testați de mine. Dacă o comandă dă eroare, trimite textul erorii.

## 1. Pregătire pe calculatorul tău (o singură dată)

1. Instalează Node.js (versiunea 22) și pnpm.
2. Clonează repo-ul: `git clone https://github.com/madalinagligor5-maker/staremeeea` și intră în folder.
3. Rulează `pnpm install`.
4. Autentifică-te la Cloudflare: `npx wrangler login` (se deschide browserul; parola o introduci tu, acolo).

## 2. Supabase

1. Creează un proiect pe supabase.com.
2. În SQL Editor, rulează în ordine fișierele din `supabase/migrations/`:
   1. `20260921090000_initial_schema.sql`
   2. `20260921095200_populate_editorial_content.sql`
   3. `20260921120000_data_api_grants.sql`
   4. `20261007120000_waitlist.sql`
3. Authentication -> URL Configuration: Site URL `https://ritualuldeazi.ro`, iar la Redirect URLs adaugă `https://ritualuldeazi.ro/auth/**`.
4. Din Project Settings -> API copiază Project URL, cheia `sb_publishable_...` și cheia `sb_secret_...`.

## 3. Stripe (începe în Test mode)

1. Dashboard -> Developers -> API keys: cheia secretă (de preferat restricționată, `rk_...`).
2. Developers -> Webhooks -> Add endpoint: `https://ritualuldeazi.ro/api/stripe/webhook`, cu evenimentele `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`.
3. Copiază Signing secret (`whsec_...`).
4. Settings -> Billing -> Customer portal: activează anularea abonamentului și schimbarea cardului.

## 4. Resend

Verifică domeniul `ritualuldeazi.ro` (înregistrările DNS cerute de Resend). Poți face asta chiar din Cloudflare DNS. Apoi copiază cheia API.

## 5. Variabilele

Folosește `cloudflare-env-template.txt`.

- **Partea A:** creează fișierul `.env.local` în folderul proiectului și completează-l. Acest fișier nu se urcă în GitHub (e ignorat).
- **Partea B:** pentru fiecare secret rulează `npx wrangler secret put NUME` și lipește valoarea când ți se cere.

## 6. Publicarea, în ordinea lansării

1. **Test:** lasă `NEXT_PUBLIC_LAUNCH_MODE` gol și nu seta `CARTE_PAYWALL`. Rulează `npm run deploy`. Verifică site-ul și `/carte`.
2. **Test plată:** pune `NEXT_PUBLIC_LAUNCH_MODE=carte` în `.env.local`, rulează din nou `npm run deploy`, apoi `npx wrangler secret put CARTE_PAYWALL` cu valoarea `on`. Fă un cont nou, confirmă emailul, plătește cu un card de test Stripe, verifică accesul la `/carte` și anularea din portal.
3. **Live:** înlocuiește cheile Stripe cu cele din Live mode (`wrangler secret put` din nou), refă webhook-ul în Live mode și rulează `npm run deploy`.

## 7. Publicare automată din GitHub (opțional)

În Cloudflare există Workers & Pages -> Create -> Import a repository, care publică la fiecare push pe `main`. Nu l-am testat pentru acest proiect (vinext, secrete, variabile de build), deci tratează-l ca pe o încercare separată, după ce publicarea manuală merge.

## 8. De completat înainte de lansarea comercială

- Datele juridice ale operatorului (nume, formă juridică, CUI, adresă, email) în Termeni și Confidențialitate, în `src/app/[slug]/page.tsx`. Textul actual spune explicit că trebuie completat.
- Revizuire juridică și contabilă: Termeni, Confidențialitate, cookies, dreptul de retragere pentru conținut digital, TVA și facturare.

## 9. Ce rămâne neverificat

- Build-ul și deploy-ul (vezi începutul documentului).
- Că secretele din Cloudflare ajung în `process.env` la rulare în acest setup.
- Rate-limiting și protecția rutelor private în mediul Cloudflare (README le listează deja ca puncte de verificat).
- Că cele cinci evenimente Stripe sunt primite și procesate (Stripe -> Webhooks -> Events).
