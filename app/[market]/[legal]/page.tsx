import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import MarketPixels from "@/components/MarketPixels";
import HtmlLang from "@/components/HtmlLang";
import { requestMarket } from "@/lib/market-request";
import { LEGAL_SLUGS, type LegalSlug, MARKET_IDS, t } from "@/lib/markets";

// Páginas legales de /us e /india: el texto vive en content/legal/<mercado>/<slug>.html.
export const dynamicParams = false;
export const generateStaticParams = () => MARKET_IDS.flatMap((market) => LEGAL_SLUGS.map((legal) => ({ market, legal })));

type P = { params: Promise<{ market: string; legal: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };
const isLegal = (s: string): s is LegalSlug => (LEGAL_SLUGS as readonly string[]).includes(s);

export async function generateMetadata({ params, searchParams }: P): Promise<Metadata> {
  const { market, legal } = await params;
  const m = await requestMarket(market, (await searchParams).lang);
  return { title: m && isLegal(legal) ? `${t(m).legal[legal]} · ${m.brand}` : "Atomic Method" };
}

export default async function Legal({ params, searchParams }: P) {
  const { market, legal } = await params;
  const m = await requestMarket(market, (await searchParams).lang);
  if (!m || !isLegal(legal)) notFound();
  const d = t(m);
  const html = fs.readFileSync(path.join(process.cwd(), "content", "legal", m.variant, `${legal}.html`), "utf8");
  return (
    <div className="legal" lang={m.lang}>
      <HtmlLang lang={m.lang} />
      <MarketPixels market={m} />
      <header className="legal-top">
        <a href={`/${m.id}`} aria-label={m.brand}><img src="/brand/atomic-method-logo.png" alt={m.brand} width={152} height={42} /></a>
        <a href={`/${m.id}`} className="legal-back">{d.back}</a>
      </header>
      <main className="legal-main">
        <h1>{d.legal[legal]}</h1>
        <div className="legal-body" dangerouslySetInnerHTML={{ __html: html }} />
      </main>
      <footer className="legal-foot">
        {LEGAL_SLUGS.map((s) => <a key={s} href={`/${m.id}/${s}`} aria-current={s === legal ? "page" : undefined}>{d.legal[s]}</a>)}
      </footer>
    </div>
  );
}
