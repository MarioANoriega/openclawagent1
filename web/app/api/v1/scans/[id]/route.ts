import { NextRequest, NextResponse } from "next/server";
import { getScan } from "@/lib/store";

export const dynamic = "force-dynamic";

// GET /v1/scans/{id} — poll a scan. Returns 200 with the scan in whatever
// status it's in (queued | processing | completed | failed). Clients poll
// until status === "completed".
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = req.headers.get("authorization") ?? "";
  if (!auth.replace(/^Bearer\s+/i, "").trim()) {
    return NextResponse.json({ error: "missing_api_key" }, { status: 401 });
  }

  const scan = getScan(params.id);
  if (!scan) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  return NextResponse.json(scan);
}
