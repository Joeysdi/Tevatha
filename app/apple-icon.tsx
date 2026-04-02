import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          borderRadius: 36,
          background: "#05080a",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg width="140" height="140" viewBox="0 0 100 100" fill="none">
          {/* Outer glow ring */}
          <circle cx="50" cy="50" r="44" stroke="#c9a84c" strokeWidth="0.5" strokeOpacity="0.2" />
          {/* Main clock ring */}
          <circle cx="50" cy="50" r="38" stroke="#c9a84c" strokeWidth="1.5" strokeOpacity="0.4" />
          {/* Danger arc glow */}
          <path
            d="M 50 12 A 38 38 0 0 0 23.1 23.1"
            stroke="#e84040"
            strokeWidth="10"
            strokeLinecap="round"
            strokeOpacity="0.15"
          />
          {/* Danger arc */}
          <path
            d="M 50 12 A 38 38 0 0 0 23.1 23.1"
            stroke="#e84040"
            strokeWidth="5"
            strokeLinecap="round"
          />
          {/* Clock hand */}
          <line x1="50" y1="50" x2="30" y2="30" stroke="#c9a84c" strokeWidth="3.5" strokeLinecap="round" />
          {/* Short second hand */}
          <line x1="50" y1="50" x2="50" y2="18" stroke="#c9a84c" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.4" />
          {/* 12 o'clock marker */}
          <circle cx="50" cy="12" r="4" fill="#e84040" />
          {/* Center pin */}
          <circle cx="50" cy="50" r="4" fill="#c9a84c" />
          {/* Hour markers */}
          <circle cx="50" cy="14" r="1.2" fill="#c9a84c" fillOpacity="0.3" />
          <circle cx="86" cy="50" r="1.2" fill="#c9a84c" fillOpacity="0.3" />
          <circle cx="50" cy="86" r="1.2" fill="#c9a84c" fillOpacity="0.3" />
          <circle cx="14" cy="50" r="1.2" fill="#c9a84c" fillOpacity="0.3" />
        </svg>
      </div>
    ),
    { ...size },
  );
}
