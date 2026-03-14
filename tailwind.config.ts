import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./providers/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      // ── TEVATHA UNIFIED COLOR SYSTEM ──────────────────────────────────
      colors: {
        // Void / Backgrounds (Provisioner origin)
        void: {
          0: "#05080a",
          1: "#080c10",
          2: "#0c1218",
          3: "#07090e", // Protocol bg — near-identical, unified here
        },
        // Gold (cross-pillar)
        gold: {
          DEFAULT: "#d4a832",
          bright: "#f0c842",
          protocol: "#c9a84c", // Protocol variant
          dim: "rgba(212,168,50,0.3)",
          glow: "rgba(212,168,50,0.12)",
        },
        // Amber
        amber: {
          DEFAULT: "#e08030",
          protocol: "#f0a500",
          dim: "rgba(224,128,48,0.2)",
        },
        // Red / Threat
        red: {
          DEFAULT: "#c94040",
          bright: "#e05050",
          protocol: "#e84040",
          dim: "rgba(201,64,64,0.12)",
          glow: "rgba(201,64,64,0.2)",
        },
        // Green / Safe
        green: {
          DEFAULT: "#2a9a60",
          bright: "#3abf78",
          protocol: "#1ae8a0", // Protocol neon green
          dim: "rgba(42,154,96,0.12)",
        },
        // Blue
        blue: {
          DEFAULT: "#3a7abf",
          dim: "rgba(58,122,191,0.12)",
        },
        // Cyan (Protocol origin — Envoy/comms accent)
        cyan: {
          DEFAULT: "#00d4ff",
          dim: "rgba(0,212,255,0.1)",
          border: "rgba(0,212,255,0.25)",
        },
        // Purple (Protocol skills domain)
        purple: {
          DEFAULT: "#a855f7",
        },
        // Text hierarchy
        text: {
          base: "#e2d8c8",
          protocol: "#e8e6e0",
          dim: "#7a8a96",
          dim2: "#8a8680",
          mute: "#3a4a54",
          mute2: "#3d3c3a",
        },
        // Glass / Surface
        glass: {
          DEFAULT: "rgba(255,255,255,0.03)",
          bright: "rgba(255,255,255,0.06)",
          protocol: "rgba(255,255,255,0.04)",
          hover: "rgba(255,255,255,0.07)",
        },
        // Border
        border: {
          DEFAULT: "rgba(255,255,255,0.07)",
          bright: "rgba(255,255,255,0.12)",
          protocol: "rgba(255,255,255,0.08)",
          hover: "rgba(255,255,255,0.18)",
        },
      },

      // ── TYPOGRAPHY ────────────────────────────────────────────────────
      fontFamily: {
        // Provisioner display
        cinzel: ["var(--font-cinzel)", "serif"],
        // Protocol display
        syne: ["var(--font-syne)", "Inter", "system-ui", "sans-serif"],
        // Monospace (shared)
        mono: [
          "var(--font-jetbrains)",
          "'Share Tech Mono'",
          "'Courier New'",
          "monospace",
        ],
        // Body (shared)
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
      },

      // ── SPACING & RADII ───────────────────────────────────────────────
      borderRadius: {
        card: "8px",
        "card-lg": "12px",
        "card-xl": "20px",
      },

      // ── BACKDROP BLUR ─────────────────────────────────────────────────
      backdropBlur: {
        glass: "16px",
        nav: "20px",
      },

      // ── BOX SHADOWS ───────────────────────────────────────────────────
      boxShadow: {
        gold: "0 0 24px rgba(212,168,50,0.12)",
        "gold-lg": "0 0 32px rgba(212,168,50,0.15)",
        cyan: "0 0 24px rgba(0,212,255,0.1)",
        red: "0 0 24px rgba(201,64,64,0.2)",
        card: "0 8px 40px rgba(0,0,0,0.5)",
        inset: "inset 0 1px 0 rgba(255,255,255,0.04)",
      },

      // ── KEYFRAME ANIMATIONS ───────────────────────────────────────────
      keyframes: {
        pulse: {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.5", transform: "scale(0.85)" },
        },
        ticker: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        fadeUp: {
          from: { opacity: "0", transform: "translateY(18px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        flicker: {
          "0%, 96%, 100%": { opacity: "1" },
          "97%": { opacity: "0.4" },
          "98%": { opacity: "1" },
          "99%": { opacity: "0.6" },
        },
        scan: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(400px)" },
        },
        breathe: {
          "0%, 100%": { opacity: "0.6" },
          "50%": { opacity: "1" },
        },
      },
      animation: {
        pulse: "pulse 1.5s infinite",
        ticker: "ticker 30s linear infinite",
        "fade-up": "fadeUp 0.4s ease both",
        flicker: "flicker 8s infinite",
        scan: "scan 3s linear infinite",
        breathe: "breathe 3s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
