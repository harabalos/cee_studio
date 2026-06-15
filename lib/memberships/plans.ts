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
      "4 hours / month",
      "Flexible use, subject to availability",
      "Basic studio access",
      "Extra hours bookable at CHF 50 / h",
    ],
    featuresDe: [
      "4 Stunden / Monat",
      "Flexible Nutzung nach Verfügbarkeit",
      "Basic Studio Zugang",
      "Extra Stunden für CHF 50 / h zubuchbar",
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
      "9 hours / month (8h + 1h bonus)",
      "Priority booking",
      "Standard equipment & lighting included",
      "Premium equipment optional (+CHF 50)",
      "Extra hours bookable at CHF 50 / h",
    ],
    featuresDe: [
      "9 Stunden / Monat (8h + 1h Bonus)",
      "Prioritätsbuchung",
      "Standard-Equipment & Beleuchtung inklusive",
      "Premium-Equipment optional (+CHF 50)",
      "Extra Stunden für CHF 50 / h zubuchbar",
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
      "16 hours / month",
      "Priority access",
      "Standard equipment & lighting included",
      "Premium equipment optional (+CHF 50)",
      "Flexible use",
    ],
    featuresDe: [
      "16 Stunden / Monat",
      "Prioritätszugang",
      "Standard-Equipment & Beleuchtung inklusive",
      "Premium-Equipment optional (+CHF 50)",
      "Flexible Nutzung",
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
