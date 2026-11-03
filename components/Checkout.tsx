"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { CURRENCY, DLOCALGO_LIVE, DLOCALGO_SDK_URL, PRICE_USD, PRODUCT_NAME } from "@/lib/config";
import { COUNTRIES, DEFAULT_COUNTRY, docExample } from "@/lib/countries";
import { track } from "@/lib/track-client";
import Icon from "./Icon";

// Checkout de dLocal Go dentro de la página. La tarjeta se escribe en el campo seguro de dLocal
// (SmartFields); el resto de métodos (efectivo, transferencia…) se pagan en el checkout de dLocal.

const SMARTFIELDS_KEY = process.env.NEXT_PUBLIC_DLOCALGO_SMARTFIELDS_KEY || "";

type CardField = { mount: (el: HTMLElement) => void; on?: (event: string, cb: (e?: { empty?: boolean }) => void) => void; destroy?: () => void; unmount?: () => void };
type Installment = { id: string; installments: number; installment_amount: number; total_amount: number; currency: string };
type DlocalGo = {
  initialize: (key: string, token: string) => Promise<void> | void;
  fields: () => { create: (type: "pan" | "expiration" | "cvv", opts: object) => CardField };
  createCardToken: (field: CardField, data: { name: string }) => Promise<{ token: string }>;
  onInstallmentsChange?: (cb: (list: Installment[] | null) => void) => void;
  onCardBinChange?: (cb: (bin: { brand?: string } | null) => void) => void;
};
declare global { interface Window { dlocalGo?: DlocalGo } }

let sdkPromise: Promise<void> | null = null;
function loadSdk() {
  if (window.dlocalGo) return Promise.resolve();
  sdkPromise ??= new Promise<void>((resolve, reject) => {
    const s = document.createElement("script");
    s.src = DLOCALGO_SDK_URL;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => { sdkPromise = null; reject(new Error("sdk")); };
    document.head.appendChild(s);
  });
  return sdkPromise;
}

// Lo que tarda el campo de tarjeta es bajar el SDK (~600 KB) y abrir los iframes de dLocal.
// Se adelanta en cuanto la landing queda quieta, para que al abrir el checkout ya esté listo.
function warmUp() {
  const api = DLOCALGO_LIVE ? "https://api.dlocalgo.com" : "https://api-sbx.dlocalgo.com";
  for (const href of [new URL(DLOCALGO_SDK_URL).origin, api, "https://static.dlocal.com"]) {
    if (document.querySelector(`link[rel="preconnect"][href="${href}"]`)) continue;
    const l = document.createElement("link");
    l.rel = "preconnect"; l.href = href; l.crossOrigin = "";
    document.head.appendChild(l);
  }
  loadSdk().catch(() => {});
}

type FieldType = "pan" | "expiration" | "cvv";
const PLACEHOLDERS: Record<FieldType, string> = { pan: "1234 1234 1234 1234", expiration: "MM / AA", cvv: "CVV" };
const NOT_FILLED: Record<FieldType, boolean> = { pan: false, expiration: false, cvv: false };

// Copia del ícono de tarjeta vacía de dLocal, justo debajo del suyo: mientras su campo carga (y aparece de a poco) se ve la copia,
// y cuando la persona escribe se quita para que solo quede el de dLocal, que cambia a la marca.
function CardIcon() {
  return (
    <svg viewBox="0 0 32 21" aria-hidden="true">
      <g fill="#AEA3D3" fillRule="evenodd">
        <path opacity=".2" d="M26.58 21H2.42A2.4 2.4 0 0 1 0 18.62V4.38A2.4 2.4 0 0 1 2.42 2h24.16A2.4 2.4 0 0 1 29 4.38v14.25A2.4 2.4 0 0 1 26.58 21zM10 7.83c0-.46-.35-.83-.78-.83H3.78c-.43 0-.78.37-.78.83v3.34c0 .46.35.83.78.83h5.44c.43 0 .78-.37.78-.83V7.83z" />
        <path opacity=".3" d="M25 17h-3c-.65 0-1-.3-1-1s.35-1 1-1h3c.65 0 1 .3 1 1s-.35 1-1 1zm-6 0h-3c-.65 0-1-.3-1-1s.35-1 1-1h3c.65 0 1 .3 1 1s-.35 1-1 1zm-6 0h-3c-.65 0-1-.3-1-1s.35-1 1-1h3c.65 0 1 .3 1 1s-.35 1-1 1zm-6 0H4c-.65 0-1-.3-1-1s.35-1 1-1h3c.65 0 1 .3 1 1s-.35 1-1 1z" />
      </g>
    </svg>
  );
}

