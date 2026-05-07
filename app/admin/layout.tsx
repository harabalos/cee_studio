import { redirect } from "next/navigation";
import { getAdminUser } from "@/lib/auth/admin";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getAdminUser();
  if (!user) redirect("/admin/login");
  return (
    <div className="pt-24 pb-16 min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <header className="flex items-center justify-between border-b border-accent pb-4 mb-8">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-foreground/50">CEE Studio · Admin</p>
            <p className="text-sm text-foreground/80">{user.email}</p>
          </div>
          <nav className="flex gap-5 text-xs uppercase tracking-widest">
            <a href="/admin" className="hover:text-brand">Dashboard</a>
            <a href="/admin/bookings" className="hover:text-brand">Bookings</a>
            <a href="/admin/manual" className="hover:text-brand">Manual</a>
            <a href="/admin/blocked" className="hover:text-brand">Blocked</a>
            <a href="/admin/logout" className="hover:text-brand">Logout</a>
          </nav>
        </header>
        {children}
      </div>
    </div>
  );
}
