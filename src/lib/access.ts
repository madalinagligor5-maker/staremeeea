// Cine are acces la Carte după lansare. Accesul vine din abonamentul înregistrat de webhook-ul Stripe.
// Datele scrise rămân pe dispozitiv; aici se verifică doar abonamentul.
import { hasAccessStatus, pickSubscription, type SubscriptionRow } from "@/lib/access-rules";
import { createClient } from "@/lib/supabase/server";

export { accessStatuses, hasAccessStatus, paywallOn, pickSubscription } from "@/lib/access-rules";

export type Access = {
  signedIn: boolean;
  email: string | null;
  subscribed: boolean;
  hasSubscription: boolean; // a avut vreodată un abonament (pentru portal și pentru a nu repeta proba)
  status: string | null;
  periodEnd: string | null;
};

/** Null dacă Supabase nu e configurat. */
export async function getAccess(): Promise<Access | null> {
  const supabase = await createClient();
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  if (!user) return { signedIn: false, email: null, subscribed: false, hasSubscription: false, status: null, periodEnd: null };
  const { data: rows } = await supabase
    .from("subscriptions")
    .select("status, current_period_end")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  const list = (rows ?? []) as SubscriptionRow[];
  const chosen = pickSubscription(list);
  return {
    signedIn: true,
    email: user.email ?? null,
    subscribed: list.some((r) => hasAccessStatus(r.status)),
    hasSubscription: list.length > 0,
    status: chosen?.status ?? null,
    periodEnd: chosen?.current_period_end ?? null,
  };
}
