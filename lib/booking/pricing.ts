/**
 * Pricing calculator. Pure functions (no DB / no I/O) — easily unit-testable.
 *
 * All prices are in CHF cents (integer math). Convert with `formatChf()` for display.
 *
 * Late-night logic: any hour where the booking is in progress at HH:mm >= 20:00
 * incurs a per-hour surcharge. We compute it integer-hour-aligned to keep things
 * simple — full hours from 20:00 onwards count.
 */

import type {
  AddonKey,
  AddonPrices,
  Duration,
  PriceBreakdown,
  PriceTiers,
} from "@/types/booking";

/** Default tier prices in CHF cents — kept in sync with `db/schema.sql` defaults. */
export const DEFAULT_PRICES: PriceTiers = {
  1: 7000,   // CHF 70
  2: 12000,  // CHF 120
  3: 16500,  // CHF 165
  4: 25000,  // CHF 250
  8: 49000,  // CHF 490
};

export const DEFAULT_ADDON_PRICES: AddonPrices = {
  lighting: 2000,
  backdrops: 3000,
};

export const DEFAULT_LATE_NIGHT_SURCHARGE_CHF_PER_HOUR = 1000; // CHF 10
export const DEFAULT_LATE_NIGHT_STARTS_AT_HOUR = 20;

/**
 * "Studio + Premium Equipment" surcharge — a flat add to the booking total
 * (independent of duration), matching the owner's pricing PDF. Premium gear
 * (Broncolor/Profoto set) is prepared on top of the standard equipment.
 */
export const DEFAULT_PREMIUM_SURCHARGE_CHF = 5000; // CHF 50 flat (guests / no membership)

/**
 * Members pay a reduced premium surcharge depending on their plan (Unlimited
 * gets it free). Falls back to DEFAULT_PREMIUM_SURCHARGE_CHF for guests.
 */
export const PREMIUM_SURCHARGE_BY_PLAN: Record<string, number> = {
  starter: 4000, // CHF 40
  pro: 2500, // CHF 25
  unlimited: 0, // included
};

/**
 * Count how many hours of a booking fall at or after `lateNightStartHour` (Zurich local).
 * Booking start/end are already in Zurich local hours (we don't deal with timezones here).
 */
export function countLateNightHours(opts: {
  startHour: number;        // 0-23, Zurich local
  durationHours: Duration;
  lateNightStartHour?: number;
}): number {
  const cutoff = opts.lateNightStartHour ?? DEFAULT_LATE_NIGHT_STARTS_AT_HOUR;
  const start = opts.startHour;
  const end = start + opts.durationHours;
  if (end <= cutoff) return 0;
  return Math.min(end, 24) - Math.max(start, cutoff);
}

export function calcPrice(opts: {
  duration: Duration;
  startHour: number;
  addons: AddonKey[];
  premium?: boolean;
  prices?: PriceTiers;
  addonPrices?: AddonPrices;
  premiumSurchargeChf?: number;
  lateNightSurchargeChfPerHour?: number;
  lateNightStartHour?: number;
}): PriceBreakdown {
  const tiers = opts.prices ?? DEFAULT_PRICES;
  const addonPrices = opts.addonPrices ?? DEFAULT_ADDON_PRICES;
  const surcharge = opts.lateNightSurchargeChfPerHour ?? DEFAULT_LATE_NIGHT_SURCHARGE_CHF_PER_HOUR;

  const baseChf = tiers[opts.duration];
  if (baseChf == null) throw new Error(`Unknown duration: ${opts.duration}`);

  const addonsChf = opts.addons.reduce((sum, key) => {
    const p = addonPrices[key];
    if (p == null) throw new Error(`Unknown addon: ${key}`);
    return sum + p;
  }, 0);

  const premiumChf = opts.premium
    ? (opts.premiumSurchargeChf ?? DEFAULT_PREMIUM_SURCHARGE_CHF)
    : 0;

  const lateNightHours = countLateNightHours({
    startHour: opts.startHour,
    durationHours: opts.duration,
    lateNightStartHour: opts.lateNightStartHour,
  });
  const lateNightChf = lateNightHours * surcharge;

  return {
    baseChf,
    addonsChf,
    premiumChf,
    lateNightChf,
    totalChf: baseChf + addonsChf + premiumChf + lateNightChf,
    lateNightHours,
  };
}

/** Format CHF cents as "CHF 70.00" / "CHF 70" (no decimals when whole CHF). */
export function formatChf(cents: number): string {
  if (cents % 100 === 0) return `CHF ${cents / 100}`;
  return `CHF ${(cents / 100).toFixed(2)}`;
}
