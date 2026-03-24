// components/watchtower/watchtower-nav.tsx
"use client";

import Link      from "next/link";
import { usePathname } from "next/navigation";
interface WatchtowerNavLink {
  href:  string;
  label: string;
}

interface WatchtowerNavProps {
  links: readonly WatchtowerNavLink[];
}

const PILLAR_LINKS = [
  { href: "/provisioner", label: "Provisioner" },
  { href: "/protocol",    label: "Protocol"    },
] as const;

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

      {/* Separator + cross-pillar escape links */}
      <div className="flex items-center ml-2 pl-2 border-l border-border-protocol/60 gap-0">
        {PILLAR_LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            prefetch
            className="px-3 py-3 font-mono text-[10px] text-text-mute2
                       border-b-2 border-transparent whitespace-nowrap
                       hover:text-text-base transition-all duration-150"
          >
            {l.label} ↗
          </Link>
        ))}
      </div>
    </nav>
  );
}
