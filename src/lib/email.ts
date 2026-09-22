import { Resend } from "resend";

const subjects = { welcome: "Bine ai venit în Ritualul de Azi", plus: "Ritualul de Azi Plus este activ", payment_failed: "Plata nu a putut fi procesată", stopped: "Abonamentul tău a fost oprit" } as const;
export async function sendTransactional(to: string, kind: keyof typeof subjects, message: string) {
  const key = process.env.RESEND_API_KEY; const from = process.env.RESEND_FROM_EMAIL; if (!key || !from) return;
  const resend = new Resend(key); await resend.emails.send({ from, to, subject: subjects[kind], html: `<div style="font-family:Manrope,Arial,sans-serif;color:#383238;line-height:1.7;max-width:560px;margin:auto"><h1 style="font-family:Georgia,serif;color:#593843">Ritualul de Azi</h1><p>${message}</p><p style="color:#756970;font-size:13px">Poți reveni oricând. Minte echilibrată. Viață mai blândă.</p></div>` });
}
