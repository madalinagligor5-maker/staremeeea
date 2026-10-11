import { Resend } from "resend";
import { planere } from "@/lib/planere";
import { siteUrl } from "@/lib/waitlist";

const subjects = { welcome: "Bine ai venit în Ritualul de Azi", plus: "Ritualul de Azi Plus este activ", payment_failed: "Plata nu a putut fi procesată", stopped: "Abonamentul tău a fost oprit" } as const;
export async function sendTransactional(to: string, kind: keyof typeof subjects, message: string) {
  const key = process.env.RESEND_API_KEY; const from = process.env.RESEND_FROM_EMAIL; if (!key || !from) return;
  const resend = new Resend(key); await resend.emails.send({ from, to, subject: subjects[kind], html: `<div style="font-family:Manrope,Arial,sans-serif;color:#383238;line-height:1.7;max-width:560px;margin:auto"><h1 style="font-family:Georgia,serif;color:#593843">Ritualul de Azi</h1><p>${message}</p><p style="color:#756970;font-size:13px">Poți reveni oricând. Minte echilibrată. Viață mai blândă.</p></div>` });
}

export async function sendWaitlistConfirmation(to: string, confirmUrl: string, unsubscribeUrl: string) {
  const key = process.env.RESEND_API_KEY; const from = process.env.RESEND_FROM_EMAIL; if (!key || !from) return false;
  const resend = new Resend(key);
  const base = siteUrl();
  const rows = planere.map((p) => `<li style="margin:0 0 8px"><strong>${p.nume}</strong> · <a href="${base}${p.crem}" style="color:#86495E">pentru ecran</a> · <a href="${base}${p.alb}" style="color:#86495E">pentru tipărit</a></li>`).join("");
  const textRows = planere.map((p) => `${p.nume}: ${base}${p.crem} (ecran) · ${base}${p.alb} (tipărit)`).join("\n");
  const { error } = await resend.emails.send({
    from, to, subject: "Confirmă-ți adresa — Ritualul de azi",
    html: `<div style="background:#F6EFE6;padding:32px 16px"><div style="font-family:'Nunito Sans',Arial,sans-serif;color:#432D3D;line-height:1.7;max-width:540px;margin:auto;font-size:17px"><h1 style="font-family:Georgia,serif;color:#432D3D;font-size:30px;line-height:1.2;margin:0 0 16px">Mai puțin de purtat.</h1><p>Apasă pe buton ca să ne spui că ești tu. Apoi te anunțăm când Ritualul de azi este gata.</p><p style="margin:28px 0"><a href="${confirmUrl}" style="background:#432D3D;color:#F6EFE6;text-decoration:none;border-radius:999px;padding:14px 28px;font-weight:700;display:inline-block">Confirmă adresa</a></p><p style="margin:24px 0 8px"><strong>Până atunci, două pagini și agenda de încercat</strong> (se completează direct în PDF):</p><ul style="padding-left:20px;margin:0 0 24px">${rows}</ul><p style="color:#6B5766;font-size:14px">Dacă nu tu ai cerut asta, ignoră mesajul. Nu te mai contactăm.<br>Te poți dezabona oricând: <a href="${unsubscribeUrl}" style="color:#86495E">dezabonare</a>.</p></div></div>`,
    text: `Mai puțin de purtat.\n\nConfirmă adresa: ${confirmUrl}\n\nPână atunci, două pagini și agenda de încercat:\n${textRows}\n\nDacă nu tu ai cerut asta, ignoră mesajul.\nDezabonare: ${unsubscribeUrl}`,
  });
  return !error;
}
