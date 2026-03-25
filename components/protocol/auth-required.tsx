// components/protocol/auth-required.tsx
"use client";

import { useTranslation } from "@/lib/i18n/use-translation";

export function AuthRequired() {
  const { t } = useTranslation();
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center">
        <p className="font-mono text-[10px] text-text-mute2 tracking-[.16em] uppercase mb-2">
          {t("envoy_auth_required")}
        </p>
        <p className="font-mono text-[12px] text-text-dim">{t("envoy_auth_sign_in")}</p>
      </div>
    </div>
  );
}
