"use client";

import { useEffect } from "react";
import { getSupabaseBrowser } from "@/lib/supabase/client";

export default function LogoutPage() {
  useEffect(() => {
    const sb = getSupabaseBrowser();
    sb.auth.signOut().finally(() => {
      window.location.href = "/login";
    });
  }, []);
  return <div className="pt-40 text-center text-foreground/50">Signing out…</div>;
}
