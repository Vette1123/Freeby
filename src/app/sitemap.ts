import type { MetadataRoute } from "next";
import { env } from "@/env";

// Public, indexable routes only — authenticated pages are excluded (see robots.ts).
const routes: { path: string; priority: number }[] = [
  { path: "/", priority: 1 },
  { path: "/pricing", priority: 0.9 },
  { path: "/login", priority: 0.8 },
  { path: "/signup", priority: 0.8 },
  { path: "/forgot-password", priority: 0.4 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = env.NEXT_PUBLIC_APP_URL;
  const lastModified = new Date();

  return routes.map(({ path, priority }) => ({
    url: `${base}${path}`,
    lastModified,
    changeFrequency: "monthly",
    priority,
  }));
}
