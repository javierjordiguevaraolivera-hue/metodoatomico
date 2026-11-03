import type { Metadata } from "next";
import { cookies } from "next/headers";
import Pixels from "@/components/Pixels";
import { CURRENCY, PRICE_USD, PRODUCT_NAME } from "@/lib/config";
import { getPayment, type DlocalPayment } from "@/lib/dlocal";
import { personFromRequest, sendMetaEvent } from "@/lib/meta";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Gracias · Método Atómico", robots: { index: false } };

// A esta página vuelve la persona después de pagar (tarjeta, 3D Secure o checkout de dLocal Go).
// El pago se busca por la cookie que dejó /api/checkout/create (o por ?payment_id si dLocal lo agrega).
export default async function Gracias({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const q = await searchParams;
  const fromQuery = typeof q.payment_id === "string" ? q.payment_id : undefined;
  const id = fromQuery || (await cookies()).get("ma_pid")?.value;
  const payment: DlocalPayment | null = id ? await getPayment(id).catch(() => null) : null;
  const paid = payment?.status === "PAID";
  const eventId = paid ? `purchase_${payment.id}` : "";
  const site = process.env.NEXT_PUBLIC_SITE_URL || "";

  if (paid) {
    const person = await personFromRequest();
    await sendMetaEvent({
      name: "Purchase",
      id: eventId,
      sourceUrl: `${site}/gracias`,
      person: { ...person, email: payment.payer?.email, firstName: payment.payer?.first_name, lastName: payment.payer?.last_name, country: payment.country || person.country },
      customData: { value: PRICE_USD, currency: CURRENCY, content_name: PRODUCT_NAME, content_type: "product", order_id: payment.order_id },
    });
  }

  const access = process.env.PRODUCT_ACCESS_URL;
  const pending = payment?.status === "PENDING";

  return (
    <main style={{ minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, boxSizing: "border-box", background: "#120A2A", color: "#F7F4FF", fontFamily: "Inter, system-ui, sans-serif" }}>
      <Pixels
        purchase={paid ? { eventId, value: PRICE_USD, currency: CURRENCY } : undefined}
        userData={paid ? { em: payment.payer?.email?.toLowerCase(), fn: payment.payer?.first_name?.toLowerCase(), ln: payment.payer?.last_name?.toLowerCase(), country: payment.country?.toLowerCase() } : {}}
      />
      <div style={{ width: "100%", maxWidth: 560, background: "#1D1240", border: "1px solid #35276A", borderRadius: 24, padding: 32, boxSizing: "border-box", display: "flex", flexDirection: "column", gap: 16, textAlign: "center", alignItems: "center" }}>
        <img src="/brand/metodo-atomico-logo.png" alt="Método Atómico" width={190} height={50} style={{ height: 50, width: "auto" }} />
        {paid ? (
          <>
            <h1 style={{ margin: 0, fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 36, lineHeight: 1.05 }}>¡Listo! Ya es tuyo.</h1>
            <p style={{ margin: 0, color: "#D2C9EE" }}>Tu pago se confirmó. Te mandamos el acceso a <strong style={{ color: "#F7F4FF" }}>{payment.payer?.email || "tu correo"}</strong>. Si no lo ves en unos minutos, revisa la carpeta de spam.</p>
            {access && <a href={access} style={{ background: "#119564", color: "#fff", textDecoration: "none", padding: "16px 26px", borderRadius: 14, fontWeight: 800, fontSize: 18 }}>Descargar Método Atómico</a>}
          </>
        ) : pending ? (
          <>
            <h1 style={{ margin: 0, fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 32, lineHeight: 1.05 }}>Tu pago está en proceso</h1>
            <p style={{ margin: 0, color: "#D2C9EE" }}>Si pagaste en efectivo o por transferencia, puede tardar un poco. Apenas se confirme te llega el acceso al correo.</p>
          </>
        ) : (
          <>
            <h1 style={{ margin: 0, fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 32, lineHeight: 1.05 }}>No vemos tu pago todavía</h1>
            <p style={{ margin: 0, color: "#D2C9EE" }}>Si se rechazó, puedes intentarlo de nuevo con otra tarjeta o método.</p>
            <a href="/#precio" style={{ background: "#119564", color: "#fff", textDecoration: "none", padding: "16px 26px", borderRadius: 14, fontWeight: 800, fontSize: 18 }}>Volver a intentar</a>
          </>
        )}
      </div>
    </main>
  );
}
