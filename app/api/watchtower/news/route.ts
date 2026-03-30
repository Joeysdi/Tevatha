// app/api/watchtower/news/route.ts
export const dynamic = "force-dynamic";
export async function GET() {
  return Response.json(
    { error: "deprecated — news feed is now fetched client-side" },
    { status: 410 },
  );
}
