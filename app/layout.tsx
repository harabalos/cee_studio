import type { Metadata } from "next";
import { DM_Sans, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CustomCursor from "@/components/CustomCursor";
import LoadingScreen from "@/components/LoadingScreen";

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

export const metadata: Metadata = {
  title: {
    template: "%s | CEE Studio Zurich",
    default: "CEE Studio | Premium Photo & Video Rental Space Zurich",
  },
  description:
    "Zurich's premier B2B production studio. Fully equipped professional photo and video rental space featuring a Cyc Wall, Phase 3 power, and high-end aesthetics.",
  keywords: ["photo studio rental Zurich", "video production space", "B2B studio", "Cyc wall Zurich", "Profoto rental Switzerland"],
  openGraph: {
    title: "CEE Studio | Premium Photo & Video Rental Space Zurich",
    description: "Zurich's premier B2B production studio. Fully equipped professional rental space.",
    url: "https://ceestudio.ch",
    siteName: "CEE Studio",
    locale: "en_CH",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CEE Studio | Studio Rental Zurich",
    description: "Premium B2B photo and video production space.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${dmSans.variable} ${seasons.variable}`}>
      <body className="font-sans antialiased">
        <LoadingScreen />
        <CustomCursor />
        <Navbar />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
