"use client";

import Script from "next/script";
import { useEffect, useState } from "react";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? "G-Q0VDRZLGPB";
const KEY = "rda-analytics";

type Gtag = (...args: unknown[]) => void;

function setConsent(granted: boolean) {
  const gtag = (window as unknown as { gtag?: Gtag }).gtag;
  gtag?.("consent", "update", { analytics_storage: granted ? "granted" : "denied" });
}

export function Analytics() {
  const [asked, setAsked] = useState(true);

  useEffect(() => {
    let saved: string | null = null;
    try { saved = localStorage.getItem(KEY); } catch {}
    if (saved === "yes") setConsent(true);
    setAsked(saved === "yes" || saved === "no");
  }, []);

  function choose(yes: boolean) {
    try { localStorage.setItem(KEY, yes ? "yes" : "no"); } catch {}
    setConsent(yes);
    setAsked(true);
  }

  if (!GA_ID) return null;

  return (
    <>
      <Script id="ga-consent" strategy="afterInteractive">{`
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        window.gtag = gtag;
        gtag('consent', 'default', { analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
        gtag('js', new Date());
        gtag('config', '${GA_ID}');
      `}</Script>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
      {!asked && (
        <div role="dialog" aria-label="Statistici anonime" className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-xl rounded-2xl border border-[var(--line)] bg-[var(--ivory)] p-4 shadow-lg">
          <p className="text-sm text-[var(--ink)]">Folosim statistici anonime ca să vedem ce merită îmbunătățit. Fără ele, site-ul funcționează la fel.</p>
          <div className="mt-3 flex gap-2">
            <button type="button" onClick={() => choose(true)} className="rounded-full bg-[var(--wine)] px-4 py-2 text-sm font-semibold text-[var(--ivory)]">Sunt de acord</button>
            <button type="button" onClick={() => choose(false)} className="rounded-full border border-[var(--line)] px-4 py-2 text-sm text-[var(--wine)]">Nu, mulțumesc</button>
          </div>
        </div>
      )}
    </>
  );
}
