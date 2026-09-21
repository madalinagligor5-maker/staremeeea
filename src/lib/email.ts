import { Resend } from "resend";

const subjects = { welcome: "Bine ai venit în Starea Mea", plus: "Starea Mea Plus este activ", payment_failed: "Plata nu a putut fi procesată", stopped: "Abonamentul tău a fost oprit" } as const;
export async function sendTransactional(to: string, kind: keyof typeof subjects, message: string) {
  const key = process.env.RESEND_API_KEY; const from = process.env.RESEND_FROM_EMAIL; if (!key || !from) return;
  const resend = new Resend(key); await resend.emails.send({ from, to, subject: subjects[kind], html: `<div style="font-family:Arial,sans-serif;color:#252129;line-height:1.7;max-width:560px;margin:auto"><h1 style="font-family:Georgia,serif;color:#56373E">Starea Mea</h1><p>${message}</p><p style="color:#776568;font-size:13px">Poți reveni oricând. Minte echilibrată. Viață mai blândă.</p></div>` });
}
