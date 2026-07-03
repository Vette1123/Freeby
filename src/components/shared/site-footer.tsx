import Link from "next/link";
import { brandHost } from "@/lib/brand";
import { GithubIcon, LinkedinIcon, XIcon } from "@/components/icons/brand-icons";
import { BrandWordmark } from "@/components/brand/brand-mark";

/**
 * Site footer for public marketing pages (landing + pricing).
 *
 * Reflects the maker (Mohamed Gado, mohamedgado.com) for personal-brand SEO,
 * and carries a Person JSON-LD block with `sameAs` so search engines can
 * corroborate the author's identity across the web — the strongest
 * E-E-A-T (Experience, Expertise, Authoritativeness, Trust) signal for a
 * person-linked product.
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

// Maker identity — these URLs are also mirrored in the Person schema `sameAs`.
const MAKER = {
  name: "Mohamed Gado",
  site: "https://mohamedgado.com",
  linkedin: "https://www.linkedin.com/in/mgado/",
  github: "https://github.com/Vette1123",
  x: "https://x.com/Sadge1996",
};

const socials = [
  { label: "GitHub", href: MAKER.github, Icon: GithubIcon },
  { label: "LinkedIn", href: MAKER.linkedin, Icon: LinkedinIcon },
  { label: "X", href: MAKER.x, Icon: XIcon },
];

export function SiteFooter() {
  const year = new Date().getFullYear();

  // Person JSON-LD — links the product to its author and corroborates identity
  // across the web via `sameAs`. This is what Google uses to connect your
  // website, GitHub, LinkedIn, and X as the same person (E-E-A-T signal).
  const personLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: MAKER.name,
    url: MAKER.site,
    jobTitle: "Software Engineer",
    knowsAbout: [
      "Web Development",
      "SaaS",
      "Next.js",
      "Product Engineering",
    ],
    // `sameAs` is THE key field — Google cross-checks these to verify you are
    // who you say you are. Every profile should link back to mohamedgado.com
    // (or share a consistent identity) for maximum corroboration.
    sameAs: [MAKER.site, MAKER.github, MAKER.linkedin, MAKER.x],
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
          {/* Brand + tagline + maker */}
          <div className="lg:col-span-2">
            <BrandWordmark size={28} />
            <p className="mt-3 max-w-sm text-sm text-muted-foreground">
              Invoicing &amp; time tracking for freelancers. Track time, send
              professional invoices, and get paid — in one unbroken flow.
            </p>
            <p className="mt-4 text-xs text-muted-foreground">
              Built by{" "}
              <a
                href={MAKER.site}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-foreground underline-offset-4 hover:underline"
              >
                {MAKER.name}
              </a>
            </p>

            {/* Social identity links — rel="me" tells platforms these are YOUR
                profiles (used by Mastodon/IndieWeb verification, and reinforces
                the sameAs graph for search engines). */}
            <div className="mt-3 flex items-center gap-1">
              {socials.map(({ label, href, Icon }) => (
                <a
                  key={href}
                  href={href}
                  target="_blank"
                  rel="me noopener noreferrer"
                  aria-label={`${MAKER.name} on ${label}`}
                  title={`${MAKER.name} on ${label}`}
                  className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <Icon className="size-4" />
                </a>
              ))}
            </div>
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
                href={MAKER.site}
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
