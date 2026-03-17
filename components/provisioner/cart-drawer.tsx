// components/provisioner/cart-drawer.tsx
"use client";

import { useRef, useEffect, useState }    from "react";
import Image                              from "next/image";
import { motion, AnimatePresence }        from "framer-motion";
import { useCart, cartTotal, cartTotalUsdc, type CartItem } from "@/lib/cart/store";
import { SolanaCheckout }                 from "./solana-checkout";
import { StripeEmbeddedCheckout }         from "./stripe-embedded-checkout";

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

export function CartDrawer() {
  const { items, open, setOpen, removeItem, updateQty, clearCart } = useCart();
  const overlayRef = useRef<HTMLDivElement>(null);
  const [checkingOut, setCheckingOut] = useState(false);

  const cardItems = items.filter((i) => !i.highTicket);
  const usdcItems = items.filter((i) => i.highTicket);
  const totalUsd  = cartTotal(items);
  const totalUsdc = cartTotalUsdc(items);

  // Reset checkout view when drawer closes
  useEffect(() => {
    if (!open) setCheckingOut(false);
  }, [open]);

  // Close on Escape (but not when Stripe form is open — let Stripe handle Escape)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !checkingOut) setOpen(false);
    };
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, checkingOut, setOpen]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current && !checkingOut) setOpen(false);
  };

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
                  {checkingOut ? "Secure Payment" : "Cart"}
                </h2>
                <p className="font-mono text-[9px] text-text-mute2 tracking-[.14em] uppercase mt-0.5">
                  {checkingOut
                    ? "Powered by Stripe · TLS encrypted"
                    : `${items.length} ${items.length === 1 ? "item" : "items"}`}
                </p>
              </div>
              <button
                onClick={() => (checkingOut ? setCheckingOut(false) : setOpen(false))}
                className="w-8 h-8 flex items-center justify-center rounded-lg
                           border border-border-protocol text-text-mute2
                           hover:text-text-base hover:border-border-bright/40 transition-colors"
                aria-label={checkingOut ? "Back to cart" : "Close cart"}
              >
                {checkingOut ? "←" : "✕"}
              </button>
            </div>

            {/* ── Body ────────────────────────────────────────────────────── */}
            {checkingOut ? (
              // ── EMBEDDED CHECKOUT VIEW ──────────────────────────────────
              <div className="flex-1 overflow-y-auto px-5 py-4">
                <StripeEmbeddedCheckout
                  items={cardItems}
                  onClose={() => setCheckingOut(false)}
                />
              </div>
            ) : (
              // ── CART ITEMS VIEW ─────────────────────────────────────────
              <>
                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
                  {items.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-40 gap-3">
                      <span className="font-mono text-[28px] opacity-20">🛒</span>
                      <p className="font-mono text-[10px] text-text-mute2 tracking-[.08em]">
                        YOUR CART IS EMPTY
                      </p>
                    </div>
                  )}

                  {/* Card rail items */}
                  {cardItems.length > 0 && (
                    <div>
                      {usdcItems.length > 0 && (
                        <p className="font-mono text-[9px] text-gold-protocol tracking-[.14em] uppercase mb-2">
                          Card Rail
                        </p>
                      )}
                      <div className="space-y-2">
                        {cardItems.map((item) => (
                          <CartItemRow
                            key={item.id}
                            item={item}
                            onRemove={() => removeItem(item.id)}
                            onQtyChange={(q) => updateQty(item.id, q)}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* USDC rail items */}
                  {usdcItems.length > 0 && (
                    <div>
                      {cardItems.length > 0 && (
                        <p className="font-mono text-[9px] text-cyan-DEFAULT tracking-[.14em] uppercase mb-2 mt-4">
                          USDC Rail
                        </p>
                      )}
                      <div className="space-y-2">
                        {usdcItems.map((item) => (
                          <CartItemRow
                            key={item.id}
                            item={item}
                            onRemove={() => removeItem(item.id)}
                            onQtyChange={(q) => updateQty(item.id, q)}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* ── Footer ────────────────────────────────────────────── */}
                {items.length > 0 && (
                  <div className="flex-shrink-0 px-5 py-4 border-t border-border-protocol space-y-3">
                    {/* Totals */}
                    <div className="space-y-1.5">
                      {totalUsd > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[10px] text-text-mute2">Card total</span>
                          <span className="font-mono text-[14px] font-bold text-gold-bright">
                            ${(totalUsd / 100).toFixed(2)}
                          </span>
                        </div>
                      )}
                      {totalUsdc > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[10px] text-text-mute2">USDC total</span>
                          <span className="font-mono text-[14px] font-bold text-cyan-DEFAULT">
                            {totalUsdc.toFixed(2)} USDC
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Card checkout — opens embedded Stripe form in-drawer */}
                    {cardItems.length > 0 && (
                      <button
                        onClick={() => setCheckingOut(true)}
                        className="w-full bg-gold-protocol text-void-0 font-mono font-bold
                                   text-[11px] tracking-[.06em] px-4 py-2.5 rounded-lg
                                   transition-all duration-150 hover:bg-gold-bright hover:-translate-y-0.5
                                   hover:shadow-[0_8px_24px_rgba(201,168,76,0.3)]"
                      >
                        CHECKOUT — CARD ${(totalUsd / 100).toFixed(2)}
                      </button>
                    )}

                    {/* USDC checkout — per item (Solana Pay) */}
                    {usdcItems.map((item) => (
                      <div key={item.id} className="rounded-xl border border-cyan-border/40 p-3 space-y-2">
                        <p className="font-mono text-[9px] text-cyan-DEFAULT tracking-[.1em] uppercase">
                          {item.name} — USDC checkout
                        </p>
                        <SolanaCheckout
                          productId={item.id}
                          productName={item.name}
                          priceUsdc={item.priceUsdc * item.qty}
                          onSuccess={() => {
                            removeItem(item.id);
                            if (items.length <= 1) setOpen(false);
                          }}
                        />
                      </div>
                    ))}

                    {/* Clear */}
                    <button
                      onClick={clearCart}
                      className="w-full font-mono text-[10px] text-text-mute2
                                 hover:text-red-bright transition-colors text-center py-1"
                    >
                      Clear cart
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
  const price  = item.highTicket
    ? `${(item.priceUsdc * item.qty).toFixed(2)} USDC`
    : `$${((item.priceUsd * item.qty) / 100).toFixed(2)}`;

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
      </div>

      <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
        <span className={`font-mono text-[11px] font-bold
          ${item.highTicket ? "text-cyan-DEFAULT" : "text-gold-bright"}`}>
          {price}
        </span>
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
