import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { createSessionValue, SESSION_COOKIE, SESSION_HOURS } from "@/lib/session";
import { findPaidOrder, logLogin, normalizeEmail } from "@/lib/supabase";

// Entrar a /mis-accesos con el correo de compra. Si tiene un pago confirmado, se abre una sesión de 2 horas.
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const email = typeof body?.email === "string" ? normalizeEmail(body.email).slice(0, 200) : "";
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json({ error: "Escribe un correo válido." }, { status: 400 });
  }

  // Una pausa corta hace más lento probar correos al azar.
  await new Promise((r) => setTimeout(r, 400));

  try {
    const order = await findPaidOrder(email);
    if (!order) {
      return NextResponse.json({ error: "no-encontrado" }, { status: 404 });
    }
    const h = await headers();
    await logLogin({
      email,
      ip: h.get("x-forwarded-for")?.split(",")[0].trim() || undefined,
      user_agent: h.get("user-agent")?.slice(0, 300) || undefined,
      country: h.get("x-vercel-ip-country") || undefined,
    }).catch((err) => console.error("acceso: registrar ingreso", err));

    const { value } = createSessionValue(email);
    const res = NextResponse.json({ ok: true });
    res.cookies.set(SESSION_COOKIE, value, {
      httpOnly: true,
      sameSite: "lax",
      secure: new URL(req.url).protocol === "https:",
      path: "/",
      maxAge: SESSION_HOURS * 60 * 60,
    });
    return res;
  } catch (err) {
    console.error("acceso", err);
    return NextResponse.json({ error: "No pudimos revisar tu acceso. Intenta de nuevo en un momento." }, { status: 502 });
  }
}
