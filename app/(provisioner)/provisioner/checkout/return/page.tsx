// app/(provisioner)/provisioner/checkout/return/page.tsx
// Stripe redirects here after the embedded checkout completes.
// session_id is set by Stripe; order_id is our UUID we embedded in return_url.

import type { Metadata }   from "next";
import { getStripe }       from "@/lib/stripe/client";
import { ReturnShell }     from "@/components/provisioner/return-shell";

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
