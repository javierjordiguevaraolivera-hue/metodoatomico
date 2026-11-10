import { NextResponse } from "next/server";
import { getMarket, serverKeys } from "@/lib/markets";
import { personFromRequest, sendMetaEvent } from "@/lib/meta";
import { sendTikTokEvent } from "@/lib/tiktok";

// Copia en las APIs de Meta y TikTok de los eventos del navegador en /us e /india, con el píxel de cada mercado.
// La página principal usa /api/track (sin cambios).
const ALLOWED = new Set(["PageView", "ViewContent", "InitiateCheckout"]);

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const market = getMarket(String(body?.market ?? ""));
  if (!market || !ALLOWED.has(body.name) || typeof body.id !== "string" || body.id.length > 80) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const keys = serverKeys(market);
  const url = typeof body.url === "string" ? body.url.slice(0, 2000) : undefined;
  const person = await personFromRequest(url);
  await Promise.all([
    sendMetaEvent({
      name: body.name,
      id: body.id,
      sourceUrl: url,
      person,
      pixel: { id: market.metaPixel, token: keys.metaToken },
      customData: typeof body.customData === "object" && body.customData ? body.customData : undefined,
    }),
    body.name !== "PageView" &&
      sendTikTokEvent({ name: body.name, id: body.id, sourceUrl: url, person, value: market.trackValue, currency: market.trackCurrency, contentName: market.brand, pixel: { id: market.tiktokPixel, token: keys.tiktokToken } }),
  ]);
  return NextResponse.json({ ok: true });
}
