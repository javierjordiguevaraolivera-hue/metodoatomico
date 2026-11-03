import crypto from "node:crypto";
import { DLOCALGO_LIVE } from "./config";

// API de dLocal Go: https://docs.dlocalgo.com/integration-api
const API_URL = DLOCALGO_LIVE ? "https://api.dlocalgo.com" : "https://api-sbx.dlocalgo.com";

export type DlocalPayment = {
  id: string;
  status: "PENDING" | "PAID" | "REJECTED" | "CANCELLED" | "EXPIRED";
  status_detail?: string | null;
  amount: number;
  currency: string;
  country?: string;
  order_id?: string;
  redirect_url?: string;
  merchant_checkout_token?: string;
  rejected_reason?: string;
  payer?: { first_name?: string; last_name?: string; email?: string };
};

export class DlocalError extends Error {
  constructor(public status: number, public body: string) {
    super(`dLocal Go ${status}: ${body.slice(0, 300)}`);
  }
}

function credentials() {
  const key = process.env.DLOCALGO_API_KEY;
  const secret = process.env.DLOCALGO_SECRET_KEY;
  if (!key || !secret) throw new Error("Faltan DLOCALGO_API_KEY o DLOCALGO_SECRET_KEY");
  return { key, secret };
}

async function call<T>(path: string, body?: unknown): Promise<T> {
  const { key, secret } = credentials();
  const res = await fetch(API_URL + path, {
    method: body === undefined ? "GET" : "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${key}:${secret}` },
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: "no-store",
  });
  const text = await res.text();
  if (!res.ok) throw new DlocalError(res.status, text);
  return JSON.parse(text) as T;
}

export function createPayment(body: Record<string, unknown>) {
  return call<DlocalPayment>("/v1/payments", body);
}

export function confirmPayment(checkoutToken: string, body: Record<string, unknown>) {
  return call<DlocalPayment>(`/v1/payments/confirm/${encodeURIComponent(checkoutToken)}`, body);
}

export function getPayment(id: string) {
  return call<DlocalPayment>(`/v1/payments/${encodeURIComponent(id)}`);
}

// Notificaciones: Authorization = "V2-HMAC-SHA256, Signature: <hex>",
// firmado con HMAC-SHA256(secret, apiKey + cuerpo crudo).
export function verifyNotification(rawBody: string, authorization: string | null) {
  const received = authorization?.match(/Signature:\s*([a-f0-9]+)/i)?.[1];
  if (!received) return false;
  const { key, secret } = credentials();
  const expected = crypto.createHmac("sha256", secret).update(key + rawBody).digest("hex");
  const a = Buffer.from(received.toLowerCase());
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

// order_id = "<id del visitante>-<marca de tiempo>": así el webhook recupera el external_id para Meta.
export function makeOrderId(visitorId: string | undefined) {
  const vid = (visitorId || crypto.randomUUID()).replace(/[^a-zA-Z0-9]/g, "").slice(0, 40);
  return `${vid}-${Date.now().toString(36)}`;
}

export function visitorFromOrderId(orderId: string | undefined) {
  return orderId?.split("-")[0] || undefined;
}
