import { EmailShell, H2, Body14, DataRow, CTAButton } from "./_layout";

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
  premium: boolean;
  manageUrl: string;
};

export default function BookingConfirmationOwner(p: Props) {
  return (
    <EmailShell preview={`New booking — ${p.startStr} · ${p.totalStr}`}>
      <H2>New booking</H2>
      <Body14 muted>A new booking just came in.</Body14>

      <DataRow label="When" value={`${p.startStr} – ${p.endStr}`} />
      <DataRow label="Duration" value={`${p.durationHours}h`} />
      <DataRow label="Package" value={p.premium ? "⚡ PREMIUM EQUIPMENT (+CHF 50) — prepare the premium set" : "Standard"} />
      <DataRow label="Total" value={p.totalStr} />
      <DataRow label="Payment" value={p.paymentMethod} />

      <Body14 muted>Customer</Body14>
      <DataRow label="Name" value={p.name} />
      {p.email && <DataRow label="Email" value={p.email} />}
      {p.phone && <DataRow label="Phone" value={p.phone} mono />}
      {p.company && <DataRow label="Company" value={p.company} />}
      {p.shootType && <DataRow label="Shoot type" value={p.shootType} />}

      <CTAButton href={p.manageUrl} label="Open in admin" />
    </EmailShell>
  );
}
