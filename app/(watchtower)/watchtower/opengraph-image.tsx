import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Tevatha Watchtower — Global Threat Intelligence Dashboard";

export default function WatchtowerOGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          background: "#05080a",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "60px 72px",
          fontFamily: "sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background grid */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(201,168,76,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.04) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        {/* Red radial glow — top right */}
        <div
          style={{
            position: "absolute",
            top: -120,
            right: -120,
            width: 600,
            height: 600,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(232,64,64,0.18) 0%, transparent 65%)",
          }}
        />

        {/* Gold radial glow — bottom left */}
        <div
          style={{
            position: "absolute",
            bottom: -100,
            left: -100,
            width: 500,
            height: 500,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(201,168,76,0.10) 0%, transparent 65%)",
          }}
        />

        {/* Left — text content */}
        <div style={{ display: "flex", flexDirection: "column", gap: 0, zIndex: 1, maxWidth: 560 }}>
          {/* Label */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 20,
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "#e84040",
              }}
            />
            <span
              style={{
                fontFamily: "monospace",
                fontSize: 11,
                letterSpacing: "0.24em",
                textTransform: "uppercase",
                color: "#c9a84c",
              }}
            >
              WATCHTOWER · THREAT MATRIX
            </span>
          </div>

          {/* TEVATHA wordmark */}
          <div
            style={{
              fontSize: 72,
              fontWeight: 900,
              letterSpacing: "0.12em",
              color: "#f0c842",
              lineHeight: 1,
              marginBottom: 8,
            }}
          >
            TEVATHA
          </div>

          {/* Tagline */}
          <div
            style={{
              fontSize: 22,
              color: "#8a9ab0",
              letterSpacing: "0.04em",
              marginBottom: 36,
            }}
          >
            Prepare. Operate. Endure.
          </div>

          {/* Description */}
          <div
            style={{
              fontSize: 16,
              color: "#6a7a8e",
              lineHeight: 1.6,
              marginBottom: 40,
              maxWidth: 460,
            }}
          >
            Real-time geopolitical threat intelligence. Collapse probability scoring.
            Signal feeds across nuclear, economic, and grid domains.
          </div>

          {/* Stat pills */}
          <div style={{ display: "flex", gap: 12 }}>
            {[
              { label: "COLLAPSE INDEX", value: "87", unit: "%" },
              { label: "ACTIVE SIGNALS", value: "24", unit: "" },
              { label: "THREAT DOMAINS", value: "6", unit: "" },
            ].map((stat) => (
              <div
                key={stat.label}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  padding: "10px 16px",
                  borderRadius: 8,
                  border: "1px solid rgba(201,168,76,0.2)",
                  background: "rgba(201,168,76,0.04)",
                  gap: 2,
                }}
              >
                <div
                  style={{
                    fontFamily: "monospace",
                    fontSize: 9,
                    letterSpacing: "0.15em",
                    color: "#6a7a8e",
                  }}
                >
                  {stat.label}
                </div>
                <div
                  style={{
                    fontFamily: "monospace",
                    fontSize: 26,
                    fontWeight: 700,
                    color: "#e84040",
                    lineHeight: 1,
                  }}
                >
                  {stat.value}
                  <span style={{ fontSize: 14, color: "#c9a84c" }}>{stat.unit}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right — Doomsday clock SVG */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1,
            position: "relative",
          }}
        >
          {/* Outer ambient glow */}
          <div
            style={{
              position: "absolute",
              width: 420,
              height: 420,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(232,64,64,0.14) 0%, transparent 70%)",
            }}
          />

          <svg width="340" height="340" viewBox="0 0 100 100" fill="none">
            {/* Outermost subtle ring */}
            <circle cx="50" cy="50" r="48" stroke="#c9a84c" strokeWidth="0.3" strokeOpacity="0.15" />
            {/* Main clock ring */}
            <circle cx="50" cy="50" r="42" stroke="#c9a84c" strokeWidth="0.8" strokeOpacity="0.35" />
            {/* Inner ring */}
            <circle cx="50" cy="50" r="36" stroke="#c9a84c" strokeWidth="0.3" strokeOpacity="0.12" />

            {/* Globe latitude rings */}
            <ellipse cx="50" cy="50" rx="42" ry="14" stroke="#e84040" strokeWidth="0.4" strokeOpacity="0.08" />
            <ellipse cx="50" cy="50" rx="42" ry="28" stroke="#e84040" strokeWidth="0.4" strokeOpacity="0.06" />
            <ellipse cx="50" cy="50" rx="14" ry="42" stroke="#e84040" strokeWidth="0.4" strokeOpacity="0.06" />

            {/* Hour tick marks */}
            {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg, i) => {
              const rad = (deg - 90) * (Math.PI / 180);
              const x1 = 50 + 40 * Math.cos(rad);
              const y1 = 50 + 40 * Math.sin(rad);
              const x2 = 50 + 42 * Math.cos(rad);
              const y2 = 50 + 42 * Math.sin(rad);
              return (
                <line
                  key={i}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="#c9a84c"
                  strokeWidth="0.6"
                  strokeOpacity="0.4"
                />
              );
            })}

            {/* Danger arc glow — ~45° CCW from midnight */}
            <path
              d="M 50 8 A 42 42 0 0 0 20.3 20.3"
              stroke="#e84040"
              strokeWidth="8"
              strokeLinecap="round"
              strokeOpacity="0.18"
            />
            {/* Danger arc */}
            <path
              d="M 50 8 A 42 42 0 0 0 20.3 20.3"
              stroke="#e84040"
              strokeWidth="3"
              strokeLinecap="round"
            />

            {/* Clock hand — pointing ~45° CCW from midnight */}
            <line
              x1="50" y1="50"
              x2="28" y2="28"
              stroke="#c9a84c"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            {/* Minute hand */}
            <line
              x1="50" y1="50"
              x2="50" y2="14"
              stroke="#c9a84c"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeOpacity="0.5"
            />

            {/* 12 o'clock dot */}
            <circle cx="50" cy="8" r="2.5" fill="#e84040" />
            {/* 3 o'clock */}
            <circle cx="92" cy="50" r="1.2" fill="#c9a84c" fillOpacity="0.3" />
            {/* 6 o'clock */}
            <circle cx="50" cy="92" r="1.2" fill="#c9a84c" fillOpacity="0.3" />
            {/* 9 o'clock */}
            <circle cx="8" cy="50" r="1.2" fill="#c9a84c" fillOpacity="0.3" />

            {/* Center pin */}
            <circle cx="50" cy="50" r="3" fill="#c9a84c" />
            <circle cx="50" cy="50" r="1.5" fill="#05080a" />

            {/* "85s" label */}
            <text
              x="50"
              y="68"
              textAnchor="middle"
              fill="#e84040"
              fontSize="7"
              fontFamily="monospace"
              fontWeight="bold"
              letterSpacing="0.05em"
            >
              85 SEC
            </text>
            <text
              x="50"
              y="74"
              textAnchor="middle"
              fill="#c9a84c"
              fontSize="3.5"
              fontFamily="monospace"
              letterSpacing="0.15em"
              fillOpacity="0.6"
            >
              TO MIDNIGHT
            </text>
          </svg>
        </div>

        {/* Bottom border accent */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 2,
            background: "linear-gradient(90deg, transparent, #c9a84c, rgba(232,64,64,0.6), transparent)",
          }}
        />

        {/* Top border accent */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 1,
            background: "linear-gradient(90deg, transparent, rgba(201,168,76,0.4), transparent)",
          }}
        />
      </div>
    ),
    { ...size },
  );
}
