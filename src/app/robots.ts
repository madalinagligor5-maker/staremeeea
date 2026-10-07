import type { MetadataRoute } from "next";
export default function robots(): MetadataRoute.Robots { const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ritualuldeazi.ro"; return { rules: [{ userAgent: "*", allow: "/", disallow: ["/spatiu/", "/admin/", "/api/", "/multumim"] }], sitemap: `${base}/sitemap.xml` }; }
