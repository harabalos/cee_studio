import { EmailShell, H2, Body14, DataRow, InfoBox, CTAButton } from "./_layout";

type Props = {
  name: string;
  planName: string;
  hoursAllocated: number;
  hoursRolledOver: number;
  newBalance: number;
  accountUrl: string;
};

export default function MembershipRenewal(p: Props) {
  return (
    <EmailShell preview={`Your CEE Studio ${p.planName} membership has renewed`}>
      <H2>Your membership renewed</H2>
      <Body14>Hi {p.name || "there"},</Body14>
      <Body14>your {p.planName} subscription was successfully renewed.</Body14>

      <DataRow label="Hours added this month" value={`${p.hoursAllocated}h`} />
      {p.hoursRolledOver > 0 && (
        <DataRow label="Rolled over from last month" value={`${p.hoursRolledOver}h`} />
      )}
      <DataRow label="New balance" value={`${p.newBalance}h`} />

      {p.hoursRolledOver > 0 && (
        <InfoBox>
          <Body14>
            Note: rolled-over hours expire 1 month from now. Use them first to maximize value.
          </Body14>
        </InfoBox>
      )}

      <CTAButton href={p.accountUrl} label="View account" />
    </EmailShell>
  );
}
