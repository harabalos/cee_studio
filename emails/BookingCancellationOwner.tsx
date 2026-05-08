import { EmailShell, H2, Body14, DataRow } from "./_layout";

type Props = { name: string; email: string; phone: string; startStr: string };

export default function BookingCancellationOwner(p: Props) {
  return (
    <EmailShell preview={`Cancellation — ${p.startStr}`}>
      <H2>Booking cancelled</H2>
      <Body14 muted>
        <strong>{p.name}</strong> has cancelled their booking.
      </Body14>

      <DataRow label="Slot" value={p.startStr} />
      <DataRow label="Customer" value={p.name} />
      {p.email && <DataRow label="Email" value={p.email} />}
      {p.phone && <DataRow label="Phone" value={p.phone} mono />}
    </EmailShell>
  );
}
