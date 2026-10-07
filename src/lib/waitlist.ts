export const waitlistConsentText = "Sunt de acord să primesc pe email mini-pagina „Azi” și informări despre lansarea Ritualul de azi. Mă pot dezabona oricând.";

export function newToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(24));
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export function siteUrl(request?: Request) {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? (request ? new URL(request.url).origin : "https://ritualuldeazi.ro")).replace(/\/$/, "");
}
