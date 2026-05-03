"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type Lang = "EN" | "DE" | "FR" | "IT";

type LanguageContextType = {
  lang: Lang;
  setLang: (l: Lang) => void;
};

const STORAGE_KEY = "cee-lang";
const DEFAULT_LANG: Lang = "DE";

const LanguageContext = createContext<LanguageContextType>({
  lang: DEFAULT_LANG,
  setLang: () => {},
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(DEFAULT_LANG);

  // Hydrate from localStorage on mount (preserve user choice across visits).
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY) as Lang | null;
      if (saved && (["EN", "DE", "FR", "IT"] as Lang[]).includes(saved)) {
        setLangState(saved);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    try {
      window.localStorage.setItem(STORAGE_KEY, l);
    } catch {
      /* ignore */
    }
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLang = () => useContext(LanguageContext);
