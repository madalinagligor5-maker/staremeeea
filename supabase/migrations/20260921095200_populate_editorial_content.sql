insert into public.resource_categories (name, slug, sort_order) values
  ('Claritate', 'claritate', 1),
  ('Focus', 'focus', 2),
  ('Organizare', 'organizare', 3),
  ('Calm', 'calm', 4),
  ('Odihnă', 'odihna', 5),
  ('Ritualuri', 'ritualuri', 6)
on conflict (slug) do update set name = excluded.name, sort_order = excluded.sort_order;

insert into public.resources (category_id, title, slug, excerpt, body, resource_type, access, is_published, published_at)
select c.id, v.title, v.slug, v.excerpt, v.body, v.resource_type, v.access::public.content_access, true, v.published_at::timestamptz
from (values
  ('claritate', 'Când mintea are prea multe file deschise', 'cand-mintea-are-prea-multe-file-deschise', 'Un exercițiu de zece minute pentru a muta gândurile din minte într-un loc pe care îl poți vedea.', E'Uneori nu ai prea multe lucruri de făcut, ci prea multe lucruri de ținut minte în același timp. Primul pas nu este să le ordonezi. Este doar să le scoți din minte.\n\nIa o foaie sau deschide Brain Dump și scrie fiecare lucru exact așa cum apare. Nu îl corecta, nu îl transforma încă într-un plan și nu decide dacă este important. Lasă lista să fie dezordonată.\n\nDupă zece minute, alege un singur element care ar face restul zilei puțin mai ușor. Mută-l în planificator și fă primul pas suficient de mic încât să poată începe în cinci minute. Restul poate rămâne pe hârtie.', 'article', 'free', '2026-09-08T09:00:00Z'),
  ('focus', 'Planul de 15 minute pentru o zi încărcată', 'planul-de-15-minute-pentru-o-zi-incarcata', 'Trei intervale mici: pregătire, acțiune și închidere. Fără să reconstruiești toată ziua.', E'Când ziua pare deja pierdută, un plan mare adaugă presiune. Încearcă un container de cincisprezece minute.\n\nPrimele trei minute sunt pentru pregătire: apă, materialele necesare și notificările puse pe silențios. Următoarele zece minute sunt pentru un singur rezultat concret. Ultimele două minute sunt pentru a nota unde ai rămas și ce urmează.\n\nDacă continui, este în regulă. Dacă te oprești, sesiunea este tot completă. Scopul ei nu este să recupereze ziua, ci să creeze o intrare blândă în următorul lucru.', 'guide', 'free', '2026-09-03T09:00:00Z'),
  ('claritate', 'Cum să începi când nu poți să începi', 'cum-sa-incepi-cand-nu-poti-sa-incepi', 'Micșorează pragul de intrare până când corpul și mintea nu mai trebuie convinse.', E'Blocajul de început nu spune că nu îți pasă. De multe ori, taskul este prea vag, prea mare sau cere prea multe decizii înainte de prima acțiune.\n\nÎnlocuiește „termin proiectul” cu un gest fizic și observabil: deschid documentul, scriu titlul sau așez obiectele pe masă. Dacă pasul încă pare greu, mai taie o dată din el.\n\nFolosește apoi un timer de cinci minute. La final poți continua, schimba abordarea sau opri. Toate cele trei variante îți oferă informație.', 'article', 'free', '2026-08-26T09:00:00Z'),
  ('calm', 'Pauză senzorială de trei minute', 'pauza-senzoriala-de-trei-minute', 'O secvență scurtă pentru momentele în care lumina, sunetul sau ritmul din jur devin prea mult.', E'Dacă poți, redu o singură sursă de stimulare: lumina, sunetul sau mișcarea din jur. Nu trebuie să schimbi tot mediul.\n\nAșază tălpile pe podea și observă trei puncte de contact ale corpului cu suprafețele din jur. Lasă expirația să fie puțin mai lungă decât inspirația, fără să forțezi.\n\nLa final, întreabă-te ce ar reduce următoarele zece minute cu cinci la sută: căști, apă, o cameră mai liniștită sau o pauză de la conversație.', 'audio', 'free', '2026-08-18T09:00:00Z'),
  ('organizare', 'Workbook: o săptămână cu mai puțină presiune', 'workbook-saptamana-cu-mai-putina-presiune', 'Șapte pagini de reflecție și planificare construite în jurul energiei reale, nu al unei săptămâni perfecte.', E'Acest workbook te ajută să observi ce îți consumă energia, ce merită păstrat și ce poate fi simplificat. Fiecare zi are o întrebare, un exercițiu de zece minute și un spațiu de încheiere.\n\nNu există zile pierdute. Dacă sari o pagină, continui cu cea care îți este utilă acum. Materialul este construit pentru reflecție personală și nu reprezintă evaluare sau recomandare medicală.\n\nÎn varianta Plus, workbook-ul poate fi parcurs în propriul ritm și reluat ori de câte ori ai nevoie de o săptămână mai aerisită.', 'workbook', 'plus', '2026-08-11T09:00:00Z'),
  ('odihna', 'Somnul nu este o probă de disciplină', 'somnul-nu-este-o-proba-de-disciplina', 'O privire blândă asupra serilor care se prelungesc și a dimineților care pornesc greu.', E'O seară dificilă nu este o notă despre caracterul tău. Somnul este influențat de ritm, lumină, stres, mediu și mulți alți factori care nu răspund la critică.\n\nÎncepe cu o singură ancoră repetabilă: aceeași lumină caldă, telefonul pus la încărcat într-un loc fix sau câteva rânduri scrise înainte de culcare. Nu încerca să repari toată rutina într-o singură seară.\n\nDacă dificultățile de somn persistă sau îți afectează semnificativ viața, discută cu un profesionist calificat.', 'article', 'free', '2026-08-02T09:00:00Z'),
  ('organizare', 'Cum reprogramezi fără rușine', 'cum-reprogramezi-fara-rusine', 'Reprogramarea poate fi o decizie de planificare, nu o sentință despre tine.', E'Un task mutat nu este un task eșuat. Uneori estimarea a fost prea optimistă, energia s-a schimbat sau a apărut ceva mai important.\n\nCând reprogramezi, notează motivul în cuvinte neutre: lipsă de timp, energie redusă, informație lipsă. Apoi schimbă una dintre condiții: micșorează pasul, mută ora sau cere ajutor.\n\nDacă un task este mutat de trei ori, nu îl muta automat a patra oară. Întreabă dacă mai este necesar, dacă poate fi delegat sau dacă primul pas trebuie reformulat.', 'guide', 'free', '2026-07-24T09:00:00Z'),
  ('ritualuri', 'Ritual de închidere a zilei', 'ritual-de-inchidere-a-zilei', 'O practică de zece minute care lasă ziua de mâine cu un punct clar de pornire.', E'Închiderea zilei nu este încă o listă de bifat. Este un mod de a opri negocierile mentale care continuă după ce munca s-a terminat.\n\nNotează ce ai încheiat, ce rămâne deschis și primul pas pentru mâine. Alege maximum trei lucruri și lasă restul în Brain Dump.\n\nÎncheie cu o propoziție simplă: „Pentru astăzi, este suficient”. Repetarea aceleiași formule poate deveni un semnal clar că ziua nu mai cere nimic de la tine.', 'guide', 'plus', '2026-07-15T09:00:00Z')
) as v(category_slug, title, slug, excerpt, body, resource_type, access, published_at)
join public.resource_categories c on c.slug = v.category_slug
on conflict (slug) do update set
  category_id = excluded.category_id, title = excluded.title, excerpt = excluded.excerpt,
  body = excluded.body, resource_type = excluded.resource_type, access = excluded.access,
  is_published = true, published_at = excluded.published_at, updated_at = now();

