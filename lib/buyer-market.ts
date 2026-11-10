import { redirect } from "next/navigation";
import { externalDownloads } from "./buyer";
import type { Market } from "./markets";
import { currentSession } from "./session";
import { findCustomer, findPaidOrder, listDownloads, listProgress, type DownloadFile } from "./supabase";

// Igual que loadBuyer() de la página principal, pero vuelve al ingreso del mercado (/us/login, /india/login).
export async function loadMarketBuyer(m: Market) {
  const session = await currentSession();
  if (!session) redirect(`/${m.id}/login`);
  const [order, customer, files, done] = await Promise.all([
    findPaidOrder(session.email),
    findCustomer(session.email).catch(() => null),
    listDownloads().catch((err) => { console.error("members: archivos", err); return [] as DownloadFile[]; }),
    listProgress(session.email).catch((err) => { console.error("members: avance", err); return [] as string[]; }),
  ]);
  if (!order) redirect(`/${m.id}/logout`);
  const byName = new Map<string, DownloadFile>(files.map((f) => [f.name, f]));
  for (const name of Object.keys(externalDownloads())) if (!byName.has(name)) byName.set(name, { name, size: null });
  return { session, name: customer?.first_name?.trim() || "", files, byName, done: new Set(done) };
}
