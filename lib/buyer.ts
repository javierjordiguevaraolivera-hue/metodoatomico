import { redirect } from "next/navigation";
import { currentSession } from "@/lib/session";
import { findCustomer, findPaidOrder, listDownloads, listProgress, type DownloadFile } from "@/lib/supabase";

// Archivos que viven fuera de Supabase (el plan gratis no acepta más de 50 MB por archivo).
// DESCARGAS_EXTERNAS = {"nombre exacto.zip": "https://link-de-descarga"} en Vercel.
export function externalDownloads(): Record<string, string> {
  try {
    const v = JSON.parse(process.env.DESCARGAS_EXTERNAS || "{}");
    return v && typeof v === "object" ? v : {};
  } catch {
    console.error("DESCARGAS_EXTERNAS no es un JSON válido");
    return {};
  }
}

// Comprador con sesión y compra vigente, sus archivos disponibles y las clases que completó.
export async function loadBuyer() {
  const session = await currentSession();
  if (!session) redirect("/acceso");
  const [order, customer, files, done] = await Promise.all([
    findPaidOrder(session.email),
    findCustomer(session.email).catch(() => null),
    listDownloads().catch((err) => { console.error("mis-accesos: archivos", err); return [] as DownloadFile[]; }),
    listProgress(session.email).catch((err) => { console.error("mis-accesos: avance", err); return [] as string[]; }),
  ]);
  if (!order) redirect("/api/acceso/salir");
  const byName = new Map<string, DownloadFile>(files.map((f) => [f.name, f]));
  for (const name of Object.keys(externalDownloads())) if (!byName.has(name)) byName.set(name, { name, size: null });
  return { session, name: customer?.first_name?.trim() || "", files, byName, done: new Set(done) };
}
