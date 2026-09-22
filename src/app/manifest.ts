import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return { name: "Ritualul de Azi", short_name: "Ritualul", description: "Ritualuri mici pentru organizare, focus și wellbeing într-un ritm mai blând.", start_url: "/spatiu/azi", display: "standalone", background_color: "#FCF9F5", theme_color: "#593843", lang: "ro", icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }] };
}
