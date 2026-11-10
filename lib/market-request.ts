import { headers } from "next/headers";
import { getMarket, localize, type Market, pickLang } from "./markets";

// Mercado de /us o /india en el idioma de quien visita: se decide en el servidor con Accept-Language,
// así la página llega directo en su idioma (sin parpadeo). ?lang=es|en|hi lo fuerza.
export async function requestMarket(id: string, override?: string | string[]): Promise<Market | null> {
  const m = getMarket(id);
  if (!m) return null;
  const forced = typeof override === "string" ? override : undefined;
  if (forced && (m.langs as string[]).includes(forced)) return localize(m, forced);
  return localize(m, pickLang(m, (await headers()).get("accept-language")));
}
