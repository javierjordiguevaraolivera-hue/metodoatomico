"use client";

import type { Market } from "./markets";
import { loadMetaPixel, loadTikTokPixel, newEventId, trackTikTok, visitorId } from "./track-client";

// Lado navegador de /us e /india: píxeles del mercado + copia a /api/track/market con el mismo event_id.
// La página principal usa lib/track-client.ts tal cual.

let started = false;

export function startMarketPixels(m: Market, userData: Record<string, string | undefined> = {}) {
  if (started) return;
  started = true;
  const vid = visitorId();
  const ttclid = new URLSearchParams(location.search).get("ttclid");
  if (ttclid) document.cookie = `ma_ttclid=${encodeURIComponent(ttclid)}; Max-Age=${60 * 60 * 24 * 30}; Path=/; SameSite=Lax`;
  if (m.metaPixel) loadMetaPixel(m.metaPixel, { external_id: vid, ...userData });
  if (m.tiktokPixel) loadTikTokPixel(m.tiktokPixel, { email: userData.em, external_id: vid });
  const id = newEventId("pageview");
  window.fbq?.("track", "PageView", {}, { eventID: id });
  window.ttq?.page();
  send(m, "PageView", id, {});
}

export function trackMarket(m: Market, name: "ViewContent" | "InitiateCheckout") {
  const data = { content_name: m.brand, content_type: "product", value: m.trackValue, currency: m.trackCurrency };
  const id = newEventId(name.toLowerCase());
  window.fbq?.("track", name, data, { eventID: id });
  trackTikTok(name, data, id);
  send(m, name, id, data);
  return id;
}

// El Purchase del navegador lleva el mismo event_id que el servidor ("purchase_<pay_…>"): cada plataforma lo cuenta una vez.
export function trackMarketPurchase(paymentId: string, value: number, currency: string, brand: string) {
  const key = `ma_compra_${paymentId}`;
  try { if (localStorage.getItem(key) === "1") return; } catch {}
  const data = { value, currency, content_name: brand, content_type: "product" };
  window.fbq?.("track", "Purchase", data, { eventID: `purchase_${paymentId}` });
  trackTikTok("Purchase", data, `purchase_${paymentId}`);
  try { localStorage.setItem(key, "1"); } catch {}
}

// Cookies que sirven para atribuir la venta: viajan en la metadata del pago de Whop hasta el webhook.
export function attributionMetadata(m: Market) {
  const c = (n: string) => document.cookie.match(new RegExp(`(?:^|; )${n}=([^;]+)`))?.[1];
  const md: Record<string, string> = { market: m.id, vid: visitorId() };
  const fbp = c("_fbp"), fbc = c("_fbc"), ttp = c("_ttp"), ttclid = c("ma_ttclid");
  const fbclid = new URLSearchParams(location.search).get("fbclid");
  if (fbp) md.fbp = decodeURIComponent(fbp);
  if (fbc) md.fbc = decodeURIComponent(fbc);
  else if (fbclid) md.fbc = `fb.1.${Date.now()}.${fbclid}`;
  if (ttp) md.ttp = decodeURIComponent(ttp);
  if (ttclid) md.ttclid = decodeURIComponent(ttclid);
  return md;
}

function send(m: Market, name: string, id: string, customData: Record<string, unknown>) {
  if (!m.metaPixel && !m.tiktokPixel) return;
  fetch("/api/track/market", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ market: m.id, name, id, url: location.href, customData }),
    keepalive: true,
  }).catch(() => {});
}