insert into public.calm_exercises (title, slug, category, minutes, body, access, is_published) values
  ('Pauză pentru umeri', 'pauza-pentru-umeri', 'Simt tensiune în corp', 3, 'Lasă brațele pe lângă corp. Ridică umerii ușor spre urechi, ține o clipă și lasă-i să coboare. Repetă lent de cinci ori, fără să forțezi.', 'free', true),
  ('Un minut cu tălpile pe podea', 'talpile-pe-podea', 'Am prea multe gânduri', 1, 'Așază ambele tălpi pe podea. Observă presiunea, temperatura și textura. Numește în gând trei senzații, fără să încerci să le schimbi.', 'free', true),
  ('Expirație mai lungă', 'expiratie-mai-lunga', 'Sunt agitată', 5, 'Inspiră într-un ritm confortabil. Lasă expirația să dureze puțin mai mult decât inspirația. Repetă fără să ții aerul și oprește-te dacă apare disconfort.', 'free', true),
  ('Spațiu senzorial', 'spatiu-senzorial', 'Sunt suprastimulată', 3, 'Redu o singură sursă de stimulare. Dacă poți, micșorează lumina sau sunetul. Rămâi trei minute într-un ritm mai lent și observă ce devine mai ușor.', 'plus', true)
on conflict (slug) do update set title = excluded.title, category = excluded.category, minutes = excluded.minutes, body = excluded.body, access = excluded.access, is_published = true, updated_at = now();

insert into public.programs (title, slug, description, access, is_published) values
  ('7 zile cu mai puțină presiune', '7-zile-cu-mai-putina-presiune', 'Un program scurt pentru a reduce numărul de decizii și a construi o rutină care încape în viața reală.', 'plus', true),
  ('Claritate pentru săptămâna mea', 'claritate-pentru-saptamana-mea', 'Patru pași pentru a separa ce contează de ce poate aștepta.', 'free', true)
on conflict (slug) do update set title = excluded.title, description = excluded.description, access = excluded.access, is_published = true, updated_at = now();

