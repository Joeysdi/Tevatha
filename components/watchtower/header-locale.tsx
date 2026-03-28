// components/watchtower/header-locale.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslation } from "@/lib/i18n/use-translation";

export function HeaderLocale() {
  const { locale, setLocale, locales, meta } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} className="relative flex items-center">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1.5 font-mono text-[7.5px] tracking-[.12em] uppercase
                   text-text-mute2/60 hover:text-text-mute2 transition-colors"
        aria-label="Select language"
      >
        <span className="text-[13px] leading-none">{meta[locale].flag}</span>
        <span>{locale.toUpperCase()}</span>
        <svg width="6" height="4" viewBox="0 0 6 4" fill="currentColor" className="opacity-50">
          <path d="M0 0l3 4 3-4z" />
        </svg>
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-2 z-[200] rounded-lg overflow-hidden"
          style={{
            background: "rgba(8,10,18,0.97)",
            border: "1px solid rgba(255,255,255,0.07)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
            minWidth: "160px",
          }}
        >
          <div className="grid grid-cols-3 gap-px p-1.5">
            {locales.map((loc) => {
              const active = loc === locale;
              return (
                <button
                  key={loc}
                  onClick={() => { setLocale(loc); setOpen(false); }}
                  className={`flex flex-col items-center gap-0.5 py-1.5 px-1 rounded font-mono text-[7px]
                              transition-all duration-100
                              ${active
                                ? "bg-gold-protocol/15 text-gold-bright"
                                : "text-text-mute2 hover:text-text-base hover:bg-white/[0.04]"}`}
                >
                  <span className="text-[13px] leading-none">{meta[loc].flag}</span>
                  <span className="tracking-[.08em] uppercase">{loc.toUpperCase()}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
