// components/provisioner/cart-drawer.tsx
"use client";

import { useRef, useEffect, useState }    from "react";
import Image                              from "next/image";
import { motion, AnimatePresence }        from "framer-motion";
import { useCart, cartTotal, cartTotalUsdc, type CartItem } from "@/lib/cart/store";
import { SolanaCheckout }                 from "./solana-checkout";
import { StripeEmbeddedCheckout }         from "./stripe-embedded-checkout";
import { useTranslation }                 from "@/lib/i18n/use-translation";

const PRODUCT_IMAGES: Record<string, string> = {
  "garmin-inreach-mini2": "/products/garmin-inreach-mini2.jpg",
  "baofeng-uv5r":         "/products/baofeng-uv5r.jpg",
  "starlink-mini":        "/products/starlink-mini.png",
  "nar-ifak":             "/products/nar-ifak.jpg",
  "myfak-advanced":       "/products/myfak-advanced.png",
  "quikclot":             "/products/quikclot.jpg",
  "jackery-1000plus":     "/products/jackery-1000plus.png",
  "ecoflow-delta-pro":    "/products/ecoflow-delta-pro.png",
  "renogy-400w":          "/products/renogy-400w.jpg",
  "wavian-jerry":         "/products/wavian-jerry.jpg",
  "noco-gb40":            "/products/noco-gb40.png",
  "berkey-big":           "/products/berkey-big.jpg",
  "sawyer-squeeze":       "/products/sawyer-squeeze.png",
  "reolink-810a":         "/products/reolink-810a.png",
  "faraday-xl":           "/products/faraday-xl.jpg",
};

type CheckoutMode = "cart" | "stripe" | "usdc";

