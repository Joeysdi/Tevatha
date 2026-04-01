export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import { createServiceSupabaseClient } from "@/lib/supabase/server";
import { parseCSV }                  from "@/lib/store/sources/csv-parser";
import { normalizeCSVFood }          from "@/lib/store/normalize/food";
import { normalizeCSVWater }         from "@/lib/store/normalize/water";
import { normalizeCSVEnergy }        from "@/lib/store/normalize/energy";
import type { StoreProduct, RawCSVProduct } from "@/lib/store/types";
import { requireAdmin, authErrorStatus } from "@/lib/auth/roles";

const MAX_FILE_BYTES = 2 * 1024 * 1024; // 2 MB

type ProductRow = Omit<StoreProduct, "id" | "created_at" | "updated_at" | "store_variants">;

function routeRowToNormalizer(row: RawCSVProduct): {
  product: ProductRow | null;
  errors: string[];
} {
  const category = row["category"]?.trim().toLowerCase();
  if (category === "food") {
    const { product, errors } = normalizeCSVFood(row);
    return { product: product as ProductRow, errors };
  }
  if (category === "water") {
    const { product, errors } = normalizeCSVWater(row);
    return { product: product as ProductRow, errors };
  }
  if (category === "energy") {
    const { product, errors } = normalizeCSVEnergy(row);
    return { product: product as ProductRow, errors };
  }
  return { product: null, errors: [`Unknown category: ${category}`] };
}

// POST /api/admin/store/import — multipart CSV upload
// Returns: { imported: number; flagged: number; errors: string[] }
export async function POST(req: NextRequest) {
  try {
    await requireAdmin();

    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const bytes = await (file as Blob).arrayBuffer();
    if (bytes.byteLength > MAX_FILE_BYTES) {
      return NextResponse.json({ error: "File exceeds 2 MB limit" }, { status: 413 });
    }

    const text = new TextDecoder("utf-8").decode(bytes);
    const { rows, errors: parseErrors } = parseCSV(text);

    const allErrors: string[] = [...parseErrors];
    const products: ProductRow[] = [];
    let flagged = 0;

    for (const row of rows) {
      const { product, errors } = routeRowToNormalizer(row);
      if (errors.length > 0) {
        allErrors.push(...errors.map((e) => `Row [${row["name"] ?? "?"}]: ${e}`));
      }
      if (product) {
        products.push(product);
        if (product.status === "review") flagged++;
      }
    }

    if (!products.length) {
      return NextResponse.json({ imported: 0, flagged: 0, errors: allErrors });
    }

    const supabase = createServiceSupabaseClient();
    const { data, error } = await supabase
      .from("store_products")
      .upsert(products, { onConflict: "source,source_id", ignoreDuplicates: false })
      .select("id");

    if (error) throw error;

    return NextResponse.json({
      imported: (data ?? []).length,
      flagged,
      errors: allErrors,
    });
  } catch (err) {
    const msg = String(err);
    return NextResponse.json({ error: msg }, { status: authErrorStatus(msg) });
  }
}
