// components/protocol/vault-lock.tsx
"use client";

import { motion } from "framer-motion";

interface VaultLockProps {
  locked: boolean;
}

export function VaultLock({ locked }: VaultLockProps) {
  return (
    <motion.div
      style={{ filter: "drop-shadow(0 0 16px rgba(201,168,76,0.25))" }}
    >
      <svg
        viewBox="0 0 80 96"
        width="80"
        height="96"
        xmlns="http://www.w3.org/2000/svg"
        overflow="visible"
      >
        <defs>
          {/* Body radial gradient */}
          <radialGradient id="body-fill" cx="50%" cy="40%" r="60%">
            <stop offset="0%"   stopColor="#1a2535" />
            <stop offset="60%"  stopColor="#0f1820" />
            <stop offset="100%" stopColor="#0a1018" />
          </radialGradient>

          {/* Shackle linear gradient */}
          <linearGradient id="shackle-grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor="#c9a84c" />
            <stop offset="50%"  stopColor="#f0c842" />
            <stop offset="100%" stopColor="#c9a84c" />
          </linearGradient>

          {/* Inner shadow filter */}
          <filter id="inner-shadow" x="-10%" y="-10%" width="120%" height="120%">
            <feOffset dx="0" dy="2" result="offset" />
            <feGaussianBlur stdDeviation="2" in="offset" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          {/* Glow filter for shackle */}
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Green glow for unlocked state */}
          <filter id="green-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Lock body — outer rect */}
        <motion.rect
          x="4" y="40" width="72" height="52" rx="9"
          fill="url(#body-fill)"
          strokeWidth="1.5"
          filter="url(#inner-shadow)"
          animate={locked
            ? { stroke: "#c9a84c", filter: "url(#inner-shadow)" }
            : { stroke: "#1ae8a0", filter: "drop-shadow(0 0 8px rgba(26,232,160,0.4))" }
          }
          transition={{ duration: 0.4 }}
        />

        {/* Top gloss highlight stripe */}
        <rect x="10" y="44" width="60" height="3" rx="1.5"
              fill="rgba(255,255,255,0.07)" />

        {/* Rivets */}
        <circle cx="18" cy="58" r="2" fill="#0a1018"
                stroke="rgba(201,168,76,0.2)" strokeWidth="1" />
        <circle cx="62" cy="58" r="2" fill="#0a1018"
                stroke="rgba(201,168,76,0.2)" strokeWidth="1" />

        {/* Keyhole circle */}
        <circle cx="40" cy="62" r="7" fill="#050810"
                stroke="rgba(201,168,76,0.3)" strokeWidth="1" />

        {/* Keyhole slot */}
        <rect x="37" y="62" width="6" height="9" rx="2" fill="#050810" />

        {/* Shackle (animated) */}
        <motion.g
          animate={locked
            ? { rotate: 0, y: 0 }
            : { rotate: -38, y: -11 }
          }
          transition={{ type: "spring", stiffness: 180, damping: 16, delay: 0.05 }}
          style={{ transformOrigin: "58px 42px" }}
        >
          {/* Main shackle arc */}
          <path
            d="M 22,42 V 24 Q 22,8 40,8 Q 58,8 58,24 V 42"
            fill="none"
            stroke="url(#shackle-grad)"
            strokeWidth="4.5"
            strokeLinecap="round"
            filter="url(#glow)"
          />
          {/* Inner highlight arc */}
          <path
            d="M 22,42 V 24 Q 22,8 40,8 Q 58,8 58,24 V 42"
            fill="none"
            stroke="rgba(255,255,255,0.3)"
            strokeWidth="1"
            strokeLinecap="round"
            opacity="0.6"
          />
        </motion.g>
      </svg>
    </motion.div>
  );
}
