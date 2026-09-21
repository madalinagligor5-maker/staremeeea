import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return { name: "Starea Mea", short_name: "Starea Mea", description: "Organizare, focus și wellbeing într-un ritm mai blând.", start_url: "/spatiu/azi", display: "standalone", background_color: "#FBF6F4", theme_color: "#B75668", lang: "ro", icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }] };
}
