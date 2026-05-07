import { Html, Head, Body, Container, Heading, Text, Tailwind, Preview } from "@react-email/components";

type Props = { name: string; email: string; phone: string; startStr: string };

export default function BookingCancellationOwner(p: Props) {
  return (
    <Html>
      <Head />
      <Preview>Stornierung — {p.startStr}</Preview>
      <Tailwind>
        <Body style={{ backgroundColor: "#FDFAF4", fontFamily: "Helvetica, Arial, sans-serif", color: "#2A1A1A" }}>
          <Container style={{ maxWidth: 560, margin: "40px auto", padding: 32, backgroundColor: "#FFFFFF", border: "1px solid #E6CDA3" }}>
            <Heading style={{ fontFamily: "Georgia, serif", color: "#661414", fontSize: 22, margin: 0 }}>
              Buchung storniert
            </Heading>
            <Text style={{ marginTop: 16, fontSize: 14 }}>
              <strong>{p.name}</strong> ({p.email}, {p.phone}) hat die Buchung am <strong>{p.startStr}</strong> storniert.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
