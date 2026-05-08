import { EmailShell, H2, Body14, DataRow, InfoBox, CTAButton, colors } from "./_layout";

type Props = {
  planName: string;
  hoursPerMonth: number;
  priceStr: string;
  magicLink: string;
  accountUrl: string;
};

export default function MembershipWelcome(p: Props) {
  return (
    <EmailShell preview={`Welcome to ${p.planName} — CEE Studio`}>
      <H2>Welcome to {p.planName}</H2>
      <Body14>Your membership is active. Here&apos;s the gist:</Body14>

      <DataRow label="Plan" value={p.planName} />
      <DataRow label="Hours / month" value={`${p.hoursPerMonth}h`} />
      <DataRow label="Price" value={`${p.priceStr} / month`} />

      <InfoBox tone="success">
        <Body14>
          ✓ Your account is set up and the first {p.hoursPerMonth} hours have been added
          to your balance. Click below to sign in and start booking.
        </Body14>
      </InfoBox>

      <CTAButton href={p.magicLink} label="Sign in & book" />

      <Body14 muted>
        If the button above doesn&apos;t work, you can always sign in from{" "}
        <a href={p.accountUrl.replace(/\/account$/, "/login")} style={{ color: colors.BRAND }}>
          ceestudio.ch/login
        </a>{" "}
        with this email — we&apos;ll send a fresh magic link.
      </Body14>

      <Body14 muted>
        Unused hours roll over to the next month (max 1 month). The minimum subscription
        period is 3 months — after that, cancel anytime via your account.
      </Body14>
    </EmailShell>
  );
}
