import type { Metadata, Viewport } from "next";
import { DM_Sans, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LoadingScreen from "@/components/LoadingScreen";
import Providers from "@/components/Providers";
import CookieBanner from "@/components/CookieBanner";
import { Analytics } from "@vercel/analytics/next";
import Script from "next/script";

const GA_ID = "G-J4H8K2FNDN";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

const seasons = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-seasons",
  display: "swap",
});

const SITE_URL = "https://www.ceestudio.ch";
const SITE_NAME = "CEE Studio";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    template: "%s | CEE Studio — Fotostudio Zürich",
    default: "CEE Studio | Fotostudio Zürich mieten — Photo & Content Studio",
  },
  description:
    "Fotostudio in Zürich: 60 m² Tageslichtstudio mit Cyc Wall, Godox Beleuchtung, Make-up Bereich und Lounge. Self-Service Vermietung ab CHF 70/h oder ABO Membership. 5 Min. von Zürich Oerlikon. Jetzt buchen.",
  keywords: [
    // German — primary Zurich market (lead with the highest-value phrases)
    "Fotostudio Zürich",
    "Fotostudio mieten Zürich",
    "Studio mieten Zürich",
    "Mietstudio Zürich",
    "Tageslichtstudio Zürich",
    "Content Studio Zürich",
    "Cyc Wall Zürich",
    "Self-Service Fotostudio Zürich",
    "Photoshooting Zürich",
    "Lifestyle Fotostudio Zürich",
    "ABO Fotostudio Zürich",
    "Beauty Studio Zürich",
    "Fotostudio Zürich Nord",
    // Secondary geo (kept for proximity search match — not surfaced in copy)
    "Fotostudio Glattpark",
    "Fotostudio Opfikon",
    // English
    "photo studio Zurich",
    "photo studio rental Zurich",
    "content creation studio Zurich",
    "Zurich photography studio",
    "studio rental Switzerland",
    // French
    "studio photo Zurich",
    "location studio Zurich",
    // Italian
    "studio fotografico Zurigo",
    "noleggio studio Zurigo",
  ],
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "Photography Studio",
  applicationName: SITE_NAME,
  alternates: {
    canonical: "/",
    languages: {
      "de-CH": "/",
      de: "/",
      en: "/",
      fr: "/",
      it: "/",
      "x-default": "/",
    },
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: "CEE Studio | Fotostudio Zürich",
    description:
      "Modernes 60 m² Fotostudio in Zürich. Tageslicht, Cyc Wall, Make-up Bereich, Profi-Equipment. Self-Service ab CHF 70/h.",
    locale: "de_CH",
    alternateLocale: ["en_US", "fr_CH", "it_CH"],
    // images: auto-generated from app/opengraph-image.tsx
  },
  twitter: {
    card: "summary_large_image",
    title: "CEE Studio | Fotostudio Zürich",
    description:
      "Modernes Fotostudio in Zürich. 60 m², Cyc Wall, Tageslicht, Make-up Bereich. Ab CHF 70/h.",
    // images: auto-generated from app/twitter-image.tsx
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
  // Icons auto-detected from app/icon.tsx + app/apple-icon.tsx + app/manifest.ts
  manifest: "/manifest.webmanifest",
  // Search engine verification — replace these with real tokens once
  // the owner verifies in Google Search Console + Bing Webmaster Tools.
  // Leaving as commented placeholder so the format is obvious.
  // verification: {
  //   google: "<paste-google-search-console-meta-token>",
  //   other: { "msvalidate.01": "<paste-bing-webmaster-token>" },
  // },
  formatDetection: {
    telephone: true,
    email: true,
    address: true,
  },
  other: {
    "geo.region": "CH-ZH",
    "geo.placename": "Glattpark, Opfikon, Zürich",
    "geo.position": "47.412;8.556",
    ICBM: "47.412, 8.556",
  },
};

export const viewport: Viewport = {
  // Theme color tints mobile browser chrome (Chrome/Safari address bar,
  // Android status bar, taskbar in PWA). Cream matches the page background
  // for light theme; burgundy used in the manifest for the PWA splash.
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FDFAF4" },
    { media: "(prefers-color-scheme: dark)", color: "#661414" },
  ],
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
};

