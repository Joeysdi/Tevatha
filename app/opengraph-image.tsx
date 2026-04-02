// app/opengraph-image.tsx — dynamic OG image via Next.js ImageResponse
import { ImageResponse } from "next/og";

export const alt     = "Tevatha — Prepare. Operate. Endure.";
export const size    = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#05080a",
          fontFamily: "sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Top accent line */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "2px",
            background: "linear-gradient(90deg, #e84040, #c9a84c 40%, transparent)",
          }}
        />

        {/* Grid lines — subtle background texture */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(201,168,76,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.04) 1px, transparent 1px)",
            backgroundSize: "80px 80px",
          }}
        />

        {/* Corner brackets */}
        <div style={{ position: "absolute", top: 32, left: 40, width: 32, height: 32, borderTop: "2px solid rgba(201,168,76,0.4)", borderLeft: "2px solid rgba(201,168,76,0.4)" }} />
        <div style={{ position: "absolute", top: 32, right: 40, width: 32, height: 32, borderTop: "2px solid rgba(201,168,76,0.4)", borderRight: "2px solid rgba(201,168,76,0.4)" }} />
        <div style={{ position: "absolute", bottom: 32, left: 40, width: 32, height: 32, borderBottom: "2px solid rgba(201,168,76,0.4)", borderLeft: "2px solid rgba(201,168,76,0.4)" }} />
        <div style={{ position: "absolute", bottom: 32, right: 40, width: 32, height: 32, borderBottom: "2px solid rgba(201,168,76,0.4)", borderRight: "2px solid rgba(201,168,76,0.4)" }} />

        {/* Eyebrow label */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 28,
          }}
        >
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#e84040", boxShadow: "0 0 12px #e84040" }} />
          <span
            style={{
              fontFamily: "monospace",
              fontSize: 14,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "rgba(201,168,76,0.7)",
            }}
          >
            Zero-Hour Infrastructure
          </span>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#e84040", boxShadow: "0 0 12px #e84040" }} />
        </div>

        {/* Main title */}
        <div
          style={{
            fontSize: 72,
            fontWeight: 800,
            color: "#e2d8c8",
            letterSpacing: "-0.02em",
            lineHeight: 1.1,
            textAlign: "center",
          }}
        >
          TEVATHA
        </div>

        {/* Tagline */}
        <div
          style={{
            marginTop: 16,
            fontSize: 24,
            color: "rgba(201,168,76,0.8)",
            fontFamily: "monospace",
            letterSpacing: "0.12em",
          }}
        >
          PREPARE · OPERATE · ENDURE
        </div>

        {/* Divider */}
        <div
          style={{
            width: 320,
            height: 1,
            background: "linear-gradient(90deg, transparent, rgba(201,168,76,0.4), transparent)",
            margin: "32px 0",
          }}
        />

        {/* Stats row */}
        <div style={{ display: "flex", gap: 48, marginBottom: 32 }}>
          {[
            { val: "85 SEC",  label: "TO MIDNIGHT",          color: "#e84040" },
            { val: "73%",     label: "COLLAPSE PROBABILITY",  color: "#f0a500" },
            { val: "FREE",    label: "NONPROFIT",             color: "#1ae8a0" },
          ].map(({ val, label, color }) => (
            <div key={label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <div style={{ fontFamily: "monospace", fontSize: 28, fontWeight: 800, color, letterSpacing: "-0.01em" }}>
                {val}
              </div>
              <div style={{ fontFamily: "monospace", fontSize: 10, letterSpacing: "0.18em", color: "rgba(122,138,150,0.7)" }}>
                {label}
              </div>
            </div>
          ))}
        </div>

        {/* Three pillars */}
        <div style={{ display: "flex", gap: 40 }}>
          {[
            { label: "WATCHTOWER", color: "#e84040", desc: "Threat Intelligence" },
            { label: "PROVISIONER", color: "#c9a84c", desc: "Gear Catalog" },
            { label: "PROTOCOL", color: "#00d4ff", desc: "Continuity Ledger" },
          ].map(({ label, color, desc }) => (
            <div
              key={label}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}
            >
              <div style={{ fontFamily: "monospace", fontSize: 11, letterSpacing: "0.2em", color, fontWeight: 700 }}>
                {label}
              </div>
              <div style={{ fontSize: 11, color: "rgba(122,138,150,0.8)", fontFamily: "monospace" }}>
                {desc}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom domain */}
        <div
          style={{
            position: "absolute",
            bottom: 36,
            fontFamily: "monospace",
            fontSize: 12,
            color: "rgba(122,138,150,0.5)",
            letterSpacing: "0.18em",
          }}
        >
          tevatha.com
        </div>
      </div>
    ),
    { ...size },
  );
}
