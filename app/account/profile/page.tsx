import { getSupabaseServer, getSupabaseAdmin } from "@/lib/supabase/server";
import ProfileForm from "./ProfileForm";

export const dynamic = "force-dynamic";

export default async function AccountProfilePage() {
  const supabase = getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return null;

  const admin = getSupabaseAdmin();
  const userEmail = user.email.toLowerCase();

  const { data: dbUser } = await admin
    .from("users")
    .select("name, phone, company, preferred_lang")
    .eq("email", userEmail)
    .maybeSingle();

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="font-seasons text-4xl text-brand">Profile</h1>
        <p className="text-sm text-foreground/60 mt-2">
          Used to pre-fill bookings and tailor confirmation emails.
        </p>
      </div>

      <div className="border border-accent/40 bg-background p-6 md:p-8">
        <p className="text-[10px] uppercase tracking-widest text-foreground/50 mb-1">Email</p>
        <p className="text-sm font-medium">{userEmail}</p>
        <p className="text-[11px] text-foreground/50 mt-1 italic">
          Email is your sign-in identity and can&apos;t be changed here. Contact us if you need to migrate.
        </p>
      </div>

      <ProfileForm
        initial={{
          name: dbUser?.name ?? "",
          phone: dbUser?.phone ?? "",
          company: dbUser?.company ?? "",
          preferred_lang: (dbUser?.preferred_lang as "de" | "en" | "fr" | "it" | null) ?? null,
        }}
      />
    </div>
  );
}
