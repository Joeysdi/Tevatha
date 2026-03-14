// components/watchtower/watchtower-nav.tsx
"use client";

import Link      from "next/link";
import { usePathname } from "next/navigation";
import type { WatchtowerNavLink } from "@/app/(watchtower)/watchtower/layout";

interface WatchtowerNavProps {
  links: readonly WatchtowerNavLink[];
}

export function WatchtowerNav({ links }: WatchtowerNavProps) {
  const pathname = usePathname();

  return (
    <nav
      className="flex-shrink-0 bg-void-1 border-b border-border-protocol
                 px-4 flex gap-0 overflow-x-auto
                 scrollbar-none [-webkit-overflow-scrolling:touch]"
      style={{ boxShadow: "0 1px 0 rgba(255,255,255,0.03)" }}
      aria-label="Watchtower navigation"
    >
      {links.map((link) => {
        const isActive =
          link.href === "/watchtower"
            ? pathname === "/watchtower"
            : pathname.startsWith(link.href);

        return (
          <Link
            key={link.href}
            href={link.href}
            prefetch={true}
            className={`
              px-4 py-3 font-syne font-semibold text-[13px]
              tracking-[.03em] border-b-2 transition-all duration-150
              whitespace-nowrap focus-visible:outline-none
              focus-visible:ring-2 focus-visible:ring-gold-protocol/50
              ${isActive
                ? "text-gold-protocol border-gold-protocol bg-gold-glow"
                : "text-text-mute2 border-transparent hover:text-text-base hover:bg-white/[0.03] hover:border-border-bright/40"
              }
            `}
            aria-current={isActive ? "page" : undefined}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
