import { EmailShell, H2, Body14, DataRow, InfoBox, colors } from "./_layout";

type Props = {
  lang: "de" | "en" | "fr" | "it";
  name: string;
  startStr: string;
  durationHours: number;
  address: string;
  doorCode: string;
  wifiPassword: string;
  manageUrl: string;
};

const T = {
  de: {
    preview: "Erinnerung: Dein Shooting morgen im CEE Studio",
    greet: (n: string) => `Hallo ${n},`,
    intro: "kleine Erinnerung an dein Shooting morgen.",
    when: "Datum & Zeit",
    duration: "Dauer",
    where: "Adresse",
    access: "Zugang",
    door_code: "Türcode",
    wifi: "WLAN",
    tips_title: "Tipps für ein reibungsloses Shooting",
    tip1: "Komme pünktlich — die Buchungszeit beginnt zur vereinbarten Stunde",
    tip2: "Parking direkt unter dem Gebäude (Share-P App, 1.50 CHF/h)",
    tip3: "5. Stock — Studio 560 — Aufzug verfügbar",
    questions: "Hast du Fragen oder Probleme? Antworte einfach auf diese E-Mail.",
    manage: "Buchung verwalten",
    directions: "Wegbeschreibung",
    signoff: "Bis morgen,\nCEE Studio",
  },
  en: {
    preview: "Reminder: your shoot tomorrow at CEE Studio",
    greet: (n: string) => `Hi ${n},`,
    intro: "quick reminder about your shoot tomorrow.",
    when: "Date & time",
    duration: "Duration",
    where: "Address",
    access: "Access",
    door_code: "Door code",
    wifi: "WiFi",
    tips_title: "A few tips for a smooth shoot",
    tip1: "Arrive on time — your slot starts at the booked hour",
    tip2: "Parking right next to the building (Share-P app, 1.50 CHF/h)",
    tip3: "5th floor — Studio 560 — elevator available",
    questions: "Any questions or issues? Just reply to this email.",
    manage: "Manage booking",
    directions: "Directions",
    signoff: "See you tomorrow,\nCEE Studio",
  },
  fr: {
    preview: "Rappel : ton shooting demain au CEE Studio",
    greet: (n: string) => `Bonjour ${n},`,
    intro: "petit rappel pour ton shooting demain.",
    when: "Date & heure",
    duration: "Durée",
    where: "Adresse",
    access: "Accès",
    door_code: "Code d'entrée",
    wifi: "WiFi",
    tips_title: "Quelques conseils",
    tip1: "Arrive à l'heure — le créneau commence à l'heure réservée",
    tip2: "Parking à côté du bâtiment (app Share-P, 1.50 CHF/h)",
    tip3: "5ème étage — Studio 560 — ascenseur disponible",
    questions: "Des questions ? Réponds simplement à cet e-mail.",
    manage: "Gérer la réservation",
    directions: "Itinéraire",
    signoff: "À demain,\nCEE Studio",
  },
  it: {
    preview: "Promemoria: il tuo shoot domani al CEE Studio",
    greet: (n: string) => `Ciao ${n},`,
    intro: "promemoria veloce per il tuo shoot domani.",
    when: "Data & orario",
    duration: "Durata",
    where: "Indirizzo",
    access: "Accesso",
    door_code: "Codice porta",
    wifi: "WiFi",
    tips_title: "Alcuni consigli",
    tip1: "Arriva in orario — lo slot inizia all'ora prenotata",
    tip2: "Parcheggio accanto all'edificio (app Share-P, 1.50 CHF/h)",
    tip3: "5° piano — Studio 560 — ascensore disponibile",
    questions: "Domande? Rispondi semplicemente a questa email.",
    manage: "Gestisci prenotazione",
    directions: "Indicazioni",
    signoff: "A domani,\nCEE Studio",
  },
};

export default function BookingReminder24h(props: Props) {
  const t = T[props.lang];
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(props.address)}`;

  return (
    <EmailShell preview={t.preview}>
      <H2>{t.intro.charAt(0).toUpperCase() + t.intro.slice(1)}</H2>
      <Body14>{t.greet(props.name)}</Body14>

      <DataRow label={t.when} value={props.startStr} />
      <DataRow label={t.duration} value={`${props.durationHours}h`} />
      <DataRow label={t.where} value={props.address} />

      {(props.doorCode || props.wifiPassword) && (
        <>
          <Body14 muted>{t.access}</Body14>
          {props.doorCode && <DataRow label={t.door_code} value={props.doorCode} mono />}
          {props.wifiPassword && <DataRow label={t.wifi} value={props.wifiPassword} mono />}
        </>
      )}

      <InfoBox>
        <Body14>
          <strong>{t.tips_title}</strong>
        </Body14>
        <Body14>
          <span style={{ fontSize: 13, color: colors.MUTED }}>
            • {t.tip1}<br />
            • {t.tip2}<br />
            • {t.tip3}
          </span>
        </Body14>
      </InfoBox>

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

      <Body14 muted>
        <span style={{ fontSize: 13 }}>{t.questions}</span>
      </Body14>

      <Body14 muted>
        <span style={{ whiteSpace: "pre-line" }}>{t.signoff}</span>
      </Body14>
    </EmailShell>
  );
}
