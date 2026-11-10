import crypto from "node:crypto";
import { sendEmail } from "./brevo";
import { marketWelcomeEmail } from "./emails-market";
import { localize, MARKETS, type Market, type MarketId, serverKeys } from "./markets";
import { type Person, sendMetaEvent } from "./meta";
import { claimWelcome, releaseWelcome, saveCustomer, saveOrder } from "./supabase";
import { sendTikTokEvent } from "./tiktok";

// Whop (pagos de /us e /india). La página principal sigue con dLocal Go y no pasa por aquí.
// API: https://docs.whop.com/api-reference/overview — webhooks con el estándar Standard Webhooks.
const API = process.env.WHOP_API_URL || "https://api.whop.com/api/v1";

type Money = { amount: string; currency: string } | null;
export type WhopPayment = {
  id: string;
  status: string;
  paid_at: string | null;
  currency: string | null;
  total: Money;
  usd_total: Money;
  customer_email: string | null;
  user: { name: string | null } | null;
  billing_address: { name: string | null; country: string | null } | null;
  variant_id: string | null;
  metadata: Record<string, string> | null;
  ip_address: string | null;
  user_agent: string | null;
};

export async function getWhopPayment(id: string): Promise<WhopPayment> {
  const key = process.env.WHOP_API_KEY;
  if (!key) throw new Error("Falta WHOP_API_KEY");
  if (!/^pay_[A-Za-z0-9]+$/.test(id)) throw new Error("payment id no válido");
  const res = await fetch(`${API}/payments/${id}`, { headers: { Authorization: `Bearer ${key}` }, cache: "no-store" });
  if (!res.ok) throw new Error(`Whop ${res.status}: ${(await res.text()).slice(0, 200)}`);
  return (await res.json()) as WhopPayment;
}

// Firma del webhook (Standard Webhooks): HMAC-SHA256 en base64 de "id.timestamp.cuerpo" con el secreto ws_… tal cual.
export function verifyWhopWebhook(raw: string, h: Headers) {
  const secret = process.env.WHOP_WEBHOOK_SECRET;
  const id = h.get("webhook-id"), ts = h.get("webhook-timestamp"), sigs = h.get("webhook-signature");
  if (!secret || !id || !ts || !sigs) return false;
  if (Math.abs(Date.now() / 1000 - Number(ts)) > 300) return false;
  const expected = crypto.createHmac("sha256", secret).update(`${id}.${ts}.${raw}`).digest("base64");
  return sigs.split(" ").some((s) => {
    const v = s.split(",")[1] ?? "";
    return v.length === expected.length && crypto.timingSafeEqual(Buffer.from(v), Buffer.from(expected));
  });
}

// Mercado de un pago: por la metadata que pone nuestro checkout o, si falta, por el plan.
export function marketOfPayment(p: WhopPayment): Market | null {
  // El idioma en el que compró (lo manda nuestro checkout) decide el idioma del correo de bienvenida.
  const lang = p.metadata?.lang;
  const m = p.metadata?.market;
  if (m && m in MARKETS) return localize(MARKETS[m as MarketId], lang);
  const byPlan = Object.values(MARKETS).find((x) => x.whopPlan && x.whopPlan === p.variant_id);
  return byPlan ? localize(byPlan, lang) : null;
}

const splitName = (full?: string | null) => {
  const parts = (full ?? "").trim().split(/\s+/).filter(Boolean);
  return { first: parts[0], last: parts.slice(1).join(" ") || undefined };
};

// Registra la venta en Supabase (mismas tablas que dLocal) y manda la bienvenida en el idioma del mercado, una sola vez.
// Lo llaman el webhook de Whop y la página de gracias: lo que llegue primero.
export async function recordWhopPayment(p: WhopPayment, site: string) {
  const market = marketOfPayment(p);
  const email = p.customer_email?.trim().toLowerCase();
  if (p.status !== "paid" || !email || !market) return { saved: false as const, market };

  const { first, last } = splitName(p.billing_address?.name || p.user?.name);
  const country = p.billing_address?.country || undefined;
  await saveCustomer({ email, first_name: first, last_name: last, country });
  await saveOrder({
    payment_id: p.id,
    email,
    order_id: `${market.orderPrefix}_${p.metadata?.vid || "sin-visitante"}`,
    amount: p.total ? Number(p.total.amount) : null,
    currency: (p.total?.currency || p.currency || "").toUpperCase() || null,
    country: country ?? null,
    status: "paid",
    paid_at: p.paid_at || new Date().toISOString(),
  });

  if (!(await claimWelcome(p.id))) return { saved: true as const, market, welcome: "ya enviada" };
  try {
    const mail = marketWelcomeEmail(market, { site, email, firstName: first });
    await sendEmail({ to: email, name: [first, last].filter(Boolean).join(" "), senderName: market.brand, ...mail });
    return { saved: true as const, market, welcome: "enviada" };
  } catch (err) {
    await releaseWelcome(p.id).catch(() => {});
    throw err;
  }
}

// Purchase a la API de Meta y CompletePayment a TikTok, con el píxel del mercado y el mismo event_id que el navegador.
export async function trackWhopPurchase(p: WhopPayment, market: Market, site: string, browser?: Partial<Person>) {
  const keys = serverKeys(market);
  const { first, last } = splitName(p.billing_address?.name || p.user?.name);
  const md = p.metadata ?? {};
  const person: Person = {
    ip: p.ip_address || undefined,
    userAgent: p.user_agent || undefined,
    fbp: md.fbp || undefined,
    fbc: md.fbc || undefined,
    ttp: md.ttp || undefined,
    ttclid: md.ttclid || undefined,
    ...browser,
    email: p.customer_email || undefined,
    firstName: first,
    lastName: last,
    country: p.billing_address?.country || browser?.country,
    externalId: md.vid || browser?.externalId,
  };
  const value = p.total ? Number(p.total.amount) : market.price;
  const currency = (p.total?.currency || market.currency).toUpperCase();
  const id = `purchase_${p.id}`;
  const sourceUrl = `${site}/${market.id}/thanks`;
  await Promise.all([
    sendMetaEvent({ name: "Purchase", id, sourceUrl, person, pixel: { id: market.metaPixel, token: keys.metaToken }, customData: { value, currency, content_name: market.brand, content_type: "product", order_id: p.id } }),
    sendTikTokEvent({ name: "CompletePayment", id, sourceUrl, person, value, currency, contentName: market.brand, pixel: { id: market.tiktokPixel, token: keys.tiktokToken } }),
  ]);
}
