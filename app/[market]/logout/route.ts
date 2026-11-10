import { NextResponse } from "next/server";
import { getMarket } from "@/lib/markets";
import { SESSION_COOKIE } from "@/lib/session";

// Cierra la sesión y vuelve al ingreso del mercado (/us/login o /india/login).
export async function GET(req: Request, { params }: { params: Promise<{ market: string }> }) {
  const m = getMarket((await params).market);
  const res = NextResponse.redirect(new URL(m ? `/${m.id}/login` : "/", req.url), 303);
  res.cookies.set(SESSION_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}
