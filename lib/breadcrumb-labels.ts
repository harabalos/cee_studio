/**
 * Centralized breadcrumb labels per language.
 * Each page imports the labels it needs and passes them to <Breadcrumbs />.
 */

export type BreadcrumbLang = "en" | "de" | "fr" | "it";

const HOME: Record<BreadcrumbLang, string> = {
  en: "Home",
  de: "Start",
  fr: "Accueil",
  it: "Home",
};

const PAGES: Record<string, Record<BreadcrumbLang, string>> = {
  studio: { en: "Studio", de: "Studio", fr: "Studio", it: "Studio" },
  equipment: { en: "Equipment", de: "Equipment", fr: "Équipement", it: "Attrezzatura" },
  space: { en: "Other Services", de: "Weitere Services", fr: "Autres Services", it: "Altri Servizi" },
  booking: { en: "Booking", de: "Buchung", fr: "Réservation", it: "Prenotazione" },
  contact: { en: "Contact", de: "Kontakt", fr: "Contact", it: "Contatti" },
  faq: { en: "FAQ", de: "FAQ", fr: "FAQ", it: "FAQ" },
  about: { en: "About", de: "Über uns", fr: "À propos", it: "Chi siamo" },
  rules: { en: "Studio Rules", de: "Studio-Regeln", fr: "Règlement", it: "Regole" },
  blog: { en: "Blog", de: "Blog", fr: "Blog", it: "Blog" },
};

export function bc(lang: string, ...slugs: string[]): { label: string; href?: string }[] {
  const l = (lang.toLowerCase() as BreadcrumbLang) ?? "de";
  const items: { label: string; href?: string }[] = [
    { label: HOME[l] ?? HOME.de, href: "/" },
  ];
  slugs.forEach((slug, i) => {
    const isLast = i === slugs.length - 1;
    const known = PAGES[slug];
    const label = known ? (known[l] ?? known.de) : slug;
    // Build the cumulative href: /studio, /studio/foo, /studio/foo/bar
    const href = "/" + slugs.slice(0, i + 1).join("/");
    items.push(isLast ? { label } : { label, href });
  });
  return items;
}

/** For blog posts where the title is dynamic (not in the static label map). */
export function bcBlogPost(lang: string, postTitle: string): { label: string; href?: string }[] {
  const l = (lang.toLowerCase() as BreadcrumbLang) ?? "de";
  return [
    { label: HOME[l] ?? HOME.de, href: "/" },
    { label: PAGES.blog[l] ?? PAGES.blog.de, href: "/blog" },
    { label: postTitle },
  ];
}
