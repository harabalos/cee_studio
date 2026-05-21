import type { Metadata, Viewport } from "next";
import { DM_Sans, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LoadingScreen from "@/components/LoadingScreen";
import Providers from "@/components/Providers";
import { Analytics } from "@vercel/analytics/next";

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

const SITE_URL = "https://ceestudio.ch";
const SITE_NAME = "CEE Studio";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    template: "%s | CEE Studio Zürich",
    default: "CEE Studio | Fotostudio in Zürich (Glattpark) — Photo & Content Studio",
  },
  description:
    "CEE Studio – modernes Fotostudio in Zürich (Glattpark, Opfikon). 60 m² Tageslichtstudio mit Cyc Wall, Godox Beleuchtung, Make-up Bereich und Lounge. Self-Service Vermietung ab CHF 70/h oder ABO Membership. Jetzt buchen.",
  keywords: [
    // German — primary Zurich market
    "Fotostudio Zürich",
    "Fotostudio Glattpark",
    "Fotostudio Opfikon",
    "Fotostudio mieten Zürich",
    "Studio mieten Zürich",
    "Mietstudio Zürich",
    "Tageslichtstudio Zürich",
    "Content Studio Zürich",
    "Cyc Wall Zürich",
    "Self-Service Fotostudio Zürich",
    "Studio Glattpark",
    "Photoshooting Zürich",
    "Studio in der Nähe Zürich",
    "Fotostudio Flughafen Zürich",
    "ABO Fotostudio Zürich",
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
    title: "CEE Studio | Fotostudio in Zürich (Glattpark)",
    description:
      "Modernes 60 m² Fotostudio mit Tageslicht, Cyc Wall, Make-up Bereich und Profi-Equipment in Glattpark, Opfikon. Self-Service ab CHF 70/h.",
    locale: "de_CH",
    alternateLocale: ["en_US", "fr_CH", "it_CH"],
    // images: auto-generated from app/opengraph-image.tsx
  },
  twitter: {
    card: "summary_large_image",
    title: "CEE Studio | Fotostudio Zürich",
    description:
      "Modernes Fotostudio in Glattpark (Opfikon), Zürich. 60 m², Cyc Wall, Tageslicht. Ab CHF 70/h.",
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
        "Modernes Fotostudio in Zürich (Glattpark, Opfikon). 60 m² Tageslichtstudio mit Cyc Wall, Godox Beleuchtung und Make-up Bereich. Self-Service Vermietung und ABO Memberships für Content Creators, Fotografen und Marken.",
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
        name: "Studio Vermietung",
        itemListElement: [
          {
            "@type": "Offer",
            name: "Studio Miete – 1 Stunde",
            price: "70",
            priceCurrency: "CHF",
            availability: "https://schema.org/InStock",
            itemOffered: {
              "@type": "Service",
              name: "Photography Studio Rental",
              serviceType: "Self-Service Studio Rental",
            },
          },
          {
            "@type": "Offer",
            name: "Studio Miete – 4 Stunden (Halbtag)",
            price: "250",
            priceCurrency: "CHF",
            availability: "https://schema.org/InStock",
          },
          {
            "@type": "Offer",
            name: "Studio Miete – Ganztag",
            price: "490",
            priceCurrency: "CHF",
            availability: "https://schema.org/InStock",
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
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
