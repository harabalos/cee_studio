import { Html, Head, Body, Container, Heading, Text, Tailwind, Preview } from "@react-email/components";

type Props = {
  lang: "de" | "en" | "fr" | "it";
  name: string;
  startStr: string;
  refundStr: string | null;
};

const T = {
  de: { preview: "Buchung storniert", title: "Buchung storniert", greet: (n: string) => `Hallo ${n},`, body: (s: string) => `Deine Buchung am ${s} wurde storniert.`, refund: (r: string) => `Rückerstattung: ${r}`, signoff: "CEE Studio" },
  en: { preview: "Booking cancelled", title: "Booking cancelled", greet: (n: string) => `Hi ${n},`, body: (s: string) => `Your booking on ${s} has been cancelled.`, refund: (r: string) => `Refund: ${r}`, signoff: "CEE Studio" },
  fr: { preview: "Réservation annulée", title: "Réservation annulée", greet: (n: string) => `Bonjour ${n},`, body: (s: string) => `Ta réservation du ${s} a été annulée.`, refund: (r: string) => `Remboursement : ${r}`, signoff: "CEE Studio" },
  it: { preview: "Prenotazione annullata", title: "Prenotazione annullata", greet: (n: string) => `Ciao ${n},`, body: (s: string) => `La tua prenotazione del ${s} è stata annullata.`, refund: (r: string) => `Rimborso: ${r}`, signoff: "CEE Studio" },
};

export default function BookingCancellationCustomer(p: Props) {
  const t = T[p.lang];
  return (
    <Html>
      <Head />
      <Preview>{t.preview}</Preview>
      <Tailwind>
        <Body style={{ backgroundColor: "#FDFAF4", fontFamily: "Helvetica, Arial, sans-serif", color: "#2A1A1A" }}>
          <Container style={{ maxWidth: 560, margin: "40px auto", padding: 32, backgroundColor: "#FFFFFF", border: "1px solid #E6CDA3" }}>
            <Heading style={{ fontFamily: "Georgia, serif", color: "#661414", fontSize: 24, margin: 0 }}>{t.title}</Heading>
            <Text style={{ marginTop: 24, fontSize: 15 }}>{t.greet(p.name)}</Text>
            <Text style={{ fontSize: 15 }}>{t.body(p.startStr)}</Text>
            {p.refundStr ? <Text style={{ fontSize: 15 }}>{t.refund(p.refundStr)}</Text> : null}
            <Text style={{ marginTop: 24, fontSize: 13 }}>{t.signoff}</Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
