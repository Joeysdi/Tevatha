// components/provisioner/provisioner-atmosphere.tsx
"use client";

export function ProvisionerAtmosphere() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      {/* Gold grid */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(201,168,76,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(201,168,76,0.03) 1px,transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      {/* Scan line — promoted to its own compositor layer */}
      <div
        className="fixed left-0 right-0 top-0 h-[2px]"
        style={{
          background: "rgba(201,168,76,0.10)",
          animation: "scanDown 3.5s linear infinite",
          willChange: "transform",
        }}
      />
      <style>{`
        @keyframes scanDown {
          from { transform: translateY(0) }
          to   { transform: translateY(100vh) }
        }
      `}</style>
    </div>
  );
}
