import { notFound } from "next/navigation";
import { getMarket, MARKET_IDS } from "@/lib/markets";
import "../market.css";

// /us e /india: páginas aparte con Whop. Cualquier otro valor da 404,
// y las rutas que ya existen (/acceso, /gracias…) tienen prioridad sobre esta carpeta.
// El idioma (inglés/español en /us, hindi/inglés en /india) lo elige cada página según el navegador.
export const dynamicParams = false;
export const generateStaticParams = () => MARKET_IDS.map((market) => ({ market }));

export default async function MarketLayout({ children, params }: { children: React.ReactNode; params: Promise<{ market: string }> }) {
  const m = getMarket((await params).market);
  if (!m) notFound();
  return (
    <div className={`mk mk-${m.id}`}>
      {m.id === "india" && (
        // Solo baja la parte devanagari de la fuente cuando hay texto en hindi (unicode-range).
        // eslint-disable-next-line @next/next/no-page-custom-font
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;500;600;700;800&display=swap" />
      )}
      {children}
    </div>
  );
}
