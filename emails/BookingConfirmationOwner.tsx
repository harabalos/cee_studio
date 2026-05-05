import { Html, Head, Body, Container, Heading, Text, Section, Button, Tailwind, Preview } from "@react-email/components";

type Props = {
  name: string;
  email: string;
  phone: string;
  company: string;
  shootType: string;
  startStr: string;
  endStr: string;
  durationHours: number;
  totalStr: string;
  paymentMethod: string;
  manageUrl: string;
};

export default function BookingConfirmationOwner(p: Props) {
  return (
    <Html>
      <Head />
      <Preview>Neue Buchung — {p.startStr} · {p.totalStr}</Preview>
      <Tailwind>
        <Body style={{ backgroundColor: "#FDFAF4", fontFamily: "Helvetica, Arial, sans-serif", color: "#2A1A1A" }}>
          <Container style={{ maxWidth: 560, margin: "40px auto", padding: 32, backgroundColor: "#FFFFFF", border: "1px solid #E6CDA3" }}>
            <Heading style={{ fontFamily: "Georgia, serif", color: "#661414", fontSize: 24, margin: 0 }}>
              Neue Buchung
            </Heading>

            <Section style={{ marginTop: 24 }}>
              <KV k="Wann" v={`${p.startStr} – ${p.endStr}`} />
              <KV k="Dauer" v={`${p.durationHours}h`} />
              <KV k="Total" v={`${p.totalStr} (${p.paymentMethod})`} />
            </Section>

            <Heading as="h2" style={{ marginTop: 32, fontSize: 16, fontFamily: "Georgia, serif", color: "#661414" }}>
              Kunde
            </Heading>
            <Section>
              <KV k="Name" v={p.name} />
              <KV k="E-Mail" v={p.email} />
              <KV k="Telefon" v={p.phone} />
              {p.company ? <KV k="Firma" v={p.company} /> : null}
              {p.shootType ? <KV k="Shoot Type" v={p.shootType} /> : null}
            </Section>

            <Section style={{ marginTop: 32 }}>
              <Button href={p.manageUrl} style={{ backgroundColor: "#661414", color: "#FDFAF4", padding: "10px 20px", fontSize: 13, textDecoration: "none", textTransform: "uppercase", letterSpacing: "0.15em" }}>
                Im Admin öffnen
              </Button>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

function KV({ k, v }: { k: string; v: string }) {
  return (
    <Text style={{ margin: "4px 0", fontSize: 14 }}>
      <span style={{ fontSize: 11, color: "#5A3A3A", textTransform: "uppercase", letterSpacing: "0.1em" }}>{k}: </span>
      <strong>{v}</strong>
    </Text>
  );
}
