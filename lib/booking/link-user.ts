/**
 * Ensure a `users` row exists for the given email and return its id.
 * Used to link bookings to a user profile so the customer can find them
 * when they sign in via magic link.
 *
 * No password — the user row is just a profile holder. Auth happens via
 * Supabase Auth which is decoupled from this table.
 */

import { getSupabaseAdmin } from "@/lib/supabase/server";

export async function ensureUserAndLinkBooking(opts: {
  bookingId: string;
  email: string | null;
  name?: string | null;
  phone?: string | null;
  company?: string | null;
  preferredLang?: "de" | "en" | "fr" | "it";
}): Promise<string | null> {
  if (!opts.email) return null;
  const supabase = getSupabaseAdmin();

  const emailLower = opts.email.toLowerCase().trim();

  // Find or create user row
  const { data: existing } = await supabase
    .from("users")
    .select("id")
    .eq("email", emailLower)
    .maybeSingle();

  let userId: string;
  if (existing) {
    userId = existing.id;
    // Optionally enrich missing fields
    const enrich: Record<string, unknown> = {};
    if (opts.name) enrich.name = opts.name;
    if (opts.phone) enrich.phone = opts.phone;
    if (opts.company) enrich.company = opts.company;
    if (Object.keys(enrich).length > 0) {
      await supabase.from("users").update(enrich).eq("id", userId);
    }
  } else {
    const { data: created, error } = await supabase
      .from("users")
      .insert({
        email: emailLower,
        name: opts.name ?? null,
        phone: opts.phone ?? null,
        company: opts.company ?? null,
        role: "visitor",
        preferred_lang: opts.preferredLang ?? "de",
      })
      .select("id")
      .single();
    if (error || !created) {
      console.error("[link-user] insert failed", error);
      return null;
    }
    userId = created.id;
  }

  // Link booking
  await supabase.from("bookings").update({ user_id: userId }).eq("id", opts.bookingId);
  return userId;
}
