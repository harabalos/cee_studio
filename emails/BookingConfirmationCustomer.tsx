import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Heading,
  Text,
  Button,
  Hr,
  Preview,
  Tailwind,
} from "@react-email/components";

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
};

const T = {
  de: {
    preview: "Deine Buchung im CEE Studio ist bestätigt",
    greet: (n: string) => `Hallo ${n},`,
    confirmed: "Deine Buchung im CEE Studio ist bestätigt.",
    when: "Wann",
    duration: "Dauer",
    where: "Wo",
    paid: "Bezahlt",
    arrival_info: "Anfahrt & Zugang",
    door_code: "Türcode",
    wifi: "WLAN-Passwort",
    no_codes: "Den Türcode senden wir dir 24h vor dem Termin separat zu.",
    manage: "Buchung verwalten",
    questions: "Fragen? Antworte einfach auf diese E-Mail.",
    signoff: "Bis bald!\nCEE Studio",
  },
  en: {
    preview: "Your CEE Studio booking is confirmed",
    greet: (n: string) => `Hi ${n},`,
    confirmed: "Your CEE Studio booking is confirmed.",
    when: "When",
    duration: "Duration",
    where: "Where",
    paid: "Paid",
    arrival_info: "Arrival & Access",
    door_code: "Door code",
    wifi: "WiFi password",
    no_codes: "We'll send the door code 24h before your booking.",
    manage: "Manage booking",
    questions: "Questions? Just reply to this email.",
    signoff: "See you soon!\nCEE Studio",
  },
  fr: {
    preview: "Ta réservation au CEE Studio est confirmée",
    greet: (n: string) => `Bonjour ${n},`,
    confirmed: "Ta réservation au CEE Studio est confirmée.",
    when: "Quand",
    duration: "Durée",
    where: "Où",
    paid: "Payé",
    arrival_info: "Arrivée & Accès",
    door_code: "Code d'entrée",
    wifi: "Mot de passe WiFi",
    no_codes: "Nous t'enverrons le code d'entrée 24h avant la réservation.",
    manage: "Gérer la réservation",
    questions: "Questions ? Réponds simplement à cet e-mail.",
    signoff: "À bientôt !\nCEE Studio",
  },
  it: {
    preview: "La tua prenotazione al CEE Studio è confermata",
    greet: (n: string) => `Ciao ${n},`,
    confirmed: "La tua prenotazione al CEE Studio è confermata.",
    when: "Quando",
    duration: "Durata",
    where: "Dove",
    paid: "Pagato",
    arrival_info: "Arrivo & Accesso",
    door_code: "Codice porta",
    wifi: "Password WiFi",
    no_codes: "Ti invieremo il codice porta 24h prima della prenotazione.",
    manage: "Gestisci prenotazione",
    questions: "Domande? Rispondi a questa email.",
    signoff: "A presto!\nCEE Studio",
  },
};

export default function BookingConfirmationCustomer(props: Props) {
  const t = T[props.lang];
  return (
    <Html>
      <Head />
      <Preview>{t.preview}</Preview>
      <Tailwind>
        <Body style={{ backgroundColor: "#FDFAF4", fontFamily: "Helvetica, Arial, sans-serif", color: "#2A1A1A" }}>
          <Container style={{ maxWidth: 560, margin: "40px auto", padding: 32, backgroundColor: "#FFFFFF", border: "1px solid #E6CDA3" }}>
            <Heading style={{ fontFamily: "Georgia, serif", color: "#661414", fontSize: 28, margin: 0 }}>
              CEE Studio
            </Heading>
            <Text style={{ marginTop: 24, fontSize: 16 }}>{t.greet(props.name)}</Text>
            <Text style={{ fontSize: 16 }}>{t.confirmed}</Text>

            <Section style={{ backgroundColor: "#F5EFE6", padding: 16, marginTop: 24 }}>
              <Row label={t.when} value={`${props.startStr} – ${props.endStr}`} />
              <Row label={t.duration} value={`${props.durationHours}h`} />
              <Row label={t.where} value={props.address} />
              <Row label={t.paid} value={props.totalStr} />
            </Section>

            <Hr style={{ borderColor: "#E6CDA3", margin: "24px 0" }} />

            <Heading as="h2" style={{ fontSize: 18, fontFamily: "Georgia, serif", color: "#661414" }}>
              {t.arrival_info}
            </Heading>
            {props.doorCode ? (
              <>
                <Row label={t.door_code} value={props.doorCode} />
                {props.wifiPassword ? <Row label={t.wifi} value={props.wifiPassword} /> : null}
              </>
            ) : (
              <Text style={{ fontSize: 14, color: "#5A3A3A" }}>{t.no_codes}</Text>
            )}

            <Section style={{ marginTop: 32 }}>
              <Button
                href={props.manageUrl}
                style={{
                  backgroundColor: "#661414",
                  color: "#FDFAF4",
                  padding: "12px 24px",
                  fontSize: 14,
                  textDecoration: "none",
                  textTransform: "uppercase",
                  letterSpacing: "0.15em",
                }}
              >
                {t.manage}
              </Button>
            </Section>

            <Text style={{ marginTop: 24, fontSize: 13, color: "#5A3A3A" }}>{t.questions}</Text>
            <Text style={{ marginTop: 16, fontSize: 13, whiteSpace: "pre-line" }}>{t.signoff}</Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <table style={{ width: "100%", marginBottom: 6 }}>
      <tbody>
        <tr>
          <td style={{ width: "35%", fontSize: 12, color: "#5A3A3A", textTransform: "uppercase", letterSpacing: "0.1em" }}>{label}</td>
          <td style={{ fontSize: 14, fontWeight: 600 }}>{value}</td>
        </tr>
      </tbody>
    </table>
  );
}
