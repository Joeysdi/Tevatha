// app/sign-up/[[...sign-up]]/page.tsx
import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-void-0 flex items-center justify-center px-4">
      {/* Ambient glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 50% 40%, rgba(201,168,76,0.06), transparent)",
        }}
      />

      <div className="relative z-10 flex flex-col items-center gap-6">
        {/* Brand header */}
        <div className="text-center mb-2">
          <p className="font-mono text-[9px] text-gold-protocol tracking-[.28em] uppercase mb-3">
            Tevatha · Secure Access
          </p>
          <h1 className="font-syne font-extrabold text-[26px] text-text-base leading-tight">
            Create{" "}
            <span className="text-gold-protocol">Account</span>
          </h1>
          <p className="font-mono text-[10.5px] text-text-dim mt-2">
            Join the Tevatha provisioner network
          </p>
        </div>

        <SignUp
          routing="path"
          path="/sign-up"
          signInUrl="/sign-in"
          forceRedirectUrl="/provisioner"
          appearance={{
            elements: {
              rootBox:            "w-full",
              card:               "bg-void-1 border border-border-protocol rounded-xl shadow-none",
              headerTitle:        "hidden",
              headerSubtitle:     "hidden",
              socialButtonsBlockButton:
                "bg-void-2 border border-border-protocol text-text-base hover:bg-void-3 font-mono text-[11px]",
              dividerLine:        "bg-border-protocol",
              dividerText:        "text-text-mute2 font-mono text-[10px]",
              formFieldInput:
                "bg-void-2 border border-border-protocol text-text-base font-mono placeholder:text-text-mute2/50 focus:border-gold-protocol",
              formFieldLabel:     "text-text-dim font-mono text-[11px]",
              formButtonPrimary:
                "bg-gold-protocol hover:bg-gold-bright text-void-0 font-mono font-bold text-[11px] tracking-[.06em] transition-colors",
              footerActionLink:   "text-gold-protocol hover:text-gold-bright font-mono text-[11px]",
              footerActionText:   "text-text-mute2 font-mono text-[11px]",
            },
          }}
        />
      </div>
    </div>
  );
}
