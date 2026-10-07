import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return { name: "Ritualul de Azi", short_name: "Ritualul", description: "Un sistem de organizare pentru zilele grele. Mai puțin de purtat.", start_url: "/spatiu/azi", display: "standalone", background_color: "#F6EFE6", theme_color: "#432D3D", lang: "ro", icons: [{ src: "/images/ritualul-de-azi-monogram.png", sizes: "1254x1254", type: "image/png", purpose: "any" }] };
}
