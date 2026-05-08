import { EmailShell, H2, Body14, DataRow, CTAButton } from "./_layout";

type Props = { name: string; balance: number; renewsOn: string; accountUrl: string };

export default function MembershipLowBalance(p: Props) {
  return (
    <EmailShell preview="Your CEE Studio hours are running low">
      <H2>Hours running low</H2>
      <Body14>Hi {p.name || "there"},</Body14>
      <Body14>just a heads-up — your hour balance is below 2h.</Body14>

      <DataRow label="Current balance" value={`${p.balance}h`} />
      <DataRow label="Next renewal" value={p.renewsOn} />

      <Body14 muted>
        You can either book your remaining hours now, or wait for renewal — your
        next monthly allocation will refill your balance automatically.
      </Body14>

      <CTAButton href={p.accountUrl} label="View account" />
    </EmailShell>
  );
}
