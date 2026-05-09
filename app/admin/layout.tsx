import { redirect } from "next/navigation";
import { getAdminUser } from "@/lib/auth/admin";
import AdminNav from "./AdminNav";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getAdminUser();
  if (!user) redirect("/login");
  return (
    <div className="pt-20 md:pt-24 pb-16 min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-10">
        <header className="flex items-center justify-between border-b border-accent pb-4 mb-6 md:mb-8 gap-3">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-widest text-foreground/50 truncate">CEE Studio · Admin</p>
            <p className="text-sm text-foreground/80 truncate">{user.email}</p>
          </div>
          <AdminNav />
        </header>
        {children}
      </div>
    </div>
  );
}
