// components/provisioner/print-button.tsx
"use client";

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="mt-4 font-mono text-[10px] font-bold px-4 py-2 rounded-lg
                 border border-gold-protocol/40 text-gold-protocol
                 hover:bg-gold-protocol/10 transition-colors print:hidden"
    >
      Print / Save as PDF →
    </button>
  );
}
