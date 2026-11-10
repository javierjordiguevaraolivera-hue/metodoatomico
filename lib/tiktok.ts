import crypto from "node:crypto";
import { TIKTOK_PIXEL_ID } from "./config";
import type { Person } from "./meta";

// Events API de TikTok. Lleva el mismo event_id que ttq.track en el navegador, así TikTok lo cuenta una vez.
const sha256 = (v?: string) => (v ? crypto.createHash("sha256").update(v.trim().toLowerCase()).digest("hex") : undefined);

export async function sendTikTokEvent(e: {
  name: "ViewContent" | "InitiateCheckout" | "AddPaymentInfo" | "CompletePayment";
  id: string;
  sourceUrl?: string;
  person: Person;
  value: number;
  currency: string;
  contentName: string;
  /** Solo /us e /india: su propio píxel y token. */
  pixel?: { id: string; token: string };
}) {
  const token = e.pixel ? e.pixel.token : process.env.TIKTOK_ACCESS_TOKEN;
  if (e.pixel && !e.pixel.id) return { skipped: "sin píxel" };
  if (!token) return { skipped: "sin TIKTOK_ACCESS_TOKEN" };
  const p = e.person;
  const body = {
    event_source: "web",
    event_source_id: e.pixel ? e.pixel.id : TIKTOK_PIXEL_ID,
    test_event_code: process.env.TIKTOK_TEST_EVENT_CODE || undefined,
    data: [{
      event: e.name,
      event_time: Math.floor(Date.now() / 1000),
      event_id: e.id,
      user: {
        email: sha256(p.email),
        external_id: sha256(p.externalId),
        ttclid: p.ttclid,
        ttp: p.ttp,
        ip: p.ip,
        user_agent: p.userAgent,
      },
      page: e.sourceUrl ? { url: e.sourceUrl } : undefined,
      properties: {
        currency: e.currency,
        value: e.value,
        content_type: "product",
        contents: [{ content_id: "metodo-atomico", content_name: e.contentName, price: e.value, quantity: 1 }],
      },
    }],
  };
  try {
    const res = await fetch("https://business-api.tiktok.com/open_api/v1.3/event/track/", {
      method: "POST",
      headers: { "content-type": "application/json", "Access-Token": token },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    const text = await res.text();
    // TikTok responde 200 aunque haya error; el resultado real viene en "code" (0 = bien).
    const ok = res.ok && JSON.parse(text || "{}").code === 0;
    if (!ok) console.error("TikTok Events API", e.name, res.status, text.slice(0, 300));
    return { ok };
  } catch (err) {
    console.error("TikTok Events API", e.name, err);
    return { ok: false };
  }
}
