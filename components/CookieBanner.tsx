"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useLang } from "@/contexts/LanguageContext";

const STORAGE_KEY = "cee-cookie-consent";

type Lang = "de" | "en" | "fr" | "it";

const t: Record<Lang, {
  title: string;
  body: string;
  accept: string;
  reject: string;
  privacy: string;
}> = {
  de: {
    title: "Cookies & Datenschutz",
    body: "Wir nutzen ausschliesslich notwendige Cookies sowie anonyme Analyse-Cookies, um die Website zu verbessern. Es werden keine Daten an Dritte verkauft.",
    accept: "Akzeptieren",
    reject: "Nur notwendige",
    privacy: "Datenschutz",
  },
  en: {
    title: "Cookies & Privacy",
    body: "We use only essential cookies and anonymous analytics to improve the site. No data is sold to third parties.",
    accept: "Accept all",
    reject: "Essential only",
    privacy: "Privacy",
  },
  fr: {
    title: "Cookies & Confidentialité",
    body: "Nous utilisons uniquement des cookies essentiels et des analyses anonymes pour améliorer le site. Aucune donnée n'est vendue à des tiers.",
    accept: "Accepter",
    reject: "Essentiels uniquement",
    privacy: "Confidentialité",
  },
  it: {
    title: "Cookie & Privacy",
    body: "Utilizziamo solo cookie essenziali e analisi anonime per migliorare il sito. Nessun dato viene venduto a terzi.",
    accept: "Accetta",
    reject: "Solo essenziali",
    privacy: "Privacy",
  },
};

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const { lang } = useLang();
  const l = lang.toLowerCase() as Lang;
  const tx = t[l] ?? t.de;

  useEffect(() => {
    // Show only if user hasn't made a choice yet
    if (typeof window === "undefined") return;
    const consent = window.localStorage.getItem(STORAGE_KEY);
    if (!consent) {
      // Slight delay so it doesn't appear instantly on first paint
      const timer = setTimeout(() => setVisible(true), 600);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleChoice = (choice: "accepted" | "rejected") => {
    window.localStorage.setItem(STORAGE_KEY, choice);
    window.localStorage.setItem(`${STORAGE_KEY}-at`, new Date().toISOString());
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="fixed bottom-4 left-4 right-4 md:bottom-6 md:left-auto md:right-6 md:max-w-md z-[60]"
          role="dialog"
          aria-labelledby="cookie-banner-title"
          aria-describedby="cookie-banner-body"
        >
          <div className="bg-background border border-accent shadow-2xl p-6 md:p-7">
            <p className="text-[10px] uppercase tracking-widest text-foreground/50 mb-2">
              CEE Studio
            </p>
            <h2
              id="cookie-banner-title"
              className="font-seasons text-2xl text-brand mb-3"
            >
              {tx.title}
            </h2>
            <p
              id="cookie-banner-body"
              className="text-sm text-foreground/70 leading-relaxed mb-5"
            >
              {tx.body}{" "}
              <Link
                href="/privacy"
                className="text-brand underline hover:opacity-70 transition"
              >
                {tx.privacy} →
              </Link>
            </p>

            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => handleChoice("rejected")}
                className="flex-1 px-4 py-2.5 text-xs uppercase tracking-widest border border-accent text-foreground/70 hover:text-brand hover:border-brand transition-colors"
              >
                {tx.reject}
              </button>
              <button
                onClick={() => handleChoice("accepted")}
                className="flex-1 px-4 py-2.5 text-xs uppercase tracking-widest bg-brand text-background hover:opacity-90 transition-opacity"
              >
                {tx.accept}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
