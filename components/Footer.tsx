"use client";

import Link from "next/link";
import Logo from "@/components/ui/Logo";
import { useLang } from "@/contexts/LanguageContext";
import { IS_MARKETING_MODE } from "@/lib/launch-mode";

const t = {
  en: {
    studioLinks: [
      { href: "/equipment", label: "The Studio" },
      { href: "/space", label: "Other Services" },
      { href: "/studio", label: "Rates & Memberships" },
      { href: "/booking", label: "Book Now" },
    ],
    infoLinks: [
      { href: "/account", label: "My Bookings" },
      { href: "/faq", label: "Logistics & FAQ" },
      { href: "/terms", label: "Terms & Conditions" },
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
      { href: "/studio", label: "Preise & ABO" },
      { href: "/booking", label: "Jetzt buchen" },
    ],
    infoLinks: [
      { href: "/account", label: "Meine Buchungen" },
      { href: "/faq", label: "Infos & FAQ" },
      { href: "/terms", label: "AGB" },
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
  fr: {
    studioLinks: [
      { href: "/equipment", label: "Le Studio" },
      { href: "/space", label: "Autres Services" },
      { href: "/studio", label: "Tarifs & Forfaits" },
      { href: "/booking", label: "Réserver" },
    ],
    infoLinks: [
      { href: "/account", label: "Mes réservations" },
      { href: "/faq", label: "Infos & FAQ" },
      { href: "/terms", label: "Conditions générales" },
      { href: "/contact", label: "Contact" },
    ],
    intro:
      "Un studio professionnel B2B de production photo et vidéo à Zurich. Conçu pour les professionnels exigeant un contrôle créatif total.",
    studioCol: "Le Studio",
    infoCol: "Informations",
    status: "Réservations ouvertes",
    rights: "Tous droits réservés.",
    privacy: "Politique de confidentialité",
    legal: "CGV",
  },
  it: {
    studioLinks: [
      { href: "/equipment", label: "Lo Studio" },
      { href: "/space", label: "Altri Servizi" },
      { href: "/studio", label: "Tariffe & Abbonamenti" },
      { href: "/booking", label: "Prenota" },
    ],
    infoLinks: [
      { href: "/account", label: "Le mie prenotazioni" },
      { href: "/faq", label: "Info & FAQ" },
      { href: "/terms", label: "Termini e Condizioni" },
      { href: "/contact", label: "Contatti" },
    ],
    intro:
      "Un premium studio B2B di produzione foto e video a Zurigo. Progettato per professionisti che esigono pieno controllo creativo.",
    studioCol: "Lo Studio",
    infoCol: "Informazioni",
    status: "Prenotazioni aperte",
    rights: "Tutti i diritti riservati.",
    privacy: "Privacy Policy",
    legal: "CGC",
  },
};

// Filter out booking/account links in marketing mode (those routes are guarded
// by middleware but we don't want broken navigation either).
const COMING_SOON_BY_LANG: Record<string, string> = {
  en: "Coming Soon",
  de: "Bald verfügbar",
  fr: "Bientôt disponible",
  it: "Presto disponibile",
};
function rewriteForMarketing<T extends { href: string; label: string }>(
  links: T[],
  lang: string
): T[] {
  if (!IS_MARKETING_MODE) return links;
  const comingSoon = COMING_SOON_BY_LANG[lang] ?? COMING_SOON_BY_LANG.en;
  return links
    .filter((l) => l.href !== "/account") // private — hide entirely
    .map((l) =>
      l.href === "/booking" ? { ...l, href: "/coming-soon", label: comingSoon } : l
    );
}

export default function Footer() {
  const { lang } = useLang();
  const langKey = lang.toLowerCase() as keyof typeof t;
  const tx = t[langKey];
  const studioLinks = rewriteForMarketing(tx.studioLinks, langKey);
  const infoLinks = rewriteForMarketing(tx.infoLinks, langKey);

  return (
    <footer className="border-t border-accent bg-background">
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-16 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
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

          <div className="flex flex-col gap-4">
            <span className="text-xs uppercase tracking-[0.2em] font-bold text-brand mb-2">
              {tx.studioCol}
            </span>
            {studioLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-foreground/70 hover:text-brand transition-colors duration-300 font-light"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex flex-col gap-4">
            <span className="text-xs uppercase tracking-[0.2em] font-bold text-brand mb-2">
              {tx.infoCol}
            </span>
            {infoLinks.map((link) => (
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

      <div className="border-t border-accent">
        <div className="max-w-7xl mx-auto px-6 md:px-10 py-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-light text-foreground/50">
          <span>&copy; {new Date().getFullYear()} CEE Studio. {tx.rights}</span>
          <div className="flex gap-4 items-center flex-wrap justify-center">
            <Link href="/privacy" className="hover:text-brand transition-colors">{tx.privacy}</Link>
            <span>|</span>
            <Link href="/terms" className="hover:text-brand transition-colors">{tx.legal}</Link>
            <span>|</span>
            <Link href="/impressum" className="hover:text-brand transition-colors">Impressum</Link>
          </div>
          <span className="text-foreground/70">
            Powered by <a href="https://amox.gr" target="_blank" rel="noopener noreferrer" className="font-medium text-brand hover:underline transition-all">AMOX</a>
          </span>
        </div>
      </div>
    </footer>
  );
}
