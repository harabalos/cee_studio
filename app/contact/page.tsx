"use client";

import { motion } from "framer-motion";
import Tag from "@/components/ui/Tag";
import Link from "next/link";
import { useState } from "react";
import { useLang } from "@/contexts/LanguageContext";

const t = {
  en: {
    tag: "Contact",
    h1: "Get in touch",
    inquiriesH: "General Inquiries",
    phoneH: "Phone",
    studioH: "The Studio",
    successH: "Message Received",
    successP: "We've received your inquiry and will get back to you shortly.",
    successBtn: "Send another message",
    formH: "Production Inquiry",
    formP: "To request a custom production quote or to hold dates for a multi-day commercial shoot, please outline the scope of your project below.",
    namePh: "Name or Agency",
    emailPh: "Email Address",
    msgPh: "Project Details (Dates, Equipment needs, Crew size)",
    errorP: "There was an error sending your message. Please try again or email us directly.",
    termsBefore: "I agree to the",
    termsLink: "Terms of Service",
    termsAnd: "and",
    privacyLink: "Privacy Policy",
    submit: "Submit Inquiry",
    sending: "Sending...",
    subjectLine: "New Production Inquiry - CEE Studio",
  },
  de: {
    tag: "Kontakt",
    h1: "Schreiben Sie uns",
    inquiriesH: "Allgemeine Anfragen",
    phoneH: "Telefon",
    studioH: "Das Studio",
    successH: "Nachricht erhalten",
    successP: "Wir haben Ihre Anfrage erhalten und melden uns in Kürze.",
    successBtn: "Weitere Nachricht senden",
    formH: "Produktions-Anfrage",
    formP: "Für ein individuelles Produktions-Angebot oder die Reservierung mehrerer Tage für ein kommerzielles Shooting beschreiben Sie bitte unten den Umfang Ihres Projekts.",
    namePh: "Name oder Agentur",
    emailPh: "E-Mail-Adresse",
    msgPh: "Projekt-Details (Daten, Equipment-Bedarf, Team-Grösse)",
    errorP: "Beim Senden Ihrer Nachricht ist ein Fehler aufgetreten. Bitte erneut versuchen oder direkt per E-Mail kontaktieren.",
    termsBefore: "Ich akzeptiere die",
    termsLink: "AGB",
    termsAnd: "und die",
    privacyLink: "Datenschutzerklärung",
    submit: "Anfrage senden",
    sending: "Wird gesendet...",
    subjectLine: "Neue Produktions-Anfrage - CEE Studio",
  },
  fr: {
    tag: "Contact",
    h1: "Contactez-nous",
    inquiriesH: "Demandes générales",
    phoneH: "Téléphone",
    studioH: "Le Studio",
    successH: "Message reçu",
    successP: "Nous avons reçu votre demande et reviendrons vers vous rapidement.",
    successBtn: "Envoyer un autre message",
    formH: "Demande de Production",
    formP: "Pour un devis de production personnalisé ou pour réserver plusieurs jours pour un shooting commercial, veuillez décrire l'étendue de votre projet ci-dessous.",
    namePh: "Nom ou Agence",
    emailPh: "Adresse Email",
    msgPh: "Détails du projet (Dates, besoins équipement, taille de l'équipe)",
    errorP: "Une erreur est survenue lors de l'envoi de votre message. Veuillez réessayer ou nous contacter directement par email.",
    termsBefore: "J'accepte les",
    termsLink: "CGV",
    termsAnd: "et la",
    privacyLink: "Politique de Confidentialité",
    submit: "Envoyer la demande",
    sending: "Envoi en cours...",
    subjectLine: "Nouvelle demande de production - CEE Studio",
  },
  it: {
    tag: "Contatti",
    h1: "Contattaci",
    inquiriesH: "Richieste generali",
    phoneH: "Telefono",
    studioH: "Lo Studio",
    successH: "Messaggio ricevuto",
    successP: "Abbiamo ricevuto la tua richiesta e ti risponderemo a breve.",
    successBtn: "Invia un altro messaggio",
    formH: "Richiesta di Produzione",
    formP: "Per un preventivo di produzione personalizzato o per riservare più giorni per uno shooting commerciale, descrivi qui sotto la portata del tuo progetto.",
    namePh: "Nome o Agenzia",
    emailPh: "Indirizzo Email",
    msgPh: "Dettagli progetto (Date, esigenze attrezzatura, dimensione team)",
    errorP: "Si è verificato un errore nell'invio del messaggio. Riprova o contattaci direttamente via email.",
    termsBefore: "Accetto le",
    termsLink: "CGC",
    termsAnd: "e la",
    privacyLink: "Privacy Policy",
    submit: "Invia richiesta",
    sending: "Invio in corso...",
    subjectLine: "Nuova richiesta di produzione - CEE Studio",
  },
};

