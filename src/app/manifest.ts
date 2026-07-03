import type { MetadataRoute } from "next";
import { BRAND } from "@/lib/brand";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: BRAND.name,
    short_name: "Freeby",
    description:
      "Clean, fast invoicing and time tracking for freelancers — timer, projects, and invoices in one unbroken flow.",
    start_url: "/",
    // "browser" (not "standalone") so Chrome/Edge don't treat Freeby as an
    // installable PWA and pop the "Install app" prompt. The manifest still
    // provides theme color, icons, and metadata.
    display: "browser",
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
