import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#661414", // Burgundy Brand Color
          borderRadius: "8px", // Squircle shape
        }}
      >
        <div
          style={{
            position: "relative",
            width: "18px",
            height: "18px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Inner Lens */}
          <div
            style={{
              position: "absolute",
              width: "14px",
              height: "14px",
              border: "1.5px solid #FDFAF4",
              borderRadius: "50%",
            }}
          />
          {/* Focus Point */}
          <div
            style={{
              position: "absolute",
              width: "4px",
              height: "4px",
              background: "#FDFAF4",
              borderRadius: "50%",
            }}
          />
        </div>
      </div>
    ),
    { ...size }
  );
}
