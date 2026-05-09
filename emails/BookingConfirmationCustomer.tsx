import { EmailShell, H2, Body14, DataRow, InfoBox, CTAButton, colors } from "./_layout";

type Props = {
  lang: "de" | "en" | "fr" | "it";
  name: string;
  startStr: string;
  endStr: string;
  durationHours: number;
  totalStr: string;
  address: string;
  doorCode: string;
  wifiPassword: string;
  manageUrl: string;
  accountUrl: string;
};

const T = {
  de: {
    preview: "Deine Buchung im CEE Studio ist bestätigt",
    greet: (n: string) => `Hallo ${n},`,
    intro: "deine Buchung im CEE Studio ist bestätigt.",
    details: "Buchungsdetails",
    when: "Datum & Zeit",
    duration: "Dauer",
    where: "Adresse",
    paid: "Bezahlt",
    access: "Zugang am Tag des Shootings",
    door_code: "Türcode",
    wifi: "WLAN-Passwort",
    no_codes: "Den Türcode senden wir dir 24h vor dem Termin separat zu.",
    manage: "Buchung verwalten",
    directions: "Wegbeschreibung öffnen",
    account_title: "Konto erstellen",
    account_body: "Sieh alle deine Buchungen, verwalte dein ABO und buche schneller. Kein Passwort nötig.",
    account_cta: "Anmelden →",
    questions_title: "Fragen?",
    questions: "Antworte einfach auf diese E-Mail. Wir helfen gerne.",
    cancellation_title: "Stornierung",
    cancellation: "Werktage über den \"Buchung verwalten\" Link bis 48h vor Beginn. Wochenend-Buchungen sind nicht stornierbar.",
    signoff: "Bis bald,\nCEE Studio",
  },
  en: {
    preview: "Your CEE Studio booking is confirmed",
    greet: (n: string) => `Hi ${n},`,
    intro: "your CEE Studio booking is confirmed.",
    details: "Booking details",
    when: "Date & time",
    duration: "Duration",
    where: "Address",
    paid: "Paid",
    access: "Access on shoot day",
    door_code: "Door code",
    wifi: "WiFi password",
    no_codes: "We'll send the door code 24h before your booking.",
    manage: "Manage booking",
    directions: "Open directions",
    account_title: "Create your account",
    account_body: "See all your bookings, manage your membership, and book faster next time. No password — just your email.",
    account_cta: "Sign in →",
    questions_title: "Questions?",
    questions: "Just reply to this email — we're happy to help.",
    cancellation_title: "Cancellation",
    cancellation: "Weekdays via \"Manage booking\" link, up to 48h before. Weekend bookings are non-cancellable.",
    signoff: "See you soon,\nCEE Studio",
  },
  fr: {
    preview: "Ta réservation au CEE Studio est confirmée",
    greet: (n: string) => `Bonjour ${n},`,
    intro: "ta réservation au CEE Studio est confirmée.",
    details: "Détails de la réservation",
    when: "Date & heure",
    duration: "Durée",
    where: "Adresse",
    paid: "Payé",
    access: "Accès le jour du shooting",
    door_code: "Code d'entrée",
    wifi: "Mot de passe WiFi",
    no_codes: "Nous t'enverrons le code d'entrée 24h avant la réservation.",
    manage: "Gérer la réservation",
    directions: "Voir l'itinéraire",
    account_title: "Crée ton compte",
    account_body: "Vois toutes tes réservations, gère ton abonnement et réserve plus vite. Sans mot de passe.",
    account_cta: "Connexion →",
    questions_title: "Questions ?",
    questions: "Réponds simplement à cet e-mail.",
    cancellation_title: "Annulation",
    cancellation: "En semaine via le lien \"Gérer la réservation\", jusqu'à 48h avant. Les réservations du week-end ne sont pas annulables.",
    signoff: "À bientôt,\nCEE Studio",
  },
  it: {
    preview: "La tua prenotazione al CEE Studio è confermata",
    greet: (n: string) => `Ciao ${n},`,
    intro: "la tua prenotazione al CEE Studio è confermata.",
    details: "Dettagli della prenotazione",
    when: "Data & orario",
    duration: "Durata",
    where: "Indirizzo",
    paid: "Pagato",
    access: "Accesso il giorno dello shoot",
    door_code: "Codice porta",
    wifi: "Password WiFi",
    no_codes: "Ti invieremo il codice porta 24h prima della prenotazione.",
    manage: "Gestisci prenotazione",
    directions: "Apri indicazioni",
    account_title: "Crea il tuo account",
    account_body: "Vedi tutte le tue prenotazioni, gestisci il tuo abbonamento e prenota più veloce. Senza password.",
    account_cta: "Accedi →",
    questions_title: "Domande?",
    questions: "Rispondi semplicemente a questa email.",
    cancellation_title: "Annullamento",
    cancellation: "Nei giorni feriali tramite il link \"Gestisci prenotazione\", fino a 48h prima. Le prenotazioni del weekend non sono annullabili.",
    signoff: "A presto,\nCEE Studio",
  },
};

