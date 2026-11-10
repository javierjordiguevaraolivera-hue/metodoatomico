"use client";

import { useEffect } from "react";
import type { Market } from "@/lib/markets";
import { startMarketPixels, trackMarket, trackMarketPurchase } from "@/lib/track-market";

let viewSent = false;

// Píxeles de /us e /india (cada mercado con los suyos; sin variables no se carga ninguno).
export default function MarketPixels({ market, viewContentOnScroll = false, purchase, userData }: {
  market: Market;
  viewContentOnScroll?: boolean;
  purchase?: { paymentId: string; value: number; currency: string };
  userData?: Record<string, string | undefined>;
}) {
  useEffect(() => {
    startMarketPixels(market, userData);
    if (purchase) trackMarketPurchase(purchase.paymentId, purchase.value, purchase.currency, market.brand);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!viewContentOnScroll) return;
    const onScroll = () => {
      if (viewSent || window.scrollY < 300) return;
      viewSent = true;
      window.removeEventListener("scroll", onScroll);
      trackMarket(market, "ViewContent");
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [viewContentOnScroll, market]);

  return null;
}
