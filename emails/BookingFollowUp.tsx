/**
 * Thank-you follow-up — sent the day after a completed shoot.
 * Content per owner's exact wording (German), translated for EN/FR/IT.
 * German keeps the formal "Sie" as given; FR/IT use informal "tu" to match
 * the tone already established in BookingReminder24h.
 */
import { EmailShell, H2, Body14, colors } from "./_layout";

type Props = {
  lang: "de" | "en" | "fr" | "it";
  name: string;
};

const T = {
  de: {
    preview: "Vielen Dank für Ihr Shooting im CEE Studio",
    title: "Vielen Dank für Ihr Shooting! 📸",
    greet: (n: string) => (n ? `Hallo ${n},` : "Hallo,"),
    p1: "Vielen Dank, dass Sie sich für CEE Studio für Ihr letztes Fotoshooting entschieden haben!",
    p2: "Wir hoffen, Sie haben Ihre Zeit im Studio genossen und alles war genau so, wie Sie es sich für Ihr Shooting gewünscht haben.",
    p3: "Es war uns eine Freude, Sie bei uns zu haben, und wir freuen uns darauf, Sie für Ihr nächstes Projekt wieder bei uns begrüssen zu dürfen.",
    rebook: "Bereit für die nächste Session? Buche jederzeit neu auf",
    signoff: "Liebe Grüsse\nCEE Studio",
  },
  en: {
    preview: "Thank you for your shoot at CEE Studio",
    title: "Thank you for your shoot! 📸",
    greet: (n: string) => (n ? `Hello ${n},` : "Hello,"),
    p1: "Thank you for choosing CEE Studio for your recent photo shoot!",
    p2: "We hope you enjoyed your time in the studio and that everything was exactly as you wanted for your shoot.",
    p3: "It was a pleasure having you with us, and we look forward to welcoming you back for your next project.",
    rebook: "Ready for the next session? Book anytime at",
    signoff: "Best regards,\nCEE Studio",
  },
  fr: {
    preview: "Merci pour ton shooting au CEE Studio",
    title: "Merci pour ton shooting ! 📸",
    greet: (n: string) => (n ? `Bonjour ${n},` : "Bonjour,"),
    p1: "Merci d'avoir choisi CEE Studio pour ton récent shooting photo !",
    p2: "Nous espérons que tu as apprécié ton passage au studio et que tout s'est déroulé exactement comme tu le souhaitais.",
    p3: "Ce fut un plaisir de t'accueillir, et nous avons hâte de te retrouver pour ton prochain projet.",
    rebook: "Prêt·e pour la prochaine session ? Réserve à tout moment sur",
    signoff: "Cordialement,\nCEE Studio",
  },
  it: {
    preview: "Grazie per il tuo shooting al CEE Studio",
    title: "Grazie per il tuo shooting! 📸",
    greet: (n: string) => (n ? `Ciao ${n},` : "Ciao,"),
    p1: "Grazie per aver scelto CEE Studio per il tuo recente shooting fotografico!",
    p2: "Speriamo che tu abbia apprezzato il tempo trascorso in studio e che tutto sia stato esattamente come desideravi per il tuo shooting.",
    p3: "È stato un piacere averti con noi, e non vediamo l'ora di darti il benvenuto per il tuo prossimo progetto.",
    rebook: "Pronto per la prossima sessione? Prenota quando vuoi su",
    signoff: "Cordiali saluti,\nCEE Studio",
  },
};

export default function BookingFollowUp(props: Props) {
  const t = T[props.lang];
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ceestudio.ch";

  return (
    <EmailShell preview={t.preview}>
      <H2>{t.title}</H2>
      <Body14>{t.greet(props.name)}</Body14>
      <Body14>{t.p1}</Body14>
      <Body14>{t.p2}</Body14>
      <Body14>{t.p3}</Body14>

      <Body14 muted>
        {t.rebook}{" "}
        <a href={SITE_URL + "/booking"} style={{ color: colors.BRAND }}>
          ceestudio.ch/booking
        </a>
      </Body14>

      <Body14 muted>
        <span style={{ whiteSpace: "pre-line" }}>{t.signoff}</span>
      </Body14>
    </EmailShell>
  );
}
