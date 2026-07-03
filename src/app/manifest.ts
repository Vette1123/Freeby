import type { MetadataRoute } from "next";
import { BRAND } from "@/lib/brand";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: BRAND.name,
    short_name: "Freeby",
    description:
      "Clean, fast invoicing and time tracking for freelancers — timer, projects, and invoices in one unbroken flow.",
    start_url: "/",
    display: "standalone",
    background_color: BRAND.ink,
    theme_color: BRAND.indigo,
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
