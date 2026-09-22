export type EditorialResource = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  resource_type: "article" | "guide" | "workbook" | "audio" | "program";
  access: "free" | "plus";
  is_published: boolean;
  published_at: string;
  category?: string;
};

export const fallbackResources: EditorialResource[] = [
  {
    id: "fallback-tabs",
    title: "Când mintea are prea multe file deschise",
    slug: "cand-mintea-are-prea-multe-file-deschise",
    excerpt: "Un exercițiu de zece minute pentru a muta gândurile din minte într-un loc pe care îl poți vedea.",
    body: "Uneori nu ai prea multe lucruri de făcut, ci prea multe lucruri de ținut minte în același timp. Primul pas nu este să le ordonezi. Este doar să le scoți din minte.\n\nIa o foaie sau deschide Brain Dump și scrie fiecare lucru exact așa cum apare. Nu îl corecta, nu îl transforma încă într-un plan și nu decide dacă este important. Lasă lista să fie dezordonată.\n\nDupă zece minute, alege un singur element care ar face restul zilei puțin mai ușor. Mută-l în planificator și fă primul pas suficient de mic încât să poată începe în cinci minute. Restul poate rămâne pe hârtie. Nu trebuie rezolvat doar pentru că a fost observat.",
    resource_type: "article", access: "free", is_published: true, published_at: "2026-09-08T09:00:00Z", category: "Claritate",
  },
  {
    id: "fallback-15",
    title: "Planul de 15 minute pentru o zi încărcată",
    slug: "planul-de-15-minute-pentru-o-zi-incarcata",
    excerpt: "Trei intervale mici: pregătire, acțiune și închidere. Fără să reconstruiești toată ziua.",
    body: "Când ziua pare deja pierdută, un plan mare adaugă presiune. Încearcă un container de cincisprezece minute.\n\nPrimele trei minute sunt pentru pregătire: apă, materialele necesare și notificările puse pe silențios. Următoarele zece minute sunt pentru un singur rezultat concret. Ultimele două minute sunt pentru a nota unde ai rămas și ce urmează.\n\nDacă continui, este în regulă. Dacă te oprești, sesiunea este tot completă. Scopul ei nu este să recupereze ziua, ci să creeze o intrare blândă în următorul lucru.",
    resource_type: "guide", access: "free", is_published: true, published_at: "2026-09-03T09:00:00Z", category: "Focus",
  },
  {
    id: "fallback-start",
    title: "Cum să începi când nu poți să începi",
    slug: "cum-sa-incepi-cand-nu-poti-sa-incepi",
    excerpt: "Micșorează pragul de intrare până când corpul și mintea nu mai trebuie convinse.",
    body: "Blocajul de început nu spune că nu îți pasă. De multe ori, taskul este prea vag, prea mare sau cere prea multe decizii înainte de prima acțiune.\n\nÎnlocuiește «termin proiectul» cu un gest fizic și observabil: deschid documentul, scriu titlul sau așez obiectele pe masă. Dacă pasul încă pare greu, mai taie o dată din el.\n\nFolosește apoi un timer de cinci minute. La final poți continua, schimba abordarea sau opri. Toate cele trei variante îți oferă informație. Nu transforma startul mic într-un contract pentru întreaga sarcină.",
    resource_type: "article", access: "free", is_published: true, published_at: "2026-08-26T09:00:00Z", category: "Începuturi",
  },
  {
    id: "fallback-sensory",
    title: "Pauză senzorială de trei minute",
    slug: "pauza-senzoriala-de-trei-minute",
    excerpt: "O secvență scurtă pentru momentele în care lumina, sunetul sau ritmul din jur devin prea mult.",
    body: "Dacă poți, redu o singură sursă de stimulare: lumina, sunetul sau mișcarea din jur. Nu trebuie să schimbi tot mediul.\n\nAșază tălpile pe podea și observă trei puncte de contact ale corpului cu suprafețele din jur. Lasă expirația să fie puțin mai lungă decât inspirația, fără să forțezi.\n\nLa final, întreabă-te ce ar reduce următoarele zece minute cu cinci la sută: căști, apă, o cameră mai liniștită sau o pauză de la conversație.",
    resource_type: "audio", access: "free", is_published: true, published_at: "2026-08-18T09:00:00Z", category: "Calm",
  },
  {
    id: "fallback-week",
    title: "Workbook: o săptămână cu mai puțină presiune",
    slug: "workbook-saptamana-cu-mai-putina-presiune",
    excerpt: "Șapte pagini de reflecție și planificare construite în jurul energiei reale, nu al unei săptămâni perfecte.",
    body: "Acest workbook te ajută să observi ce îți consumă energia, ce merită păstrat și ce poate fi simplificat. Fiecare zi are o întrebare, un exercițiu de zece minute și un spațiu de încheiere.\n\nNu există zile pierdute. Dacă sari o pagină, continui cu cea care îți este utilă acum. Materialul este construit pentru reflecție personală și nu reprezintă evaluare sau recomandare medicală.\n\nÎn varianta Plus, workbook-ul poate fi parcurs în propriul ritm și reluat ori de câte ori ai nevoie de o săptămână mai aerisită.",
    resource_type: "workbook", access: "plus", is_published: true, published_at: "2026-08-11T09:00:00Z", category: "Planificare",
  },
  {
    id: "fallback-sleep",
    title: "Somnul nu este o probă de disciplină",
    slug: "somnul-nu-este-o-proba-de-disciplina",
    excerpt: "O privire blândă asupra serilor care se prelungesc și a dimineților care pornesc greu.",
    body: "O seară dificilă nu este o notă despre caracterul tău. Somnul este influențat de ritm, lumină, stres, mediu și mulți alți factori care nu răspund la critică.\n\nÎncepe cu o singură ancoră repetabilă: aceeași lumină caldă, telefonul pus la încărcat într-un loc fix sau câteva rânduri scrise înainte de culcare. Nu încerca să repari toată rutina într-o singură seară.\n\nDacă dificultățile de somn persistă sau îți afectează semnificativ viața, discută cu un profesionist calificat. Un ritual poate susține odihna, dar nu înlocuiește evaluarea medicală.",
    resource_type: "article", access: "free", is_published: true, published_at: "2026-08-02T09:00:00Z", category: "Odihnă",
  },
  {
    id: "fallback-reschedule",
    title: "Cum reprogramezi fără rușine",
    slug: "cum-reprogramezi-fara-rusine",
    excerpt: "Reprogramarea poate fi o decizie de planificare, nu o sentință despre tine.",
    body: "Un task mutat nu este un task eșuat. Uneori estimarea a fost prea optimistă, energia s-a schimbat sau a apărut ceva mai important.\n\nCând reprogramezi, notează motivul în cuvinte neutre: lipsă de timp, energie redusă, informație lipsă. Apoi schimbă una dintre condiții: micșorează pasul, mută ora sau cere ajutor.\n\nDacă un task este mutat de trei ori, nu îl muta automat a patra oară. Întreabă dacă mai este necesar, dacă poate fi delegat sau dacă primul pas trebuie reformulat.",
    resource_type: "guide", access: "free", is_published: true, published_at: "2026-07-24T09:00:00Z", category: "Organizare",
  },
  {
    id: "fallback-close",
    title: "Ritual de închidere a zilei",
    slug: "ritual-de-inchidere-a-zilei",
    excerpt: "O practică de zece minute care lasă ziua de mâine cu un punct clar de pornire.",
    body: "Închiderea zilei nu este încă o listă de bifat. Este un mod de a opri negocierile mentale care continuă după ce munca s-a terminat.\n\nNotează ce ai încheiat, ce rămâne deschis și primul pas pentru mâine. Alege maximum trei lucruri și lasă restul în Brain Dump.\n\nÎncheie cu o propoziție simplă: «Pentru astăzi, este suficient». Repetarea aceleiași formule poate deveni un semnal clar că ziua nu mai cere nimic de la tine.",
    resource_type: "guide", access: "plus", is_published: true, published_at: "2026-07-15T09:00:00Z", category: "Ritualuri",
  },
];

