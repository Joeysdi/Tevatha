// components/provisioner/provisioner-header.tsx
"use client";

import Link from "next/link";
import { UserButton, SignInButton, useUser } from "@clerk/nextjs";

export function ProvisionerHeader() {
  const { isSignedIn, isLoaded } = useUser();

  return (
    <>
      <header
        className="bg-void-1 border-b border-border-protocol/40 relative z-20 px-4 sm:px-6 py-3 sm:py-3.5"
        style={{ boxShadow: "0 0 24px rgba(201,168,76,0.06)" }}
      >
        {/* Gold top accent line */}
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{ background: "linear-gradient(90deg,#f0c842,#c9a84c,transparent)" }}
        />

        <div className="max-w-[1400px] mx-auto w-full flex items-center justify-between">
          {/* Left: brand + pillar label */}
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-gold-protocol animate-pulse" />
            <span
              className="font-cinzel font-bold text-[15px] tracking-[.2em]"
              style={{
                background: "linear-gradient(90deg,#f0c842,#c9a84c)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              TEVATHA
            </span>
            <span className="w-px h-4 bg-border-bright opacity-40" />
            <span className="font-mono text-[10px] text-text-mute2 tracking-[.18em]">
              PROVISIONER
            </span>
          </div>

          {/* Right: donate + auth + back link */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Contribute link */}
            <Link
              href="/contribute"
              className="hidden sm:flex items-center font-mono text-[11px] text-text-mute2
                         border border-border-protocol rounded-lg px-3 py-1.5 min-h-[40px]
                         hover:border-gold-protocol/40 hover:text-text-base transition-all duration-200"
            >
              Contribute
            </Link>

            {/* Donate button */}
            <Link
              href="/donate"
              className="flex items-center gap-1.5 font-mono text-[11px] font-bold
                         text-void-0 bg-gold-protocol hover:bg-gold-bright
                         rounded-lg px-2.5 sm:px-3 py-1.5 min-h-[40px]
                         hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(201,168,76,0.35)]
                         transition-all duration-200"
            >
              <span>♥</span>
              <span className="hidden sm:inline">Donate</span>
            </Link>

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
                               min-h-[40px] hover:border-gold-protocol/40 transition-all duration-200"
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
                         border border-border-protocol rounded-lg px-3 py-1.5 min-h-[40px]
                         hover:border-gold-protocol/40 transition-all duration-200 flex items-center"
            >
              ← Watchtower
            </Link>
          </div>
        </div>
      </header>

    </>
  );
}
