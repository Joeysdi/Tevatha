// components/protocol/protocol-nav.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";

const PROTOCOL_LINKS = [
  { href: "/ledger",  label: "Continuity Ledger" },
  { href: "/envoy",   label: "Envoy Network"      },
];

const ESCAPE_LINK = { href: "/watchtower", label: "← Watchtower" };

export function ProtocolNav() {
  const pathname  = usePathname();
  const [open, setOpen]       = useState(false);
  const [isOnline, setOnline] = useState(true);

  useEffect(() => {
    setOnline(navigator.onLine);
    const on  = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online",  on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online",  on);
      window.removeEventListener("offline", off);
    };
  }, []);

  const OfflineBadge = () => (
    <span className="border border-cyan-border text-cyan-DEFAULT font-mono text-[9px]
                     px-2 py-0.5 rounded ml-4">
      {isOnline ? "ONLINE" : "OFFLINE READY"}
    </span>
  );

  return (
    <>
      {/* Desktop nav */}
      <nav className="hidden md:flex items-center gap-1">
        {PROTOCOL_LINKS.map((l) => {
          const active = pathname === l.href || pathname.startsWith(l.href + "/");
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`font-mono text-[11px] px-3 py-1.5 transition-colors duration-150
                ${active
                  ? "border-b-2 border-cyan-DEFAULT text-cyan-DEFAULT"
                  : "text-text-dim hover:text-text-base"
                }`}
            >
              {l.label}
            </Link>
          );
        })}

        <span className="text-text-mute2 mx-2">·</span>

        <Link
          href={ESCAPE_LINK.href}
          className="font-mono text-[11px] text-text-mute2 hover:text-text-base
                     transition-colors duration-150"
        >
          {ESCAPE_LINK.label}
        </Link>

        <OfflineBadge />
      </nav>

      {/* Mobile hamburger */}
      <div className="md:hidden">
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex flex-col gap-[5px] p-2 focus-visible:outline-none"
          aria-label={open ? "Close menu" : "Open menu"}
        >
          <motion.span
            animate={open ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }}
            transition={{ duration: 0.2 }}
            className="block w-5 h-px bg-text-base"
          />
          <motion.span
            animate={open ? { opacity: 0 } : { opacity: 1 }}
            transition={{ duration: 0.15 }}
            className="block w-5 h-px bg-text-base"
          />
          <motion.span
            animate={open ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }}
            transition={{ duration: 0.2 }}
            className="block w-5 h-px bg-text-base"
          />
        </button>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
              style={{ overflow: "hidden" }}
              className="absolute top-full left-0 right-0 bg-void-1
                         border-b border-border-protocol z-50 px-6 py-4"
            >
              <div className="flex flex-col gap-2">
                {PROTOCOL_LINKS.map((l) => {
                  const active = pathname === l.href || pathname.startsWith(l.href + "/");
                  return (
                    <Link
                      key={l.href}
                      href={l.href}
                      onClick={() => setOpen(false)}
                      className={`font-mono text-[12px] py-2 transition-colors duration-150
                        ${active
                          ? "text-cyan-DEFAULT border-b border-cyan-DEFAULT/40"
                          : "text-text-dim hover:text-text-base"
                        }`}
                    >
                      {l.label}
                    </Link>
                  );
                })}

                <div className="border-t border-border-protocol my-1" />

                <Link
                  href={ESCAPE_LINK.href}
                  onClick={() => setOpen(false)}
                  className="font-mono text-[11px] text-text-mute2 hover:text-text-base
                             py-2 transition-colors duration-150"
                >
                  {ESCAPE_LINK.label}
                </Link>

                <OfflineBadge />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
