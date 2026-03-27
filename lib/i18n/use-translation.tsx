// lib/i18n/use-translation.tsx
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  useCallback,
  type ReactNode,
} from "react";
import {
  translations,
  LOCALE_META,
  type Locale,
  type TranslationKey,
} from "./translations";

const LOCALES = Object.keys(translations) as Locale[];
const STORAGE_KEY = "tevatha-lang";

interface LangCtx {
  locale:    Locale;
  t:         (key: TranslationKey) => string;
  setLocale: (l: Locale) => void;
  locales:   Locale[];
  meta:      typeof LOCALE_META;
}

const Ctx = createContext<LangCtx | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  // Hydrate from localStorage after mount (avoids SSR mismatch)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as Locale | null;
      if (saved && translations[saved]) setLocaleState(saved);
    } catch {
      // localStorage may be unavailable (private browsing, etc.)
    }
  }, []);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    try { localStorage.setItem(STORAGE_KEY, l); } catch { /* ignore */ }
  }, []);

  // Falls back to English if a key is somehow missing in a locale
  const t = useCallback((key: TranslationKey): string =>
    translations[locale]?.[key] ?? translations.en[key] ?? key,
  [locale]);

  const value = useMemo(
    () => ({ locale, t, setLocale, locales: LOCALES, meta: LOCALE_META }),
    [locale, t, setLocale],
  );

  return (
    <Ctx.Provider value={value}>
      {children}
    </Ctx.Provider>
  );
}

export function useTranslation() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useTranslation must be inside <LanguageProvider>");
  return ctx;
}
