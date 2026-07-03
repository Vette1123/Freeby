import type { MetadataRoute } from "next";
import { env } from "@/env";

export default function robots(): MetadataRoute.Robots {
  const base = env.NEXT_PUBLIC_APP_URL;

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Keep authenticated areas and API routes out of search indexes.
      disallow: ["/dashboard", "/clients", "/projects", "/timer", "/invoices", "/settings", "/billing", "/api/", "/reset-password", "/verify-email"],
    },
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
