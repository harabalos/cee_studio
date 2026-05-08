import { EmailShell, H2, Body14, DataRow, InfoBox, colors } from "./_layout";

type Props = {
  lang: "de" | "en" | "fr" | "it";
  name: string;
  startStr: string;
  refundStr: string | null;
};

const T = {
  de: {
    preview: "Deine Buchung wurde storniert",
    title: "Buchung storniert",
    greet: (n: string) => `Hallo ${n},`,
    intro: "wir haben deine Buchung storniert.",
    cancelled_for: "Storniert für",
    refund: "Rückerstattung",
    refund_pending: "Die Rückerstattung erscheint in 5–7 Werktagen auf deiner Karte (TWINT-Rückerstattungen können bis zu 7 Tage dauern).",
    rebook: "Wir freuen uns, wenn du wiederkommst — buche einfach neu auf",
    signoff: "Liebe Grüsse,\nCEE Studio",
  },
  en: {
    preview: "Your booking has been cancelled",
    title: "Booking cancelled",
    greet: (n: string) => `Hi ${n},`,
    intro: "we've cancelled your booking.",
    cancelled_for: "Cancelled for",
    refund: "Refund",
    refund_pending: "The refund will appear on your card in 5–7 business days (TWINT refunds may take up to 7 days).",
    rebook: "We'd love to see you again — book a new slot anytime at",
    signoff: "Best,\nCEE Studio",
  },
  fr: {
    preview: "Ta réservation a été annulée",
    title: "Réservation annulée",
    greet: (n: string) => `Bonjour ${n},`,
    intro: "nous avons annulé ta réservation.",
    cancelled_for: "Annulée pour",
    refund: "Remboursement",
    refund_pending: "Le remboursement apparaîtra sur ta carte sous 5 à 7 jours ouvrables (TWINT peut prendre jusqu'à 7 jours).",
    rebook: "À bientôt — réserve un nouveau créneau sur",
    signoff: "À bientôt,\nCEE Studio",
  },
  it: {
    preview: "La tua prenotazione è stata annullata",
    title: "Prenotazione annullata",
    greet: (n: string) => `Ciao ${n},`,
    intro: "abbiamo annullato la tua prenotazione.",
    cancelled_for: "Annullata per",
    refund: "Rimborso",
    refund_pending: "Il rimborso apparirà sulla tua carta entro 5–7 giorni lavorativi (TWINT può richiedere fino a 7 giorni).",
    rebook: "Ci vediamo presto — prenota un nuovo slot su",
    signoff: "A presto,\nCEE Studio",
  },
};

export default function BookingCancellationCustomer(props: Props) {
  const t = T[props.lang];
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ceestudio.ch";

  return (
    <EmailShell preview={t.preview}>
      <H2>{t.title}</H2>
      <Body14>{t.greet(props.name)}</Body14>
      <Body14>{t.intro}</Body14>

      <DataRow label={t.cancelled_for} value={props.startStr} />
      {props.refundStr && <DataRow label={t.refund} value={props.refundStr} />}

      {props.refundStr && (
        <InfoBox>
          <Body14>
            <span style={{ fontSize: 13, color: colors.MUTED }}>{t.refund_pending}</span>
          </Body14>
        </InfoBox>
      )}

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
