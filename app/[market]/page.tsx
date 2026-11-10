import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Script from "next/script";
import MarketPixels from "@/components/MarketPixels";
import WhopCheckout from "@/components/WhopCheckout";
import HtmlLang from "@/components/HtmlLang";
import { requestMarket } from "@/lib/market-request";

// Landing de /us (inglés o español) o /india (hindi o inglés): la landing traducida (content/landing-<variant>.html),
// con sus scripts traducidos y el checkout de Whop.
type P = { params: Promise<{ market: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata({ params, searchParams }: P): Promise<Metadata> {
  const m = await requestMarket((await params).market, (await searchParams).lang);
  if (!m) return {};
  return {
    title: m.title,
    description: m.description,
    alternates: { canonical: `/${m.id}` },
    openGraph: { title: m.title, description: m.description, images: [m.ogImage], type: "website", url: `/${m.id}` },
  };
}

export default async function MarketHome({ params, searchParams }: P) {
  const m = await requestMarket((await params).market, (await searchParams).lang);
  if (!m) notFound();
  const landing = fs.readFileSync(path.join(process.cwd(), "content", `landing-${m.variant}.html`), "utf8");
  return (
    <div lang={m.lang}>
      <HtmlLang lang={m.lang} />
      <div dangerouslySetInnerHTML={{ __html: landing }} />
      <WhopCheckout market={m} />
      <MarketPixels market={m} viewContentOnScroll />
      <Script src={`/landing/${m.variant}/runtime.js`} strategy="afterInteractive" />
      <Script src={`/landing/${m.variant}/fx.js`} type="module" strategy="afterInteractive" />
    </div>
  );
}
