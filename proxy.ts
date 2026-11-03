import { NextResponse, type NextRequest } from "next/server";

// Al entrar a la landing guarda el país que detecta Vercel por la IP, para que el checkout abra con el país ya puesto.
export function proxy(req: NextRequest) {
  const res = NextResponse.next();
  const geo = req.headers.get("x-vercel-ip-country");
  if (geo && req.cookies.get("ma_country")?.value !== geo) {
    res.cookies.set("ma_country", geo, { path: "/", sameSite: "lax", secure: true, maxAge: 60 * 60 * 24 * 30 });
  }
  return res;
}

export const config = { matcher: "/" };
