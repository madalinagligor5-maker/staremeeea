# Mutarea de pe Vercel pe Cloudflare Workers

Repo-ul este deja configurat pentru Cloudflare: `wrangler.jsonc` și comanda `npm run deploy`, care face `vinext build && vinext deploy`. Codul aplicației nu se schimbă. Se schimbă locul de publicare, variabilele și domeniul.

Limită: nu am putut rula `pnpm install`, `next build` sau `vinext deploy` în mediul în care am scris ghidul (registrul npm nu era accesibil), iar eu nu am acces la conturile tale Cloudflare și Vercel. Pașii urmează README-ul existent și nu sunt testați de mine. Dacă o comandă dă eroare, trimite textul erorii. `vinext` este în versiune beta (`1.0.0-beta.10`), deci există risc să apară probleme la build.

Regulă de siguranță: nu opri și nu șterge nimic din Vercel până când site-ul nu merge complet pe Cloudflare.

## 1. Pregătire pe calculatorul tău (o singură dată)

1. Creează un cont gratuit pe cloudflare.com, dacă nu ai.
2. Instalează Node.js (versiunea 22) și pnpm.
3. Clonează repo-ul: `git clone https://github.com/madalinagligor5-maker/staremeeea`, intră în folder și rulează `pnpm install`.
4. Autentifică-te: `npx wrangler login` (se deschide browserul; datele de acces le introduci tu, acolo).

## 2. Ia valorile existente din Vercel

În Vercel, la Settings -> Environment Variables, notează ce valori ai deja. Variabilele marcate Sensitive nu mai pot fi citite din Vercel: pe acelea le iei din nou din serviciul de origine (Supabase, Stripe, Resend). Supabase, Stripe și Resend rămân neschimbate, doar le conectezi la noua găzduire. Dacă proiectul Supabase și migrările sunt deja făcute, sari peste crearea lor.

## 3. Variabilele

Folosește `cloudflare-env-template.txt`.

- **Partea A:** creează fișierul `.env.local` în folderul proiectului și completează-l. Nu se urcă în GitHub (e ignorat).
- **Partea B:** pentru fiecare secret rulează `npx wrangler secret put NUME` și lipește valoarea când ți se cere.

## 4. Prima publicare, pe adresa de test

1. Rulează `npm run deploy`.
2. Cloudflare îți dă o adresă de tip `ritualul-de-azi.<contul-tau>.workers.dev`. Deschide-o și verifică pagina principală, `/carte`, înscrierea pe lista de așteptare.
3. Cât timp domeniul real rămâne pe Vercel, folosește Stripe doar în Test mode.

## 5. Mutarea domeniului

Verifică la început unde sunt gestionate DNS-urile domeniului `ritualuldeazi.ro`.

1. În Cloudflare: Workers & Pages -> proiectul `ritualul-de-azi` -> Settings -> Domains & Routes -> Add -> Custom domain.
2. De obicei domeniul trebuie să fie adăugat în contul Cloudflare, cu nameserverele schimbate la registrar. Cloudflare îți arată pașii exacți; urmează-i. Nu am verificat cerința pentru contul tău.
3. Înainte să schimbi nameserverele, copiază toate înregistrările DNS existente (în special MX/email și cele cerute de Resend), ca să nu se piardă emailul.
4. Schimbarea poate dura de la minute la ore.
5. După ce `https://ritualuldeazi.ro` se deschide din Cloudflare, scoate domeniul din proiectul Vercel (Settings -> Domains).
6. Păstrează `NEXT_PUBLIC_SITE_URL` egal cu domeniul final.

## 6. Actualizează serviciile externe

- **Supabase:** Authentication -> URL Configuration: Site URL `https://ritualuldeazi.ro`, iar la Redirect URLs `https://ritualuldeazi.ro/auth/**`. Elimină adresele Vercel.
- **Stripe:** webhook-ul trebuie să arate spre `https://ritualuldeazi.ro/api/stripe/webhook`, cu evenimentele `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`. Dacă domeniul e același, adresa nu se schimbă, dar secretul `whsec_...` trebuie să fie acela setat ca secret în Cloudflare.
- **Resend:** verifică domeniul expeditor, dacă nu e deja verificat.

## 7. Ordinea lansării (ca în README)

1. Test: `NEXT_PUBLIC_LAUNCH_MODE` gol și `CARTE_PAYWALL` nesetat.
2. Test plată: `NEXT_PUBLIC_LAUNCH_MODE=carte` în `.env.local`, `npm run deploy`, apoi `npx wrangler secret put CARTE_PAYWALL` cu valoarea `on`. Fă un cont nou, confirmă emailul, plătește cu card de test Stripe, verifică accesul la `/carte` și anularea din portal.
3. Live: cheile Stripe din Live mode (`wrangler secret put` din nou), webhook în Live mode, `npm run deploy`.

## 8. Publicare automată din GitHub (opțional)

În Cloudflare există Workers & Pages -> Create -> Import a repository, care publică la fiecare push pe `main`. Nu l-am testat pentru acest proiect (vinext, secrete, variabile de build). Tratează-l ca pe o încercare separată, după ce publicarea manuală merge.

## 9. De completat înainte de lansarea comercială

- Datele juridice ale operatorului (nume, formă juridică, CUI, adresă, email) în Termeni și Confidențialitate, în `src/app/[slug]/page.tsx`. Textul actual spune explicit că trebuie completat.
- Pagina de Confidențialitate numește acum Cloudflare ca furnizor de găzduire. Este corect doar după ce site-ul rulează efectiv pe Cloudflare.
- Revizuire juridică și contabilă: Termeni, Confidențialitate, cookies, dreptul de retragere pentru conținut digital, TVA și facturare.

## 10. Ce rămâne neverificat

- Build-ul și deploy-ul cu vinext.
- Că secretele din Cloudflare ajung în `process.env` la rulare în acest setup.
- Rate-limiting și protecția rutelor private în mediul Cloudflare.
- Condițiile de uz comercial ale planului gratuit Cloudflare: pagina de limite nu le menționează, dar nu am citit termenii de serviciu.
- Că cele cinci evenimente Stripe sunt primite și procesate (Stripe -> Webhooks -> Events).
