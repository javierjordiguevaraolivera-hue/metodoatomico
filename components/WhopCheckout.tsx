"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { type Market, t } from "@/lib/markets";
import { attributionMetadata, trackMarket } from "@/lib/track-market";
import Icon from "./Icon";

// Checkout de Whop para /us e /india. Se abre con los mismos botones de la landing (evento "ma:checkout").
// El formulario de pago lo dibuja Whop dentro de su marco: aquí solo va el resumen y el contenedor.
const SCRIPT = "https://cdn.whop.com/elements/amber/elements.js";

type Handle = { create: (k: "checkout") => { mount: (target: string | HTMLElement) => void }; destroy: () => void };
declare global {
  interface Window { WhopElements?: (o?: Record<string, unknown>) => { checkout: { create: (o: Record<string, unknown>) => Handle } } }
}

let scriptPromise: Promise<void> | null = null;
function loadScript() {
  if (window.WhopElements) return Promise.resolve();
  if (!scriptPromise) {
    scriptPromise = new Promise((res, rej) => {
      const s = document.createElement("script");
      s.src = SCRIPT; s.async = true; s.setAttribute("data-whop-elements", "");
      s.onload = () => res(); s.onerror = () => { scriptPromise = null; rej(new Error("whop")); };
      document.head.appendChild(s);
    });
  }
  return scriptPromise;
}

export default function WhopCheckout({ market }: { market: Market }) {
  const d = t(market).checkout;
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<"loading" | "ready" | "error" | "soon">("loading");
  const box = useRef<HTMLDivElement>(null);
  const handle = useRef<Handle | null>(null);

  // Precarga el script al primer toque en cualquier botón de compra.
  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      if ((e.target as Element | null)?.closest?.('[data-checkout],[data-action="buyFromVideo"]')) loadScript().catch(() => {});
    };
    document.addEventListener("pointerdown", onDown, true);
    return () => document.removeEventListener("pointerdown", onDown, true);
  }, []);

  useEffect(() => {
    const onBuy = () => { setOpen(true); trackMarket(market, "InitiateCheckout"); };
    window.addEventListener("ma:checkout", onBuy);
    return () => window.removeEventListener("ma:checkout", onBuy);
  }, [market]);

  useEffect(() => {
    if (!open) return;
    if (!market.whopPlan) { setState("soon"); return; }
    let cancelled = false;
    setState("loading");
    loadScript()
      .then(() => {
        if (cancelled || !box.current || !window.WhopElements) return;
        const thanks = `${location.origin}/${market.id}/thanks`;
        const h = window.WhopElements({ appearance: { theme: { appearance: "dark", accentColor: "green" } } }).checkout.create({
          plan: market.whopPlan,
          metadata: { ...attributionMetadata(market), lang: market.lang },
          returnUrl: thanks,
          locale: market.lang,
          onComplete: (r: { result: string; paymentId?: string }) => {
            if (r.result === "payment" && r.paymentId) window.location.href = `${thanks}?payment=${encodeURIComponent(r.paymentId)}&status=succeeded`;
          },
          onLoadingChange: (loading: boolean) => { if (!loading && !cancelled) setState("ready"); },
        });
        h.create("checkout").mount(box.current);
        handle.current = h;
        // Por si Whop no avisa que terminó de cargar: el formulario ya está montado, se quita el aviso.
        setTimeout(() => { if (!cancelled) setState((s) => (s === "loading" ? "ready" : s)); }, 4000);
      })
      .catch(() => { if (!cancelled) setState("error"); });
    return () => {
      cancelled = true;
      try { handle.current?.destroy(); } catch {}
      handle.current = null;
    };
  }, [open, market]);

  const close = useCallback(() => setOpen(false), []);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [open, close]);

  if (!open) return null;
  return (
    <div className="ck-overlay" role="dialog" aria-modal="true" aria-label={`${d.secure} · ${market.brand}`} onClick={(e) => { if (e.target === e.currentTarget) close(); }}>
      <div className="ck-panel wc-panel">
        <div className="ck-head">
          <div>
            <div className="ck-kicker"><Icon name="lock" /> {d.secure}</div>
            <div className="ck-title">{market.brand}</div>
          </div>
          <button type="button" className="ck-x" onClick={close} aria-label={d.close}><Icon name="x" /></button>
        </div>
        <div className="ck-sum">
          <div className="ck-amount">{market.priceLabel}{market.currency === "USD" && <small>USD</small>}</div>
          <ul className="ck-tags">
            <li><Icon name="circle-check" /> {d.oneTime}</li>
            <li><Icon name="circle-check" /> {d.lifetime}</li>
            <li><Icon name="circle-check" /> {d.instant}</li>
          </ul>
        </div>
        <div className="wc-body">
          {state === "loading" && <div className="wc-msg"><span className="ac-spin" aria-hidden="true" /> {d.loading}</div>}
          {state === "soon" && <div className="wc-msg">{d.soon}</div>}
          {state === "error" && <div className="wc-msg">{d.failed}</div>}
          <div ref={box} className="wc-frame" />
          <p className="wc-fine"><Icon name="lock" /> {d.poweredBy}</p>
        </div>
      </div>
    </div>
  );
}
