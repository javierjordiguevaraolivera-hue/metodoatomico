import { NextResponse } from "next/server";
import { confirmPayment, DlocalError } from "@/lib/dlocal";

// Confirma el pago con el token de la tarjeta (los datos de la tarjeta nunca pasan por aquí).
export async function POST(req: Request) {
  const b = await req.json().catch(() => null);
  const str = (v: unknown, max = 120) => (typeof v === "string" ? v.trim().slice(0, max) : "");
  const data = {
    checkoutToken: str(b?.checkoutToken, 200),
    cardToken: str(b?.cardToken, 200),
    firstName: str(b?.firstName),
    lastName: str(b?.lastName),
    email: str(b?.email),
    documentType: str(b?.documentType, 10),
    document: str(b?.document, 40),
    installmentsId: str(b?.installmentsId, 80),
  };
  const missing = Object.entries(data).filter(([k, v]) => !v && k !== "installmentsId").map(([k]) => k);
  if (missing.length || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(data.email)) {
    return NextResponse.json({ error: "Revisa tus datos: falta algún campo o el correo no es válido." }, { status: 400 });
  }

  try {
    const p = await confirmPayment(data.checkoutToken, {
      cardToken: data.cardToken,
      clientFirstName: data.firstName,
      clientLastName: data.lastName,
      clientDocumentType: data.documentType,
      clientDocument: data.document,
      clientEmail: data.email,
      ...(data.installmentsId ? { installmentsId: data.installmentsId } : {}),
    });
    return NextResponse.json({ status: p.status, redirectUrl: p.redirect_url, reason: p.rejected_reason });
  } catch (err) {
    console.error("confirmar pago", err);
    const rejected = err instanceof DlocalError && err.status < 500;
    return NextResponse.json(
      { error: rejected ? "El pago fue rechazado. Revisa los datos de tu tarjeta o prueba con otra." : "No pudimos procesar el pago. Intenta de nuevo." },
      { status: rejected ? 402 : 502 },
    );
  }
}
