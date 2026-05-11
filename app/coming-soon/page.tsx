"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import Tag from "@/components/ui/Tag";
import Button from "@/components/ui/Button";
import { useLang } from "@/contexts/LanguageContext";

type Lang = "de" | "en" | "fr" | "it";

const T: Record<Lang, {
  tag: string;
  title: string;
  body: string;
  contact_cta: string;
  back_home: string;
  email_label: string;
}> = {
  de: {
    tag: "Bald verfügbar",
    title: "Bald online buchbar",
    body: "Die Online-Buchung und Mitgliedschaft starten in Kürze. Bis dahin: schreib uns einfach eine Nachricht und wir kümmern uns persönlich um deinen Termin.",
    contact_cta: "Kontaktiere uns",
    back_home: "Zur Startseite",
    email_label: "Oder direkt per E-Mail:",
  },
  en: {
    tag: "Coming soon",
    title: "Online booking coming soon",
    body: "Online booking and memberships are launching in a few days. In the meantime, drop us a message and we'll arrange your shoot personally.",
    contact_cta: "Contact us",
    back_home: "Back to home",
    email_label: "Or email us directly:",
  },
  fr: {
    tag: "Bientôt disponible",
    title: "Réservation en ligne bientôt",
    body: "La réservation en ligne et les abonnements arrivent dans quelques jours. En attendant, envoie-nous un message et on organise ton shooting personnellement.",
    contact_cta: "Contacte-nous",
    back_home: "Retour à l'accueil",
    email_label: "Ou par e-mail directement :",
  },
  it: {
    tag: "Presto disponibile",
    title: "Prenotazione online in arrivo",
    body: "Prenotazioni online e abbonamenti partiranno tra pochi giorni. Nel frattempo, scrivici un messaggio e organizziamo personalmente il tuo shoot.",
    contact_cta: "Contattaci",
    back_home: "Torna alla home",
    email_label: "Oppure direttamente via email:",
  },
};

export default function ComingSoonPage() {
  const { lang } = useLang();
  const l = lang.toLowerCase() as Lang;
  const t = T[l] ?? T.en;

  return (
    <div className="pt-32 pb-32 min-h-screen flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-xl w-full text-center"
      >
        <Tag>{t.tag}</Tag>
        <h1 className="font-seasons text-4xl md:text-6xl text-brand mt-4 leading-tight">
          {t.title}
        </h1>
        <p className="mt-6 text-foreground/70 text-base md:text-lg leading-relaxed max-w-md mx-auto">
          {t.body}
        </p>

        <div className="mt-10 flex flex-col items-center gap-4">
          <Button href="/contact" variant="filled" className="px-8 py-4 text-xs tracking-widest">
            {t.contact_cta}
          </Button>

          <p className="text-[11px] uppercase tracking-widest text-foreground/50 mt-4">
            {t.email_label}
          </p>
          <a
            href="mailto:info@ceestudio.ch"
            className="text-brand text-sm font-medium hover:underline"
          >
            info@ceestudio.ch
          </a>

          <Link
            href="/"
            className="mt-6 text-xs uppercase tracking-widest text-foreground/50 hover:text-brand transition"
          >
            ← {t.back_home}
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
