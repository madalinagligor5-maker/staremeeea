// Până la lansare, aplicația arată doar pagina de lansare. Setează NEXT_PUBLIC_LAUNCH_MODE=off ca să deschizi instrumentele.
export const preLaunch = process.env.NEXT_PUBLIC_LAUNCH_MODE !== "off";

// Rute ascunse în perioada de pre-lansare. /admin, /auth și /api/* rămân active.
export const hiddenUntilLaunch = ["/spatiu", "/instrumente", "/resurse", "/blog", "/preturi", "/inregistrare", "/autentificare", "/resetare-parola", "/onboarding"];

export function isHiddenUntilLaunch(pathname: string) {
  return hiddenUntilLaunch.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}