// Fuente del sistema: el iframe de dLocal no carga Inter.
const cardStyle = {
  base: { fontSize: "16px", lineHeight: "24px", fontFamily: "system-ui, sans-serif", fontSmoothing: "antialiased", color: "#F7F4FF", "::placeholder": { color: "#8E82BF" }, iconColor: "#AEA3D3" },
  invalid: { color: "#FF6B8B", iconColor: "#FF6B8B" },
  focus: { color: "#FFFFFF" },
};

type Payment = { country: string; checkoutToken?: string; redirectUrl?: string };

export default function Checkout() {
  const [open, setOpen] = useState(false);
  const [payment, setPayment] = useState<Payment | null>(null);
  const [country, setCountry] = useState("");
  const [loading, setLoading] = useState(false);
  const [cardReady, setCardReady] = useState(false);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");
  const [installments, setInstallments] = useState<Installment[]>([]);
  // Marca que detecta dLocal con los primeros 6 dígitos: VI (Visa), MC (Mastercard), AM (Amex)…
  const [brand, setBrand] = useState("");
  // Los placeholders de la tarjeta son nuestros, fijos desde que abre el checkout (dLocal no dibuja el suyo):
  // se esconden cuando dLocal avisa que el campo ya no está vacío.
  const [filled, setFilled] = useState(NOT_FILLED);
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", documentType: "", document: "", installmentsId: "" });
  // Tarjeta como Stripe: número en una fila; vencimiento y CVV debajo, cada uno en su campo seguro de dLocal.
  const panBox = useRef<HTMLDivElement>(null);
  const expBox = useRef<HTMLDivElement>(null);
  const cvvBox = useRef<HTMLDivElement>(null);
  const card = useRef<CardField | null>(null);
  const panIcon = useRef<HTMLSpanElement>(null);
  // La copia del ícono se apaga al mismo ritmo en que aparece el campo de dLocal; después solo queda el de dLocal.
  const [panShown, setPanShown] = useState(false);
  const requested = useRef("");
  const attempt = useRef(0);

  useEffect(() => {
    if (!SMARTFIELDS_KEY) return;
    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: object) => number };
    if (w.requestIdleCallback) { w.requestIdleCallback(warmUp, { timeout: 4000 }); return; }
    const t = setTimeout(warmUp, 2500);
    return () => clearTimeout(t);
  }, []);

  // Los botones "Comprar" de la página disparan este evento (public/landing/runtime.js).
  useEffect(() => {
    const onBuy = () => {
      setOpen(true);
      track("InitiateCheckout", { value: PRICE_USD, currency: CURRENCY, content_name: PRODUCT_NAME, content_type: "product", num_items: 1 });
    };
    window.addEventListener("ma:checkout", onBuy);
    return () => window.removeEventListener("ma:checkout", onBuy);
  }, []);

  const close = useCallback(() => { if (!paying) setOpen(false); }, [paying]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    document.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = prev; document.removeEventListener("keydown", onKey); };
  }, [open, close]);

  // Crea el pago al abrir (y de nuevo si cambian de país) y monta el campo de tarjeta.
  // Cada intento lleva un número: si la persona cierra o cambia de país, el intento anterior se descarta.
  // (Que el país detectado se escriba en el selector no cuenta como cambio y no corta la carga.)
  useEffect(() => {
    if (!open) { attempt.current++; requested.current = ""; return; }
    if (requested.current === (country || "auto")) return;
    requested.current = country || "auto";
    const id = ++attempt.current;
    const stale = () => id !== attempt.current;
    (async () => {
      setLoading(true); setError(""); setCardReady(false); setInstallments([]); setFilled(NOT_FILLED); setPanShown(false);
      // El SDK baja al mismo tiempo que se crea el pago (antes iba uno detrás del otro).
      const sdkLoad = SMARTFIELDS_KEY ? loadSdk() : null;
      sdkLoad?.catch(() => {});
      try {
        const res = await fetch("/api/checkout/create", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(country ? { country } : {}) });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "error");
        if (stale()) return;
        setPayment(data);
        if (!country) { requested.current = data.country; setCountry(data.country); }
        const docs = COUNTRIES.find((c) => c.code === data.country)?.docs ?? [];
        setForm((f) => ({ ...f, documentType: docs.includes(f.documentType) ? f.documentType : docs[0] ?? "", installmentsId: "" }));

        if (!SMARTFIELDS_KEY || !data.checkoutToken) return;
        await sdkLoad;
        const sdk = window.dlocalGo!;
        await sdk.initialize(SMARTFIELDS_KEY, data.checkoutToken);
        if (stale() || !panBox.current || !expBox.current || !cvvBox.current) return;
        // Contenedores nuevos en cada intento: si se vuelve a montar en el mismo (al cambiar de país), dLocal deja el campo vacío.
        const fields = sdk.fields();
        const mount = (box: HTMLDivElement, type: FieldType) => {
          box.innerHTML = "";
          const slot = document.createElement("div");
          box.appendChild(slot);
          // Placeholder " ": vacío, dLocal muestra su "Card number".
          const field = fields.create(type, { style: cardStyle, placeholder: " " });
          field.on?.("empty", (e?: { empty?: boolean }) => { if (!stale()) setFilled((f) => ({ ...f, [type]: e?.empty === false })); });
          field.mount(slot);
          return field;
        };
        card.current = mount(panBox.current, "pan");
        // dLocal hace aparecer su iframe de a poco: cada cuadro, la copia toma la opacidad que le falta al suyo.
        // El observador ajusta la copia en el mismo cuadro en que dLocal muestra el iframe (sin él va un cuadro atrasada).
        const pan = panBox.current;
        const until = performance.now() + 15000;
        let done = false;
        const sync = () => {
          if (done) return;
          const shown = [...pan.querySelectorAll("iframe")].filter((f) => f.getBoundingClientRect().height > 0);
          const a = Math.max(0, ...shown.map((f) => Number(getComputedStyle(f).opacity) || 0));
          if (panIcon.current) panIcon.current.style.opacity = String(1 - a);
          if (stale() || a >= 0.999 || performance.now() > until) { done = true; observer.disconnect(); if (!stale()) setPanShown(true); }
        };
        const observer = new MutationObserver(sync);
        observer.observe(pan, { subtree: true, childList: true, attributes: true });
        const fade = () => { sync(); if (!done) requestAnimationFrame(fade); };
        requestAnimationFrame(fade);
        mount(expBox.current, "expiration");
        mount(cvvBox.current, "cvv");
        sdk.onInstallmentsChange?.((list) => setInstallments(list && list.length > 1 ? list : []));
        sdk.onCardBinChange?.((bin) => setBrand(bin?.brand ?? ""));
        setCardReady(true);
      } catch (err) {
        if (stale()) return;
        setError(err instanceof Error && err.message !== "error" && err.message !== "sdk" ? err.message : "No pudimos cargar el pago. Revisa tu conexión e intenta de nuevo.");
        requested.current = "";
        setCountry((c) => c || DEFAULT_COUNTRY);
      } finally {
        if (!stale()) setLoading(false);
      }
    })();
  }, [open, country]);

  async function pay(e: FormEvent) {
    e.preventDefault();
    if (!payment?.checkoutToken || !card.current || paying) return;
    setPaying(true); setError("");
    try {
      const { token } = await window.dlocalGo!.createCardToken(card.current, { name: `${form.firstName} ${form.lastName}`.trim() });
      const res = await fetch("/api/checkout/confirm", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...form, documentType: docType, checkoutToken: payment.checkoutToken, cardToken: token }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      if (data.redirectUrl) { window.location.href = data.redirectUrl; return; } // 3D Secure
      if (data.status === "REJECTED" || data.status === "CANCELLED") throw new Error("El pago fue rechazado. Revisa los datos de tu tarjeta o prueba con otra.");
      window.location.href = "/gracias";
    } catch (err) {
      setError(err instanceof Error && err.message ? err.message : "Revisa los datos de tu tarjeta e intenta de nuevo.");
      setPaying(false);
    }
  }

  if (!open) return null;
  const docs = COUNTRIES.find((c) => c.code === country)?.docs ?? [];
  // Tipo de documento válido para el país elegido (aunque el pago todavía no haya cargado)
  const docType = docs.includes(form.documentType) ? form.documentType : docs[0] ?? "";
  const set = (k: keyof typeof form) => (e: { target: { value: string } }) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const withCard = Boolean(SMARTFIELDS_KEY);

  return (
    <div className="ck-overlay" role="dialog" aria-modal="true" aria-label="Pagar Método Atómico" onClick={(e) => { if (e.target === e.currentTarget) close(); }}>
      <div className="ck-panel">
        <div className="ck-head">
          <div>
            <div className="ck-kicker"><Icon name="lock" /> Pago seguro</div>
            <div className="ck-title">{PRODUCT_NAME}</div>
          </div>
          <button type="button" className="ck-x" onClick={close} aria-label="Cerrar" disabled={paying}><Icon name="x" /></button>
        </div>
        <div className="ck-sum">
          <div className="ck-amount">${PRICE_USD}<small>USD</small></div>
          <ul className="ck-tags">
            <li><Icon name="circle-check" /> Pago único</li>
            <li><Icon name="circle-check" /> Acceso de por vida</li>
          </ul>
        </div>

        <form onSubmit={pay} className="ck-form">
          <label className="ck-field">
            <span>País</span>
            <select value={country} onChange={(e) => setCountry(e.target.value)} disabled={paying}>
              {!country && <option value="">Detectando…</option>}
              {COUNTRIES.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
            </select>
          </label>

          {withCard && (
            <>
              <div className="ck-row">
                <label className="ck-field"><span>Nombre</span><input required autoComplete="given-name" placeholder="Ej.: María" value={form.firstName} onChange={set("firstName")} disabled={paying} /></label>
                <label className="ck-field"><span>Apellido</span><input required autoComplete="family-name" placeholder="Ej.: García" value={form.lastName} onChange={set("lastName")} disabled={paying} /></label>
              </div>
              <label className="ck-field"><span>Correo (ahí te llega el acceso)</span><input required type="email" autoComplete="email" inputMode="email" placeholder="Ej.: tucorreo@gmail.com" value={form.email} onChange={set("email")} disabled={paying} /></label>
              <div className="ck-row ck-doc">
                <label className="ck-field"><span>Documento</span>
                  <select value={docType} onChange={set("documentType")} disabled={paying}>
                    {docs.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </label>
                <label className="ck-field"><span>Número</span><input required placeholder={docExample(country, docType)} value={form.document} onChange={set("document")} disabled={paying} /></label>
              </div>
              <div className="ck-field">
                <span className="ck-card-label">Tarjeta de crédito o débito <span className={brand ? "ck-brands has-brand" : "ck-brands"}>
                  <span className={brand === "VI" ? "on" : ""}><Icon name="visa" logo /></span>
                  <span className={brand === "MC" ? "on" : ""}><Icon name="mastercard" logo /></span>
                  <span className={brand === "AM" ? "on" : ""}><Icon name="amex" logo /></span>
                </span></span>
                <div className="ck-cardbox">
                  <div className="ck-card ck-card-pan">
                    {!panShown && !filled.pan && <span className="ck-pan-ic" ref={panIcon}><CardIcon /></span>}
                    <div ref={panBox} />{!filled.pan && <span className="ck-ph" aria-hidden="true">{PLACEHOLDERS.pan}</span>}
                  </div>
                  <div className="ck-card-row">
                    <div className="ck-card ck-card-exp"><div ref={expBox} />{!filled.expiration && <span className="ck-ph" aria-hidden="true">{PLACEHOLDERS.expiration}</span>}</div>
                    <div className="ck-card ck-card-cvv"><div ref={cvvBox} />{!filled.cvv && <span className="ck-ph" aria-hidden="true">{PLACEHOLDERS.cvv}</span>}</div>
                  </div>
                </div>
                {brand === "AM" && <div className="ck-hint">American Express: el CVV son 4 dígitos al frente de la tarjeta.</div>}
              </div>
              {installments.length > 0 && (
                <label className="ck-field"><span>Cuotas</span>
                  <select value={form.installmentsId} onChange={set("installmentsId")} disabled={paying}>
                    <option value="">1 pago</option>
                    {installments.map((i) => <option key={i.id} value={i.id}>{i.installments} cuotas de {i.currency} {i.installment_amount} (total {i.total_amount})</option>)}
                  </select>
                </label>
              )}
            </>
          )}

          {error && <div className="ck-error" role="alert">{error}</div>}

          {withCard ? (
            <button type="submit" className="ck-pay" disabled={!cardReady || paying}>{paying ? "Procesando…" : <><Icon name="lock" /> Pagar ${PRICE_USD} USD</>}</button>
          ) : (
            <a className="ck-pay" href={payment?.redirectUrl || "#"} aria-disabled={!payment?.redirectUrl} onClick={(e) => { if (!payment?.redirectUrl) e.preventDefault(); }}>
              {loading ? "Preparando el pago…" : <><Icon name="lock" /> Continuar al pago seguro</>}
            </a>
          )}

          {/* Siempre en su lugar (si apareciera al crearse el pago, empujaría lo de abajo); funciona cuando el pago está listo */}
          {withCard && (
            <a className="ck-alt" href={payment?.redirectUrl || "#"} aria-disabled={!payment?.redirectUrl} onClick={(e) => { if (!payment?.redirectUrl) e.preventDefault(); }}><Icon name="banknote" /> ¿Prefieres efectivo, transferencia u otro método de tu país? Paga aquí</a>
          )}
        </form>

        {/* En pantallas anchas va en la columna izquierda, debajo del precio; en celular, al final */}
        <div className="ck-aside">
          <ul className="ck-trust">
            <li><Icon name="shield" /> Garantía de 7 días</li>
            <li><Icon name="zap" /> Acceso inmediato al correo</li>
            <li><Icon name="lock" /> Datos cifrados por dLocal Go</li>
          </ul>
          <div className="ck-note">El cobro se hace en tu moneda local si aplica.</div>
        </div>
      </div>
    </div>
  );
}
