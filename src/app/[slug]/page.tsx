import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Check, Mail, MoveRight } from "lucide-react";
import { PublicFooter } from "@/components/public-footer";
import { PublicHeader } from "@/components/public-header";
import { toolCards } from "@/lib/editorial-content";
import { getPublicResources } from "@/lib/public-data";

type PageDefinition = {
  eyebrow: string;
  title: string;
  copy: string;
  description: string;
  sections: { label: string; title: string; paragraphs: string[]; points?: string[] }[];
};

const pageDefinitions: Record<string, PageDefinition> = {
  despre: {
    eyebrow: "Despre Ritualul de Azi",
    title: "O viață mai blândă nu începe cu mai multă presiune.",
    copy: "Am construit un spațiu care respectă felul în care energia, atenția și emoțiile se schimbă de la o zi la alta.",
    description: "Citește despre misiunea și principiile Ritualul de Azi.",
    sections: [
      { label: "De ce există", title: "Pentru zilele care nu urmează planul", paragraphs: ["Multe instrumente de organizare pornesc de la ideea unei energii constante. Viața reală nu funcționează așa. Unele dimineți au claritate, altele au nevoie de un început mult mai mic.", "Ritualul de Azi aduce împreună organizarea, focusul, scrisul reflexiv și wellbeing-ul într-o experiență calmă, fără rușine și fără serii pe care trebuie să le protejezi."] },
      { label: "Principiile noastre", title: "Clar, privat și fără judecată", paragraphs: ["Fiecare funcție trebuie să răspundă unei nevoi concrete și să poată fi înțeleasă fără instrucțiuni complicate."], points: ["Nu numim o zi «pierdută».", "Nu transformăm datele sensibile în publicitate.", "Nu confundăm wellbeing-ul cu îngrijirea medicală.", "Nu folosim urgența ca tactică de vânzare."] },
      { label: "Limite sănătoase", title: "Un instrument, nu un diagnostic", paragraphs: ["Ritualul de Azi nu evaluează și nu diagnostichează ADHD sau alte condiții. Instrumentele oferă structură pentru viața de zi cu zi și pot completa, dar nu înlocuiesc, sprijinul unui profesionist calificat.", "Dacă treci printr-o urgență medicală sau emoțională, contactează serviciile locale de urgență sau o persoană calificată care te poate ajuta direct."] },
    ],
  },
  confidentialitate: {
    eyebrow: "Confidențialitate",
    title: "Datele tale sunt ale tale.",
    copy: "Colectăm minimul necesar și separăm clar datele funcționale, informațiile sensibile și acordul de marketing.",
    description: "Politica de confidențialitate Ritualul de Azi, explicată clar.",
    sections: [
      { label: "Ce păstrăm", title: "Doar ce face produsul să funcționeze", paragraphs: ["Păstrăm datele contului, preferințele, taskurile și conținutul creat de tine pentru a-ți oferi funcțiile aplicației. Check-in-urile și jurnalul pot conține informații sensibile și sunt tratate separat.", "Nu trimitem textul jurnalului, taskurile, stările zilnice sau răspunsurile de wellbeing către platforme de publicitate."], points: ["Date de cont și autentificare", "Conținut creat voluntar în spațiul privat", "Date de abonament și drepturi de acces", "Consimțăminte înregistrate separat"] },
      { label: "Controlul tău", title: "Poți vedea, exporta și șterge", paragraphs: ["Din profil poți exporta datele asociate contului, poți șterge intrări individuale și poți iniția ștergerea definitivă a contului.", "Poți retrage separat acordul pentru comunicări de marketing. Retragerea nu afectează funcțiile esențiale ale contului."] },
      { label: "Furnizori", title: "Servicii folosite pentru funcționare", paragraphs: ["Supabase gestionează autentificarea și baza de date, Vercel găzduiește aplicația, iar Stripe procesează plățile. Fiecare furnizor primește numai datele necesare rolului său.", "Acest rezumat este redactat pentru claritate și trebuie completat cu datele juridice ale operatorului înainte de lansarea comercială."] },
      { label: "Cookies", title: "Preferințe și stocare locală", paragraphs: ["Folosim stocarea strict necesară pentru autentificare, securitate și funcționarea aplicației. Preferințele opționale nu sunt activate automat.", "Când vor fi adăugate instrumente de analiză opționale, vei putea accepta sau refuza separat acele categorii. Alegerea poate fi schimbată ulterior din această secțiune."] },
    ],
  },
  termeni: {
    eyebrow: "Termeni și condiții",
    title: "Termeni simpli, fără surprize.",
    copy: "Folosind Ritualul de Azi, accepți regulile de bază care păstrează serviciul sigur, corect și previzibil.",
    description: "Termenii de utilizare pentru Ritualul de Azi.",
    sections: [
      { label: "Serviciul", title: "Ce oferă Ritualul de Azi", paragraphs: ["Ritualul de Azi este un instrument digital de organizare, reflecție și wellbeing. Nu oferă diagnostic, tratament, psihoterapie sau intervenție de urgență.", "Poți folosi varianta gratuită sau un abonament Plus. Funcțiile incluse în fiecare plan sunt prezentate înainte de plată."] },
      { label: "Cont și plăți", title: "Responsabilități clare", paragraphs: ["Ești responsabilă pentru securitatea datelor de autentificare și pentru informațiile pe care alegi să le salvezi. Plățile sunt procesate prin Stripe și pot fi administrate din portalul clientului.", "Poți opri reînnoirea abonamentului oricând. Accesul plătit continuă până la finalul perioadei deja achitate, cu excepția situațiilor în care legislația aplicabilă cere altfel."] },
      { label: "Utilizare corectă", title: "Un spațiu construit cu grijă", paragraphs: ["Nu folosi serviciul pentru a încălca drepturile altor persoane, a încerca accesarea conturilor lor sau a perturba funcționarea platformei.", "Conținutul și funcțiile pot evolua. Schimbările importante ale termenilor vor fi comunicate clar. Documentul final necesită revizuire juridică înainte de lansarea comercială."] },
    ],
  },
};

