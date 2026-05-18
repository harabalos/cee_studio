/**
 * Domain types shared between client and server.
 * Pricing is in CHF cents; render with `formatChf()`.
 */

export type Lang = "de" | "en" | "fr" | "it";
export type Duration = 1 | 2 | 3 | 4 | 8;
export type AddonKey = "lighting" | "backdrops";
export type PaymentMethod =
  | "card"
  | "twint"
  | "invoice"
  | "membership_hours"
  | "admin_cash"
  | "admin_prepaid";

export type BookingStatus = "confirmed" | "cancelled" | "no_show" | "completed";
export type PaymentStatus =
  | "pending"
  | "paid"
  | "refunded"
  | "partially_refunded"
  | "invoice_pending"
  | "failed";

/** All values in CHF cents. */
export type PriceTiers = Record<Duration, number>;
export type AddonPrices = Record<AddonKey, number>;

export interface BookingDraft {
  duration: Duration;
  startISO: string;            // booking start (UTC ISO)
  endISO: string;              // booking end (UTC ISO)
  addons: AddonKey[];
  guest: {
    name: string;
    email: string;
    phone: string;
    company?: string;
    shootType?: string;
  };
  preferredLang: Lang;
  termsAccepted: boolean;
  paymentMethod: "card_or_twint" | "invoice"; // user-facing choice; Stripe shows both card+TWINT
}

export interface PriceBreakdown {
  baseChf: number;             // tier × duration price
  addonsChf: number;           // sum of selected add-ons
  lateNightChf: number;        // surcharge for hours after 20:00
  totalChf: number;
  lateNightHours: number;      // for display
}

export interface AvailabilityResult {
  date: string;                // YYYY-MM-DD
  duration: Duration;
  slots: string[];             // HH:mm strings, available start times in Zurich tz
  closedReason?: "blocked" | "fully_booked" | "outside_hours";
}

export interface BookingRow {
  id: string;
  start_time: string;
  end_time: string;
  duration_hours: number;
  base_price_chf: number;
  addons_price_chf: number;
  late_night_surcharge_chf: number;
  total_chf: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  status: BookingStatus;
  guest_name: string | null;
  guest_email: string | null;
  guest_phone: string | null;
  guest_company: string | null;
  shoot_type: string | null;
  manage_token: string;
  preferred_lang: Lang;
  cancelled_at: string | null;
  created_at: string;
}