// LocalBusiness schema — critical for Local SEO / Zurich GEO ranking.
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": ["LocalBusiness", "PhotographyBusiness"],
      "@id": `${SITE_URL}/#business`,
      name: SITE_NAME,
      alternateName: ["CEE Studio Zürich", "CEE Studio Glattpark"],
      legalName: "CEE Studio",
      description:
        "Modernes Fotostudio in Zürich. 60 m² Tageslichtstudio mit Cyc Wall, Godox Beleuchtung und Make-up Bereich. Self-Service Vermietung und ABO Memberships für Content Creators, Fotografen und Marken. 5 Min. von Zürich Oerlikon mit Tram 10.",
      url: SITE_URL,
      logo: `${SITE_URL}/apple-icon`,
      image: [
        `${SITE_URL}/images/studio-hero.jpg`,
        `${SITE_URL}/images/cyc-wall.jpg`,
        `${SITE_URL}/images/lounge.jpg`,
        `${SITE_URL}/images/makeup-area.jpg`,
      ],
      telephone: "+41762402056",
      email: "info@ceestudio.ch",
      priceRange: "CHF 70 – CHF 490",
      currenciesAccepted: "CHF",
      paymentAccepted: ["Cash", "Credit Card", "TWINT", "Bank Transfer", "Invoice"],
      address: {
        "@type": "PostalAddress",
        streetAddress: "Thurgauerstrasse 117",
        addressLocality: "Glattpark (Opfikon)",
        addressRegion: "ZH",
        postalCode: "8152",
        addressCountry: "CH",
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: 47.412,
        longitude: 8.556,
      },
      hasMap:
        "https://www.google.com/maps/search/?api=1&query=Thurgauerstrasse+117,+8152+Glattpark",
      openingHoursSpecification: [
        {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
          ],
          opens: "08:00",
          closes: "22:00",
        },
      ],
      areaServed: [
        { "@type": "City", name: "Zürich" },
        { "@type": "City", name: "Opfikon" },
        { "@type": "City", name: "Glattpark" },
        { "@type": "City", name: "Wallisellen" },
        { "@type": "City", name: "Kloten" },
        { "@type": "City", name: "Dübendorf" },
        { "@type": "City", name: "Winterthur" },
        { "@type": "AdministrativeArea", name: "Kanton Zürich" },
        { "@type": "Country", name: "Switzerland" },
      ],
      serviceArea: {
        "@type": "GeoCircle",
        geoMidpoint: {
          "@type": "GeoCoordinates",
          latitude: 47.412,
          longitude: 8.556,
        },
        geoRadius: 50000,
      },
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Studio Vermietung & ABO",
        itemListElement: [
          {
            "@type": "Offer",
            "@id": `${SITE_URL}/#offer-1h`,
            name: "Fotostudio Zürich — 1 Stunde",
            description: "1 Stunde Self-Service Studio-Miete in Zürich inkl. Equipment, Cyc Wall, Tageslicht, Make-up Bereich.",
            price: "70",
            priceCurrency: "CHF",
            availability: "https://schema.org/InStock",
            url: `${SITE_URL}/booking`,
            itemOffered: {
              "@type": "Service",
              name: "Self-Service Studio Rental",
              serviceType: "Photography Studio Rental",
              areaServed: { "@type": "City", name: "Zürich" },
              provider: { "@id": `${SITE_URL}/#business` },
            },
            priceSpecification: {
              "@type": "UnitPriceSpecification",
              price: "70",
              priceCurrency: "CHF",
              unitText: "HUR",
              referenceQuantity: { "@type": "QuantitativeValue", value: 1, unitCode: "HUR" },
            },
          },
          {
            "@type": "Offer",
            "@id": `${SITE_URL}/#offer-2h`,
            name: "Fotostudio Zürich — 2 Stunden",
            price: "120",
            priceCurrency: "CHF",
            availability: "https://schema.org/InStock",
            url: `${SITE_URL}/booking`,
          },
          {
            "@type": "Offer",
            "@id": `${SITE_URL}/#offer-3h`,
            name: "Fotostudio Zürich — 3 Stunden",
            price: "180",
            priceCurrency: "CHF",
            availability: "https://schema.org/InStock",
            url: `${SITE_URL}/booking`,
          },
          {
            "@type": "Offer",
            "@id": `${SITE_URL}/#offer-4h`,
            name: "Fotostudio Zürich — 4 Stunden (Halbtag)",
            price: "250",
            priceCurrency: "CHF",
            availability: "https://schema.org/InStock",
            url: `${SITE_URL}/booking`,
          },
          {
            "@type": "Offer",
            "@id": `${SITE_URL}/#offer-8h`,
            name: "Fotostudio Zürich — 8 Stunden (Ganztag)",
            price: "490",
            priceCurrency: "CHF",
            availability: "https://schema.org/InStock",
            url: `${SITE_URL}/booking`,
          },
          {
            "@type": "Offer",
            "@id": `${SITE_URL}/#membership-starter`,
            name: "Starter Creator — ABO Membership",
            description: "Monatliches ABO mit 4 Stunden Studio-Zeit pro Monat. Mindestlaufzeit 3 Monate.",
            price: "220",
            priceCurrency: "CHF",
            availability: "https://schema.org/InStock",
            url: `${SITE_URL}/membership/signup?plan=starter`,
            itemOffered: {
              "@type": "Service",
              name: "Studio Membership — Starter",
              serviceType: "Recurring Studio Subscription",
              provider: { "@id": `${SITE_URL}/#business` },
            },
            priceSpecification: {
              "@type": "UnitPriceSpecification",
              price: "220",
              priceCurrency: "CHF",
              unitText: "MON",
              billingDuration: "P1M",
            },
            eligibleDuration: { "@type": "QuantitativeValue", minValue: 3, unitCode: "MON" },
          },
          {
            "@type": "Offer",
            "@id": `${SITE_URL}/#membership-pro`,
            name: "Pro Creator — ABO Membership",
            description: "Monatliches ABO mit 9 Stunden Studio-Zeit, Prioritätsbuchung und Profi-Equipment. Mindestlaufzeit 3 Monate.",
            price: "420",
            priceCurrency: "CHF",
            availability: "https://schema.org/InStock",
            url: `${SITE_URL}/membership/signup?plan=pro`,
            itemOffered: {
              "@type": "Service",
              name: "Studio Membership — Pro",
              serviceType: "Recurring Studio Subscription",
              provider: { "@id": `${SITE_URL}/#business` },
            },
            priceSpecification: {
              "@type": "UnitPriceSpecification",
              price: "420",
              priceCurrency: "CHF",
              unitText: "MON",
              billingDuration: "P1M",
            },
            eligibleDuration: { "@type": "QuantitativeValue", minValue: 3, unitCode: "MON" },
          },
          {
            "@type": "Offer",
            "@id": `${SITE_URL}/#membership-unlimited`,
            name: "Studio Unlimited — ABO Membership",
            description: "Monatliches ABO mit 16 Stunden Studio-Zeit für Agenturen und Marken. Mindestlaufzeit 3 Monate.",
            price: "780",
            priceCurrency: "CHF",
            availability: "https://schema.org/InStock",
            url: `${SITE_URL}/membership/signup?plan=unlimited`,
            itemOffered: {
              "@type": "Service",
              name: "Studio Membership — Unlimited",
              serviceType: "Recurring Studio Subscription",
              provider: { "@id": `${SITE_URL}/#business` },
            },
            priceSpecification: {
              "@type": "UnitPriceSpecification",
              price: "780",
              priceCurrency: "CHF",
              unitText: "MON",
              billingDuration: "P1M",
            },
            eligibleDuration: { "@type": "QuantitativeValue", minValue: 3, unitCode: "MON" },
          },
        ],
      },
      knowsLanguage: ["de", "en", "fr", "it"],
      sameAs: ["https://www.instagram.com/ceestudio.ch/"],
      makesOffer: [
        { "@type": "Offer", name: "Self-Service Studio Rental" },
        { "@type": "Offer", name: "ABO Membership" },
        { "@type": "Offer", name: "Content Creation & BTS" },
        { "@type": "Offer", name: "Brand & Product Photography" },
      ],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      publisher: { "@id": `${SITE_URL}/#business` },
      inLanguage: ["de-CH", "en", "fr", "it"],
      potentialAction: {
        "@type": "SearchAction",
        target: `${SITE_URL}/?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
    // HowTo schema — primes generative engines (ChatGPT, Perplexity, Google
    // AI Overviews) to answer "how do I book a photo studio in Zurich?" with
    // an explicit reference to CEE Studio. AEO/GEO entity.
    {
      "@type": "HowTo",
      "@id": `${SITE_URL}/#howto-book`,
      name: "How to book a photo studio in Zurich at CEE Studio",
      description:
        "Step-by-step guide to renting CEE Studio in Zurich online. Self-service booking with instant confirmation, no phone calls required.",
      totalTime: "PT3M",
      estimatedCost: { "@type": "MonetaryAmount", currency: "CHF", value: "70" },
      supply: [],
      tool: [],
      step: [
        {
          "@type": "HowToStep",
          position: 1,
          name: "Choose date and duration",
          text: "Visit https://www.ceestudio.ch/booking and pick a duration between 1 and 8 hours. The calendar shows real-time availability.",
          url: `${SITE_URL}/booking`,
        },
        {
          "@type": "HowToStep",
          position: 2,
          name: "Select optional add-ons",
          text: "Choose extra lighting, additional paper backdrops, or a late-night surcharge if needed. Nothing is mandatory.",
        },
        {
          "@type": "HowToStep",
          position: 3,
          name: "Pay online",
          text: "Pay by credit card or TWINT. B2B customers can request invoice payment. Booking is confirmed instantly.",
        },
        {
          "@type": "HowToStep",
          position: 4,
          name: "Receive confirmation",
          text: "An email arrives immediately with the door access code, WiFi password, usage agreement PDF, and invoice PDF.",
        },
      ],
    },
    // Organization schema (separate from LocalBusiness) — entity disambiguation
    // for AI engines that resolve brand names to canonical entities.
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: SITE_NAME,
      alternateName: ["CEE Studio Zürich", "CEE Photo Studio"],
      url: SITE_URL,
      logo: `${SITE_URL}/apple-icon`,
      contactPoint: {
        "@type": "ContactPoint",
        telephone: "+41762402056",
        contactType: "customer service",
        email: "info@ceestudio.ch",
        availableLanguage: ["de", "en", "fr", "it"],
        areaServed: "CH",
      },
      sameAs: ["https://www.instagram.com/ceestudio.ch/"],
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de" className={`${dmSans.variable} ${seasons.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="font-sans antialiased">
        <Providers>
          <LoadingScreen />
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <Footer />
          <CookieBanner />
        </Providers>
        <Analytics />

        {/* Google Analytics 4 (gtag.js) — loaded after the page is interactive */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
          strategy="afterInteractive"
        />
        <Script id="ga4-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_ID}');
          `}
        </Script>
      </body>
    </html>
  );
}
