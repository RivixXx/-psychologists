import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 40,
          background: "linear-gradient(145deg, #f4faf7 0%, #cfe7df 100%)",
        }}
      >
        <div style={{ position: "relative", width: 120, height: 126, display: "flex" }}>
          <div
            style={{
              position: "absolute",
              left: 8,
              top: 22,
              width: 73,
              height: 94,
              borderRadius: "50%",
              transform: "rotate(-24deg)",
              background: "linear-gradient(145deg, #83cabe, #24796f)",
              boxShadow: "inset 5px 5px 12px rgba(255,255,255,.65), 0 8px 16px rgba(25,85,73,.18)",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 43,
              top: 10,
              width: 71,
              height: 94,
              borderRadius: "50%",
              transform: "rotate(24deg)",
              background: "linear-gradient(145deg, #c3e9df, #55a89c)",
              boxShadow: "inset 5px 5px 12px rgba(255,255,255,.72), 0 8px 16px rgba(25,85,73,.15)",
            }}
          />
        </div>
      </div>
    ),
    { ...size },
  );
}
