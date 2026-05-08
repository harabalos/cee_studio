import { EmailShell, H2, Body14, InfoBox, CTAButton, colors } from "./_layout";

type Props = { name: string; accountUrl: string };

export default function MembershipPaymentFailed(p: Props) {
  return (
    <EmailShell preview="Payment failed for your CEE Studio membership">
      <H2>We couldn&apos;t process your payment</H2>
      <Body14>Hi {p.name || "there"},</Body14>
      <Body14>your most recent CEE Studio subscription payment didn&apos;t go through.</Body14>

      <InfoBox tone="warning">
        <Body14>
          <span style={{ color: colors.MUTED, fontSize: 13 }}>
            Stripe will retry automatically over the next few days. To avoid interruption,
            update your payment method now via the customer portal.
          </span>
        </Body14>
      </InfoBox>

      <CTAButton href={p.accountUrl} label="Update payment method" />

      <Body14 muted>
        If the issue persists, your subscription will be paused. You can reactivate
        anytime by completing payment.
      </Body14>
    </EmailShell>
  );
}
