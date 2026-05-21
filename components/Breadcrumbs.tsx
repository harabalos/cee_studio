"use client";

import Link from "next/link";
import Script from "next/script";

export interface BreadcrumbItem {
  /** Display label for this breadcrumb segment. */
  label: string;
  /** Target href. Omit for the current page (last segment). */
  href?: string;
}

interface Props {
  items: BreadcrumbItem[];
  /** Optional class extension for the outer nav element. */
  className?: string;
}

/**
 * Editorial breadcrumb trail.
 *
 *   Home › Studio › Pricing
 *
 * Renders both the visible nav (a11y-friendly with aria-label) AND a
 * BreadcrumbList JSON-LD block so Google shows the trail in SERPs in
 * place of the raw URL.
 *
 * Place at the very top of a sub-page, above the page header / Tag.
 */
export default function Breadcrumbs({ items, className = "" }: Props) {
  // Build JSON-LD — absolute URLs, position is 1-indexed, the last item
  // (current page) still needs an item URL for valid schema.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.label,
      item: it.href
        ? `https://ceestudio.ch${it.href}`
        : typeof window !== "undefined"
          ? window.location.href.split("?")[0].split("#")[0]
          : undefined,
    })),
  };

  return (
    <>
      <Script
        id={`breadcrumbs-${items.map((i) => i.label).join("-")}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav
        aria-label="Breadcrumb"
        className={`text-[10px] uppercase tracking-[0.18em] text-foreground/45 ${className}`}
      >
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
          {items.map((it, i) => {
            const isLast = i === items.length - 1;
            return (
              <li key={`${it.label}-${i}`} className="flex items-center gap-2">
                {isLast || !it.href ? (
                  <span aria-current={isLast ? "page" : undefined} className="text-foreground/60">
                    {it.label}
                  </span>
                ) : (
                  <Link
                    href={it.href}
                    className="hover:text-brand transition-colors"
                  >
                    {it.label}
                  </Link>
                )}
                {!isLast && (
                  <span aria-hidden="true" className="text-foreground/30">
                    ›
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
