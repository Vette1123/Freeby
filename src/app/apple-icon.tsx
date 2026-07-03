import { ImageResponse } from "next/og";
import { brandBadgeSvg, svgToDataUri } from "@/lib/brand";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// Full-bleed mark — iOS applies its own rounded-corner mask, so no radius here.
export default function AppleIcon() {
  const badge = svgToDataUri(brandBadgeSvg({ size: 180, radius: 0 }));

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={badge} width={180} height={180} alt="Freeby" />
      </div>
    ),
    { ...size },
  );
}
