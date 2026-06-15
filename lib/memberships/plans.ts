/**
 * Membership plan definitions. Single source of truth.
 *
 * Prices are in CHF cents.
 * Hours are decimal (Pro = 9 = 8 + 1 bonus).
 *
 * Stripe Products/Prices are created lazily on first need
 * (see lib/stripe/products.ts).
 */

export type PlanKey = "starter" | "pro" | "unlimited";

export interface PlanDef {
  key: PlanKey;
  /** Display name (DE primary; English version too). */
  nameEn: string;
  nameDe: string;
  /** Short tagline. */
  taglineEn: string;
  taglineDe: string;
  /** Monthly recurring price in CHF cents. */
  priceChfPerMonth: number;
  /** Hours allocated each renewal cycle. */
  hoursPerMonth: number;
  /** UI badge marker (max 1 per list). */
  popular?: boolean;
  /** Highlighted features for UI. */
  featuresEn: string[];
  featuresDe: string[];
}

export const PLANS: Record<PlanKey, PlanDef> = {
  starter: {
    key: "starter",
    nameEn: "Starter Creator",
    nameDe: "Starter Creator",
    taglineEn: "Best for occasional shoots",
    taglineDe: "Für gelegentliche Shootings",
    priceChfPerMonth: 22000, // CHF 220
    hoursPerMonth: 4,
    featuresEn: [
      "4h / month",
      "Standard equipment included",
      "1 backdrop color included per session",
      "Premium equipment +CHF 40",
    ],
    featuresDe: [
      "4h / Monat",
      "Standard-Equipment inklusive",
      "1 Hintergrundfarbe pro Session inklusive",
      "Premium-Equipment +CHF 40",
    ],
  },
  pro: {
    key: "pro",
    nameEn: "Pro Creator",
    nameDe: "Pro Creator",
    taglineEn: "For regulars who want full kit",
    taglineDe: "Für Stammkunden mit Profi-Anspruch",
    priceChfPerMonth: 42000, // CHF 420
    hoursPerMonth: 9, // 8 + 1 bonus
    popular: true,
    featuresEn: [
      "9h / month",
      "Priority booking",
      "Standard equipment included",
      "Up to 2 backdrop colors included per session",
      "Premium equipment +CHF 25",
    ],
    featuresDe: [
      "9h / Monat",
      "Prioritätsbuchung",
      "Standard-Equipment inklusive",
      "Bis zu 2 Hintergrundfarben pro Session inklusive",
      "Premium-Equipment +CHF 25",
    ],
  },
  unlimited: {
    key: "unlimited",
    nameEn: "Studio Unlimited",
    nameDe: "Studio Unlimited",
    taglineEn: "For agencies and brands",
    taglineDe: "Für Agenturen und Marken",
    priceChfPerMonth: 78000, // CHF 780
    hoursPerMonth: 16,
    featuresEn: [
      "16h / month",
      "Priority access",
      "Standard equipment included",
      "All backdrop colors included",
      "Premium equipment included",
    ],
    featuresDe: [
      "16h / Monat",
      "Prioritätszugang",
      "Standard-Equipment inklusive",
      "Alle Hintergrundfarben inklusive",
      "Premium-Equipment inklusive",
    ],
  },
};

/** Minimum subscription term enforced before user can cancel. */
export const MINIMUM_MONTHS = 3;

/** Extra hour rate when a member exhausts their balance and wants to keep booking. */
export const EXTRA_HOUR_CHF = 5000; // CHF 50

/** Get a plan by key. Throws if unknown. */
export function getPlan(key: PlanKey): PlanDef {
  const p = PLANS[key];
  if (!p) throw new Error(`Unknown plan: ${key}`);
  return p;
}

export const PLAN_KEYS: PlanKey[] = ["starter", "pro", "unlimited"];
