"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/account", label: "Bookings" },
  { href: "/account/membership", label: "Membership" },
  { href: "/account/profile", label: "Profile" },
];

export default function AccountTabs() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 border-b border-accent/30 -mb-px overflow-x-auto" aria-label="Account sections">
      {tabs.map((t) => {
        const active = pathname === t.href;
        return (
          <Link
            key={t.href}
            href={t.href}
            aria-current={active ? "page" : undefined}
            className={`px-4 py-3 text-xs uppercase tracking-widest font-medium transition border-b-2 -mb-px whitespace-nowrap ${
              active
                ? "border-brand text-brand"
                : "border-transparent text-foreground/50 hover:text-brand hover:border-brand/40"
            }`}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
