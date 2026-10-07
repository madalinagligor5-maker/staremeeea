import type { MetadataRoute } from "next";
import { preLaunch } from "@/lib/launch";
export default function sitemap(): MetadataRoute.Sitemap { const b = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ritualuldeazi.ro"; const paths = preLaunch ? ["", "/despre", "/contact", "/confidentialitate", "/termeni"] : ["", "/despre", "/instrumente", "/resurse", "/blog", "/preturi", "/contact", "/confidentialitate", "/termeni"]; return paths.map(path => ({ url: `${b}${path}`, lastModified: new Date(), changeFrequency: path === "" ? "weekly" : "monthly", priority: path === "" ? 1 : .7 })); }
