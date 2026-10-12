#!/usr/bin/env python3
"""Generează cele trei bonusuri PDF (completabile) pentru Ritualul de azi.

Rulare: python3 scripts/bonusuri.py  (necesită reportlab și fonturile DejaVu)
Rezultat: public/bonusuri/*.pdf, câte o variantă „crem” (ecran) și „alb” (tipărit).
Textele sunt aici, ca să le poți edita și regenera.
"""
from pathlib import Path
from reportlab.lib.colors import HexColor, white
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas
from reportlab.platypus import Paragraph

FONTS = Path("/usr/share/fonts/truetype/dejavu")
pdfmetrics.registerFont(TTFont("Sans", str(FONTS / "DejaVuSans.ttf")))
pdfmetrics.registerFont(TTFont("Sans-B", str(FONTS / "DejaVuSans-Bold.ttf")))
pdfmetrics.registerFont(TTFont("Serif", str(FONTS / "DejaVuSerif.ttf")))
pdfmetrics.registerFont(TTFont("Serif-B", str(FONTS / "DejaVuSerif-Bold.ttf")))

W, H = A4
M = 54  # margine
PLUM, ROSE, BLUSH, MUTED, CREAM, LINE = (HexColor(c) for c in ("#432D3D", "#86495E", "#E8DCCB", "#6B5766", "#F6EFE6", "#CDBFB3"))
OUT = Path(__file__).resolve().parent.parent / "public" / "bonusuri"

body = ParagraphStyle("body", fontName="Sans", fontSize=10.5, leading=16, textColor=PLUM, alignment=TA_LEFT)
small = ParagraphStyle("small", parent=body, fontSize=9, leading=13, textColor=MUTED)
bold = ParagraphStyle("bold", parent=body, fontName="Sans-B")
h2 = ParagraphStyle("h2", parent=body, fontName="Serif-B", fontSize=15, leading=20, textColor=PLUM)


class Doc:
    def __init__(self, filename: str, bg: bool, title: str):
        OUT.mkdir(parents=True, exist_ok=True)
        self.c = canvas.Canvas(str(OUT / filename), pagesize=A4)
        self.c.setTitle(title)
        self.c.setAuthor("Ritualul de azi")
        self.bg = bg
        self.n = 0
        self.fields = 0
        self.y = H - M

    def page(self, label: str = ""):
        if self.n:
            self.c.showPage()
        self.n += 1
        c = self.c
        if self.bg:
            c.setFillColor(CREAM)
            c.rect(0, 0, W, H, stroke=0, fill=1)
        c.setFillColor(ROSE)
        c.setFont("Sans-B", 8.5)
        c.drawString(M, H - 34, "RITUALUL DE AZI")
        if label:
            c.setFillColor(MUTED)
            c.setFont("Sans", 8.5)
            c.drawRightString(W - M, H - 34, label)
        c.setStrokeColor(LINE)
        c.line(M, H - 42, W - M, H - 42)
        c.setFillColor(MUTED)
        c.setFont("Sans", 8)
        c.drawString(M, 28, "Mai puțin de purtat. Nu înlocuiește ajutorul unui specialist.")
        c.drawRightString(W - M, 28, str(self.n))
        self.y = H - 78

    def para(self, text: str, style=body, gap=8, width=None, x=M):
        w = width or (W - 2 * M)
        p = Paragraph(text, style)
        _, h = p.wrap(w, H)
        p.drawOn(self.c, x, self.y - h)
        self.y -= h + gap
        return h

    def title(self, text: str, size=26):
        st = ParagraphStyle("t", parent=h2, fontSize=size, leading=size + 6)
        self.para(text, st, gap=10)

    def gap(self, n=10):
        self.y -= n

    def line(self, name: str, label: str = "", height=24, multiline=False, lines=1, hint=""):
        """Un rând (sau mai multe) de completat."""
        if label:
            self.para(label, bold, gap=2)
        if hint:
            self.para(hint, small, gap=2)
        h = 22 * lines if multiline else height
        top = self.y
        self.fields += 1
        self.c.acroForm.textfield(
            name=f"{name}_{self.fields}", x=M, y=top - h, width=W - 2 * M, height=h,
            borderStyle="underlined", borderWidth=1, borderColor=ROSE, fillColor=None,
            textColor=PLUM, fontSize=12, fontName="Helvetica", forceBorder=True,
            fieldFlags="multiline" if multiline else "",
        )
        self.y -= h + 12

    def tick(self, name: str, text: str):
        self.fields += 1
        self.c.acroForm.checkbox(name=f"{name}_{self.fields}", x=M, y=self.y - 18, size=18, borderColor=ROSE, fillColor=white, textColor=PLUM, buttonStyle="check", borderWidth=1.5, forceBorder=True)
        p = Paragraph(text, body)
        _, h = p.wrap(W - 2 * M - 30, H)
        p.drawOn(self.c, M + 30, self.y - 16 - (h - 16) / 2 if h > 16 else self.y - 16)
        self.y -= max(h, 20) + 10

    def card(self, heading: str, text: str):
        """Casetă cu titlu și text scurt."""
        w = W - 2 * M - 24
        hp = Paragraph(heading, ParagraphStyle("ch", parent=bold, fontSize=11.5, leading=16))
        tp = Paragraph(text, body)
        _, hh = hp.wrap(w, H)
        _, th = tp.wrap(w, H)
        total = hh + th + 28
        c = self.c
        c.setFillColor(white if self.bg else CREAM)
        c.setStrokeColor(LINE)
        c.roundRect(M, self.y - total, W - 2 * M, total, 10, stroke=1, fill=1)
        hp.drawOn(c, M + 12, self.y - 12 - hh)
        tp.drawOn(c, M + 12, self.y - 16 - hh - th)
        self.y -= total + 12

    def save(self):
        self.c.save()


