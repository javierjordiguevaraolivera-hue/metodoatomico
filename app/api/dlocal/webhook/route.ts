import { NextResponse } from "next/server";
import { CURRENCY, PRICE_USD, PRODUCT_NAME } from "@/lib/config";
import { getPayment, verifyNotification, visitorFromOrderId } from "@/lib/dlocal";
import { sendMetaEvent, type Person } from "@/lib/meta";
import { sendTikTokEvent } from "@/lib/tiktok";

// dLocal Go avisa aquí cada cambio de estado de un pago. Si quedó pagado, se manda Purchase a la CAPI de Meta
// y CompletePayment a TikTok, con event_id "purchase_<id del pago>", el mismo que usan los píxeles en /gracias.
export async function POST(req: Request) {
  const raw = await req.text();
  if (!verifyNotification(raw, req.headers.get("authorization"))) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const paymentId = (() => { try { return JSON.parse(raw).payment_id as string | undefined; } catch { return undefined; } })();
  if (!paymentId) return NextResponse.json({ ok: true });

  try {
    const p = await getPayment(paymentId);
    if (p.status === "PAID") {
      const site = process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin;
      const id = `purchase_${p.id}`;
      const sourceUrl = `${site}/gracias`;
      const person: Person = {
        email: p.payer?.email,
        firstName: p.payer?.first_name,
        lastName: p.payer?.last_name,
        country: p.country,
        externalId: visitorFromOrderId(p.order_id),
      };
      await Promise.all([
        sendMetaEvent({ name: "Purchase", id, sourceUrl, person, customData: { value: PRICE_USD, currency: CURRENCY, content_name: PRODUCT_NAME, content_type: "product", order_id: p.order_id } }),
        sendTikTokEvent({ name: "CompletePayment", id, sourceUrl, person, value: PRICE_USD, currency: CURRENCY, contentName: PRODUCT_NAME }),
      ]);
    }
  } catch (err) {
    // Sin 200, dLocal Go reintenta cada 10 minutos.
    console.error("webhook dLocal", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
