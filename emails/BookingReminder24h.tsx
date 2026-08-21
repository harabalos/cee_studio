import { Text, Hr } from "@react-email/components";
import { EmailShell, H2, Body14, colors } from "./_layout";

type Props = {
  lang: "de" | "en" | "fr" | "it";
  name: string;
  startStr: string;
  durationHours: number;
  address: string;
  doorCode: string;
  wifiPassword: string;
  premium: boolean;
  manageUrl: string;
};

const WIFI_SSID = "CEE_Studio_5G";
const WIFI_PASS = "Ceestudio00";
const WHATSAPP = "+41 76 240 20 56";

type Section = { icon: string; title: string; body: string };

const T = {
  de: {
    preview: "Erinnerung: Ihr Shooting morgen im CEE Studio",
    greet: (n: string) => (n ? `Guten Tag ${n},` : "Guten Tag,"),
    intro: "vielen Dank für Ihre Buchung. Hier einige Informationen für Ihren Besuch:",
    apptLabel: "Ihr Termin",
    arrival:
      "Sie können gerne bis zu 10 Minuten vor Ihrer gebuchten Zeit eintreffen und bis zu 10 Minuten nach Ihrer Buchung im Studio bleiben.",
    sections: (code: string, premium: boolean): Section[] => [
      {
        icon: "📦",
        title: "Dein Paket",
        body: premium
          ? "Du hast das Premium-Paket gebucht — das Premium-Equipment ist für dich bereitgestellt."
          : "Du hast das Standard-Paket gebucht — nutze bitte das Standard-Equipment im Studio.",
      },
      {
        icon: "🎨",
        title: "Hintergrund wechseln",
        body: "Ein Wechsel des Papierhintergrunds kostet zusätzlich CHF 15 pro verbrauchtem Meter.",
      },
      {
        icon: "📍",
        title: "Adresse",
        body: "CEE Studio\nThurgauerstrasse 117\n8152 Glattpark\n5. Stock, Studio 560",
      },
      {
        icon: "🔑",
        title: "Zugang",
        body: `Der 4-stellige Code (${code}) öffnet die Schlüsselbox neben der Studiotür. Darin befindet sich der Studioschlüssel. Bitte legen Sie den Schlüssel nach Ihrem Termin wieder zurück und verschliessen Sie die Box.`,
      },
      { icon: "📶", title: "WLAN", body: `${WIFI_SSID}\nPasswort: ${WIFI_PASS}` },
      {
        icon: "☕",
        title: "Studio",
        body: "Kaffeemaschine, Trinkwasser, Einwegbecher, Tassen sowie ein Mini-Kühlschrank stehen Ihnen kostenlos zur Verfügung.",
      },
      {
        icon: "🌬️",
        title: "Fenster & Storen",
        body: "Die Storen können über die Schalter neben der Eingangstür bedient werden. Der Fensterschlüssel befindet sich in der zweiten Schublade des weissen Schranks. Ein Ventilator steht ebenfalls zur Verfügung.",
      },
      {
        icon: "🚗",
        title: "Parkieren",
        body: "Vor dem Gebäude stehen kostenpflichtige Parkplätze zur Verfügung. Alternativ befindet sich direkt neben dem Gebäude ein grosser öffentlicher Parkplatz. Die Parkgebühr beträgt CHF 1.50 pro Stunde via Share P App.",
      },
      {
        icon: "🧹",
        title: "Studio verlassen",
        body: "Bitte hinterlassen Sie das Studio ordentlich und in demselben Zustand, wie Sie es vorgefunden haben. Eine Grundreinigung ist nicht erforderlich.",
      },
    ],
    contact: `Falls Sie Fragen haben, können Sie uns jederzeit per WhatsApp unter ${WHATSAPP} kontaktieren.`,
    signoff: "Beste Grüsse\nCEE Studio",
  },
  en: {
    preview: "Reminder: your shoot tomorrow at CEE Studio",
    greet: (n: string) => (n ? `Hello ${n},` : "Hello,"),
    intro: "thank you for your booking. Here is some information for your visit:",
    apptLabel: "Your booking",
    arrival:
      "You are welcome to arrive up to 10 minutes before your booked time and to stay up to 10 minutes after.",
    sections: (code: string, premium: boolean): Section[] => [
      {
        icon: "📦",
        title: "Your package",
        body: premium
          ? "You booked the Premium package — the premium equipment is set up and ready for you."
          : "You booked the Standard package — please use the standard equipment in the studio.",
      },
      {
        icon: "🎨",
        title: "Changing the backdrop",
        body: "Changing the paper backdrop costs an extra CHF 15 per used meter.",
      },
      {
        icon: "📍",
        title: "Address",
        body: "CEE Studio\nThurgauerstrasse 117\n8152 Glattpark\n5th floor, Studio 560",
      },
      {
        icon: "🔑",
        title: "Access",
        body: `The 4-digit code (${code}) opens the key box next to the studio door. The studio key is inside. Please put the key back after your session and lock the box.`,
      },
      { icon: "📶", title: "WiFi", body: `${WIFI_SSID}\nPassword: ${WIFI_PASS}` },
      {
        icon: "☕",
        title: "Studio",
        body: "A coffee machine, drinking water, disposable cups, mugs and a mini fridge are available free of charge.",
      },
      {
        icon: "🌬️",
        title: "Windows & blinds",
        body: "The blinds can be operated via the switches next to the entrance door. The window key is in the second drawer of the white cabinet. A fan is also available.",
      },
      {
        icon: "🚗",
        title: "Parking",
        body: "Paid parking is available in front of the building. Alternatively, there is a large public car park right next to the building. The fee is CHF 1.50 per hour via the Share P app.",
      },
      {
        icon: "🧹",
        title: "Leaving the studio",
        body: "Please leave the studio tidy and in the same condition as you found it. A deep clean is not required.",
      },
    ],
    contact: `If you have any questions, you can reach us anytime on WhatsApp at ${WHATSAPP}.`,
    signoff: "Best regards,\nCEE Studio",
  },
  fr: {
    preview: "Rappel : ton shooting demain au CEE Studio",
    greet: (n: string) => (n ? `Bonjour ${n},` : "Bonjour,"),
    intro: "merci pour ta réservation. Voici quelques informations pour ta visite :",
    apptLabel: "Ta réservation",
    arrival:
      "Tu peux arriver jusqu'à 10 minutes avant l'heure réservée et rester jusqu'à 10 minutes après.",
    sections: (code: string, premium: boolean): Section[] => [
      {
        icon: "📦",
        title: "Ton forfait",
        body: premium
          ? "Tu as réservé le forfait Premium — l'équipement premium est préparé pour toi."
          : "Tu as réservé le forfait Standard — merci d'utiliser l'équipement standard du studio.",
      },
      {
        icon: "🎨",
        title: "Changer de fond",
        body: "Changer le fond en papier coûte CHF 15 supplémentaires par mètre utilisé.",
      },
      {
        icon: "📍",
        title: "Adresse",
        body: "CEE Studio\nThurgauerstrasse 117\n8152 Glattpark\n5ème étage, Studio 560",
      },
      {
        icon: "🔑",
        title: "Accès",
        body: `Le code à 4 chiffres (${code}) ouvre la boîte à clés à côté de la porte du studio. La clé du studio s'y trouve. Merci de remettre la clé après ta séance et de refermer la boîte.`,
      },
      { icon: "📶", title: "WiFi", body: `${WIFI_SSID}\nMot de passe : ${WIFI_PASS}` },
      {
        icon: "☕",
        title: "Studio",
        body: "Une machine à café, de l'eau, des gobelets jetables, des tasses et un mini-réfrigérateur sont à ta disposition gratuitement.",
      },
      {
        icon: "🌬️",
        title: "Fenêtres & stores",
        body: "Les stores se commandent via les interrupteurs à côté de la porte d'entrée. La clé des fenêtres se trouve dans le deuxième tiroir de l'armoire blanche. Un ventilateur est également disponible.",
      },
      {
        icon: "🚗",
        title: "Parking",
        body: "Des places payantes sont disponibles devant le bâtiment. Sinon, un grand parking public se trouve juste à côté. Le tarif est de CHF 1.50 par heure via l'app Share P.",
      },
      {
        icon: "🧹",
        title: "Quitter le studio",
        body: "Merci de laisser le studio propre et dans le même état que tu l'as trouvé. Un nettoyage en profondeur n'est pas nécessaire.",
      },
    ],
    contact: `Pour toute question, tu peux nous contacter à tout moment par WhatsApp au ${WHATSAPP}.`,
    signoff: "Cordialement,\nCEE Studio",
  },
  it: {
    preview: "Promemoria: il tuo shoot domani al CEE Studio",
    greet: (n: string) => (n ? `Ciao ${n},` : "Ciao,"),
    intro: "grazie per la tua prenotazione. Ecco alcune informazioni per la tua visita:",
    apptLabel: "La tua prenotazione",
    arrival:
      "Puoi arrivare fino a 10 minuti prima dell'orario prenotato e rimanere fino a 10 minuti dopo.",
    sections: (code: string, premium: boolean): Section[] => [
      {
        icon: "📦",
        title: "Il tuo pacchetto",
        body: premium
          ? "Hai prenotato il pacchetto Premium — l'attrezzatura premium è pronta per te."
          : "Hai prenotato il pacchetto Standard — utilizza l'attrezzatura standard dello studio.",
      },
      {
        icon: "🎨",
        title: "Cambiare lo sfondo",
        body: "Cambiare lo sfondo di carta costa CHF 15 extra per metro utilizzato.",
      },
      {
        icon: "📍",
        title: "Indirizzo",
        body: "CEE Studio\nThurgauerstrasse 117\n8152 Glattpark\n5° piano, Studio 560",
      },
      {
        icon: "🔑",
        title: "Accesso",
        body: `Il codice a 4 cifre (${code}) apre la cassetta delle chiavi accanto alla porta dello studio. All'interno trovi la chiave dello studio. Per favore rimetti la chiave dopo la sessione e chiudi la cassetta.`,
      },
      { icon: "📶", title: "WiFi", body: `${WIFI_SSID}\nPassword: ${WIFI_PASS}` },
      {
        icon: "☕",
        title: "Studio",
        body: "Macchina del caffè, acqua, bicchieri usa e getta, tazze e un mini-frigo sono a tua disposizione gratuitamente.",
      },
      {
        icon: "🌬️",
        title: "Finestre & tapparelle",
        body: "Le tapparelle si comandano tramite gli interruttori accanto alla porta d'ingresso. La chiave delle finestre è nel secondo cassetto dell'armadio bianco. È disponibile anche un ventilatore.",
      },
      {
        icon: "🚗",
        title: "Parcheggio",
        body: "Davanti all'edificio ci sono parcheggi a pagamento. In alternativa, accanto all'edificio c'è un grande parcheggio pubblico. La tariffa è di CHF 1.50 all'ora tramite l'app Share P.",
      },
      {
        icon: "🧹",
        title: "Lasciare lo studio",
        body: "Per favore lascia lo studio in ordine e nelle stesse condizioni in cui l'hai trovato. Non è richiesta una pulizia profonda.",
      },
    ],
    contact: `Per qualsiasi domanda puoi contattarci in qualsiasi momento su WhatsApp al ${WHATSAPP}.`,
    signoff: "Cordiali saluti,\nCEE Studio",
  },
};

