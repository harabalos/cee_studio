"use client";

import { useState } from "react";

const ITEMS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/calendar", label: "Calendar" },
  { href: "/admin/bookings", label: "Bookings" },
  { href: "/admin/members", label: "Members" },
  { href: "/admin/blog", label: "Blog" },
  { href: "/admin/manual", label: "Manual" },
  { href: "/admin/blocked", label: "Blocked" },
  { href: "/admin/settings", label: "Settings" },
  { href: "/logout", label: "Logout" },
];

export default function AdminNav() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Desktop nav (≥md) */}
      <nav className="hidden md:flex gap-5 text-xs uppercase tracking-widest">
        {ITEMS.map((it) => (
          <a key={it.href} href={it.href} className="hover:text-brand transition">
            {it.label}
          </a>
        ))}
      </nav>

      {/* Mobile hamburger (<md) */}
      <button
        className="md:hidden flex flex-col gap-1 p-2"
        onClick={() => setOpen(!open)}
        aria-label="Toggle menu"
      >
        <span className={`block w-5 h-[1.5px] bg-brand transition-all ${open ? "rotate-45 translate-y-[5px]" : ""}`} />
        <span className={`block w-5 h-[1.5px] bg-brand transition-all ${open ? "opacity-0" : ""}`} />
        <span className={`block w-5 h-[1.5px] bg-brand transition-all ${open ? "-rotate-45 -translate-y-[5px]" : ""}`} />
      </button>

      {/* Mobile menu drawer */}
      {open && (
        <>
          <div
            className="md:hidden fixed inset-0 bg-foreground/40 z-40"
            onClick={() => setOpen(false)}
          />
          <nav className="md:hidden fixed top-0 right-0 bottom-0 w-64 bg-background border-l border-accent z-50 p-6 flex flex-col gap-4">
            <p className="text-[10px] uppercase tracking-widest text-foreground/40 pb-4 border-b border-accent">
              CEE Studio · Admin
            </p>
            {ITEMS.map((it) => (
              <a
                key={it.href}
                href={it.href}
                onClick={() => setOpen(false)}
                className="text-base text-foreground hover:text-brand transition"
              >
                {it.label}
              </a>
            ))}
          </nav>
        </>
      )}
    </>
  );
}
