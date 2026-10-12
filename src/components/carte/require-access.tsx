// Închide paginile de scris ale Cărții pentru cine nu are abonament, dar numai după ce pornești CARTE_PAYWALL=on.
// Paginile Date și Statistici nu trec pe aici: cine și-a anulat abonamentul își poate citi și exporta ce a scris.
import { redirect } from "next/navigation";
import { getAccess } from "@/lib/access";
import { paywallOn } from "@/lib/access-rules";

export async function RequireAccess({ next, children }: { next: string; children: React.ReactNode }) {
  if (!paywallOn()) return <>{children}</>;
  const access = await getAccess();
  if (!access) redirect("/preturi"); // fără Supabase, nu deschidem Cartea din greșeală
  if (!access.signedIn) redirect(`/autentificare?next=${encodeURIComponent(next)}`);
  if (!access.subscribed) redirect("/preturi");
  return <>{children}</>;
}
