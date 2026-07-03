import Link from "next/link";
import { ReceiptText } from "lucide-react";
import { brandHost } from "@/lib/brand";

/**
 * Site footer for public marketing pages (landing + pricing).
 *
 * Reflects the maker (Mohamed Gado, mohamedgado.com) for personal-brand SEO,
 * and carries a Person JSON-LD block so search engines link the product to its
 * author.
 */

const productLinks = [
  { label: "Features", href: "/#features" },
  { label: "Pricing", href: "/pricing" },
  { label: "Get started", href: "/signup" },
  { label: "Log in", href: "/login" },
];

const resourceLinks = [
  { label: "Documentation", href: "https://github.com/Vette1123/Freeby" },
  { label: "Source code", href: "https://github.com/Vette1123/Freeby" },
  { label: "Report a bug", href: "https://github.com/Vette1123/Freeby/issues/new" },
  { label: "Discussions", href: "https://github.com/Vette1123/Freeby/discussions" },
];

// The maker's personal site — external, so we keep crawl budget tidy with
// rel="noopener" and let link equity flow (do-follow: this is a real endorsement).
const MAKER_SITE = "https://mohamedgado.com";
const MAKER_HANDLE = "Mohamed Gado";

export function SiteFooter() {
  const year = new Date().getFullYear();

  // JSON-LD: links the product to its author for richer personal search results.
  const personLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: MAKER_HANDLE,
    url: MAKER_SITE,
    jobTitle: "Software Engineer",
    knowsAbout: [
      "Web Development",
      "SaaS",
      "Next.js",
      "Product Engineering",
    ],
    creatorOf: {
      "@type": "SoftwareApplication",
      name: "Freeby",
      url: `https://${brandHost()}`,
    },
  };

  return (
    <footer className="border-t border-border/40 bg-muted/20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personLd) }}
      />
      <div className="mx-auto w-full max-w-6xl px-6 py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand + tagline */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 font-heading text-base font-semibold">
              <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <ReceiptText className="size-4" />
              </span>
              Freeby
            </div>
            <p className="mt-3 max-w-sm text-sm text-muted-foreground">
              Invoicing &amp; time tracking for freelancers. Track time, send
              professional invoices, and get paid — in one unbroken flow.
            </p>
            <p className="mt-4 text-xs text-muted-foreground">
              Built by{" "}
              <a
                href={MAKER_SITE}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-foreground underline-offset-4 hover:underline"
              >
                {MAKER_HANDLE}
              </a>
            </p>
          </div>

          {/* Product */}
          <nav aria-label="Product">
            <h2 className="font-heading text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Product
            </h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              {productLinks.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Resources */}
          <nav aria-label="Resources">
            <h2 className="font-heading text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Resources
            </h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              {resourceLinks.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border/40 pt-6 text-xs text-muted-foreground sm:flex-row">
          <p>© {year} Freeby. Invoicing without the bloat.</p>
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline">
              Made with care by{" "}
              <a
                href={MAKER_SITE}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-foreground underline-offset-4 hover:underline"
              >
                mohamedgado.com
              </a>
            </span>
            <Link
              href="/"
              className="transition-colors hover:text-foreground"
            >
              {brandHost()}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