export const toolCards = [
  { title: "Check-in zilnic", copy: "Observă starea, energia și focusul fără scoruri bune sau rele.", href: "/spatiu/azi", accent: "Acum" },
  { title: "Planificator blând", copy: "Alege ce încape în ziua reală și reprogramează fără etichete de eșec.", href: "/spatiu/planificator", accent: "5–60 min" },
  { title: "Brain Dump", copy: "Scoate gândurile din minte înainte să hotărăști ce faci cu ele.", href: "/spatiu/brain-dump", accent: "Fără ordine" },
  { title: "Nu pot să încep", copy: "Transformă un lucru mare într-un prim gest fizic și clar.", href: "/spatiu/nu-pot-sa-incep", accent: "Pas cu pas" },
  { title: "Timer de focus", copy: "Sesiuni scurte, cu un final clar și fără serii de protejat.", href: "/spatiu/focus", accent: "5–60 min" },
  { title: "Jurnal privat", copy: "Scriere liberă sau ghidată, cu căutare și favorite.", href: "/spatiu/jurnal", accent: "Doar al tău" },
  { title: "Exerciții de calm", copy: "Pauze de 1–10 minute pentru diferite stări și niveluri de energie.", href: "/spatiu/calm", accent: "1–10 min" },
  { title: "Tiparele mele", copy: "Tendințe descriptive din datele tale, fără interpretări medicale.", href: "/spatiu/patterns", accent: "După 7 zile" },
];