const typeLabel: Record<string, string> = { article: "Articol", guide: "Ghid", workbook: "Workbook", audio: "Exercițiu audio", program: "Program" };

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const page = pageDefinitions[slug];
  if (page) return { title: page.eyebrow, description: page.description };
  const special: Record<string, [string, string]> = {
    instrumente: ["Instrumente", "Instrumente blânde pentru organizare, focus, jurnal și calm."],
    resurse: ["Resurse", "Ghiduri practice despre focus, organizare, emoții și odihnă."],
    blog: ["Blog", "Idei românești pentru zile reale, fără productivitate toxică."],
    contact: ["Contact", "Contactează echipa Ritualul de Azi."],
  };
  return special[slug] ? { title: special[slug][0], description: special[slug][1] } : {};
}

function StandardPage({ page }: { page: PageDefinition }) {
  return <><section className="border-b hairline"><div className="container-shell py-20 sm:py-28"><p className="eyebrow">{page.eyebrow}</p><h1 className="display mt-5 max-w-5xl text-6xl font-semibold leading-[.9] tracking-[-.045em] text-[var(--wine)] sm:text-8xl">{page.title}</h1><p className="mt-8 max-w-2xl text-xl leading-9 text-[var(--muted)]">{page.copy}</p></div></section><div className="container-shell py-20 sm:py-28">{page.sections.map((section, index) => <section id={section.label.toLowerCase().replace(/[^a-z0-9]+/g, "-")} key={section.title} className={`scroll-mt-28 grid gap-8 py-12 lg:grid-cols-[.38fr_.62fr] ${index ? "border-t hairline" : ""}`}><p className="eyebrow pt-2">{section.label}</p><div><h2 className="display max-w-3xl text-4xl font-semibold leading-tight text-[var(--wine)] sm:text-5xl">{section.title}</h2><div className="mt-6 max-w-3xl">{section.paragraphs.map((paragraph) => <p key={paragraph} className="mb-5 text-base leading-8 text-[var(--muted)]">{paragraph}</p>)}</div>{section.points && <ul className="mt-8 grid gap-3 sm:grid-cols-2">{section.points.map((point) => <li key={point} className="flex gap-3 rounded-xl bg-white/65 p-4 text-sm leading-6 text-[var(--wine)]"><Check size={17} className="mt-1 shrink-0 text-[var(--rose)]" />{point}</li>)}</ul>}</div></section>)}</div></>;
}

