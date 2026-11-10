import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import MarketAccessForm from "@/components/MarketAccessForm";
import HtmlLang from "@/components/HtmlLang";
import { requestMarket } from "@/lib/market-request";
import { t } from "@/lib/markets";
import { currentSession } from "@/lib/session";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Access · Atomic Method", robots: { index: false } };

// Ingreso de compradores de /us e /india: misma sesión y misma API (/api/acceso) que la página principal.
export default async function Login({ params, searchParams }: {
  params: Promise<{ market: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const q = await searchParams;
  const m = await requestMarket((await params).market, q.lang);
  if (!m) notFound();
  if (await currentSession()) redirect(`/${m.id}/members`);
  const email = typeof q.email === "string" ? q.email.slice(0, 200) : "";
  const d = t(m).access;

  return (
    <main className="ac-page" lang={m.lang}>
      <HtmlLang lang={m.lang} />
      <div className="ac-glow" aria-hidden="true" />
      <section className="ac-card">
        <a href={`/${m.id}`} className="ac-logo"><img src="/brand/atomic-method-logo.png" alt={m.brand} width={170} height={47} /></a>
        <img className="ac-mascot" src="/landing/atomin-saluda.webp" alt="" width={120} height={120} />
        <div className="ac-kicker">{d.kicker}</div>
        <h1 className="ac-title">{d.title(m.brand)}</h1>
        <p className="ac-sub">{d.sub}</p>
        <MarketAccessForm market={m} initialEmail={email} />
      </section>
      <p className="ac-foot">{d.notYet} <a href={`/${m.id}`}>{d.discover(m.brand)}</a></p>
    </main>
  );
}
