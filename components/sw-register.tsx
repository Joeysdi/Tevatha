// components/sw-register.tsx
"use client";

import { useEffect } from "react";

export function SWRegister() {
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      process.env.NODE_ENV === "production"
    ) {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .then((reg) => {
          console.info("[SW] Registered:", reg.scope);
          // Trigger immediate update check on each mount
          reg.update().catch(() => null);
        })
        .catch((err) => console.warn("[SW] Registration failed:", err));
    }
  }, []);

  return null; // renders nothing — side-effect only
}
