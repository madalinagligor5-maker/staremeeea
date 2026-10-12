// Regulile de acces, fără nicio dependență de server, ca să poată fi verificate ușor.

/** Stări Stripe care dau acces. past_due rămâne cu acces cât timp Stripe mai reîncearcă plata. */
export const accessStatuses: readonly string[] = ["trialing", "active", "past_due"];

export function hasAccessStatus(status: string | null | undefined): boolean {
  return typeof status === "string" && accessStatuses.includes(status);
}

/** Blocarea accesului se pornește din setările serverului: CARTE_PAYWALL=on. Până atunci Cartea e deschisă. */
export function paywallOn(env: Record<string, string | undefined> = process.env): boolean {
  return env.CARTE_PAYWALL === "on";
}

export type SubscriptionRow = { status: string; current_period_end: string | null };

/** Alege rândul care contează: întâi unul cu acces, apoi cel mai recent. */
export function pickSubscription(rows: readonly SubscriptionRow[]): SubscriptionRow | null {
  return rows.find((r) => hasAccessStatus(r.status)) ?? rows[0] ?? null;
}