# ---------------------------------------------------------------- 1. Ghidul
def ghid(bg: bool, suffix: str):
    d = Doc(f"ghid-am-mai-incercat-si-am-renuntat-{suffix}.pdf", bg, "Am mai încercat și am renunțat")
    d.page("Ghid")
    d.gap(30)
    d.title("Am mai încercat<br/>și am renunțat", 32)
    d.para("De ce se oprește o agendă după câteva zile și ce faci diferit data viitoare.", ParagraphStyle("sub", parent=body, fontSize=13, leading=20, textColor=ROSE), gap=26)
    d.para("Dacă ai început o agendă și ai lăsat-o, nu ești singura. Foarte multe agende presupun aceeași energie în fiecare zi: aceeași dimineață limpede, aceeași seară liniștită. Poate tu nu ai așa ceva, și nu e vina ta.", gap=12)
    d.para("Ghidul acesta nu promite că devii altă persoană. Îți arată cinci motive obișnuite pentru care o agendă se oprește și ce poți face diferit, cu pași mici. Pe ultimele pagini ai locuri de completat.", gap=12)
    d.para("Poți citi pe ecran și completa direct în PDF, sau tipări paginile.", small, gap=20)
    d.card("Cum îl folosești", "Citește un motiv pe zi, sau toate odată. Completează doar ce te ajută. Poți sări peste orice.")

    d.page("Ghid")
    d.title("Cinci motive pentru care<br/>o agendă se oprește", 21)
    motive = [
        ("1. Cere prea mult", "Pagini cu multe rubrici, în fiecare zi. În zilele grele, doar vederea lor e obositoare.", "Alegi nivelul zilei (bună, obosită, grea). În zi grea completezi un singur lucru. Restul poate rămâne gol."),
        ("2. Paginile goale devin vină", "O pagină nefolosită se transformă, în câteva zile, într-un teanc de pagini nefolosite.", "O zi goală rămâne o zi goală. Nu o recuperezi, nu o completezi retroactiv. Mergi mai departe de la azi."),
        ("3. O pauză pare imposibil de recuperat", "După trei zile fără agendă apare gândul „acum trebuie să o iau de la capăt”. Atunci ușa se închide.", "Faci Resetarea: ce s-a întâmplat, ce poți lăsa jos, un singur lucru pentru azi. Fără listă veche."),
        ("4. Lucrurile sunt în prea multe locuri", "Notițe în telefon, bilețele, o agendă, în cap. Nu mai știi unde ai pus ce.", "Un singur loc pentru tot ce porți: pagina Acum. Scrii fără ordine, apoi alegi: azi, mai târziu, nu mai port."),
        ("5. Nu există loc pentru zilele grele", "Agenda e făcută pentru zilele în care mergi bine. În celelalte nu o deschizi.", "Ai o pagină de zi grea, gândită din start: un lucru, o bifă. Și asta e o zi folosită."),
    ]
    for t, ce, dif in motive:
        d.card(t, f"<b>Ce se întâmplă.</b> {ce}<br/><b>Ce faci diferit.</b> {dif}")

    d.page("Ghid · Exercițiu")
    d.title("Ce a oprit ultima ta agendă?", 21)
    d.para("Nu cauți vinovați. Cauți ce nu s-a potrivit cu viața ta.", small, gap=14)
    d.line("agenda", "Ce agendă sau aplicație ai încercat ultima dată?")
    d.line("cat", "Cât a ținut?")
    d.line("oprire", "Ce s-a întâmplat în ziua în care ai oprit-o?", multiline=True, lines=3)
    d.line("prea_mult", "Ce cerea prea mult de la tine?", multiline=True, lines=3)
    d.line("trebuia", "Ce ți-ar fi trebuit în ziua aceea?", multiline=True, lines=3)

    d.page("Ghid · Plan")
    d.title("Prima săptămână, mică", 21)
    d.para("Nu începi cu totul. Începi cu foarte puțin și lași restul să vină, dacă vine.", gap=14)
    d.card("Zilele 1–3", "Doar pagina Acum și un singur lucru pe zi. Dacă nu ai chef, doar bifa de la „Un singur lucru”.")
    d.card("Zilele 4–7", "Adaugi Seara: o propoziție despre ce a mers, oricât de mic. Alegi nivelul zilei dimineața.")
    d.card("Dacă sari peste", "Nu faci nimic special. Revii când poți. Dacă au trecut câteva zile, faci Resetarea.")
    d.gap(6)
    d.line("prima_zi", "Când încep? (zi și ora)")
    d.line("un_lucru", "Primul meu „un singur lucru”:")

    d.page("Ghid · Pentru mai târziu")
    d.title("Dacă te oprești din nou", 21)
    d.para("Se poate întâmpla. Scrie acum, când ești bine, ce vrei să-ți spui atunci. Citește rândurile astea când te oprești.", gap=14)
    d.line("imi_spun", "Când mă opresc, îmi spun:", multiline=True, lines=4)
    d.line("pot_face", "Cel mai mic lucru pe care îl pot face atunci:", multiline=True, lines=2)
    d.line("cineva", "O persoană căreia îi pot spune:", )
    d.gap(8)
    d.para("Dacă oboseala, anxietatea sau tristețea sunt prezente de mult timp și îți îngreunează viața, vorbește cu un medic sau un psiholog. Agenda ajută la organizare, dar nu înlocuiește sprijinul specialiștilor.", small)
    d.save()


