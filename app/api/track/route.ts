import { NextResponse } from "next/server";
import { personFromRequest, sendMetaEvent } from "@/lib/meta";

// Copia en la CAPI de los eventos que el navegador manda al píxel.
// Purchase no entra por aquí: lo dispara el servidor solo cuando dLocal Go confirma el pago.
const ALLOWED = new Set(["PageView", "ViewContent", "InitiateCheckout"]);

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body || !ALLOWED.has(body.name) || typeof body.id !== "string" || body.id.length > 80) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const url = typeof body.url === "string" ? body.url.slice(0, 2000) : undefined;
  await sendMetaEvent({
    name: body.name,
    id: body.id,
    sourceUrl: url,
    person: await personFromRequest(url),
    customData: typeof body.customData === "object" && body.customData ? body.customData : undefined,
  });
  return NextResponse.json({ ok: true });
}
