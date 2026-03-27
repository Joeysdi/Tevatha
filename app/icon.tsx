import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 6,
          background: "#05080a",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <circle cx="16" cy="16" r="11" stroke="#c9a84c" strokeWidth="0.75" strokeOpacity="0.3" />
          <path d="M 16 5 A 11 11 0 0 0 8.22 8.22" stroke="#e84040" strokeWidth="4.5" strokeLinecap="round" strokeOpacity="0.18" />
          <path d="M 16 5 A 11 11 0 0 0 8.22 8.22" stroke="#e84040" strokeWidth="2.2" strokeLinecap="round" />
          <line x1="16" y1="16" x2="10" y2="10" stroke="#c9a84c" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="16" cy="5" r="1.5" fill="#e84040" />
          <circle cx="16" cy="16" r="1.5" fill="#c9a84c" />
        </svg>
      </div>
    ),
    { ...size },
  );
}
