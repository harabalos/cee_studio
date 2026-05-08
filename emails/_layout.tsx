/**
 * Shared email layout — used by all transactional templates.
 * Brand: cream background, burgundy accents, serif headlines.
 */
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Heading,
  Text,
  Hr,
  Img,
  Link,
  Preview,
} from "@react-email/components";
import * as React from "react";

const BRAND = "#661414";
const CREAM = "#FDFAF4";
const ACCENT = "#E6CDA3";
const FOREGROUND = "#2A1A1A";
const MUTED = "#7A6A6A";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ceestudio.ch";

export function EmailShell({
  preview,
  children,
  footer,
}: {
  preview: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body
        style={{
          backgroundColor: CREAM,
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif",
          color: FOREGROUND,
          margin: 0,
          padding: 0,
        }}
      >
        <Container style={{ maxWidth: 600, margin: "0 auto", padding: "32px 16px" }}>
          {/* Header band */}
          <Section
            style={{
              backgroundColor: BRAND,
              padding: "32px 40px",
              textAlign: "center" as const,
            }}
          >
            <Heading
              as="h1"
              style={{
                fontFamily: "Georgia, 'Times New Roman', serif",
                color: CREAM,
                fontSize: 32,
                margin: 0,
                letterSpacing: "0.02em",
              }}
            >
              CEE Studio
            </Heading>
            <Text
              style={{
                color: CREAM,
                opacity: 0.85,
                fontSize: 11,
                letterSpacing: "0.3em",
                textTransform: "uppercase" as const,
                margin: "8px 0 0",
              }}
            >
              Glattpark · Zürich
            </Text>
          </Section>

          {/* Body */}
          <Section
            style={{
              backgroundColor: "#FFFFFF",
              padding: "40px 40px 32px",
              borderLeft: `1px solid ${ACCENT}`,
              borderRight: `1px solid ${ACCENT}`,
            }}
          >
            {children}
          </Section>

          {/* Footer */}
          <Section
            style={{
              backgroundColor: "#FFFFFF",
              padding: "24px 40px 32px",
              borderLeft: `1px solid ${ACCENT}`,
              borderRight: `1px solid ${ACCENT}`,
              borderBottom: `1px solid ${ACCENT}`,
            }}
          >
            {footer}
            <Hr style={{ borderColor: ACCENT, borderTop: `1px solid ${ACCENT}`, margin: "16px 0" }} />
            <Text style={{ fontSize: 11, color: MUTED, margin: 0, textAlign: "center" as const }}>
              CEE Studio · Thurgauerstrasse 117, 8152 Glattpark (Opfikon)
            </Text>
            <Text style={{ fontSize: 11, color: MUTED, margin: "4px 0 0", textAlign: "center" as const }}>
              <Link href={SITE_URL} style={{ color: BRAND, textDecoration: "none" }}>
                ceestudio.ch
              </Link>
              {"  ·  "}
              <Link href="https://www.instagram.com/ceestudio.ch/" style={{ color: BRAND, textDecoration: "none" }}>
                @ceestudio.ch
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export const colors = { BRAND, CREAM, ACCENT, FOREGROUND, MUTED };

/* ---------- Reusable building blocks ---------- */

export function H2({ children }: { children: React.ReactNode }) {
  return (
    <Heading
      as="h2"
      style={{
        fontFamily: "Georgia, 'Times New Roman', serif",
        color: BRAND,
        fontSize: 22,
        margin: "0 0 12px",
        fontWeight: 500,
      }}
    >
      {children}
    </Heading>
  );
}

export function Body14({ children, muted = false }: { children: React.ReactNode; muted?: boolean }) {
  return (
    <Text style={{ fontSize: 14, color: muted ? MUTED : FOREGROUND, margin: "0 0 12px", lineHeight: "1.6" }}>
      {children}
    </Text>
  );
}

export function DataRow({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <table style={{ width: "100%", marginBottom: 8, borderCollapse: "collapse" as const }}>
      <tbody>
        <tr>
          <td
            style={{
              width: "40%",
              fontSize: 11,
              color: MUTED,
              textTransform: "uppercase" as const,
              letterSpacing: "0.15em",
              padding: "6px 0",
              verticalAlign: "top" as const,
            }}
          >
            {label}
          </td>
          <td
            style={{
              fontSize: 15,
              fontWeight: 600,
              padding: "6px 0",
              fontFamily: mono ? "ui-monospace, SFMono-Regular, Menlo, monospace" : undefined,
            }}
          >
            {value}
          </td>
        </tr>
      </tbody>
    </table>
  );
}

export function InfoBox({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "success" | "warning";
}) {
  const bg = tone === "success" ? "#F0F7F0" : tone === "warning" ? "#FFF5E1" : "#F5EFE6";
  const border = tone === "success" ? "#9AB89A" : tone === "warning" ? "#D4A95E" : ACCENT;
  return (
    <Section
      style={{
        backgroundColor: bg,
        border: `1px solid ${border}`,
        padding: 20,
        margin: "24px 0",
      }}
    >
      {children}
    </Section>
  );
}

export function CTAButton({ href, label }: { href: string; label: string }) {
  return (
    <table style={{ borderCollapse: "collapse" as const, margin: "24px 0" }}>
      <tbody>
        <tr>
          <td>
            <a
              href={href}
              style={{
                display: "inline-block",
                backgroundColor: BRAND,
                color: CREAM,
                padding: "14px 28px",
                fontSize: 12,
                textDecoration: "none",
                textTransform: "uppercase" as const,
                letterSpacing: "0.2em",
                fontWeight: 600,
                border: `1px solid ${BRAND}`,
              }}
            >
              {label}
            </a>
          </td>
        </tr>
      </tbody>
    </table>
  );
}
