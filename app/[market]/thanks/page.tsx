import type { Metadata } from "next";
import { notFound } from "next/navigation";
import MarketPixels from "@/components/MarketPixels";
import { getMarket, t } from "@/lib/markets";
import { personFromRequest } from "@/lib/meta";
import { getWhopPayment, recordWhopPayment, trackWhopPurchase, type WhopPayment } from "@/lib/whop";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Atomic Method", robots: { index: false } };

// Whop vuelve aquí con ?payment=pay_…&status=…. El pago se confirma leyéndolo de la API de Whop (no por la URL).
export default async function Thanks({ params, searchParams }: {
  params: Promise<{ market: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const m = getMarket((await params).market);
  if (!m) notFound();
  const d = t(m).thanks;
  const q = await searchParams;
  const id = typeof q.payment === "string" ? q.payment : "";
  const payment: WhopPayment | null = id ? await getWhopPayment(id).catch((err) => { console.error("thanks: Whop", err); return null; }) : null;
  const paid = payment?.status === "paid";
  const site = process.env.NEXT_PUBLIC_SITE_URL || "https://www.metodoatomico.lat";

  if (paid) {
    // Por si el aviso de Whop todavía no llegó: registra la compra y manda la bienvenida (una sola vez).
    await recordWhopPayment(payment, site).catch((err) => console.error("thanks: registrar compra", err));
    const browser = await personFromRequest();
    await trackWhopPurchase(payment, m, site, browser).catch((err) => console.error("thanks: eventos", err));
  }
  const email = payment?.customer_email?.toLowerCase() ?? "";
  const failed = !paid && (q.status === "failed" || q.status === "canceled");

  return (
    <main className="mk-thanks">
      {paid && (
        <MarketPixels
          market={m}
          purchase={{ paymentId: payment.id, value: payment.total ? Number(payment.total.amount) : m.price, currency: (payment.total?.currency || m.currency).toUpperCase() }}
          userData={{ em: email || undefined, country: payment.billing_address?.country?.toLowerCase() || undefined }}
        />
      )}
      <section className="mk-thanks-card">
        <img className="mk-logo" src="/brand/atomic-method-logo.png" alt={m.brand} width={160} height={44} />
        {paid ? (
          <>
            <h1>{d.title}</h1>
            <p>{d.paid}</p>
            {email && <p>{d.sentTo} <span className="mk-mail">{email}</span></p>}
            <div className="mk-actions"><a className="mk-btn" href={`/${m.id}/login?email=${encodeURIComponent(email)}`}>{d.cta}</a></div>
            <p className="mk-fine">{d.spam}</p>
          </>
        ) : payment && !failed ? (
          <>
            <h1>{d.pendingTitle}</h1>
            <p>{d.pending}</p>
            <div className="mk-actions">
              <a className="mk-btn" href={`/${m.id}/thanks?payment=${encodeURIComponent(payment.id)}`}>{d.refresh}</a>
              <a className="mk-btn mk-btn-ghost" href={`/${m.id}/login`}>{d.login}</a>
            </div>
          </>
        ) : (
          <>
            <h1>{d.unknownTitle}</h1>
            <p>{d.unknown}</p>
            <div className="mk-actions">
              <a className="mk-btn" href={`/${m.id}/login`}>{d.login}</a>
              <a className="mk-btn mk-btn-ghost" href={`/${m.id}`}>{t(m).back}</a>
            </div>
          </>
        )}
      </section>
    </main>
  );
}
