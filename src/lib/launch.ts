// Modul de lansare, din NEXT_PUBLIC_LAUNCH_MODE:
//  - gol sau "pre": doar pagina de lansare și lista de așteptare (/carte este deschisă și gratuită, pentru testare);
//  - "carte": lansarea Cărții: se deschid Prețurile, contul și plata; instrumentele vechi rămân ascunse;
//  - "off": se deschide tot.
export type LaunchMode = "pre" | "carte" | "off";

const raw = process.env.NEXT_PUBLIC_LAUNCH_MODE;
export const launchMode: LaunchMode = raw === "off" ? "off" : raw === "carte" ? "carte" : "pre";

/** True doar înainte de lansare: site-ul arată pagina de lansare și lista de așteptare. */
export const preLaunch = launchMode === "pre";

// Rute ascunse în fiecare mod. /admin, /auth și /api/* rămân active.
const hiddenByMode: Record<LaunchMode, readonly string[]> = {
  pre: ["/spatiu", "/instrumente", "/resurse", "/blog", "/preturi", "/inregistrare", "/autentificare", "/resetare-parola", "/onboarding"],
  carte: ["/spatiu", "/instrumente", "/resurse", "/blog", "/onboarding"],
  off: [],
};

export const hiddenUntilLaunch = hiddenByMode[launchMode];

export function isHiddenUntilLaunch(pathname: string) {
  return hiddenUntilLaunch.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}