export default function ContactPage() {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const { lang } = useLang();
  const tx = t[lang.toLowerCase() as keyof typeof t];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("submitting");

    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      const response = await fetch("https://formsubmit.co/ajax/info@ceestudio.ch", {
        method: "POST",
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        setStatus("success");
        form.reset();
      } else {
        setStatus("error");
      }
    } catch (error) {
      console.error(error);
      setStatus("error");
    }
  };

  return (
    <div className="pt-32 pb-24 px-6 md:px-10 max-w-7xl mx-auto min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <Tag>{tx.tag}</Tag>
        <h1 className="font-seasons text-5xl md:text-7xl text-brand mt-4 mb-16">
          {tx.h1}
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 lg:gap-16">

          {/* Left Column: Contact Detail Card */}
          <div className="bg-background border border-accent p-8 md:p-12 rounded-lg flex flex-col justify-center space-y-12 shadow-sm">
            <div>
              <h2 className="text-xs uppercase tracking-[0.2em] font-bold text-brand mb-4">{tx.inquiriesH}</h2>
              <a href="mailto:info@ceestudio.ch" className="font-seasons text-3xl md:text-4xl text-foreground hover:text-brand transition-colors break-words">
                info@ceestudio.ch
              </a>
            </div>

            <div>
              <h2 className="text-xs uppercase tracking-[0.2em] font-bold text-brand mb-4">{tx.phoneH}</h2>
              <p className="font-seasons text-3xl md:text-4xl text-foreground">
                +41762402056
              </p>
            </div>

            <div>
              <h2 className="text-xs uppercase tracking-[0.2em] font-bold text-brand mb-4">{tx.studioH}</h2>
              <p className="text-foreground/70 leading-relaxed font-light text-sm md:text-base">
                CEE Studio HQ<br />
                Thurgauerstrasse 117<br />
                8152 Glattpark
              </p>
            </div>
          </div>

          <div className="bg-brand/5 border border-accent p-8 md:p-12 rounded-lg flex flex-col justify-center relative overflow-hidden">
            {status === "success" ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center text-center space-y-4 py-8"
              >
                <div className="w-16 h-16 bg-brand/10 text-brand rounded-full flex items-center justify-center mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="font-seasons text-3xl text-brand">{tx.successH}</h3>
                <p className="text-foreground/70 text-sm">{tx.successP}</p>
                <button
                  onClick={() => setStatus("idle")}
                  className="mt-6 text-xs uppercase tracking-widest text-brand font-bold hover:underline"
                >
                  {tx.successBtn}
                </button>
              </motion.div>
            ) : (
              <>
                <h2 className="font-seasons text-3xl text-brand mb-8">{tx.formH}</h2>
                <p className="text-foreground/70 leading-relaxed font-light text-sm mb-8">
                  {tx.formP}
                </p>

                <form
                  onSubmit={handleSubmit}
                  className="flex flex-col gap-6"
                >
                  <input type="hidden" name="_subject" value={tx.subjectLine} />
                  <input type="hidden" name="_captcha" value="false" />
                  <input type="hidden" name="_template" value="box" />

                  <input
                    type="text"
                    name="name"
                    required
                    placeholder={tx.namePh}
                    className="w-full bg-transparent border-b border-accent pb-3 text-sm focus:outline-none focus:border-brand transition-colors text-foreground font-light placeholder:text-foreground/30"
                  />
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder={tx.emailPh}
                    className="w-full bg-transparent border-b border-accent pb-3 text-sm focus:outline-none focus:border-brand transition-colors text-foreground font-light placeholder:text-foreground/30"
                  />
                  <textarea
                    name="message"
                    required
                    placeholder={tx.msgPh}
                    rows={4}
                    className="w-full bg-transparent border-b border-accent pb-3 text-sm focus:outline-none focus:border-brand transition-colors text-foreground font-light placeholder:text-foreground/30 resize-none mt-4"
                  />

                  {status === "error" && (
                    <p className="text-red-500 text-xs">{tx.errorP}</p>
                  )}

                  <div className="flex items-start gap-3 mt-4">
                    <input
                      type="checkbox"
                      id="terms"
                      required
                      className="mt-1 accent-brand shrink-0"
                    />
                    <label htmlFor="terms" className="text-xs text-foreground/60 leading-snug">
                      {tx.termsBefore} <Link href="/terms" className="text-brand hover:underline">{tx.termsLink}</Link> {tx.termsAnd} <Link href="/privacy" className="text-brand hover:underline">{tx.privacyLink}</Link>.
                    </label>
                  </div>
                  <button
                    type="submit"
                    disabled={status === "submitting"}
                    className="self-start mt-4 px-8 py-3 bg-brand text-background text-[10px] md:text-xs tracking-[0.2em] uppercase font-bold hover:bg-[#4a0f0f] transition-colors shadow-lg hover:shadow-xl rounded-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {status === "submitting" ? tx.sending : tx.submit}
                  </button>
                </form>
              </>
            )}
          </div>

          {/* Interactive Google Map Embed */}
          <div className="md:col-span-2 mt-4 md:mt-8 bg-brand/5 border border-accent p-2 rounded-lg overflow-hidden h-[400px]">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2700.0886270381622!2d8.558352615622144!3d47.4326573791732!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47900aef7ff6d1e7%3A0xe5a363a0329b3cf2!2sThurgauerstrasse%20117%2C%208152%20Glattpark%20(Opfikon)%2C%20Switzerland!5e0!3m2!1sen!2sus!4v1711311000000!5m2!1sen!2sus"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={false}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="grayscale-[0.8] opacity-80 hover:grayscale-0 hover:opacity-100 transition-all duration-700 w-full h-full object-cover rounded-md"
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
