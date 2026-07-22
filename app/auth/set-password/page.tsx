"use client";

/**
 * Set / change password.
 *
 * Reached from the "set or forgot password" link on /login: Supabase emails a
 * recovery link → /auth/callback verifies it (creating a session) → redirects
 * here, where the user picks their own password. We never handle the password
 * ourselves; it goes straight from the browser to Supabase.
 */

import { useState, useEffect } from "react";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { useLang } from "@/contexts/LanguageContext";
import Tag from "@/components/ui/Tag";

type L = "de" | "en" | "fr" | "it";

const tx: Record<L, Record<string, string>> = {
  de: {
    tag: "Passwort", title: "Passwort setzen",
    helper: "Wähle ein Passwort für dein Konto. Danach kannst du dich damit anmelden.",
    pw: "Neues Passwort", pw2: "Passwort wiederholen",
    save: "Passwort speichern", saving: "Speichern…",
    ok: "Passwort gesetzt. Du wirst weitergeleitet…",
    err_short: "Das Passwort muss mindestens 8 Zeichen haben.",
    err_match: "Die Passwörter stimmen nicht überein.",
    err_session: "Der Link ist abgelaufen. Fordere über die Anmeldeseite einen neuen an.",
  },
  en: {
    tag: "Password", title: "Set your password",
    helper: "Choose a password for your account. You can sign in with it from now on.",
    pw: "New password", pw2: "Repeat password",
    save: "Save password", saving: "Saving…",
    ok: "Password set. Redirecting…",
    err_short: "Password must be at least 8 characters.",
    err_match: "The passwords don't match.",
    err_session: "This link has expired. Request a new one from the sign-in page.",
  },
  fr: {
    tag: "Mot de passe", title: "Définir ton mot de passe",
    helper: "Choisis un mot de passe pour ton compte. Tu pourras t'y connecter ensuite.",
    pw: "Nouveau mot de passe", pw2: "Répéter le mot de passe",
    save: "Enregistrer", saving: "Enregistrement…",
    ok: "Mot de passe défini. Redirection…",
    err_short: "Le mot de passe doit contenir au moins 8 caractères.",
    err_match: "Les mots de passe ne correspondent pas.",
    err_session: "Ce lien a expiré. Demandes-en un nouveau depuis la page de connexion.",
  },
  it: {
    tag: "Password", title: "Imposta la password",
    helper: "Scegli una password per il tuo account. Da ora potrai accedere con quella.",
    pw: "Nuova password", pw2: "Ripeti password",
    save: "Salva password", saving: "Salvataggio…",
    ok: "Password impostata. Reindirizzamento…",
    err_short: "La password deve avere almeno 8 caratteri.",
    err_match: "Le password non coincidono.",
    err_session: "Questo link è scaduto. Richiedine uno nuovo dalla pagina di accesso.",
  },
};

export default function SetPasswordPage() {
  const { lang } = useLang();
  const t = tx[(lang.toLowerCase() as L)] ?? tx.en;

  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasSession, setHasSession] = useState<boolean | null>(null);

  useEffect(() => {
    getSupabaseBrowser()
      .auth.getSession()
      .then((res: { data: { session: unknown | null } }) => setHasSession(!!res.data.session));
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (pw.length < 8) return setError(t.err_short);
    if (pw !== pw2) return setError(t.err_match);
    setLoading(true);
    const { error: err } = await getSupabaseBrowser().auth.updateUser({ password: pw });
    setLoading(false);
    if (err) return setError(err.message);
    setDone(true);
    setTimeout(() => (window.location.href = "/account"), 1200);
  }

  const inputCls =
    "w-full p-3 border border-accent/40 bg-background text-sm focus:outline-none focus:border-brand";

  return (
    <div className="pt-32 pb-32 min-h-screen flex items-center justify-center px-6">
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <Tag>{t.tag}</Tag>
          <h1 className="font-seasons text-4xl md:text-5xl text-brand mt-4">{t.title}</h1>
          <p className="text-sm text-foreground/60 mt-3">{t.helper}</p>
        </div>

        {hasSession === false ? (
          <p className="text-sm text-brand border border-brand/30 bg-brand/5 p-3">{t.err_session}</p>
        ) : done ? (
          <p className="text-sm text-foreground/70 border border-accent/40 bg-brand/5 p-3">{t.ok}</p>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <input type="password" required autoFocus value={pw} onChange={(e) => setPw(e.target.value)} placeholder={t.pw} className={inputCls} />
            <input type="password" required value={pw2} onChange={(e) => setPw2(e.target.value)} placeholder={t.pw2} className={inputCls} />
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-brand text-background text-xs uppercase tracking-widest hover:bg-brand-hover disabled:opacity-50 transition"
            >
              {loading ? t.saving : t.save}
            </button>
            {error && <p className="text-sm text-brand border border-brand/30 bg-brand/5 p-3">{error}</p>}
          </form>
        )}
      </div>
    </div>
  );
}
