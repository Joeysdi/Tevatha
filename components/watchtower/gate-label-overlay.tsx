"use client";
import { useEffect, useRef } from "react";
import type { GlobeMethods } from "react-globe.gl";
import { GATE_PINS } from "@/lib/watchtower/gate-pins";

const CARD_W = 104;  // px — matches "G7 · REPO" at 7.5px mono + padding
const CARD_H = 22;
const PAD    = 8;    // minimum gap between cards

const TIER_COL: Record<string, string> = {
  t4: "#e84040", t3: "#f0a500", t2: "#38bdf8",
};

interface Props {
  globeRef:    React.RefObject<GlobeMethods | undefined>;
  dims:        { w: number; h: number };
  showGates:   boolean;
  gateTier:    Record<string, string>;
  onGateClick: (gateId: string) => void;
}

export function GateLabelOverlay({ globeRef, dims, showGates, gateTier, onGateClick }: Props) {
  const labelRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const rafRef    = useRef<number>(0);

  useEffect(() => {
    if (!showGates) return;

    const tick = () => {
      const globe = globeRef.current;
      if (!globe) { rafRef.current = requestAnimationFrame(tick); return; }

      const cx = dims.w / 2;
      const cy = dims.h / 2;
      const globeR = Math.min(dims.w, dims.h) * 0.46; // visible sphere radius

      // 1. Screen coords + visibility
      const visible: { id: string; sx: number; sy: number; lx: number; ly: number }[] = [];
      for (const pin of GATE_PINS) {
        const sc = globe.getScreenCoords(pin.lat, pin.lng, 0);
        if (!sc) continue;
        if (Math.hypot(sc.x - cx, sc.y - cy) >= globeR) continue; // back face
        visible.push({ id: pin.gateId, sx: sc.x, sy: sc.y, lx: sc.x + 12, ly: sc.y - CARD_H / 2 });
      }

      // 2. Iterative repulsion
      for (let iter = 0; iter < 30; iter++) {
        let moved = false;
        for (let i = 0; i < visible.length; i++) {
          for (let j = i + 1; j < visible.length; j++) {
            const a = visible[i], b = visible[j];
            const ox = CARD_W + PAD - Math.abs(b.lx - a.lx);
            const oy = CARD_H + PAD - Math.abs(b.ly - a.ly);
            if (ox > 0 && oy > 0) {
              moved = true;
              if (ox < oy) {
                const push = ox / 2 + 1, sign = b.lx >= a.lx ? 1 : -1;
                a.lx -= sign * push; b.lx += sign * push;
              } else {
                const push = oy / 2 + 1, sign = b.ly >= a.ly ? 1 : -1;
                a.ly -= sign * push; b.ly += sign * push;
              }
            }
          }
        }
        for (const v of visible) {
          v.lx = Math.max(4, Math.min(dims.w - CARD_W - 4, v.lx));
          v.ly = Math.max(4, Math.min(dims.h - CARD_H - 4, v.ly));
        }
        if (!moved) break;
      }

      // 3. Write directly to DOM (no React re-render)
      const visIds = new Set(visible.map(v => v.id));
      for (const [id, el] of labelRefs.current) {
        el.style.display = visIds.has(id) ? "block" : "none";
      }
      for (const v of visible) {
        const el = labelRefs.current.get(v.id);
        if (el) { el.style.left = `${v.lx}px`; el.style.top = `${v.ly}px`; }
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [showGates, globeRef, dims, gateTier]);

  if (!showGates) return null;

  return (
    <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 26 }}>
      {GATE_PINS.map(pin => {
        const col = TIER_COL[gateTier[pin.gateId] ?? "t3"] ?? "#f0a500";
        return (
          <div
            key={pin.gateId}
            ref={el => { if (el) labelRefs.current.set(pin.gateId, el); else labelRefs.current.delete(pin.gateId); }}
            onClick={() => onGateClick(pin.gateId)}
            style={{
              position:      "absolute",
              display:       "none",
              width:         CARD_W,
              pointerEvents: "auto",
              cursor:        "pointer",
              background:    "rgba(5,8,13,0.88)",
              border:        `1.5px solid ${col}88`,
              borderLeft:    `2px solid ${col}`,
              borderRadius:  6,
              padding:       "4px 7px",
              backdropFilter:"blur(6px)",
              boxShadow:     `0 0 12px ${col}33`,
              whiteSpace:    "nowrap",
            }}
          >
            <span style={{ fontFamily:"monospace", fontSize:"7.5px", fontWeight:"bold",
                           color:col, letterSpacing:".1em" }}>
              {pin.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
