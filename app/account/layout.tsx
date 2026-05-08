import { redirect } from "next/navigation";
import Link from "next/link";
import { getSupabaseServer } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/auth/admin";

export const dynamic = "force-dynamic";

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const supabase = getSupabaseServer();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/login?next=/account");

  const isAdmin = isAdminEmail(data.user.email);

  return (
    <div className="pt-28 pb-16 min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-6 md:px-10">
        <header className="flex items-center justify-between border-b border-accent pb-4 mb-8">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-foreground/50">CEE Studio · Account</p>
            <p className="text-sm text-foreground/80">{data.user.email}</p>
          </div>
          <nav className="flex gap-5 text-xs uppercase tracking-widest">
            <Link href="/account" className="hover:text-brand">My bookings</Link>
            <Link href="/booking" className="hover:text-brand">+ New booking</Link>
            {isAdmin && <Link href="/admin" className="hover:text-brand text-brand/80">Admin →</Link>}
            <Link href="/logout" className="hover:text-brand">Logout</Link>
          </nav>
        </header>
        {children}
      </div>
    </div>
  );
}
