import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface EmailLayoutProps {
  preview: string;
  heading: string;
  intro: string;
  buttonText: string;
  url: string;
  footnote: string;
  expiresInLabel?: string;
}

/**
 * Shared transactional-email shell: branded header, white card with a heading,
 * intro copy, a primary CTA, a copy-paste fallback link, and a footer.
 * Uses inline styles for maximum email-client compatibility.
 */
export function EmailLayout({
  preview,
  heading,
  intro,
  buttonText,
  url,
  footnote,
  expiresInLabel = "This link expires in 1 hour.",
}: EmailLayoutProps) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={brandWrap}>
            <Text style={brand}>
              <span style={brandDot}>●</span> Freeby
            </Text>
          </Section>

          <Section style={card}>
            <Heading style={h1}>{heading}</Heading>
            <Text style={paragraph}>{intro}</Text>

            <Section style={buttonWrap}>
              <Button href={url} style={button}>
                {buttonText}
              </Button>
            </Section>

            <Text style={fallbackLabel}>
              Or paste this link into your browser:
            </Text>
            <Link href={url} style={fallbackLink}>
              {url}
            </Link>

            <Hr style={hr} />

            <Text style={footnoteText}>{footnote}</Text>
            <Text style={expiresText}>{expiresInLabel}</Text>
          </Section>

          <Text style={legal}>
            © {new Date().getFullYear()} Freeby · Sent because an
            action was requested for your account.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const main: React.CSSProperties = {
  backgroundColor: "#f4f4f7",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  padding: "32px 12px",
  margin: 0,
};

const container: React.CSSProperties = {
  maxWidth: "520px",
  margin: "0 auto",
};

const brandWrap: React.CSSProperties = {
  padding: "0 0 20px",
};

const brand: React.CSSProperties = {
  fontSize: "16px",
  fontWeight: 700,
  color: "#18181b",
  letterSpacing: "-0.01em",
  margin: 0,
};

const brandDot: React.CSSProperties = {
  color: "#4f46e5",
  marginRight: "6px",
};

const card: React.CSSProperties = {
  backgroundColor: "#ffffff",
  border: "1px solid #ececf1",
  borderRadius: "14px",
  padding: "40px",
  boxShadow: "0 1px 2px rgba(16, 24, 40, 0.04)",
};

const h1: React.CSSProperties = {
  fontSize: "22px",
  fontWeight: 700,
  color: "#18181b",
  letterSpacing: "-0.02em",
  margin: "0 0 12px",
};

const paragraph: React.CSSProperties = {
  fontSize: "15px",
  lineHeight: "24px",
  color: "#51525c",
  margin: "0 0 8px",
};

const buttonWrap: React.CSSProperties = {
  textAlign: "center",
  margin: "32px 0",
};

const button: React.CSSProperties = {
  backgroundColor: "#4f46e5",
  color: "#ffffff",
  fontSize: "15px",
  fontWeight: 600,
  textDecoration: "none",
  padding: "13px 28px",
  borderRadius: "8px",
  display: "inline-block",
};

const fallbackLabel: React.CSSProperties = {
  fontSize: "13px",
  color: "#8a8a94",
  margin: "0 0 4px",
};

const fallbackLink: React.CSSProperties = {
  fontSize: "13px",
  color: "#4f46e5",
  wordBreak: "break-all",
  textDecoration: "none",
};

const hr: React.CSSProperties = {
  borderColor: "#ececf1",
  margin: "28px 0 20px",
};

const footnoteText: React.CSSProperties = {
  fontSize: "13px",
  lineHeight: "20px",
  color: "#8a8a94",
  margin: "0 0 4px",
};

const expiresText: React.CSSProperties = {
  fontSize: "13px",
  color: "#a1a1aa",
  margin: 0,
};

const legal: React.CSSProperties = {
  fontSize: "12px",
  lineHeight: "18px",
  color: "#a1a1aa",
  textAlign: "center",
  margin: "20px 0 0",
};