insert into public.program_modules (program_id, day_number, title, body, checklist, journal_prompt)
select p.id, v.day_number, v.title, v.body, v.checklist::jsonb, v.journal_prompt
from public.programs p
join (values
  ('7-zile-cu-mai-putina-presiune', 1, 'Observă fără să repari', 'Începe cu o fotografie sinceră a zilei tale. Nu schimbăm nimic încă.', '["Notează energia de azi", "Scrie trei lucruri care îți ocupă mintea"]', 'Ce cere cel mai mult spațiu acum?'),
  ('7-zile-cu-mai-putina-presiune', 2, 'Un singur lucru important', 'Alege rezultatul care ar face restul zilei puțin mai ușor.', '["Alege un rezultat", "Micșorează primul pas"]', 'Ce poate rămâne nefăcut astăzi?'),
  ('7-zile-cu-mai-putina-presiune', 3, 'Lucrează cu energia', 'Potrivește tipul de task cu energia disponibilă, nu cu planul ideal.', '["Etichetează energia", "Mută un task care nu se potrivește"]', 'Când ai avut cel mai mult spațiu mental?'),
  ('claritate-pentru-saptamana-mea', 1, 'Descarcă tot', 'Folosește Brain Dump fără să clasifici sau să prioritizezi.', '["Scrie zece minute", "Păstrează lista brută"]', 'Ce ai încercat să nu uiți?'),
  ('claritate-pentru-saptamana-mea', 2, 'Alege limitele', 'Decide ce încape în săptămână înainte să alegi ordinea.', '["Alege trei priorități", "Marchează ce poate aștepta"]', 'La ce vrei să spui nu săptămâna aceasta?')
) as v(program_slug, day_number, title, body, checklist, journal_prompt) on p.slug = v.program_slug
on conflict (program_id, day_number) do update set title = excluded.title, body = excluded.body, checklist = excluded.checklist, journal_prompt = excluded.journal_prompt;

insert into public.templates (category, title, description, access, is_published)
select v.category, v.title, v.description, v.access::public.content_access, true
from (values
  ('Începuturi', 'Pornirea unui task greu', 'Un traseu de cinci pași pentru a micșora pragul de început.', 'free'),
  ('Dimineață', 'O dimineață cu mai puține decizii', 'Pregătește seara câteva repere care fac începutul zilei mai simplu.', 'free'),
  ('Odihnă', 'Închiderea blândă a zilei', 'Lasă mâine un punct clar de pornire și oprește lista pentru astăzi.', 'plus')
) as v(category, title, description, access)
where not exists (select 1 from public.templates t where t.title = v.title);

insert into public.template_steps (template_id, title, sort_order)
select t.id, v.step, v.ord
from public.templates t
join (values
  ('Pornirea unui task greu', 'Deschide materialul de lucru.', 1),
  ('Pornirea unui task greu', 'Scrie rezultatul într-o propoziție.', 2),
  ('Pornirea unui task greu', 'Alege un pas de maximum cinci minute.', 3),
  ('O dimineață cu mai puține decizii', 'Alege hainele cu o seară înainte.', 1),
  ('O dimineață cu mai puține decizii', 'Lasă apa și obiectele importante la vedere.', 2),
  ('O dimineață cu mai puține decizii', 'Păstrează un singur lucru important pentru prima oră.', 3),
  ('Închiderea blândă a zilei', 'Notează ce ai încheiat.', 1),
  ('Închiderea blândă a zilei', 'Alege primul pas pentru mâine.', 2),
  ('Închiderea blândă a zilei', 'Mută restul în Brain Dump.', 3)
) as v(template_title, step, ord) on t.title = v.template_title
where not exists (select 1 from public.template_steps s where s.template_id = t.id and s.title = v.step);

insert into public.journal_prompts (prompt, is_published, sort_order)
select v.prompt, true, v.sort_order
from (values
  ('De ce ai avea nevoie ca ziua să fie cu 5% mai ușoară?', 4),
  ('Ce îți cere energie fără să îți ofere ceva înapoi?', 5),
  ('Ce poate rămâne neterminat fără consecințe reale?', 6),
  ('Care este cel mai mic pas care ar conta acum?', 7),
  ('Ce ai vrea să îți amintești mâine dimineață?', 8)
) as v(prompt, sort_order)
where not exists (select 1 from public.journal_prompts j where j.prompt = v.prompt);

insert into public.site_content (content_key, value) values
  ('brand.promise', '{"title":"Un spațiu pentru mintea ta, exact așa cum este.","note":"Organizare, focus și wellbeing fără presiune."}'::jsonb),
  ('contact.details', '{"email":"hello@stareamea.ro","response_time":"2 zile lucrătoare"}'::jsonb),
  ('editorial.disclaimer', '{"text":"Conținut pentru wellbeing și organizare. Nu înlocuiește sprijinul profesionist."}'::jsonb)
on conflict (content_key) do update set value = excluded.value, updated_at = now();
