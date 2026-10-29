import { NextResponse, type NextRequest } from "next/server";

// Link de afiliado de Hotmart: se usa EXACTO, sin slash final.
const HOTMART_URL = "https://go.hotmart.com/N108193402G";

// Todo el tráfico (cualquier ruta) se redirige al link de Hotmart,
// pasando tal cual los parámetros de la URL (fbclid, utm_*, src, sck, etc.).
export function proxy(request: NextRequest) {
  // Query tal cual llega en la URL, sin volver a armarla.
  const i = request.url.indexOf("?");
  const query = i === -1 ? "" : request.url.slice(i); // incluye "?" o es ""
  const response = NextResponse.redirect(HOTMART_URL + query, 302);
  response.headers.set("Cache-Control", "no-store");
  return response;
}

export const config = {
  matcher: "/:path*",
};
