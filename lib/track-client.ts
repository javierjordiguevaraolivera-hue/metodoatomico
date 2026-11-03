"use client";

// Lado navegador. Meta: píxel + copia a /api/track para la CAPI, con el mismo event_id para deduplicar.
// TikTok: solo píxel, con el mismo event_id.

type Fbq = ((...args: unknown[]) => void) & { callMethod?: (...a: unknown[]) => void; queue?: unknown[][]; loaded?: boolean; version?: string; push?: unknown };
type Ttq = unknown[] & Record<string, unknown> & {
  load: (id: string) => void;
  page: () => void;
  identify: (data: Record<string, string>) => void;
  track: (name: string, data: Record<string, unknown>, opts?: { event_id: string }) => void;
};

declare global {
  interface Window { fbq?: Fbq; _fbq?: Fbq; ttq?: Ttq; TiktokAnalyticsObject?: string }
}

export function newEventId(prefix: string) {
  return `${prefix}_${crypto.randomUUID().replace(/-/g, "")}`;
}

// Id anónimo del visitante (external_id), el mismo para los píxeles, la CAPI y el pedido de dLocal Go.
export function visitorId() {
  const found = document.cookie.match(/(?:^|; )ma_vid=([^;]+)/)?.[1];
  if (found) return found;
  const vid = crypto.randomUUID().replace(/-/g, "");
  document.cookie = `ma_vid=${vid}; Max-Age=${60 * 60 * 24 * 365}; Path=/; SameSite=Lax`;
  return vid;
}

const defined = (o: Record<string, string | undefined>) => Object.fromEntries(Object.entries(o).filter(([, v]) => v)) as Record<string, string>;

export function loadMetaPixel(pixelId: string, userData: Record<string, string | undefined>) {
  if (window.fbq) return;
  const n = function (...args: unknown[]) {
    if (n.callMethod) n.callMethod(...args); else n.queue!.push(args);
  } as Fbq;
  n.push = n; n.loaded = true; n.version = "2.0"; n.queue = [];
  window.fbq = n; window._fbq = n;
  const s = document.createElement("script");
  s.async = true;
  s.src = "https://connect.facebook.net/en_US/fbevents.js";
  document.head.appendChild(s);
  n("init", pixelId, defined(userData));
}

// El snippet oficial de TikTok, sin el ttq.page() (lo hace trackPageView).
export function loadTikTokPixel(pixelId: string, userData: { email?: string; external_id?: string }) {
  if (window.ttq) return;
  /* eslint-disable */
  (function (w: any, d: Document, t: string) {
    w.TiktokAnalyticsObject = t; var ttq = w[t] = w[t] || []; ttq.methods = ["page", "track", "identify", "instances", "debug", "on", "off", "once", "ready", "alias", "group", "enableCookie", "disableCookie", "holdConsent", "revokeConsent", "grantConsent"], ttq.setAndDefer = function (t: any, e: any) { t[e] = function () { t.push([e].concat(Array.prototype.slice.call(arguments, 0))) } }; for (var i = 0; i < ttq.methods.length; i++)ttq.setAndDefer(ttq, ttq.methods[i]); ttq.instance = function (t: any) {
      for (
        var e = ttq._i[t] || [], n = 0; n < ttq.methods.length; n++)ttq.setAndDefer(e, ttq.methods[n]); return e
    }, ttq.load = function (e: any, n: any) {
      var r = "https://analytics.tiktok.com/i18n/pixel/events.js", o = n && n.partner; ttq._i = ttq._i || {}, ttq._i[e] = [], ttq._i[e]._u = r, ttq._t = ttq._t || {}, ttq._t[e] = +new Date, ttq._o = ttq._o || {}, ttq._o[e] = n || {}; n = d.createElement("script")
        ; n.type = "text/javascript", n.async = !0, n.src = r + "?sdkid=" + e + "&lib=" + t; e = d.getElementsByTagName("script")[0]; e.parentNode.insertBefore(n, e)
    };
  })(window, document, "ttq");
  /* eslint-enable */
  window.ttq!.load(pixelId);
  // El píxel de TikTok hashea el correo y el external_id antes de mandarlos.
  window.ttq!.identify(defined(userData));
}

// Nombres de TikTok para los mismos eventos de Meta.
const TIKTOK_NAMES: Record<string, string> = { ViewContent: "ViewContent", InitiateCheckout: "InitiateCheckout", Purchase: "CompletePayment" };

function tiktokData(d: Record<string, unknown>) {
  return {
    value: d.value,
    currency: d.currency,
    contents: [{ content_id: "metodo-atomico", content_type: "product", content_name: d.content_name, quantity: 1, price: d.value }],
  };
}

export function trackTikTok(name: keyof typeof TIKTOK_NAMES, data: Record<string, unknown>, eventId: string) {
  window.ttq?.track(TIKTOK_NAMES[name], tiktokData(data), { event_id: eventId });
}

export function trackPageView() {
  const id = newEventId("pageview");
  window.fbq?.("track", "PageView", {}, { eventID: id });
  window.ttq?.page();
  sendToCapi("PageView", id, {});
}

// Purchase no se manda desde aquí: lo envía el servidor al confirmar el pago.
export function track(name: "ViewContent" | "InitiateCheckout", customData: Record<string, unknown> = {}) {
  const id = newEventId(name.toLowerCase());
  window.fbq?.("track", name, customData, { eventID: id });
  trackTikTok(name, customData, id);
  sendToCapi(name, id, customData);
  return id;
}

function sendToCapi(name: string, id: string, customData: Record<string, unknown>) {
  fetch("/api/track", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name, id, url: location.href, customData }),
    keepalive: true,
  }).catch(() => {});
}
