// components/provisioner/return-shell.tsx
"use client";

import Link from "next/link";
import { useTranslation } from "@/lib/i18n/use-translation";

export function ReturnShell({
  status,
  orderId,
}: {
  status:  "paid" | "unpaid" | "error" | "invalid";
  orderId: string | null;
}) {
  const { t } = useTranslation();
  const isPaid = status === "paid";

  const headline = isPaid
    ? t("checkout_paid_headline")
    : status === "error"
      ? t("checkout_error_headline")
      : status === "invalid"
        ? t("checkout_invalid_headline")
        : t("checkout_unpaid_headline");

  const body = isPaid
    ? null
    : status === "error"
      ? t("checkout_error_body")
      : status === "invalid"
        ? t("checkout_invalid_body")
        : t("checkout_unpaid_body");

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div
        className="relative rounded-2xl border p-8 sm:p-10 max-w-md w-full text-center overflow-hidden"
        style={{
          borderColor:  isPaid ? "rgba(26,232,160,0.25)" : "rgba(232,64,64,0.25)",
          background:   isPaid
            ? "linear-gradient(135deg,rgba(26,232,160,0.06),rgba(11,13,24,0))"
            : "linear-gradient(135deg,rgba(232,64,64,0.06),rgba(11,13,24,0))",
          boxShadow: "0 0 0 1px rgba(255,255,255,0.03) inset, 0 8px 40px rgba(0,0,0,0.4)",
        }}
      >
        {/* Top accent line */}
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{
            background: isPaid
              ? "linear-gradient(90deg,#1ae8a0,transparent)"
              : "linear-gradient(90deg,#e84040,transparent)",
          }}
        />

        {/* Status icon */}
        <div className="text-[48px] mb-4 leading-none">
          {isPaid ? "✓" : status === "error" ? "⚠" : "✕"}
        </div>

        {/* Eyebrow */}
        <p
          className={`font-mono text-[9px] tracking-[.22em] uppercase mb-3
            ${isPaid ? "text-green-bright" : "text-red-bright"}`}
        >
          {isPaid ? t("checkout_confirmed") : t("checkout_not_completed")}
        </p>

        {/* Headline */}
        <h1 className="font-syne font-extrabold text-[22px] text-text-base mb-3 leading-tight">
          {headline}
        </h1>

        {/* Body */}
        <p className="font-mono text-[11px] text-text-dim leading-relaxed mb-6">
          {isPaid ? (
            <>
              {t("checkout_paid_body")}
              {orderId && (
                <span className="block mt-2 text-text-mute2">
                  {t("checkout_order_id")}{" "}
                  <span className="text-gold-protocol font-bold">
                    {orderId.slice(0, 8).toUpperCase()}
                  </span>
                </span>
              )}
            </>
          ) : (
            body
          )}
        </p>

        {/* CTA */}
        <Link
          href="/provisioner"
          className={`inline-flex items-center gap-2 font-mono font-bold text-[11px]
                      tracking-[.06em] px-6 py-3 rounded-xl transition-all duration-200
                      hover:-translate-y-0.5
                      ${isPaid
                        ? "bg-green-bright/15 text-green-bright border border-green-bright/30 hover:bg-green-bright/20 hover:shadow-[0_8px_24px_rgba(26,232,160,0.15)]"
                        : "bg-gold-protocol text-void-0 hover:bg-gold-bright hover:shadow-[0_8px_24px_rgba(201,168,76,0.3)]"
                      }`}
        >
          {isPaid ? t("checkout_back_shop") : t("checkout_try_again")}
        </Link>
      </div>
    </div>
  );
}
