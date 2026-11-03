"use client";

import { useEffect } from "react";
import { CURRENCY, META_PIXEL_ID, PRICE_USD, PRODUCT_NAME, TIKTOK_PIXEL_ID } from "@/lib/config";
import { loadMetaPixel, loadTikTokPixel, track, trackPageView, trackTikTok, visitorId } from "@/lib/track-client";

type Purchase = { eventId: string; value: number; currency: string };
type UserData = { em?: string; fn?: string; ln?: string; country?: string };

// Banderas a nivel de módulo: en desarrollo React monta dos veces y no queremos eventos dobles.
let started = false;
let viewSent = false;

// Píxeles de Meta y TikTok.
// Página principal: PageView al entrar y ViewContent la primera vez que bajan.
// Página de gracias: PageView + Purchase (con el mismo event_id que manda el servidor a las APIs de Meta y TikTok).
export default function Pixels({ viewContentOnScroll = false, purchase, userData = {} }: {
  viewContentOnScroll?: boolean;
  purchase?: Purchase;
  userData?: UserData;
}) {
  useEffect(() => {
    if (started) return;
    started = true;
    const vid = visitorId();
    // El ttclid del anuncio de TikTok se guarda para mandarlo en los eventos de después (checkout, compra).
    const ttclid = new URLSearchParams(location.search).get("ttclid");
    if (ttclid) document.cookie = `ma_ttclid=${encodeURIComponent(ttclid)}; Max-Age=${60 * 60 * 24 * 30}; Path=/; SameSite=Lax`;
    loadMetaPixel(META_PIXEL_ID, { external_id: vid, ...userData });
    loadTikTokPixel(TIKTOK_PIXEL_ID, { email: userData.em, external_id: vid });
    trackPageView();

    if (purchase) {
      const key = `ma_compra_${purchase.eventId}`;
      let sent = false;
      try { sent = localStorage.getItem(key) === "1"; } catch {}
      if (!sent) {
        const data = { value: purchase.value, currency: purchase.currency, content_name: PRODUCT_NAME, content_type: "product" };
        window.fbq?.("track", "Purchase", data, { eventID: purchase.eventId });
        trackTikTok("Purchase", data, purchase.eventId);
        try { localStorage.setItem(key, "1"); } catch {}
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!viewContentOnScroll) return;
    const onScroll = () => {
      if (viewSent || window.scrollY < 300) return;
      viewSent = true;
      window.removeEventListener("scroll", onScroll);
      track("ViewContent", { content_name: PRODUCT_NAME, content_type: "product", value: PRICE_USD, currency: CURRENCY });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [viewContentOnScroll]);

  return null;
}