export function CartDrawer() {
  const { t } = useTranslation();
  const { items, open, setOpen, removeItem, updateQty, clearCart } = useCart();
  const overlayRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<CheckoutMode>("cart");
  // Which item's USDC checkout is expanded (null = none)
  const [usdcItem, setUsdcItem] = useState<string | null>(null);

  const totalUsd  = cartTotal(items);
  const totalUsdc = cartTotalUsdc(items);

  // Reset to cart view when drawer closes
  useEffect(() => {
    if (!open) { setMode("cart"); setUsdcItem(null); }
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && mode === "cart") setOpen(false);
    };
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, mode, setOpen]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current && mode === "cart") setOpen(false);
  };

  const headerLabel = mode === "stripe"
    ? t("cart_checkout_card")
    : mode === "usdc"
      ? t("cart_checkout_usdc")
      : t("cart_title");

  const headerSub = mode === "stripe"
    ? t("cart_stripe_note")
    : mode === "usdc"
      ? t("cart_solana_note")
      : `${items.length} ${items.length === 1 ? t("cart_item_singular") : t("cart_item_plural")}`;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay */}
          <motion.div
            ref={overlayRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={handleOverlayClick}
          />

          {/* Drawer */}
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className="fixed top-0 right-0 h-full w-full max-w-[440px] z-50
                       bg-void-1 border-l border-border-protocol flex flex-col"
            style={{ boxShadow: "-8px 0 40px rgba(0,0,0,0.5)" }}
          >
            {/* Gold top accent */}
            <div
              className="absolute top-0 left-0 right-0 h-px"
              style={{ background: "linear-gradient(90deg,#f0c842,#c9a84c,transparent)" }}
            />

            {/* ── Header ──────────────────────────────────────────────────── */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border-protocol flex-shrink-0">
              <div>
                <h2 className="font-syne font-bold text-[16px] text-text-base">
                  {headerLabel}
                </h2>
                <p className="font-mono text-[9px] text-text-mute2 tracking-[.14em] uppercase mt-0.5">
                  {headerSub}
                </p>
              </div>
              <button
                onClick={() => mode !== "cart" ? setMode("cart") : setOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg
                           border border-border-protocol text-text-mute2
                           hover:text-text-base hover:border-border-bright/40 transition-colors"
                aria-label={mode !== "cart" ? "Back to cart" : "Close cart"}
              >
                {mode !== "cart" ? "←" : "✕"}
              </button>
            </div>

            {/* ── Body ────────────────────────────────────────────────────── */}
            {mode === "stripe" ? (
              <div className="flex-1 overflow-y-auto px-5 py-4">
                <StripeEmbeddedCheckout
                  items={items}
                  onClose={() => setMode("cart")}
                />
              </div>
            ) : mode === "usdc" ? (
              // ── USDC checkout view ─────────────────────────────────────
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
                <p className="font-mono text-[10px] text-text-mute2 leading-relaxed">
                  {t("cart_usdc_instruction")}
                </p>
                {items.map((item) => (
                  <div key={item.id}
                       className="rounded-xl border border-cyan-border/40 bg-void-2 p-4 space-y-3">
                    {/* Item header */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-syne font-bold text-[12px] text-text-base truncate">
                          {item.name}
                        </p>
                        <p className="font-mono text-[9px] text-text-mute2">{item.sku}</p>
                      </div>
                      <span className="font-mono text-[13px] font-bold text-cyan-DEFAULT flex-shrink-0">
                        {(item.priceUsdc * item.qty).toFixed(2)} USDC
                      </span>
                    </div>

                    {/* Expand / collapse USDC form */}
                    {usdcItem === item.id ? (
                      <>
                        <SolanaCheckout
                          productId={item.id}
                          productName={item.name}
                          priceUsdc={item.priceUsdc * item.qty}
                          onSuccess={() => {
                            removeItem(item.id);
                            setUsdcItem(null);
                            if (items.length <= 1) setOpen(false);
                          }}
                        />
                        <button
                          onClick={() => setUsdcItem(null)}
                          className="w-full font-mono text-[10px] text-text-mute2
                                     hover:text-text-dim transition-colors text-center"
                        >
                          {t("cart_collapse")}
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setUsdcItem(item.id)}
                        className="w-full bg-cyan-DEFAULT/10 text-cyan-DEFAULT font-mono
                                   font-bold text-[11px] tracking-[.06em] px-4 py-2.5
                                   rounded-lg border border-cyan-border
                                   hover:bg-cyan-dim transition-all duration-150"
                      >
                        ◎ PAY {(item.priceUsdc * item.qty).toFixed(2)} USDC
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              // ── Cart items view ─────────────────────────────────────────
              <>
                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-2">
                  {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-40 gap-3">
                      <span className="font-mono text-[28px] opacity-20">🛒</span>
                      <p className="font-mono text-[10px] text-text-mute2 tracking-[.08em]">
                        {t("cart_empty")}
                      </p>
                    </div>
                  ) : (
                    items.map((item) => (
                      <CartItemRow
                        key={item.id}
                        item={item}
                        onRemove={() => removeItem(item.id)}
                        onQtyChange={(q) => updateQty(item.id, q)}
                      />
                    ))
                  )}
                </div>

                {/* ── Footer ────────────────────────────────────────────── */}
                {items.length > 0 && (
                  <div className="flex-shrink-0 px-5 py-4 border-t border-border-protocol space-y-3">
                    {/* Totals row */}
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] text-text-mute2">
                        {items.reduce((s, i) => s + i.qty, 0)} {items.reduce((s, i) => s + i.qty, 0) !== 1 ? t("cart_item_plural") : t("cart_item_singular")}
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-[13px] font-bold text-gold-bright">
                          ${(totalUsd / 100).toFixed(2)}
                        </span>
                        <span className="font-mono text-[9px] text-text-mute2">or</span>
                        <span className="font-mono text-[13px] font-bold text-cyan-DEFAULT">
                          {totalUsdc.toFixed(2)} USDC
                        </span>
                      </div>
                    </div>

                    {/* Rail label */}
                    <p className="font-mono text-[9px] text-text-mute2 text-center tracking-[.1em] uppercase">
                      {t("cart_choose_rail")}
                    </p>

                    {/* Card checkout */}
                    <button
                      onClick={() => setMode("stripe")}
                      className="w-full bg-gold-protocol text-void-0 font-mono font-bold
                                 text-[11px] tracking-[.06em] px-4 py-2.5 rounded-lg
                                 transition-all duration-150 hover:bg-gold-bright hover:-translate-y-0.5
                                 hover:shadow-[0_8px_24px_rgba(201,168,76,0.3)]"
                    >
                      💳 {t("cart_pay_card")} — ${(totalUsd / 100).toFixed(2)}
                    </button>

                    {/* USDC checkout */}
                    <button
                      onClick={() => setMode("usdc")}
                      className="w-full bg-cyan-DEFAULT/10 text-cyan-DEFAULT font-mono font-bold
                                 text-[11px] tracking-[.06em] px-4 py-2.5 rounded-lg
                                 border border-cyan-border
                                 transition-all duration-150 hover:bg-cyan-dim hover:-translate-y-0.5
                                 hover:shadow-[0_8px_24px_rgba(0,212,255,0.2)]"
                    >
                      ◎ {t("cart_pay_usdc")} — {totalUsdc.toFixed(2)} USDC
                    </button>

                    {/* Clear */}
                    <button
                      onClick={clearCart}
                      className="w-full font-mono text-[10px] text-text-mute2
                                 hover:text-red-bright transition-colors text-center py-1"
                    >
                      {t("cart_clear")}
                    </button>
                  </div>
                )}
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

// ── Item row ──────────────────────────────────────────────────────────────────

function CartItemRow({
  item,
  onRemove,
  onQtyChange,
}: {
  item:        CartItem;
  onRemove:    () => void;
  onQtyChange: (qty: number) => void;
}) {
  const imgSrc = PRODUCT_IMAGES[item.imageSlug];

  return (
    <div className="flex items-center gap-3 bg-void-2 border border-border-protocol
                    rounded-lg px-3 py-2.5">
      <div className="w-10 h-10 flex-shrink-0 relative bg-void-3 rounded-md overflow-hidden">
        {imgSrc ? (
          <Image src={imgSrc} alt={item.name} fill className="object-contain p-1" sizes="40px" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-[14px] opacity-30">📦</span>
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-syne font-bold text-[11.5px] text-text-base leading-tight truncate">
          {item.name}
        </p>
        <p className="font-mono text-[9px] text-text-mute2">{item.sku}</p>
        {/* Both prices */}
        <p className="font-mono text-[9px] text-text-mute2 mt-0.5">
          <span className="text-gold-protocol">${((item.priceUsd * item.qty) / 100).toFixed(2)}</span>
          <span className="mx-1 opacity-40">·</span>
          <span className="text-cyan-DEFAULT">{(item.priceUsdc * item.qty).toFixed(2)} USDC</span>
        </p>
      </div>

      <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
        <div className="flex items-center gap-1">
          <button
            onClick={() => onQtyChange(item.qty - 1)}
            className="w-5 h-5 rounded border border-border-protocol text-text-mute2
                       hover:border-border-bright/40 hover:text-text-base transition-colors
                       font-mono text-[10px] flex items-center justify-center"
          >
            −
          </button>
          <span className="font-mono text-[11px] text-text-base w-4 text-center tabular-nums">
            {item.qty}
          </span>
          <button
            onClick={() => onQtyChange(item.qty + 1)}
            className="w-5 h-5 rounded border border-border-protocol text-text-mute2
                       hover:border-border-bright/40 hover:text-text-base transition-colors
                       font-mono text-[10px] flex items-center justify-center"
          >
            +
          </button>
          <button
            onClick={onRemove}
            className="w-5 h-5 rounded border border-border-protocol text-text-mute2
                       hover:border-red-bright/60 hover:text-red-bright transition-colors
                       font-mono text-[10px] flex items-center justify-center ml-0.5"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
}
