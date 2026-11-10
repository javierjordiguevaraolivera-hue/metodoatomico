import { notFound } from "next/navigation";
import HtmlLang from "@/components/HtmlLang";
import { getMarket, MARKET_IDS } from "@/lib/markets";
import "../market.css";

// /us (inglés) e /india (hindi): páginas aparte con Whop. Cualquier otro valor da 404,
// y las rutas que ya existen (/acceso, /gracias…) tienen prioridad sobre esta carpeta.
export const dynamicParams = false;
export const generateStaticParams = () => MARKET_IDS.map((market) => ({ market }));

export default async function MarketLayout({ children, params }: { children: React.ReactNode; params: Promise<{ market: string }> }) {
  const m = getMarket((await params).market);
  if (!m) notFound();
  return (
    <div className={`mk mk-${m.id}`} lang={m.lang}>
      <HtmlLang lang={m.lang} />
      {m.lang === "hi" && (
        // eslint-disable-next-line @next/next/no-page-custom-font
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;500;600;700;800&display=swap" />
      )}
      {children}
    </div>
  );
}