# ------------------------------------------------------ 2. Paginile de zi grea
def zi_grea(bg: bool, suffix: str):
    d = Doc(f"paginile-de-zi-grea-{suffix}.pdf", bg, "Paginile de zi grea")
    d.page("Zi grea · 1")
    d.title("Azi e zi grea.", 28)
    d.para("Nu trebuie să fie altfel. Un singur lucru ajunge.", ParagraphStyle("s", parent=body, fontSize=13, leading=20, textColor=ROSE), gap=26)
    d.line("un_lucru", "Un singur lucru pentru azi", hint="Alege ceva mic și clar. Poate fi „mă spăl pe față”.", multiline=True, lines=2)
    d.gap(6)
    d.tick("gata", "Gata. Sau am încercat, și asta ajunge.")
    d.gap(20)
    d.card("Dacă nu iese", "A încerca contează. Mâine e altă pagină, și nu are nicio datorie față de azi.")

    d.page("Zi grea · 2")
    d.title("Pune jos", 24)
    d.para("Scrie tot ce porți acum, fără ordine. Nu trebuie să faci nimic cu lista azi.", gap=12)
    d.line("port", "Ce port acum", multiline=True, lines=6)
    d.line("maine", "Ce las pe mâine (sau mai târziu)", multiline=True, lines=4)
    d.line("nu_mai", "Ce nu mai port", multiline=True, lines=3, hint="Ce pot scoate din listă fără urmări.")

    d.page("Zi grea · 3")
    d.title("Cel mai mic pas", 24)
    d.para("Când lucrul pare prea mare, îl faci mai mic, până încape în două minute.", gap=14)
    d.line("lucrul", "Lucrul care mi se pare prea mare")
    d.line("pas", "Primul pas, cât de mic", hint="Cât ține cât să-ți iei un pahar cu apă.", multiline=True, lines=2)
    d.line("trebuie", "Ce îmi trebuie ca să-l fac")
    d.line("cand", "Când (ora sau „după ce…”)")
    d.tick("pas_gata", "Am făcut primul pas")

    d.page("Zi grea · 4")
    d.title("Seara, într-o propoziție", 24)
    d.para("Chiar dacă ziua a fost grea. Mai ales atunci.", gap=14)
    d.line("a_mers", "Ce a mers azi, oricât de puțin", multiline=True, lines=3)
    d.line("las", "Ce las aici și nu mai port în noaptea asta", multiline=True, lines=3)
    d.line("maine_unu", "Mâine, dacă pot: un singur lucru")
    d.save()


# --------------------------------------------------- 3. Resetarea fără vină
def resetare(bg: bool, suffix: str):
    d = Doc(f"resetarea-fara-vina-{suffix}.pdf", bg, "Resetarea fără vină")
    d.page("Fișă")
    d.title("Resetarea fără vină", 28)
    d.para("Pentru când ai lipsit câteva zile și ai impresia că trebuie să o iei de la capăt. Nu trebuie. Nu ai nimic de recuperat.", gap=18)
    d.line("ce", "1. Ce s-a întâmplat?", hint="O propoziție. Fără explicații și fără justificări.")
    d.line("jos", "2. Ce pot lăsa jos?", hint="Din lista veche. Poate rămâne acolo, nu trebuie făcută.", multiline=True, lines=4)
    d.line("unu", "3. Un singur lucru pentru azi", hint="Atât. Pagina de azi se deschide pe „zi grea”.", multiline=True, lines=2)
    d.gap(8)
    d.card("Despre vină", "Ai lipsit. Se întâmplă. Pagina nu număra zilele și nu începe de la zero: te așteaptă așa cum e.")
    d.save()


if __name__ == "__main__":
    for bg, suffix in ((True, "crem"), (False, "alb")):
        ghid(bg, suffix)
        zi_grea(bg, suffix)
        resetare(bg, suffix)
    print("Gata:", ", ".join(sorted(p.name for p in OUT.glob("*.pdf"))))
