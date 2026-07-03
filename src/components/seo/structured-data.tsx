import { env } from "@/env";
import { BRAND } from "@/lib/brand";

/**
 * JSON-LD structured data for the landing page, so search engines and social
 * platforms understand Freeby as a software product.
 *
 * We emit two schemas:
 *  - SoftwareApplication: the product itself (category, pricing, offers)
 *  - Organization:        the company behind it
 *
 * Rendered server-side as a <script type="application/ld+json"> tag.
 */
export function StructuredData() {
  const base = env.NEXT_PUBLIC_APP_URL;

  const softwareApplication = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: BRAND.name,
    applicationCategory: "BusinessApplication",
    applicationSubCategory: "Invoicing & Time Tracking",
    operatingSystem: "Web",
    description:
      "Clean, fast invoicing and time tracking for freelancers. Track time, send professional invoices, and get paid — in one unbroken flow.",
    url: base,
    offers: [
      {
        "@type": "Offer",
        name: "Free",
        price: "0",
        priceCurrency: "USD",
        description: "1 client, 3 invoices per month, time tracking.",
      },
      {
        "@type": "Offer",
        name: "Pro — Monthly",
        price: "19",
        priceCurrency: "USD",
        description: "Unlimited clients, invoices, and email delivery.",
      },
      {
        "@type": "Offer",
        name: "Pro — Yearly",
        price: "190",
        priceCurrency: "USD",
        description: "Everything in Pro, billed annually (2 months free).",
      },
    ],
    featureList: [
      "Time tracking with stopwatch",
      "Professional invoicing with PDF",
      "Email invoices to clients",
      "Client management",
      "Project tracking with hourly rates",
      "Dashboard analytics",
      "Global payments via Lemon Squeezy",
    ],
  };

  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: BRAND.name,
    url: base,
    logo: `${base}/icon.svg`,
    description: BRAND.tagline,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplication) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }}
      />
    </>
  );
}
