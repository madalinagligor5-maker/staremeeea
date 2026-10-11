import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Ritualul de Azi",
    short_name: "Ritualul",
    description: "Un sistem de organizare pentru zilele grele. Mai puțin de purtat.",
    id: "/carte",
    start_url: "/carte",
    scope: "/",
    display: "standalone",
    background_color: "#F6EFE6",
    theme_color: "#432D3D",
    lang: "ro",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
