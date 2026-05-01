"use client";

import Link from "next/link";
import Logo from "@/components/ui/Logo";
import { useLang } from "@/contexts/LanguageContext";

const t = {
  en: {
    studioLinks: [
      { href: "/equipment", label: "The Studio" },
      { href: "/space", label: "Other Services" },
      { href: "/studio", label: "Rates & Memberships" },
      { href: "/booking", label: "Book Now" },
    ],
    infoLinks: [
      { href: "/about", label: "About Us" },
      { href: "/faq", label: "Logistics & FAQ" },
      { href: "/rules", label: "Studio Rules / AGB" },
      { href: "/contact", label: "Contact Support" },
    ],
    intro:
      "A premium B2B photo and video production studio in Zurich. Engineered for professionals who demand total creative control.",
    studioCol: "The Studio",
    infoCol: "Information",
    status: "Currently accepting bookings",
    rights: "All rights reserved.",
    privacy: "Privacy Policy",
    legal: "AGB",
  },
  de: {
    studioLinks: [
      { href: "/equipment", label: "Das Studio" },
      { href: "/space", label: "Weitere Services" },
      { href: "/studio", label: "Preise & Memberships" },
      { href: "/booking", label: "Jetzt buchen" },
    ],
    infoLinks: [
      { href: "/about", label: "Über uns" },
      { href: "/faq", label: "Infos & FAQ" },
      { href: "/rules", label: "Studio Regeln / AGB" },
      { href: "/contact", label: "Kontakt" },
    ],
    intro:
      "Ein professionelles B2B Foto- und Videoproduktionsstudio in Zürich. Konzipiert für Profis, die volle kreative Kontrolle erwarten.",
    studioCol: "Das Studio",
    infoCol: "Informationen",
    status: "Aktuell buchbar",
    rights: "Alle Rechte vorbehalten.",
    privacy: "Datenschutz",
    legal: "AGB",
  },
};

export default function Footer() {
  const { lang } = useLang();
  const tx = lang === "DE" ? t.de : t.en;

  return (
    <footer className="border-t border-accent bg-background">
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-16 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
          {/* Column 1: Brand & Contact Details */}
          <div className="md:col-span-2">
            <Link href="/" className="inline-block">
              <Logo textClassName="text-3xl md:text-4xl" />
            </Link>
            <p className="mt-5 text-sm md:text-base text-foreground/70 max-w-sm leading-relaxed font-light">
              {tx.intro}
            </p>

            <div className="mt-8 space-y-2 text-sm text-foreground/80 font-light">
              <p>Thurgauerstrasse 117, 8152 Glattpark</p>
              <p>info@ceestudio.ch</p>
              <p>+41762402056</p>
            </div>

            <div className="flex items-center gap-3 mt-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand" />
              </span>
              <span className="text-xs font-sans text-foreground/60 tracking-wider uppercase">
                {tx.status}
              </span>
            </div>
          </div>

          {/* Column 2: Studio Navigation */}
          <div className="flex flex-col gap-4">
            <span className="text-xs uppercase tracking-[0.2em] font-bold text-brand mb-2">
              {tx.studioCol}
            </span>
            {tx.studioLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-foreground/70 hover:text-brand transition-colors duration-300 font-light"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Column 3: Information & Legal */}
          <div className="flex flex-col gap-4">
            <span className="text-xs uppercase tracking-[0.2em] font-bold text-brand mb-2">
              {tx.infoCol}
            </span>
            {tx.infoLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-foreground/70 hover:text-brand transition-colors duration-300 font-light"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Bar: Copyright & AMOX Link */}
      <div className="border-t border-accent">
        <div className="max-w-7xl mx-auto px-6 md:px-10 py-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-light text-foreground/50">
          <span>&copy; {new Date().getFullYear()} CEE Studio. {tx.rights}</span>
          <div className="flex gap-4 items-center">
            <Link href="/privacy" className="hover:text-brand transition-colors">{tx.privacy}</Link>
            <span>|</span>
            <Link href="/rules" className="hover:text-brand transition-colors">{tx.legal}</Link>
          </div>
          <span className="text-foreground/70">
            Powered by <a href="https://amox.gr" target="_blank" rel="noopener noreferrer" className="font-medium text-brand hover:underline transition-all">AMOX</a>
          </span>
        </div>
      </div>
    </footer>
  );
}
