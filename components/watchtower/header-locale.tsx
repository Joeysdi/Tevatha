// components/watchtower/header-locale.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslation } from "@/lib/i18n/use-translation";
import type { Locale } from "@/lib/i18n/translations";

// ISO 3166-1 alpha-2 country codes for flag images
const FLAG_CODE: Record<Locale, string> = {
  en: "us",
  zh: "cn",
  es: "es",
  fr: "fr",
  th: "th",
  de: "de",
  pt: "br",
  ar: "sa",
  ja: "jp",
  ko: "kr",
  hi: "in",
  ru: "ru",
};

function FlagImg({ loc, size = 20 }: { loc: Locale; size?: number }) {
  return (
    <img
      src={`https://flagcdn.com/${size}x${Math.round(size * 0.75)}/${FLAG_CODE[loc]}.png`}
      srcSet={`https://flagcdn.com/${size * 2}x${Math.round(size * 0.75 * 2)}/${FLAG_CODE[loc]}.png 2x`}
      width={size}
      height={Math.round(size * 0.75)}
      alt=""
      className="rounded-[1px] flex-shrink-0"
      style={{ objectFit: "cover" }}
    />
  );
}

export function HeaderLocale() {
  const { locale, setLocale, locales, meta } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

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
      {/* Trigger */}
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1.5 px-2 py-1 rounded
                   font-mono text-[8px] tracking-[.08em]
                   text-text-mute2/60 hover:text-text-mute2 hover:bg-white/[0.03]
                   transition-all duration-150"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Select language"
      >
        <FlagImg loc={locale} size={16} />
        <span>{meta[locale].nativeName}</span>
        <svg
          width="6" height="4" viewBox="0 0 6 4" fill="currentColor"
          className={`opacity-40 transition-transform duration-150 ${open ? "rotate-180" : ""}`}
        >
          <path d="M0 0l3 4 3-4z" />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div
          role="listbox"
          aria-label="Language"
          className="absolute right-0 top-full mt-1.5 z-[200] rounded-lg overflow-hidden py-1"
          style={{
            background: "rgba(8,10,20,0.98)",
            border: "1px solid rgba(255,255,255,0.07)",
            boxShadow: "0 12px 40px rgba(0,0,0,0.7)",
            minWidth: "148px",
          }}
        >
          {locales.map((loc) => {
            const active = loc === locale;
            return (
              <button
                key={loc}
                role="option"
                aria-selected={active}
                onClick={() => { setLocale(loc); setOpen(false); }}
                className={`w-full flex items-center gap-2.5 px-3 py-1.5
                            font-mono text-[8.5px] text-left transition-colors duration-100
                            ${active
                              ? "text-gold-bright bg-gold-protocol/10"
                              : "text-text-mute2 hover:text-text-base hover:bg-white/[0.04]"}`}
              >
                <FlagImg loc={loc} size={18} />
                <span className="leading-none">{meta[loc].nativeName}</span>
                {active && (
                  <svg width="8" height="6" viewBox="0 0 8 6" fill="none"
                    className="ml-auto text-gold-protocol/70 flex-shrink-0">
                    <path d="M0 3l2.5 3L8 0" stroke="currentColor" strokeWidth="1.2"
                      strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
