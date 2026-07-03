import type { Metadata, Viewport } from "next";
import { Poppins, DM_Sans, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { env } from "@/env";

const dmSans = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const poppins = Poppins({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const title = "Freeby — clean, fast invoicing and time tracking for freelancers";
const description =
  "Track time, send professional invoices, and get paid — in one unbroken flow. Built for freelancers. Free to start.";

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_APP_URL),
  title: {
    default: title,
    template: "%s · Freeby",
  },
  description,
  applicationName: "Freeby",
  keywords: [
    "freelance invoicing",
    "time tracking",
    "invoice software",
    "freelancer tools",
    "billing",
    "get paid",
    "invoicing app",
    "time tracker",
    "free invoice generator",
    "invoice maker",
    "freelance billing software",
  ],
  authors: [{ name: "Freeby", url: env.NEXT_PUBLIC_APP_URL }],
  creator: "Freeby",
  publisher: "Freeby",
  category: "business",
  alternates: {
    canonical: "/",
    languages: { "en-US": "/" },
  },
  openGraph: {
    type: "website",
    siteName: "Freeby",
    title,
    description,
    url: "/",
    locale: "en_US",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Freeby — clean, fast invoicing and time tracking for freelancers.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/twitter-image"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  // Search-engine verification tokens — set these in your env (optional).
  // e.g. Google: google-site-verification=your_token
  //      Bing:   other.BingSiteVerification=your_token
  verification: process.env.SEO_GOOGLE_VERIFICATION
    ? { google: process.env.SEO_GOOGLE_VERIFICATION }
    : undefined,
};

export const viewport: Viewport = {
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${dmSans.variable} ${poppins.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider>
            {children}
          </TooltipProvider>
          <Toaster richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
