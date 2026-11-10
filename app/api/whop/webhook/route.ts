import { NextResponse } from "next/server";
import { getWhopPayment, recordWhopPayment, trackWhopPurchase, verifyWhopWebhook } from "@/lib/whop";

// Whop avisa aquí cada pago (evento payment.succeeded). Solo /us e /india usan Whop.
// Se vuelve a leer el pago desde la API de Whop: así no dependemos de lo que trae el aviso.
export async function POST(req: Request) {
  const raw = await req.text();
  if (!verifyWhopWebhook(raw, req.headers)) return NextResponse.json({ ok: false }, { status: 401 });

  let event: { type?: string; data?: { id?: string } };
  try { event = JSON.parse(raw); } catch { return NextResponse.json({ ok: true }); }
  if (event.type !== "payment.succeeded" || !event.data?.id) return NextResponse.json({ ok: true });

  try {
    const p = await getWhopPayment(event.data.id);
    const site = process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin;
    const r = await recordWhopPayment(p, site);
    if (r.saved && r.market) await trackWhopPurchase(p, r.market, site);
    else console.warn("webhook Whop: pago sin registrar", p.id, p.status, r.market?.id ?? "sin mercado");
  } catch (err) {
    // Sin 2xx, Whop reintenta el aviso.
    console.error("webhook Whop", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
