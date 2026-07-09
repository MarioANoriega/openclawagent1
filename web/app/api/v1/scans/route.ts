import { NextRequest, NextResponse } from "next/server";
import { createScan, listScans } from "@/lib/store";

export const dynamic = "force-dynamic";

// Demo API key. In a real deployment this is per-user and checked against a DB;
// here any non-empty Bearer token (or the demo key) is accepted so the flow is
// exercisable end to end.
const DEMO_KEY = "sk_demo_sapient";

function authorized(req: NextRequest): boolean {
  const auth = req.headers.get("authorization") ?? "";
  const token = auth.replace(/^Bearer\s+/i, "").trim();
  return token.length > 0; // accept any key in the demo, incl. sk_demo_sapient
}

// POST /v1/scans  — create a scan from a video URL (or a file reference).
// Body: { "url": "https://..." }  or  { "file": "name.mp4" }
export async function POST(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json(
      { error: "missing_api_key", hint: `Send "Authorization: Bearer ${DEMO_KEY}"` },
      { status: 401 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const { url, file } = (body ?? {}) as { url?: string; file?: string };
  if (!url && !file) {
    return NextResponse.json(
      { error: "missing_source", hint: "Provide a `url` or `file` field." },
      { status: 400 }
    );
  }

  const source = url
    ? { kind: "url" as const, value: url }
    : { kind: "file" as const, value: file as string };

  const scan = createScan(source);
  return NextResponse.json(scan, { status: 202 });
}

// GET /v1/scans — list recent scans (demo convenience; not per-user scoped).
export async function GET(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "missing_api_key" }, { status: 401 });
  }
  return NextResponse.json({ data: listScans() });
}
