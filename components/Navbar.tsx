"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Button from "@/components/ui/Button";
import Logo from "@/components/ui/Logo";
import { useLang, type Lang } from "@/contexts/LanguageContext";

const navLinksByLang = {
  en: [
    { href: "/equipment", label: "The Studio" },
    { href: "/space", label: "Other Services" },
    { href: "/studio", label: "Plans" },
    { href: "/contact", label: "Contact" },
    { href: "/faq", label: "FAQs" },
  ],
  de: [
    { href: "/equipment", label: "Das Studio" },
    { href: "/space", label: "Weitere Dienstleistungen" },
    { href: "/studio", label: "ABO" },
    { href: "/contact", label: "Kontakt" },
    { href: "/faq", label: "FAQs" },
  ],
  fr: [
    { href: "/equipment", label: "Le Studio" },
    { href: "/space", label: "Autres Services" },
    { href: "/studio", label: "Forfaits" },
    { href: "/contact", label: "Contact" },
    { href: "/faq", label: "FAQ" },
  ],
  it: [
    { href: "/equipment", label: "Lo Studio" },
    { href: "/space", label: "Altri Servizi" },
    { href: "/studio", label: "Abbonamenti" },
    { href: "/contact", label: "Contatti" },
    { href: "/faq", label: "FAQ" },
  ],
};

const ctaByLang = { en: "Book Now", de: "Jetzt buchen", fr: "Réserver", it: "Prenota" };

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const languages: Lang[] = ["EN", "DE", "FR", "IT"];
  const { lang: activeLang, setLang: setActiveLang } = useLang();
  const [desktopLangOpen, setDesktopLangOpen] = useState(false);
  const [mobileLangOpen, setMobileLangOpen] = useState(false);
  const langKey = activeLang.toLowerCase() as "en" | "de" | "fr" | "it";
  const navLinks = navLinksByLang[langKey];
  const ctaLabel = ctaByLang[langKey];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 80);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [mobileOpen]);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled 
            ? "bg-[#FDFAF4]/95 backdrop-blur-lg shadow-[0_2px_15px_rgba(0,0,0,0.05)] border-b border-brand/5" 
            : "bg-[#FDFAF4]/80 backdrop-blur-md border-b border-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-10 flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/">
            <Logo />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-[11px] md:text-xs uppercase tracking-[0.15em] font-sans text-foreground/80 hover:text-brand transition-colors duration-300 font-medium"
              >
                {link.label}
              </Link>
            ))}

            {/* Instagram Icon */}
            <a
              href="https://www.instagram.com/ceestudio.ch/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground/80 hover:text-brand transition-colors duration-300"
              aria-label="Instagram"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
            </a>

            {/* Desktop Language Switcher */}
            <div className="relative ml-2 mr-2">
              <button 
                onClick={() => setDesktopLangOpen(!desktopLangOpen)}
                className="flex items-center gap-1 text-[10px] md:text-[11px] font-sans text-brand font-medium tracking-widest uppercase hover:text-brand/80 transition-colors"
                aria-label="Toggle language menu"
              >
                {activeLang}
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform duration-300 ${desktopLangOpen ? 'rotate-180' : ''}`}>
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
              
              <AnimatePresence>
                {desktopLangOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setDesktopLangOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 6 }}
                      transition={{ duration: 0.18 }}
                      className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-16 bg-background/95 backdrop-blur-md border border-accent/30 shadow-xl rounded-md overflow-hidden z-50"
                    >
                      {languages.map(lang => (
                        <button
                          key={lang}
                          onClick={() => { setActiveLang(lang); setDesktopLangOpen(false); }}
                          className={`block w-full text-[10px] md:text-[11px] font-sans tracking-widest uppercase py-2 text-center transition-colors ${
                            activeLang === lang ? 'text-brand font-medium bg-brand/5' : 'text-foreground/70 hover:text-brand hover:bg-brand/5'
                          }`}
                        >
                          {lang}
                        </button>
                      ))}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Booking CTA */}
            <div className="flex items-center ml-2">
              <Button href="/booking" variant="filled" className="px-5 py-2 text-[10px] md:text-xs shadow-[0_5px_15px_rgba(102,20,20,0.2)] hover:shadow-[0_8px_25px_rgba(102,20,20,0.3)]">
                {ctaLabel}
              </Button>
            </div>
          </div>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden flex flex-col gap-1.5 z-50"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            <motion.span
              className="block w-6 h-[1.5px] bg-brand origin-center"
              animate={mobileOpen ? { rotate: 45, y: 4.5 } : { rotate: 0, y: 0 }}
              transition={{ duration: 0.3 }}
            />
            <motion.span
              className="block w-6 h-[1.5px] bg-brand"
              animate={mobileOpen ? { opacity: 0 } : { opacity: 1 }}
              transition={{ duration: 0.2 }}
            />
            <motion.span
              className="block w-6 h-[1.5px] bg-brand origin-center"
              animate={mobileOpen ? { rotate: -45, y: -4.5 } : { rotate: 0, y: 0 }}
              transition={{ duration: 0.3 }}
            />
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed inset-0 z-40 bg-background flex flex-col items-center justify-center gap-8 px-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <div className="flex flex-col items-center gap-6 mt-12">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ delay: i * 0.1, duration: 0.4, ease: "easeOut" }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="font-seasons text-4xl sm:text-5xl text-brand"
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Mobile Footer Elements */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ delay: navLinks.length * 0.05 + 0.2, duration: 0.4 }}
              className="flex flex-col items-center gap-10 mt-12 w-full max-w-sm"
            >
              {/* Mobile Booking CTA */}
              <Button href="/booking" variant="filled" className="w-full text-center py-4 text-xs tracking-widest shadow-lg">
                {ctaLabel}
              </Button>

              {/* Mobile Language Switcher & IG */}
              <div className="flex items-center justify-between w-full border-t border-accent pt-8 relative z-50">
                <div className="relative">
                  <button 
                    onClick={() => setMobileLangOpen(!mobileLangOpen)}
                    className="flex items-center gap-1.5 text-sm font-sans text-brand font-medium tracking-widest uppercase"
                    aria-label="Toggle language menu"
                  >
                    {activeLang}
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform duration-300 ${mobileLangOpen ? 'rotate-180' : ''}`}>
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </button>

                  <AnimatePresence>
                    {mobileLangOpen && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setMobileLangOpen(false)} />
                        <motion.div
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 6 }}
                          transition={{ duration: 0.18 }}
                          className="absolute bottom-full left-0 mb-3 w-20 bg-background border border-accent/30 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-md overflow-hidden z-50"
                        >
                          {languages.map(lang => (
                            <button
                              key={lang}
                              onClick={() => { setActiveLang(lang); setMobileLangOpen(false); }}
                              className={`block w-full text-[12px] font-sans tracking-widest uppercase py-2.5 text-center transition-colors ${
                                activeLang === lang ? 'text-brand font-medium bg-brand/5' : 'text-foreground/70 hover:text-brand hover:bg-brand/5'
                              }`}
                            >
                              {lang}
                            </button>
                          ))}
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
                
                <a
                  href="https://www.instagram.com/ceestudio.ch/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground/80 hover:text-brand transition-colors duration-300"
                  aria-label="Instagram"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                  </svg>
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
