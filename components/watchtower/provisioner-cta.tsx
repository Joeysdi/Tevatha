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
      className="relative overflow-hidden rounded-xl border mt-8 px-6 py-5"
      style={{
        background: "linear-gradient(135deg,rgba(251,191,36,0.07),rgba(245,158,11,0.03))",
        borderColor: "rgba(201,168,76,0.22)",
      }}
      aria-label="Call to action: Provisioner"
    >
      {/* Top accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: "linear-gradient(90deg,transparent,#c9a84c,transparent)" }}
      />

      {urgency && (
        <div className="flex items-center gap-2 mb-2.5">
          <span
            className="w-1.5 h-1.5 rounded-full bg-amber-protocol animate-pulse
                       shadow-[0_0_6px_rgba(240,165,0,0.7)]"
          />
          <span className="font-mono text-[10px] text-amber-protocol
                           tracking-[.12em] uppercase">
            {urgency}
          </span>
        </div>
      )}

      <h3 className="font-syne font-bold text-[20px] text-text-base mb-2 leading-tight">
        {headline}
      </h3>
      <p className="text-text-dim text-[13px] leading-relaxed max-w-xl mb-4">
        {subtext}
      </p>

      {/*
        prefetch={true} is the default for <Link>, but we're explicit here.
        This prefetches the Provisioner route in the background on render,
        ensuring sub-50ms navigation on click.
      */}
      <Link
        href={href}
        prefetch={true}
        className="inline-flex items-center gap-2 bg-gold-protocol text-void-0
                   font-syne font-bold text-[13px] tracking-[.08em] px-6 py-2.5
                   rounded-[7px] transition-all duration-200
                   hover:bg-[#f0c842] hover:-translate-y-0.5
                   hover:shadow-[0_6px_20px_rgba(201,168,76,0.25)]
                   focus-visible:outline-none
                   focus-visible:ring-2 focus-visible:ring-gold-bright/50"
      >
        {label}
      </Link>
    </aside>
  );
}
