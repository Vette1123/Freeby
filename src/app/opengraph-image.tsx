import { ImageResponse } from "next/og";
import {
  BRAND,
  brandBadgeSvg,
  brandHost,
  svgToDataUri,
} from "@/lib/brand";

export const alt =
  "Freeby — clean, fast invoicing and time tracking for freelancers.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const features = ["⏱  Time tracking", "🧾  Invoicing", "💸  Get paid faster"];

export default function OpenGraphImage() {
  const badge = svgToDataUri(brandBadgeSvg({ size: 88, radius: 22 }));

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
          padding: "72px 80px",
          background: BRAND.ink,
          color: "#fafafa",
          fontFamily: "sans-serif",
          overflow: "hidden",
        }}
      >
        {/* Indigo aurora glow — mirrors the site's .bg-aurora utility. */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(900px 520px at 50% -18%, rgba(79,70,229,0.40), transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(680px 520px at 108% 118%, rgba(129,140,248,0.26), transparent 70%)",
          }}
        />
        {/* Subtle grid texture */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        {/* Header: brand lockup */}
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={badge} width={88} height={88} alt="" />
          <span style={{ fontSize: 34, fontWeight: 700, letterSpacing: -0.5 }}>
            {BRAND.name}
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
              marginBottom: 24,
            }}
          >
            Invoicing without the bloat
          </span>
          <span
            style={{
              fontSize: 96,
              fontWeight: 700,
              lineHeight: 1.0,
              letterSpacing: -3.5,
            }}
          >
            Track time.
          </span>
          <span
            style={{
              fontSize: 96,
              fontWeight: 700,
              lineHeight: 1.0,
              letterSpacing: -3.5,
              marginTop: 4,
            }}
          >
            Send invoices.
          </span>
          <span
            style={{
              display: "flex",
              fontSize: 96,
              fontWeight: 700,
              lineHeight: 1.0,
              letterSpacing: -3.5,
              marginTop: 4,
            }}
          >
            <span>Get paid.</span>
            <span style={{ color: BRAND.indigoLight, marginLeft: 16 }}>.</span>
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
                  color: "rgba(250,250,250,0.82)",
                  background: "rgba(255,255,255,0.07)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: 999,
                  padding: "12px 22px",
                }}
              >
                {f}
              </span>
            ))}
          </div>
          <span
            style={{ display: "flex", fontSize: 24, color: BRAND.indigoLight, fontWeight: 600 }}
          >
            {brandHost()}
          </span>
        </div>
      </div>
    ),
    { ...size },
  );
}
