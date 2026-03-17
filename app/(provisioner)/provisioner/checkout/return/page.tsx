// app/(provisioner)/provisioner/checkout/return/page.tsx
// Stripe redirects here after the embedded checkout completes.
// session_id is set by Stripe; order_id is our UUID we embedded in return_url.

import type { Metadata }   from "next";
import Link                from "next/link";
import { getStripe }       from "@/lib/stripe/client";

export const metadata: Metadata = { title: "Order Confirmation" };

// Stripe appends ?session_id=cs_... to our return_url template.
interface PageProps {
  searchParams: Promise<{ session_id?: string; order_id?: string }>;
}

export default async function CheckoutReturnPage({ searchParams }: PageProps) {
  const { session_id, order_id } = await searchParams;

  // ── Guard: missing params ─────────────────────────────────────────────────
  if (!session_id) {
    return <ReturnShell status="invalid" orderId={null} />;
  }

  // ── Fetch session status from Stripe ─────────────────────────────────────
  let paymentStatus: string;
  try {
    const session = await getStripe().checkout.sessions.retrieve(session_id, {
      expand: ["payment_intent"],
    });
    paymentStatus = session.payment_status; // "paid" | "unpaid" | "no_payment_required"
  } catch {
    return <ReturnShell status="error" orderId={order_id ?? null} />;
  }

  return (
    <ReturnShell
      status={paymentStatus === "paid" ? "paid" : "unpaid"}
      orderId={order_id ?? null}
    />
  );
}

// ── Presentational shell ────────────────────────────────────────────────────

function ReturnShell({
  status,
  orderId,
}: {
  status:  "paid" | "unpaid" | "error" | "invalid";
  orderId: string | null;
}) {
  const isPaid = status === "paid";

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div
        className="relative rounded-2xl border p-8 sm:p-10 max-w-md w-full text-center overflow-hidden"
        style={{
          borderColor:  isPaid ? "rgba(26,232,160,0.25)" : "rgba(232,64,64,0.25)",
          background:   isPaid
            ? "linear-gradient(135deg,rgba(26,232,160,0.06),rgba(11,13,24,0))"
            : "linear-gradient(135deg,rgba(232,64,64,0.06),rgba(11,13,24,0))",
          boxShadow: "0 0 0 1px rgba(255,255,255,0.03) inset, 0 8px 40px rgba(0,0,0,0.4)",
        }}
      >
        {/* Top accent line */}
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{
            background: isPaid
              ? "linear-gradient(90deg,#1ae8a0,transparent)"
              : "linear-gradient(90deg,#e84040,transparent)",
          }}
        />

        {/* Status icon */}
        <div className="text-[48px] mb-4 leading-none">
          {isPaid ? "✓" : status === "error" ? "⚠" : "✕"}
        </div>

        {/* Eyebrow */}
        <p
          className={`font-mono text-[9px] tracking-[.22em] uppercase mb-3
            ${isPaid ? "text-green-bright" : "text-red-bright"}`}
        >
          {isPaid ? "Payment Confirmed" : "Payment Not Completed"}
        </p>

        {/* Headline */}
        <h1 className="font-syne font-extrabold text-[22px] text-text-base mb-3 leading-tight">
          {isPaid
            ? "Order Received"
            : status === "error"
              ? "Something Went Wrong"
              : status === "invalid"
                ? "Invalid Session"
                : "Payment Incomplete"}
        </h1>

        {/* Body */}
        <p className="font-mono text-[11px] text-text-dim leading-relaxed mb-6">
          {isPaid ? (
            <>
              Your gear is secured. We&apos;re processing your order now.
              {orderId && (
                <span className="block mt-2 text-text-mute2">
                  Order ID:{" "}
                  <span className="text-gold-protocol font-bold">
                    {orderId.slice(0, 8).toUpperCase()}
                  </span>
                </span>
              )}
            </>
          ) : status === "error" ? (
            "We couldn't verify your payment session. Contact support if funds were charged."
          ) : status === "invalid" ? (
            "This return link is missing required parameters."
          ) : (
            "Your payment was not completed. No funds were charged. Return to the shop and try again."
          )}
        </p>

        {/* CTA */}
        <Link
          href="/provisioner"
          className={`inline-flex items-center gap-2 font-mono font-bold text-[11px]
                      tracking-[.06em] px-6 py-3 rounded-xl transition-all duration-200
                      hover:-translate-y-0.5
                      ${isPaid
                        ? "bg-green-bright/15 text-green-bright border border-green-bright/30 hover:bg-green-bright/20 hover:shadow-[0_8px_24px_rgba(26,232,160,0.15)]"
                        : "bg-gold-protocol text-void-0 hover:bg-gold-bright hover:shadow-[0_8px_24px_rgba(201,168,76,0.3)]"
                      }`}
        >
          {isPaid ? "← Back to Shop" : "← Try Again"}
        </Link>
      </div>
    </div>
  );
}