function InfoSection({ icon, title, body }: Section) {
  return (
    <table style={{ width: "100%", borderCollapse: "collapse" as const, margin: "0 0 18px" }}>
      <tbody>
        <tr>
          <td>
            <Text
              style={{
                fontSize: 11,
                color: colors.BRAND,
                textTransform: "uppercase" as const,
                letterSpacing: "0.18em",
                fontWeight: 700,
                margin: "0 0 4px",
              }}
            >
              {icon}&nbsp;&nbsp;{title}
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: colors.FOREGROUND,
                lineHeight: "1.6",
                margin: 0,
                whiteSpace: "pre-line" as const,
              }}
            >
              {body}
            </Text>
          </td>
        </tr>
      </tbody>
    </table>
  );
}

export default function BookingReminder24h(props: Props) {
  const t = T[props.lang];
  const code = props.doorCode || "—";
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(props.address)}`;

  return (
    <EmailShell preview={t.preview}>
      <H2>{t.apptLabel}: {props.startStr} · {props.durationHours}h</H2>
      <Body14>{t.greet(props.name)}</Body14>
      <Body14>{t.intro}</Body14>
      <Body14 muted>
        <span style={{ fontSize: 13 }}>{t.arrival}</span>
      </Body14>

      <Hr style={{ borderColor: colors.ACCENT, borderTop: `1px solid ${colors.ACCENT}`, margin: "20px 0" }} />

      {t.sections(code, props.premium).map((s) => (
        <InfoSection key={s.title} {...s} />
      ))}

      <table style={{ borderCollapse: "collapse" as const, margin: "8px 0 20px" }}>
        <tbody>
          <tr>
            <td>
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
                {props.lang === "de" ? "Wegbeschreibung" : props.lang === "fr" ? "Itinéraire" : props.lang === "it" ? "Indicazioni" : "Directions"} →
              </a>
            </td>
          </tr>
        </tbody>
      </table>

      <Body14 muted>
        <span style={{ fontSize: 13 }}>{t.contact}</span>
      </Body14>
      <Body14 muted>
        <span style={{ whiteSpace: "pre-line" }}>{t.signoff}</span>
      </Body14>
    </EmailShell>
  );
}
