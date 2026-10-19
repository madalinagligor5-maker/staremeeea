# Ritualul de Azi

MVP PWA Romanian-first pentru organizare blândă, focus, journaling și wellbeing. Produsul nu diagnostichează și nu tratează afecțiuni medicale. Recomandările sunt deterministe; nu există AI în fluxurile de produs.

## Ce este implementat

- homepage editorial, pagini publice, SEO, sitemap, robots, stări 404/eroare/loading/offline;
- PWA instalabilă, manifest, icon și service worker cu shell offline;
- autentificare Supabase cu email/parolă, verificare PKCE și onboarding cu consimțământ separat;
- spațiu privat responsive, Ziua minimă și check-in zilnic persistent;
- Planner energetic, Brain Dump drag-and-drop, „Nu pot să încep”, Focus, Calm, Jurnal, Patterns și export de date;
- motor de recomandări separat de UI, bazat exclusiv pe reguli;
- Stripe Checkout pentru abonamente lunar/anual, Customer Portal și webhook verificat;
- schemă PostgreSQL pentru toate domeniile MVP, seed editorial și RLS pe datele private;
- structură admin protejată prin `app_metadata.role`;
- configurație Next.js 16 + vinext pentru Cloudflare Workers.

Fluxurile centrale ale MVP-ului sunt funcționale. Programele ghidate, editorul CRUD complet din admin și biblioteca editorială dinamică rămân următorul milestone înainte de beta.

## Pornire locală

1. Copiază `.env.example` în `.env.local` și completează valorile.
2. Rulează `npm install`.
3. Rulează migrarea din `supabase/migrations/20260921090000_initial_schema.sql` într-un proiect Supabase.
4. Pornește cu `npm run dev` și deschide `http://localhost:3000`.

Fără variabilele Supabase, pagina `/spatiu/azi` intră intenționat în mod demo local. În producție, configurează toate secretele și protejează rutele private la nivel de proxy înainte de lansare.

## Supabase

Folosește cheile moderne `sb_publishable_…` în client și `sb_secret_…` exclusiv pe server. Nu adăuga cheia secretă într-o variabilă `NEXT_PUBLIC_*`.

Migrarea:

- creează profilul la înscriere printr-o funcție `security definer` izolată în schema `private`;
- activează RLS pe toate tabelele expuse;
- separă datele gestionate de utilizatoare de abonamente/entitlements, care sunt mutate doar de webhook;
- autorizează adminul din `app_metadata`, nu din `user_metadata`.

Setează rolul de admin dintr-un mediu server sigur:

```json
{ "role": "admin" }
```

în `app_metadata` pentru utilizatoarea aleasă.

## Stripe și abonamentul Cartea

Abonamentul este de **25 lei pe lună** sau **225 lei pe an**, cu **3 zile de probă**. Prețul se creează chiar la plată (`price_data`, în RON), deci nu trebuie să definești produse în Stripe. Dacă totuși vrei să le controlezi din Dashboard, creează două Price-uri recurente și pune ID-urile în `STRIPE_CARTE_MONTHLY_PRICE_ID` și `STRIPE_CARTE_ANNUAL_PRICE_ID` (nu există valori implicite vechi: prețurile Plus nu se mai folosesc).

1. Pune cheia în `STRIPE_SECRET_KEY` (preferă o cheie restricționată `rk_…`).
2. Configurează webhook-ul către `https://domeniul-tau/api/stripe/webhook` pentru:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
3. Pune signing secret în `STRIPE_WEBHOOK_SECRET`.
4. În Customer Portal (Dashboard) activează anularea abonamentului, schimbarea cardului și, dacă vrei, trecerea de la lunar la anual.
5. Proba cere card implicit. Pentru probă fără card setează `CARTE_TRIAL_CARD=optional`: proba pornește fără card și se anulează singură dacă nu adaugi unul.

Proba de 3 zile se acordă o singură dată pe cont. Accesul nu se acordă în pagina de succes: starea abonamentului este scrisă numai de webhook, după verificarea semnăturii. Au acces stările `trialing`, `active` și `past_due`.

## Lansarea Cărții, pas cu pas

Până la lansare, site-ul arată pagina de lansare și lista de așteptare, iar `/carte` este deschisă și gratuită (testare). La lansare:

1. Aplică migrările Supabase și verifică tabelul `subscriptions`.
2. Setează în Cloudflare: `STRIPE_*`, `SUPABASE_*`, `RESEND_*`.
3. Setează `NEXT_PUBLIC_LAUNCH_MODE=carte` (variabilă de build: se aplică la următorul `npm run deploy`). Se deschid Prețurile, înregistrarea și autentificarea; instrumentele vechi (`/spatiu`, `/instrumente`, `/resurse`, `/blog`) rămân ascunse.
4. Setează `CARTE_PAYWALL=on` (variabilă de server). De atunci, Cartea, Sertarele, Setările și Bonusurile cer abonament activ. Datele și Statisticile rămân deschise: cine și-a anulat abonamentul își poate citi și exporta ce a scris.
5. Testează cu un cont nou: înregistrare, confirmare email, plată de test în Stripe, acces la `/carte`, anulare din portal.

Bonusurile PDF se generează cu `python3 scripts/bonusuri.py` (rezultat în `public/bonusuri`). Fișierele sunt publice dacă cineva are linkul exact; pagina `/carte/bonusuri` le listează doar abonaților.

## Resend

Verifică domeniul expeditor, apoi setează `RESEND_API_KEY` și `RESEND_FROM_EMAIL`. Confirmarea emailului și resetarea parolei se configurează în template-urile Supabase Auth; `src/lib/email.ts` asigură mesajele tranzacționale de produs.

## Cloudflare Workers

Pașii de publicare și mutarea de pe Vercel sunt în [`DEPLOY-CLOUDFLARE.md`](./DEPLOY-CLOUDFLARE.md); un șablon de completat este în `cloudflare-env-template.txt`.

Cloudflare recomandă acum vinext pentru proiecte Next.js noi. Configurația păstrează și dezvoltarea standard Next.js:

```bash
npm run dev
npm run dev:vinext
npm run build:vinext
npm run deploy
```

Înainte de primul deploy rulează `npx vinext check`, apoi configurează în Cloudflare toate variabilele publice de build și secretele runtime. Pentru domeniu: Workers & Pages → Custom Domains → Add Custom Domain; păstrează `NEXT_PUBLIC_SITE_URL` sincronizat cu domeniul canonic.

## Checklist înainte de producție

- revizuire juridică pentru Termeni, Confidențialitate, cookies și baza legală GDPR;
- politicile RLS verificate cu conturi distincte și Supabase advisors;
- webhook Stripe testat pentru toate cele cinci evenimente și retry/idempotency;
- autentificarea și rate-limitarea endpointurilor sensibile verificate în mediul Cloudflare;
- iconuri PNG maskable 192/512 și capturi PWA adăugate pentru toate magazinele vizate;
- accesibilitate testată cu tastatură, cititor de ecran și zoom 200%;
- testimoniale publicate numai după verificare explicită.

## Imagine generată

`public/images/hero-journal.png` a fost creată cu instrumentul built-in de generare imagini. Promptul final cere o fotografie editorială naturală, text-free, cu jurnal alb, cafea, flori dusty-rose, lumină calmă și paleta Ritualul de Azi.
