"use client";

import { motion } from "framer-motion";
import Tag from "@/components/ui/Tag";
import { useLang } from "@/contexts/LanguageContext";

type Lang = "de" | "en" | "fr" | "it";

const t: Record<Lang, {
  tag: string;
  title: string;
  intro: string;
  responsibleLabel: string;
  emailLabel: string;
}> = {
  de: {
    tag: "Rechtliches",
    title: "Impressum",
    intro: "Angaben gemäss schweizerischem Recht.",
    responsibleLabel: "Verantwortlich für den Inhalt",
    emailLabel: "E-Mail",
  },
  en: {
    tag: "Legal",
    title: "Legal Notice",
    intro: "Information according to Swiss law.",
    responsibleLabel: "Responsible for content",
    emailLabel: "Email",
  },
  fr: {
    tag: "Mentions légales",
    title: "Mentions légales",
    intro: "Informations selon le droit suisse.",
    responsibleLabel: "Responsable du contenu",
    emailLabel: "E-mail",
  },
  it: {
    tag: "Note legali",
    title: "Note legali",
    intro: "Informazioni secondo il diritto svizzero.",
    responsibleLabel: "Responsabile dei contenuti",
    emailLabel: "Email",
  },
};

export default function ImpressumPage() {
  const { lang } = useLang();
  const l = lang.toLowerCase() as Lang;
  const tx = t[l] ?? t.de; // DE is the canonical version under Swiss law

  return (
    <div className="pt-32 pb-32 px-6 md:px-10 max-w-3xl mx-auto min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <Tag>{tx.tag}</Tag>
        <h1 className="font-seasons text-5xl md:text-7xl text-brand mt-4">
          {tx.title}
        </h1>
        <p className="mt-6 text-foreground/70 text-base md:text-lg leading-relaxed">
          {tx.intro}
        </p>

        <div className="mt-16 border border-accent/40 bg-background p-8 md:p-10">
          <div className="space-y-1 text-base text-foreground">
            <p className="font-semibold text-lg mb-3">CEE Studio</p>
            <p>Thurgauerstrasse 117</p>
            <p>8152 Glattpark</p>
            <p>Switzerland</p>
          </div>

          <hr className="my-6 border-accent/30" />

          <div className="space-y-2 text-sm">
            <p className="text-foreground/60 uppercase tracking-widest text-[10px]">
              {tx.emailLabel}
            </p>
            <a
              href="mailto:info@ceestudio.ch"
              className="text-brand hover:underline text-base"
            >
              info@ceestudio.ch
            </a>
          </div>

          <hr className="my-6 border-accent/30" />

          <div className="space-y-2 text-sm">
            <p className="text-foreground/60 uppercase tracking-widest text-[10px]">
              {tx.responsibleLabel}
            </p>
            <p className="text-foreground text-base">CEE Studio</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
