import { NextResponse } from "next/server";
import { findLesson } from "@/lib/curso";
import { currentSession } from "@/lib/session";
import { findPaidOrder, setProgress } from "@/lib/supabase";

// Marca o desmarca una clase como completada para el comprador con sesión.
export async function POST(req: Request) {
  const session = await currentSession();
  if (!session) return NextResponse.json({ error: "Sin sesión" }, { status: 401 });
  const body = (await req.json().catch(() => null)) as { lesson?: unknown; done?: unknown } | null;
  const lesson = typeof body?.lesson === "string" ? body.lesson : "";
  if (!findLesson(lesson) || typeof body?.done !== "boolean") return NextResponse.json({ error: "Clase no válida" }, { status: 400 });
  try {
    if (!(await findPaidOrder(session.email))) return NextResponse.json({ error: "Sin compra" }, { status: 403 });
    await setProgress(session.email, lesson, body.done);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("progreso", err);
    return NextResponse.json({ error: "No pudimos guardar tu avance" }, { status: 502 });
  }
}
