// app/(provisioner)/provisioner/page.tsx  →  redirect to threat-domain catalog
import { redirect } from "next/navigation";

export default function ProvisionerRoot() {
  redirect("/provisioner/tiers");
}
