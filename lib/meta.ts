import crypto from "node:crypto";
import { cookies, headers } from "next/headers";
import { META_PIXEL_ID } from "./config";

// API de Conversiones de Meta (CAPI). Cada evento lleva el mismo event_id que el del píxel,
// así Meta lo cuenta una sola vez.
const GRAPH_VERSION = process.env.META_GRAPH_VERSION || "v23.0";

export type Person = {
  email?: string;
  firstName?: string;
  lastName?: string;
  country?: string;
  region?: string;
  city?: string;
  zip?: string;
  externalId?: string;
  ip?: string;
  userAgent?: string;
  fbp?: string;
  fbc?: string;
  // TikTok
  ttp?: string;
  ttclid?: string;
};

const sha256 = (v: string) => crypto.createHash("sha256").update(v).digest("hex");
const clean = (v: string | undefined, squash = false) => {
  if (!v) return undefined;
  let s = v.trim().toLowerCase().normalize("NFD").replace(/\p{M}/gu, "");
  if (squash) s = s.replace(/[^a-z0-9]/g, "");
  return s || undefined;
};
const hashed = (v: string | undefined) => (v ? [sha256(v)] : undefined);

// Lo que se sabe del visitante a partir de la petición: IP, navegador, cookies del píxel y ubicación de Vercel.
export async function personFromRequest(sourceUrl?: string): Promise<Person> {
  const h = await headers();
  const c = await cookies();
  const geo = (name: string) => {
    const v = h.get(name);
    try { return v ? decodeURIComponent(v) : undefined; } catch { return v || undefined; }
  };
  let fbc = c.get("_fbc")?.value;
  let ttclid = c.get("ma_ttclid")?.value;
  if (sourceUrl) {
    try {
      const params = new URL(sourceUrl).searchParams;
      const fbclid = params.get("fbclid");
      if (!fbc && fbclid) fbc = `fb.1.${Date.now()}.${fbclid}`;
      ttclid = params.get("ttclid") || ttclid;
    } catch {}
  }
  return {
    ip: h.get("x-forwarded-for")?.split(",")[0].trim() || h.get("x-real-ip") || undefined,
    userAgent: h.get("user-agent") || undefined,
    fbp: c.get("_fbp")?.value,
    fbc,
    ttp: c.get("_ttp")?.value,
    ttclid,
    externalId: c.get("ma_vid")?.value,
    country: geo("x-vercel-ip-country"),
    region: geo("x-vercel-ip-country-region"),
    city: geo("x-vercel-ip-city"),
    zip: geo("x-vercel-ip-postal-code"),
  };
}

export async function sendMetaEvent(e: {
  name: string;
  id: string;
  sourceUrl?: string;
  person: Person;
  customData?: Record<string, unknown>;
  /** Solo /us e /india: su propio píxel y token. Sin esto se usa el de la página principal. */
  pixel?: { id: string; token: string };
}) {
  const token = e.pixel ? e.pixel.token : process.env.META_CAPI_TOKEN;
  const pixelId = e.pixel ? e.pixel.id : META_PIXEL_ID;
  if (!pixelId) return { skipped: "sin píxel" };
  if (!token) return { skipped: "sin META_CAPI_TOKEN" };
  const p = e.person;
  const user_data = {
    em: hashed(clean(p.email)),
    fn: hashed(clean(p.firstName)),
    ln: hashed(clean(p.lastName)),
    ct: hashed(clean(p.city, true)),
    st: hashed(clean(p.region, true)),
    zp: hashed(clean(p.zip, true)),
    country: hashed(clean(p.country)),
    external_id: hashed(p.externalId),
    client_ip_address: p.ip,
    client_user_agent: p.userAgent,
    fbp: p.fbp,
    fbc: p.fbc,
  };
  const body = {
    data: [{
      event_name: e.name,
      event_time: Math.floor(Date.now() / 1000),
      event_id: e.id,
      action_source: "website",
      event_source_url: e.sourceUrl,
      user_data,
      custom_data: e.customData,
    }],
    test_event_code: process.env.META_TEST_EVENT_CODE || undefined,
  };
  try {
    const res = await fetch(`https://graph.facebook.com/${GRAPH_VERSION}/${pixelId}/events?access_token=${encodeURIComponent(token)}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    if (!res.ok) console.error("Meta CAPI", e.name, res.status, await res.text());
    return { ok: res.ok };
  } catch (err) {
    console.error("Meta CAPI", e.name, err);
    return { ok: false };
  }
}
