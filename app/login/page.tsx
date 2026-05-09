"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import Tag from "@/components/ui/Tag";
import { useLang } from "@/contexts/LanguageContext";

type L = "de" | "en" | "fr" | "it";

const tx: Record<L, {
  tag: string;
  title: string;
  helper: string;
  helper_account: string;
  helper_admin: string;
  emailPlaceholder: string;
  send: string;
  sending: string;
  sent_title: string;
  sent_body: string;
  sent_change: string;
  hint_new: string;
  hint_existing: string;
  err_link_expired: string;
  err_pkce: string;
  err_generic_prefix: string;
}> = {
  de: {
    tag: "Anmelden",
    title: "Willkommen zurück",
    helper: "Gib deine E-Mail ein — wir schicken dir einen Magic Link. Kein Passwort nötig.",
    helper_account: "Melde dich an, um deine Buchungen und dein ABO zu verwalten.",
    helper_admin: "Admin-Anmeldung. Nur freigeschaltete E-Mails haben Zugriff.",
    emailPlaceholder: "du@beispiel.ch",
    send: "Magic Link senden",
    sending: "Wird gesendet…",
    sent_title: "Prüfe deinen Posteingang",
    sent_body: "Wir haben dir einen Magic Link an {email} gesendet. Klick darauf, um dich anzumelden.",
    sent_change: "← Andere E-Mail verwenden",
    hint_new: "Neuer Kunde? Gib einfach deine E-Mail ein — wir erstellen dein Konto automatisch.",
    hint_existing: "Bestehender Kunde? Melde dich an, um alle deine Buchungen zu sehen.",
    err_link_expired: "Der Link ist abgelaufen. Fordere einen neuen an.",
    err_pkce: "Magic Link muss im selben Browser geöffnet werden, in dem er angefordert wurde. Bitte einen neuen anfordern.",
    err_generic_prefix: "Anmeldung fehlgeschlagen: ",
  },
  en: {
    tag: "Sign in",
    title: "Welcome back",
    helper: "Enter your email — we'll send you a magic link. No password needed.",
    helper_account: "Sign in to manage your bookings and membership.",
    helper_admin: "Admin sign-in. Access restricted to authorized emails.",
    emailPlaceholder: "you@example.com",
    send: "Send magic link",
    sending: "Sending…",
    sent_title: "Check your inbox",
    sent_body: "We sent a magic link to {email}. Click it to sign in.",
    sent_change: "← Use a different email",
    hint_new: "New customer? Just enter your email — we'll create your account automatically.",
    hint_existing: "Existing customer? Sign in to see all your bookings.",
    err_link_expired: "The link has expired. Request a fresh one below.",
    err_pkce: "Magic links must be opened in the same browser that requested them. Please request a fresh one.",
    err_generic_prefix: "Sign-in failed: ",
  },
  fr: {
    tag: "Connexion",
    title: "Bon retour",
    helper: "Entre ton e-mail — on t'envoie un lien magique. Sans mot de passe.",
    helper_account: "Connecte-toi pour gérer tes réservations et ton abonnement.",
    helper_admin: "Connexion admin. Accès réservé aux e-mails autorisés.",
    emailPlaceholder: "toi@exemple.ch",
    send: "Envoyer le lien magique",
    sending: "Envoi…",
    sent_title: "Vérifie ta boîte mail",
    sent_body: "On a envoyé un lien magique à {email}. Clique dessus pour te connecter.",
    sent_change: "← Utiliser un autre e-mail",
    hint_new: "Nouveau client ? Entre ton e-mail — on crée ton compte automatiquement.",
    hint_existing: "Client existant ? Connecte-toi pour voir toutes tes réservations.",
    err_link_expired: "Le lien a expiré. Demande-en un nouveau.",
    err_pkce: "Le lien magique doit être ouvert dans le même navigateur. Demande un nouveau lien.",
    err_generic_prefix: "Connexion impossible : ",
  },
  it: {
    tag: "Accedi",
    title: "Bentornato",
    helper: "Inserisci la tua email — ti inviamo un magic link. Nessuna password.",
    helper_account: "Accedi per gestire le tue prenotazioni e il tuo abbonamento.",
    helper_admin: "Accesso admin. Solo per email autorizzate.",
    emailPlaceholder: "tu@esempio.ch",
    send: "Invia magic link",
    sending: "Invio in corso…",
    sent_title: "Controlla la tua casella",
    sent_body: "Abbiamo inviato un magic link a {email}. Cliccalo per accedere.",
    sent_change: "← Usa un'altra email",
    hint_new: "Nuovo cliente? Inserisci la tua email — creeremo l'account automaticamente.",
    hint_existing: "Cliente esistente? Accedi per vedere tutte le tue prenotazioni.",
    err_link_expired: "Il link è scaduto. Richiedine uno nuovo.",
    err_pkce: "I magic link devono essere aperti nello stesso browser. Richiedine uno nuovo.",
    err_generic_prefix: "Accesso fallito: ",
  },
};

