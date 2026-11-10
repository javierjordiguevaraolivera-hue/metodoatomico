import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Script from "next/script";
import MarketPixels from "@/components/MarketPixels";
import WhopCheckout from "@/components/WhopCheckout";
import { getMarket } from "@/lib/markets";

// Landing de /us (inglés) o /india (hindi): la misma landing traducida (content/landing-<mercado>.html),
// con sus scripts traducidos y el checkout de Whop.
export async function generateMetadata({ params }: { params: Promise<{ market: string }> }): Promise<Metadata> {
  const m = getMarket((await params).market);
  if (!m) return {};
  return {
    title: m.title,
    description: m.description,
    alternates: { canonical: `/${m.id}` },
    openGraph: { title: m.title, description: m.description, images: [m.ogImage], type: "website", url: `/${m.id}` },
  };
}

export default async function MarketHome({ params }: { params: Promise<{ market: string }> }) {
  const m = getMarket((await params).market);
  if (!m) notFound();
  const landing = fs.readFileSync(path.join(process.cwd(), "content", `landing-${m.id}.html`), "utf8");
  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: landing }} />
      <WhopCheckout market={m} />
      <MarketPixels market={m} viewContentOnScroll />
      <Script src={`/landing/${m.id}/runtime.js`} strategy="afterInteractive" />
      <Script src={`/landing/${m.id}/fx.js`} type="module" strategy="afterInteractive" />
    </>
  );
}