export default function BookingConfirmationCustomer(props: Props) {
  const t = T[props.lang];
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(props.address)}`;

  return (
    <EmailShell preview={t.preview}>
      <H2>{t.intro.charAt(0).toUpperCase() + t.intro.slice(1)}</H2>
      <Body14>{t.greet(props.name)}</Body14>

      {/* Confirmation badge */}
      <InfoBox tone="success">
        <Body14>
          ✓ <strong>{t.intro}</strong>
        </Body14>
      </InfoBox>

      {/* Booking details */}
      <Body14 muted>{t.details}</Body14>
      <DataRow label={t.when} value={`${props.startStr} – ${props.endStr}`} />
      <DataRow label={t.duration} value={`${props.durationHours}h`} />
      <DataRow label={t.where} value={props.address} />
      <DataRow label={t.paid} value={props.totalStr} />

      {/* Access info */}
      <Body14 muted>{t.access}</Body14>
      {props.doorCode ? (
        <>
          <DataRow label={t.door_code} value={props.doorCode} mono />
          {props.wifiPassword ? <DataRow label={t.wifi} value={props.wifiPassword} mono /> : null}
        </>
      ) : (
        <Body14 muted>{t.no_codes}</Body14>
      )}

      {/* CTAs */}
      <table style={{ width: "100%", borderCollapse: "collapse" as const, marginTop: 24 }}>
        <tbody>
          <tr>
            <td style={{ paddingRight: 8 }}>
              <a
                href={props.manageUrl}
                style={{
                  display: "inline-block",
                  backgroundColor: colors.BRAND,
                  color: colors.CREAM,
                  padding: "12px 22px",
                  fontSize: 11,
                  textDecoration: "none",
                  textTransform: "uppercase" as const,
                  letterSpacing: "0.2em",
                  fontWeight: 600,
                }}
              >
                {t.manage}
              </a>
            </td>
            <td style={{ paddingLeft: 8 }}>
              <a
                href={mapsUrl}
                style={{
                  display: "inline-block",
                  backgroundColor: "transparent",
                  color: colors.BRAND,
                  padding: "12px 22px",
                  fontSize: 11,
                  textDecoration: "none",
                  textTransform: "uppercase" as const,
                  letterSpacing: "0.2em",
                  fontWeight: 600,
                  border: `1px solid ${colors.BRAND}`,
                }}
              >
                {t.directions} →
              </a>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Account / sign-in CTA */}
      <InfoBox>
        <Body14>
          <strong>{t.account_title}</strong>
          <br />
          <span style={{ fontSize: 13, color: colors.MUTED }}>{t.account_body}</span>
        </Body14>
        <table style={{ marginTop: 12, borderCollapse: "collapse" as const }}>
          <tbody>
            <tr>
              <td>
                <a
                  href={props.accountUrl}
                  style={{
                    display: "inline-block",
                    backgroundColor: colors.BRAND,
                    color: colors.CREAM,
                    padding: "10px 18px",
                    fontSize: 11,
                    textDecoration: "none",
                    textTransform: "uppercase" as const,
                    letterSpacing: "0.2em",
                    fontWeight: 600,
                  }}
                >
                  {t.account_cta}
                </a>
              </td>
            </tr>
          </tbody>
        </table>
      </InfoBox>

      {/* Cancellation note */}
      <InfoBox>
        <Body14>
          <strong>{t.cancellation_title}</strong>
          <br />
          <span style={{ fontSize: 13, color: colors.MUTED }}>{t.cancellation}</span>
        </Body14>
      </InfoBox>

      {/* Signoff */}
      <Body14>
        <strong>{t.questions_title}</strong>
        <br />
        <span style={{ fontSize: 13, color: colors.MUTED }}>{t.questions}</span>
      </Body14>

      <Body14 muted>
        <span style={{ whiteSpace: "pre-line" }}>{t.signoff}</span>
      </Body14>
    </EmailShell>
  );
}

// Re-export for type checker
export { CTAButton };
