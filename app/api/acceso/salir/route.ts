import { NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/session";

// Cierra la sesión de /mis-accesos.
export async function GET(req: Request) {
  const res = NextResponse.redirect(new URL("/acceso", req.url), 303);
  res.cookies.set(SESSION_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}
