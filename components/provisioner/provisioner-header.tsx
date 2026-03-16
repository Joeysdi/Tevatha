// components/provisioner/provisioner-header.tsx
"use client";

import Link from "next/link";
import { UserButton, SignInButton, useUser } from "@clerk/nextjs";
import { useCart } from "@/lib/cart/store";
import { CartDrawer } from "./cart-drawer";

export function ProvisionerHeader() {
  const { items, open, setOpen } = useCart();
  const { isSignedIn, isLoaded } = useUser();
  const itemCount = items.reduce((sum, i) => sum + i.qty, 0);

  return (
    <>
      <header className="bg-void-1 border-b border-border-bright/60 relative px-4 sm:px-6 py-3 sm:py-3.5 flex items-center justify-between">
        {/* Gold top accent line */}
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{ background: "linear-gradient(90deg,#f0c842,#c9a84c,transparent)" }}
        />

        {/* Left: brand + pillar label */}
        <div className="flex items-center gap-2.5">
          <span className="font-syne font-bold text-[17px] text-gold-protocol">
            ⚙ TEVATHA
          </span>
          <span className="w-px h-4 bg-border-bright opacity-40" />
          <span className="font-mono text-[10px] text-text-mute2 tracking-[.18em]">
            PROVISIONER
          </span>
        </div>

        {/* Right: cart + auth + back link */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Cart button */}
          <button
            onClick={() => setOpen(!open)}
            className="relative flex items-center gap-1.5 font-mono text-[11px]
                       text-text-mute2 hover:text-gold-bright border border-border-protocol
                       rounded-lg px-2.5 sm:px-3 py-1.5 hover:border-gold-protocol/40
                       transition-all duration-200"
            aria-label="Open cart"
          >
            <span>🛒</span>
            <span className="hidden sm:inline">Cart</span>
            {itemCount > 0 && (
              <span
                className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px]
                           bg-gold-protocol text-void-0 font-mono font-bold
                           text-[9px] rounded-full flex items-center justify-center
                           px-1 tabular-nums"
              >
                {itemCount > 99 ? "99+" : itemCount}
              </span>
            )}
          </button>

          {/* Auth */}
          {isLoaded && (
            isSignedIn ? (
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "w-7 h-7",
                    userButtonPopoverCard: "bg-void-1 border border-border-protocol",
                    userButtonPopoverActionButton: "text-text-base hover:bg-void-2 font-mono text-[11px]",
                    userButtonPopoverActionButtonText: "font-mono text-[11px]",
                    userButtonPopoverFooter: "hidden",
                  },
                }}
              />
            ) : (
              <SignInButton mode="redirect" forceRedirectUrl="/provisioner">
                <button
                  className="font-mono text-[11px] text-text-mute2 hover:text-gold-bright
                             border border-border-protocol rounded-lg px-2.5 sm:px-3 py-1.5
                             hover:border-gold-protocol/40 transition-all duration-200"
                >
                  Sign In
                </button>
              </SignInButton>
            )
          )}

          {/* Back link */}
          <Link
            href="/watchtower"
            className="hidden sm:inline font-mono text-[11px] text-text-mute2 hover:text-gold-bright
                       border border-border-protocol rounded-lg px-3 py-1.5
                       hover:border-gold-protocol/40 transition-all duration-200"
          >
            ← Watchtower
          </Link>
        </div>
      </header>

      <CartDrawer />
    </>
  );
}
