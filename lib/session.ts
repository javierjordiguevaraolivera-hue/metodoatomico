import crypto from "node:crypto";
import { cookies } from "next/headers";

// Sesión de /acceso: una cookie firmada con ACCESS_SESSION_SECRET que dura como máximo 2 horas
// (no se renueva sola: al vencer, la persona vuelve a poner su correo).
export const SESSION_COOKIE = "ma_acceso";
export const SESSION_HOURS = 2;

const secret = () => {
  const s = process.env.ACCESS_SESSION_SECRET;
  if (!s || s.length < 32) throw new Error("Falta ACCESS_SESSION_SECRET (mínimo 32 caracteres)");
  return s;
};
const sign = (data: string) => crypto.createHmac("sha256", secret()).update(data).digest("base64url");

export function createSessionValue(email: string) {
  const exp = Date.now() + SESSION_HOURS * 60 * 60 * 1000;
  const data = Buffer.from(JSON.stringify({ email, exp })).toString("base64url");
  return { value: `${data}.${sign(data)}`, exp };
}

export function readSessionValue(value: string | undefined) {
  if (!value) return null;
  const [data, sig] = value.split(".");
  if (!data || !sig) return null;
  const expected = sign(data);
  if (sig.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  try {
    const { email, exp } = JSON.parse(Buffer.from(data, "base64url").toString()) as { email: string; exp: number };
    return typeof email === "string" && typeof exp === "number" && exp > Date.now() ? { email, exp } : null;
  } catch {
    return null;
  }
}

export async function currentSession() {
  return readSessionValue((await cookies()).get(SESSION_COOKIE)?.value);
}