function friendlyError(raw: string, t: typeof tx.en): string {
  const r = raw.toLowerCase();
  if (/expire|token has expired|otp_expired/.test(r)) return t.err_link_expired;
  if (/pkce|code verifier|same browser/.test(r)) return t.err_pkce;
  return t.err_generic_prefix + raw;
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginInner />
    </Suspense>
  );
}

function LoginInner() {
  const params = useSearchParams();
  const errorParam = params.get("error");
  const next = params.get("next") ?? "";
  const emailParam = params.get("email") ?? "";
  const { lang } = useLang();
  const l = lang.toLowerCase() as L;
  const t = tx[l] ?? tx.en;

  const [email, setEmail] = useState(emailParam);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (errorParam) setError(friendlyError(errorParam, t));
  }, [errorParam, t]);

  // Contextual subtitle based on `next` destination
  const contextHelper =
    next.startsWith("/admin") ? t.helper_admin :
    next.startsWith("/account") ? t.helper_account :
    t.helper;

  async function send(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const sb = getSupabaseBrowser();
    const callbackParams = next ? `?next=${encodeURIComponent(next)}` : "";
    const { error: err } = await sb.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback${callbackParams}`,
      },
    });
    setLoading(false);
    if (err) setError(friendlyError(err.message, t));
    else setSent(true);
  }

  return (
    <div className="pt-32 pb-32 min-h-screen flex items-center justify-center px-6">
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <Tag>{t.tag}</Tag>
          <h1 className="font-seasons text-4xl md:text-5xl text-brand mt-4">{t.title}</h1>
          <p className="text-sm text-foreground/60 mt-3 max-w-sm mx-auto">{contextHelper}</p>
        </div>

        {sent ? (
          <div className="border border-accent/40 bg-background p-6 text-center">
            <p className="font-seasons text-xl text-brand mb-2">{t.sent_title}</p>
            <p className="text-sm text-foreground/70">
              {t.sent_body.split("{email}").map((chunk, i, arr) =>
                i < arr.length - 1 ? (
                  <span key={i}>
                    {chunk}
                    <strong>{email}</strong>
                  </span>
                ) : (
                  <span key={i}>{chunk}</span>
                )
              )}
            </p>
            <button
              onClick={() => {
                setSent(false);
                setEmail("");
              }}
              className="mt-4 text-xs uppercase tracking-widest text-foreground/50 hover:text-brand"
            >
              {t.sent_change}
            </button>
          </div>
        ) : (
          <form onSubmit={send} className="space-y-4">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t.emailPlaceholder}
              autoFocus
              className="w-full p-3 border border-accent/40 bg-background text-sm focus:outline-none focus:border-brand"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-brand text-background text-xs uppercase tracking-widest hover:bg-brand-hover disabled:opacity-50 transition"
            >
              {loading ? t.sending : t.send}
            </button>
            {error && (
              <p className="text-sm text-brand border border-brand/30 bg-brand/5 p-3">{error}</p>
            )}
          </form>
        )}

        <p className="mt-8 text-xs text-foreground/50 text-center leading-relaxed">
          {t.hint_new}
          <br />
          {t.hint_existing}
        </p>
      </div>
    </div>
  );
}
