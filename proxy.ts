import { NextResponse, type NextRequest } from "next/server";

// Interruptor: HOTMART_REDIRECT=true manda el tráfico al link de afiliado de Hotmart, como al principio.
// Sin la variable (o con otro valor) queda la landing con el checkout de dLocal Go.
// En Vercel, después de cambiarla hay que volver a desplegar para que tome el valor nuevo.
const HOTMART_URL = "https://go.hotmart.com/N108193402G"; // exacto, sin slash final

// Aunque redirija, esto sigue funcionando: compradores que ya pagaron y el webhook de dLocal
// (un pago en efectivo puede confirmarse días después).
const KEEP = ["/acceso", "/mis-accesos", "/gracias"];

export function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;

  if (process.env.HOTMART_REDIRECT === "true" && !KEEP.some((p) => path === p || path.startsWith(`${p}/`))) {
    // Query tal cual llega en la URL (fbclid, utm_*, src, sck…), sin volver a armarla.
    const i = req.url.indexOf("?");
    const res = NextResponse.redirect(HOTMART_URL + (i === -1 ? "" : req.url.slice(i)), 302);
    res.headers.set("Cache-Control", "no-store");
    return res;
  }

  // Al entrar a la landing guarda el país que detecta Vercel por la IP, para que el checkout abra con el país ya puesto.
  const res = NextResponse.next();
  const geo = req.headers.get("x-vercel-ip-country");
  if (path === "/" && geo && req.cookies.get("ma_country")?.value !== geo) {
    res.cookies.set("ma_country", geo, { path: "/", sameSite: "lax", secure: true, maxAge: 60 * 60 * 24 * 30 });
  }
  return res;
}

// Páginas solamente: fuera la API (webhook de dLocal, tracking), los archivos de Next y todo lo que tenga extensión (js, css, imágenes, video).
export const config = { matcher: "/((?!api/|_next/|.*\\..*).*)" };
