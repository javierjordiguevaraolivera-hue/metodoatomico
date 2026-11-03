import { NextResponse } from "next/server";
import { currentSession } from "@/lib/session";
import { findPaidOrder, listDownloads, signedDownloadUrl } from "@/lib/supabase";

// Descarga de un archivo del bucket privado: solo con sesión y compra vigente.
// Redirige a un link firmado de Supabase que vence en 2 minutos (no sirve compartirlo).
export async function GET(req: Request) {
  const session = await currentSession();
  if (!session) return NextResponse.redirect(new URL("/acceso", req.url), 303);

  const name = new URL(req.url).searchParams.get("f") ?? "";
  try {
    if (!(await findPaidOrder(session.email))) return NextResponse.redirect(new URL("/acceso", req.url), 303);
    // Solo se puede pedir un archivo que esté en la lista (nada de rutas inventadas).
    const files = await listDownloads();
    if (!files.some((f) => f.name === name)) return NextResponse.json({ error: "Archivo no encontrado" }, { status: 404 });
    return NextResponse.redirect(await signedDownloadUrl(name), 303);
  } catch (err) {
    console.error("descarga", err);
    return NextResponse.json({ error: "No pudimos preparar la descarga. Intenta de nuevo." }, { status: 502 });
  }
}
