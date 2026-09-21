import type { MetadataRoute } from "next";
export default function robots(): MetadataRoute.Robots { const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://stareamea.ro"; return { rules: [{ userAgent: "*", allow: "/", disallow: ["/spatiu/", "/admin/", "/api/"] }], sitemap: `${base}/sitemap.xml` }; }
