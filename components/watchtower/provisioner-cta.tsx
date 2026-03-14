// components/watchtower/provisioner-cta.tsx
import Link from "next/link";

interface ProvisionerCtaProps {
  headline:   string;
  subtext:    string;
  label?:     string;
  href?:      string;
  urgency?:   string;
}

export function ProvisionerCta({
  headline,
  subtext,
  label   = "Enter the Provisioner →",
  href    = "/provisioner",
  urgency,
}: ProvisionerCtaProps) {
  return (
    <aside
      className="relative overflow-hidden rounded-2xl border mt-8 px-8 py-7"
      style={{
        background: "linear-gradient(135deg,rgba(201,168,76,0.09) 0%,rgba(245,158,11,0.03) 50%,rgba(8,12,16,0) 100%)",
        borderColor: "rgba(201,168,76,0.28)",
        boxShadow: "0 0 0 1px rgba(255,255,255,0.03) inset, 0 8px 40px rgba(0,0,0,0.4)",
      }}
      aria-label="Call to action: Provisioner"
    >
      {/* Top accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: "linear-gradient(90deg,transparent,rgba(201,168,76,0.6),transparent)" }}
      />

      {urgency && (
        <div className="flex items-center gap-2.5 mb-4">
          <span
            className="w-1.5 h-1.5 rounded-full bg-amber-protocol animate-pulse
                       shadow-[0_0_8px_rgba(240,165,0,0.7)]"
          />
          <span className="font-mono text-[10px] text-amber-protocol
                           tracking-[.14em] uppercase">
            {urgency}
          </span>
        </div>
      )}

      <h3 className="font-syne font-bold text-[22px] text-text-base mb-3 leading-tight">
        {headline}
      </h3>
      <p className="text-text-dim text-[13.5px] leading-relaxed max-w-2xl mb-6">
        {subtext}
      </p>

      <Link
        href={href}
        prefetch={true}
        className="inline-flex items-center gap-2 bg-gold-protocol text-void-0
                   font-syne font-bold text-[13px] tracking-[.08em] px-7 py-3
                   rounded-lg transition-all duration-200
                   hover:bg-gold-bright hover:-translate-y-0.5
                   hover:shadow-[0_8px_24px_rgba(201,168,76,0.3)]
                   focus-visible:outline-none
                   focus-visible:ring-2 focus-visible:ring-gold-bright/50"
      >
        {label}
      </Link>
    </aside>
  );
}
