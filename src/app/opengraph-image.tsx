import { ImageResponse } from "next/og";
import { BRAND, brandBadgeSvg, svgToDataUri } from "@/lib/brand";

export const alt =
  "Freeby — clean, fast invoicing and time tracking for freelancers.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const features = ["Time tracking", "Invoicing", "Get paid faster"];

export default function OpenGraphImage() {
  const badge = svgToDataUri(brandBadgeSvg({ size: 76, radius: 20 }));

  return new ImageResponse(
    (
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          background: BRAND.ink,
          color: "#fafafa",
          fontFamily: "sans-serif",
          overflow: "hidden",
        }}
      >
        {/* Indigo aurora glow — mirrors the .bg-aurora utility on the site. */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(900px 520px at 50% -18%, rgba(79,70,229,0.36), transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(680px 520px at 108% 118%, rgba(129,140,248,0.24), transparent 70%)",
          }}
        />

        {/* Header: brand lockup + version pill */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={badge} width={76} height={76} alt="" />
            <span
              style={{ fontSize: 30, fontWeight: 600, letterSpacing: -0.5 }}
            >
              {BRAND.name}
            </span>
          </div>
          <span
            style={{
              display: "flex",
              fontSize: 22,
              color: "rgba(250,250,250,0.62)",
              border: "1px solid rgba(255,255,255,0.14)",
              borderRadius: 999,
              padding: "10px 22px",
            }}
          >
            For freelancers
          </span>
        </div>

        {/* Headline block */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span
            style={{
              display: "flex",
              fontSize: 22,
              fontWeight: 600,
              letterSpacing: 4,
              textTransform: "uppercase",
              color: BRAND.indigoLight,
              marginBottom: 22,
            }}
          >
            Invoicing without the bloat
          </span>
          <span
            style={{
              fontSize: 92,
              fontWeight: 700,
              lineHeight: 1.02,
              letterSpacing: -3,
            }}
          >
            Track time. Send invoices. Get paid.
          </span>
          <span
            style={{
              fontSize: 30,
              lineHeight: 1.4,
              color: "rgba(250,250,250,0.64)",
              marginTop: 26,
              maxWidth: 920,
            }}
          >
            One unbroken flow from a running timer to a paid invoice — built for
            freelancers who hate FreshBooks.
          </span>
        </div>

        {/* Footer: feature chips + site */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", gap: 14 }}>
            {features.map((f) => (
              <span
                key={f}
                style={{
                  display: "flex",
                  fontSize: 22,
                  color: "rgba(250,250,250,0.78)",
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: 999,
                  padding: "10px 22px",
                }}
              >
                {f}
              </span>
            ))}
          </div>
          <span
            style={{ display: "flex", fontSize: 24, color: BRAND.indigoLight }}
          >
            freeby.app
          </span>
        </div>
      </div>
    ),
    { ...size },
  );
}
