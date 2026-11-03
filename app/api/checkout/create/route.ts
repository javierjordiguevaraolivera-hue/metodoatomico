import { cookies, headers } from "next/headers";
import { NextResponse } from "next/server";
import { CURRENCY, PRICE_USD, PRODUCT_NAME } from "@/lib/config";
import { DEFAULT_COUNTRY, isCountry } from "@/lib/countries";
import { createPayment, makeOrderId } from "@/lib/dlocal";

// Crea el pago en dLocal Go al abrir el checkout. Devuelve el token para la tarjeta embebida
// (SmartFields) y el link del checkout de dLocal para pagar con otros métodos.
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const h = await headers();
  const c = await cookies();
  const geoCountry = h.get("x-vercel-ip-country");
  const country = isCountry(body?.country) ? body.country : isCountry(geoCountry) ? geoCountry : DEFAULT_COUNTRY;
  const site = process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin;

  try {
    const payment = await createPayment({
      amount: PRICE_USD,
      currency: CURRENCY,
      country,
      order_id: makeOrderId(c.get("ma_vid")?.value),
      description: PRODUCT_NAME,
      success_url: `${site}/gracias`,
      back_url: site,
      notification_url: `${site}/api/dlocal/webhook`,
      allow_transparent: true,
    });
    const res = NextResponse.json({
      country,
      checkoutToken: payment.merchant_checkout_token,
      redirectUrl: payment.redirect_url,
    });
    // La página de gracias lee de aquí qué pago revisar.
    res.cookies.set("ma_pid", payment.id, { httpOnly: true, sameSite: "lax", secure: site.startsWith("https"), path: "/", maxAge: 60 * 60 * 24 * 3 });
    return res;
  } catch (err) {
    console.error("crear pago", err);
    return NextResponse.json({ error: "No pudimos iniciar el pago. Intenta de nuevo en un momento." }, { status: 502 });
  }
}
