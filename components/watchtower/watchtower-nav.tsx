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
                 px-3.5 flex gap-0 overflow-x-auto
                 scrollbar-none [-webkit-overflow-scrolling:touch]"
      aria-label="Watchtower navigation"
    >
      {links.map((link) => {
        // Exact match for Hub (/watchtower), prefix match for sub-pages
        const isActive =
          link.href === "/watchtower"
            ? pathname === "/watchtower"
            : pathname.startsWith(link.href);

        return (
          <Link
            key={link.href}
            href={link.href}
            prefetch={true}            // Aggressive prefetch — LCP on navigation
            className={`
              px-3.5 py-2.5 font-syne font-semibold text-[13.5px]
              tracking-[.04em] border-b-2 transition-all duration-150
              whitespace-nowrap focus-visible:outline-none
              focus-visible:ring-2 focus-visible:ring-gold-protocol/50
              ${isActive
                ? "text-gold-protocol border-gold-protocol bg-gold-protocol/[0.06]"
                : "text-text-mute2 border-transparent hover:text-text-base hover:border-border-hover"
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