async function ResourcesPage({ blog = false }: { blog?: boolean }) {
  const resources = (await getPublicResources()).filter((item) => !blog || item.resource_type === "article");
  const [featured, ...rest] = resources;
  return <><section className="border-b hairline"><div className="container-shell grid gap-8 py-20 sm:py-28 lg:grid-cols-[1fr_.55fr] lg:items-end"><div><p className="eyebrow">{blog ? "Jurnal editorial" : "Biblioteca Ritualul de Azi"}</p><h1 className="display mt-5 max-w-4xl text-6xl font-semibold leading-[.9] tracking-[-.045em] text-[var(--wine)] sm:text-8xl">{blog ? "Idei pentru zile reale." : "Citește doar ce îți este util acum."}</h1></div><p className="max-w-xl text-base leading-8 text-[var(--muted)]">{blog ? "Texte clare și calde despre atenție, energie și relația cu tine — fără productivitate toxică." : "Ghiduri, exerciții și workbook-uri pentru focus, organizare, emoții, somn și o viață mai blândă."}</p></div></section>{featured && <section className="container-shell py-16 sm:py-24"><Link href={`/resurse/${featured.slug}`} className="group grid overflow-hidden rounded-[22px] bg-[var(--wine)] text-white lg:grid-cols-[.7fr_1.3fr]"><div className="paper-noise min-h-64 bg-[#6e4750] p-8 sm:p-12"><p className="eyebrow !text-[var(--rose-soft)]">Recomandarea săptămânii</p><p className="display mt-14 max-w-xs text-4xl font-medium italic leading-tight">Un început mic poate schimba tonul întregii zile.</p></div><div className="flex flex-col justify-center p-8 sm:p-14"><p className="text-xs font-bold uppercase tracking-[.14em] text-[var(--rose-soft)]">{typeLabel[featured.resource_type]} · {featured.access === "free" ? "Gratuit" : "Plus"}</p><h2 className="display mt-4 max-w-3xl text-4xl font-semibold leading-tight sm:text-6xl">{featured.title}</h2><p className="mt-5 max-w-2xl leading-8 text-white/70">{featured.excerpt}</p><span className="mt-8 inline-flex items-center gap-2 text-sm font-bold">Citește materialul <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" /></span></div></Link><div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{rest.map((item) => <Link href={`/resurse/${item.slug}`} key={item.slug} className="editorial-card group flex min-h-72 flex-col p-7 transition-transform hover:-translate-y-1"><div className="flex items-center justify-between gap-4"><span className="text-[.68rem] font-bold uppercase tracking-[.14em] text-[var(--rose-dark)]">{typeLabel[item.resource_type]}</span><span className="text-xs text-[var(--muted)]">{item.access === "free" ? "Gratuit" : "Plus"}</span></div><h2 className="display mt-8 text-3xl font-semibold leading-tight text-[var(--wine)]">{item.title}</h2><p className="mt-4 text-sm leading-7 text-[var(--muted)]">{item.excerpt}</p><MoveRight className="mt-auto pt-7 text-[var(--rose)] transition-transform group-hover:translate-x-1" size={39} /></Link>)}</div></section>}</>;
}

function ToolsPage() {
  return <><section className="border-b hairline"><div className="container-shell py-20 sm:py-28"><p className="eyebrow">Instrumente</p><h1 className="display mt-5 max-w-5xl text-6xl font-semibold leading-[.9] tracking-[-.045em] text-[var(--wine)] sm:text-8xl">Instrumente care nu te ceartă.</h1><p className="mt-8 max-w-2xl text-xl leading-9 text-[var(--muted)]">Începi cu energia pe care o ai, nu cu cea pe care crezi că ar trebui să o ai.</p></div></section><section className="container-shell py-16 sm:py-24"><div className="grid gap-4 md:grid-cols-2">{toolCards.map((tool, index) => <Link key={tool.title} href={tool.href} className={`group grid min-h-64 overflow-hidden rounded-[18px] border hairline p-7 transition-transform hover:-translate-y-1 sm:p-9 ${index % 3 === 0 ? "bg-[var(--blush)]" : "bg-[rgba(255,250,248,.82)]"}`}><span className="font-mono text-xs font-bold text-[var(--rose-dark)]">{String(index + 1).padStart(2, "0")} / {tool.accent}</span><div className="self-end"><h2 className="display text-4xl font-semibold text-[var(--wine)]">{tool.title}</h2><p className="mt-3 max-w-md text-sm leading-7 text-[var(--muted)]">{tool.copy}</p><span className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[var(--rose-dark)]">Deschide instrumentul <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" /></span></div></Link>)}</div><aside className="mt-12 grid gap-5 rounded-[22px] bg-[var(--wine)] p-8 text-white sm:p-12 lg:grid-cols-[1fr_auto] lg:items-center"><div><p className="display text-4xl font-semibold">Nu trebuie să le folosești pe toate.</p><p className="mt-3 max-w-2xl leading-7 text-white/65">Alege instrumentul care răspunde zilei de azi. Poți reveni la altul când nevoia se schimbă.</p></div><Link href="/inregistrare" className="button-primary bg-[var(--rose-soft)] !text-[var(--wine)]">Creează contul gratuit</Link></aside></section></>;
}

function ContactPage() {
  return <><section className="container-shell grid gap-12 py-20 sm:py-28 lg:grid-cols-[1fr_.72fr]"><div><p className="eyebrow">Contact</p><h1 className="display mt-5 max-w-3xl text-6xl font-semibold leading-[.9] tracking-[-.045em] text-[var(--wine)] sm:text-8xl">Suntem aici, cu răbdare.</h1><p className="mt-8 max-w-xl text-xl leading-9 text-[var(--muted)]">Pentru întrebări despre cont, plăți, confidențialitate, conținut sau colaborări.</p><a href="mailto:hello@ritualuldeazi.ro" className="button-primary mt-9"><Mail size={17} /> hello@ritualuldeazi.ro</a></div><aside className="editorial-card self-start p-7 sm:p-9"><p className="eyebrow">Ca să te ajutăm mai repede</p><ul className="mt-6 grid gap-4 text-sm leading-7 text-[var(--muted)]"><li><strong className="text-[var(--wine)]">Cont:</strong> scrie adresa folosită la înregistrare, fără parolă.</li><li><strong className="text-[var(--wine)]">Plată:</strong> include data aproximativă și tipul abonamentului.</li><li><strong className="text-[var(--wine)]">Confidențialitate:</strong> spune clar dacă dorești acces, corectare sau ștergere.</li></ul></aside></section><section className="border-y hairline bg-white/50"><div className="container-shell grid gap-6 py-16 sm:grid-cols-3"><div><p className="eyebrow">Răspuns</p><p className="mt-3 text-sm leading-7 text-[var(--muted)]">Îți răspundem, de regulă, în două zile lucrătoare.</p></div><div><p className="eyebrow">Siguranță</p><p className="mt-3 text-sm leading-7 text-[var(--muted)]">Nu trimite parole, date complete de card sau informații medicale prin email.</p></div><div><p className="eyebrow">Urgențe</p><p className="mt-3 text-sm leading-7 text-[var(--muted)]">Pentru urgențe medicale sau emoționale, contactează serviciile locale de urgență.</p></div></div></section></>;
}

export default async function PublicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let content: React.ReactNode;
  if (pageDefinitions[slug]) content = <StandardPage page={pageDefinitions[slug]} />;
  else if (slug === "resurse") content = <ResourcesPage />;
  else if (slug === "blog") content = <ResourcesPage blog />;
  else if (slug === "instrumente") content = <ToolsPage />;
  else if (slug === "contact") content = <ContactPage />;
  else notFound();
  return <><PublicHeader /><main id="continut">{content}</main><PublicFooter /></>;
}
