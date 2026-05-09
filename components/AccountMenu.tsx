"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

type Me = {
  user: {
    id?: string;
    email?: string | null;
    name?: string | null;
  } | null;
  isAdmin?: boolean;
};

const labelByLang = {
  en: { signIn: "Sign in", account: "My account", admin: "Admin", signOut: "Sign out" },
  de: { signIn: "Anmelden", account: "Mein Konto", admin: "Admin", signOut: "Abmelden" },
  fr: { signIn: "Connexion", account: "Mon compte", admin: "Admin", signOut: "Déconnexion" },
  it: { signIn: "Accedi", account: "Il mio account", admin: "Admin", signOut: "Esci" },
} as const;

type Props = {
  lang: "en" | "de" | "fr" | "it";
  variant?: "desktop" | "mobile";
  onNavigate?: () => void;
};

export default function AccountMenu({ lang, variant = "desktop", onNavigate }: Props) {
  const [me, setMe] = useState<Me | null>(null);
  const [open, setOpen] = useState(false);
  const t = labelByLang[lang] ?? labelByLang.en;

  useEffect(() => {
    fetch("/api/me", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { user: null }))
      .then((d) => setMe(d))
      .catch(() => setMe({ user: null }));
  }, []);

  // Loading state — render nothing to avoid flicker
  if (me === null) return null;

  const email = me.user?.email ?? null;

  // ==================== MOBILE VARIANT ====================
  if (variant === "mobile") {
    // Not logged in → big "Sign in" link styled like nav items
    if (!email) {
      return (
        <Link
          href="/login"
          onClick={onNavigate}
          className="font-seasons text-3xl text-brand/80 hover:text-brand transition"
        >
          {t.signIn}
        </Link>
      );
    }

    // Logged in → stacked block with email + actions
    const initial = (me.user?.name?.[0] ?? email[0]).toUpperCase();

    return (
      <div className="flex flex-col items-center gap-4 w-full">
        <div className="flex items-center gap-3">
          <span className="w-12 h-12 rounded-full bg-brand text-background flex items-center justify-center text-base font-semibold">
            {initial}
          </span>
          <div className="text-left">
            <p className="text-[10px] uppercase tracking-widest text-foreground/50">{t.account}</p>
            <p className="text-sm font-medium truncate max-w-[200px]">{email}</p>
          </div>
        </div>
        <div className="flex flex-col items-center gap-3">
          <Link
            href="/account"
            onClick={onNavigate}
            className="text-base uppercase tracking-[0.2em] font-sans text-foreground/80 hover:text-brand transition"
          >
            {t.account}
          </Link>
          {me.isAdmin && (
            <Link
              href="/admin"
              onClick={onNavigate}
              className="text-base uppercase tracking-[0.2em] font-sans text-foreground/80 hover:text-brand transition"
            >
              {t.admin} →
            </Link>
          )}
          <Link
            href="/logout"
            onClick={onNavigate}
            className="text-sm uppercase tracking-[0.2em] font-sans text-foreground/50 hover:text-brand transition"
          >
            {t.signOut}
          </Link>
        </div>
      </div>
    );
  }

  // ==================== DESKTOP VARIANT ====================
  // Not logged in → simple "Sign in" link
  if (!email) {
    return (
      <Link
        href="/login"
        className="text-[11px] md:text-xs uppercase tracking-[0.15em] font-sans text-foreground/80 hover:text-brand transition-colors duration-300 font-medium"
      >
        {t.signIn}
      </Link>
    );
  }

  // Logged in → dropdown
  const initial = (me.user?.name?.[0] ?? email[0]).toUpperCase();
  const display = me.user?.name ?? email.split("@")[0];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 text-[11px] md:text-xs uppercase tracking-[0.15em] font-sans text-foreground/80 hover:text-brand transition-colors duration-300 font-medium"
        aria-label="Account menu"
      >
        <span className="w-7 h-7 rounded-full bg-brand text-background flex items-center justify-center text-[11px] font-semibold normal-case tracking-normal">
          {initial}
        </span>
        <span className="hidden lg:inline max-w-[140px] truncate">{display}</span>
        <svg
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.18 }}
              className="absolute top-full right-0 mt-2 min-w-[220px] bg-background/95 backdrop-blur-md border border-accent/30 shadow-xl rounded-md overflow-hidden z-50"
            >
              <div className="px-4 py-3 border-b border-accent/30">
                <p className="text-[10px] uppercase tracking-widest text-foreground/50">{t.account}</p>
                <p className="text-sm font-medium truncate mt-0.5">{email}</p>
              </div>
              <Link
                href="/account"
                onClick={() => setOpen(false)}
                className="block px-4 py-2.5 text-sm text-foreground/80 hover:text-brand hover:bg-brand/5 transition"
              >
                {t.account}
              </Link>
              {me.isAdmin && (
                <Link
                  href="/admin"
                  onClick={() => setOpen(false)}
                  className="block px-4 py-2.5 text-sm text-foreground/80 hover:text-brand hover:bg-brand/5 transition border-t border-accent/30"
                >
                  {t.admin} →
                </Link>
              )}
              <Link
                href="/logout"
                onClick={() => setOpen(false)}
                className="block px-4 py-2.5 text-sm text-foreground/60 hover:text-brand hover:bg-brand/5 transition border-t border-accent/30"
              >
                {t.signOut}
              </Link>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
