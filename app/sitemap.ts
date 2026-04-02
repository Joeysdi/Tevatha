// app/sitemap.ts
import type { MetadataRoute } from "next";
import { CATALOG } from "@/lib/provisioner/catalog";

const BASE = "https://tevatha.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const gearPages = CATALOG
    .filter((p) => p.category !== "real_estate")
    .map((p) => ({
      url:              `${BASE}/provisioner/gear/${p.id}`,
      lastModified:     new Date(),
      changeFrequency:  "monthly" as const,
      priority:         0.7,
    }));

  const realEstatePages = CATALOG
    .filter((p) => p.category === "real_estate")
    .map((p) => ({
      url:              `${BASE}/provisioner/gear/${p.id}`,
      lastModified:     new Date(),
      changeFrequency:  "monthly" as const,
      priority:         0.6,
    }));

  return [
    { url: `${BASE}/watchtower`,               lastModified: new Date(), changeFrequency: "daily",   priority: 1.0 },
    { url: `${BASE}/provisioner`,              lastModified: new Date(), changeFrequency: "weekly",  priority: 0.9 },
    { url: `${BASE}/provisioner/gear`,         lastModified: new Date(), changeFrequency: "weekly",  priority: 0.9 },
    { url: `${BASE}/provisioner/zero`,         lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE}/provisioner/checklist`,    lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/provisioner/properties`,   lastModified: new Date(), changeFrequency: "weekly",  priority: 0.7 },
    { url: `${BASE}/donate`,                   lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    ...gearPages,
    ...realEstatePages,
  ];
}
