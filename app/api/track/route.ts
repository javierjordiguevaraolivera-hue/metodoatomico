import { NextResponse } from "next/server";
import { CURRENCY, PRICE_USD, PRODUCT_NAME } from "@/lib/config";
import { personFromRequest, sendMetaEvent } from "@/lib/meta";
import { sendTikTokEvent } from "@/lib/tiktok";

// Copia en la CAPI de los eventos que el navegador manda al píxel.
// Purchase no entra por aquí: lo dispara el servidor solo cuando dLocal Go confirma el pago.
const ALLOWED = new Set(["PageView", "ViewContent", "InitiateCheckout", "AddPaymentInfo"]);
const text = (v: unknown, max = 200) => (typeof v === "string" && v.trim() ? v.trim().slice(0, max) : undefined);

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body || !ALLOWED.has(body.name) || typeof body.id !== "string" || body.id.length > 80) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const url = typeof body.url === "string" ? body.url.slice(0, 2000) : undefined;
  const person = await personFromRequest(url);
  // Datos que la persona escribió en el checkout (AddPaymentInfo): se suman al advanced matching.
  const b = typeof body.buyer === "object" && body.buyer ? body.buyer : {};
  person.email = text(b.email)?.toLowerCase() || person.email;
  person.firstName = text(b.firstName) || person.firstName;
  person.lastName = text(b.lastName) || person.lastName;
  await Promise.all([
    sendMetaEvent({
      name: body.name,
      id: body.id,
      sourceUrl: url,
      person,
      customData: typeof body.customData === "object" && body.customData ? body.customData : undefined,
    }),
    // A TikTok va todo menos PageView: ttq.page() no lleva event_id y no se podría deduplicar.
    body.name !== "PageView" &&
      sendTikTokEvent({ name: body.name, id: body.id, sourceUrl: url, person, value: PRICE_USD, currency: CURRENCY, contentName: PRODUCT_NAME }),
  ]);
  return NextResponse.json({ ok: true });
}
