// Acceso a Supabase desde el servidor con la llave service_role (REST y Storage, sin librerías).
// Las tablas están en supabase/schema.sql y tienen RLS: solo esta llave puede leer y escribir.

function config() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY");
  return { url, key };
}

async function rest<T>(path: string, init: RequestInit & { prefer?: string } = {}): Promise<T> {
  const { url, key } = config();
  const res = await fetch(`${url}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: key,
      "content-type": "application/json",
      ...(init.prefer ? { Prefer: init.prefer } : {}),
    },
    cache: "no-store",
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`Supabase ${res.status}: ${text.slice(0, 300)}`);
  return (text ? JSON.parse(text) : null) as T;
}

export type Order = {
  payment_id: string;
  email: string;
  order_id: string | null;
  amount: number | null;
  currency: string | null;
  country: string | null;
  status: "paid" | "refunded" | "chargeback";
  paid_at: string | null;
  welcome_sent_at: string | null;
};

export const normalizeEmail = (email: string) => email.trim().toLowerCase();

export async function saveCustomer(c: { email: string; first_name?: string; last_name?: string; country?: string }) {
  // Si ya existe, no se pisan los datos que tenía.
  await rest("customers?on_conflict=email", {
    method: "POST",
    prefer: "resolution=ignore-duplicates,return=minimal",
    body: JSON.stringify({ ...c, email: normalizeEmail(c.email) }),
  });
}

export async function saveOrder(o: Omit<Order, "welcome_sent_at">) {
  // El estado de un pedido ya registrado (por ejemplo "refunded") no se cambia desde aquí.
  await rest("orders?on_conflict=payment_id", {
    method: "POST",
    prefer: "resolution=ignore-duplicates,return=minimal",
    body: JSON.stringify({ ...o, email: normalizeEmail(o.email) }),
  });
}

// Marca la bienvenida como enviada solo si nadie la marcó antes. Devuelve true si esta llamada "ganó"
// (así el webhook y la página de gracias nunca mandan el correo dos veces).
export async function claimWelcome(paymentId: string) {
  const rows = await rest<Order[]>(
    `orders?payment_id=eq.${encodeURIComponent(paymentId)}&welcome_sent_at=is.null`,
    { method: "PATCH", prefer: "return=representation", body: JSON.stringify({ welcome_sent_at: new Date().toISOString() }) },
  );
  return rows.length > 0;
}

export async function releaseWelcome(paymentId: string) {
  await rest(`orders?payment_id=eq.${encodeURIComponent(paymentId)}`, {
    method: "PATCH",
    prefer: "return=minimal",
    body: JSON.stringify({ welcome_sent_at: null }),
  });
}

export async function findPaidOrder(email: string) {
  const rows = await rest<Order[]>(
    `orders?email=eq.${encodeURIComponent(normalizeEmail(email))}&status=eq.paid&select=*&order=paid_at.desc&limit=1`,
  );
  return rows[0] ?? null;
}

export async function findCustomer(email: string) {
  const rows = await rest<{ email: string; first_name: string | null }[]>(
    `customers?email=eq.${encodeURIComponent(normalizeEmail(email))}&select=email,first_name&limit=1`,
  );
  return rows[0] ?? null;
}

export async function logLogin(l: { email: string; ip?: string; user_agent?: string; country?: string }) {
  await rest("access_logins", { method: "POST", prefer: "return=minimal", body: JSON.stringify({ ...l, email: normalizeEmail(l.email) }) });
}

// ---------- Archivos descargables (bucket privado "descargas") ----------
const BUCKET = "descargas";

async function storage<T>(path: string, body: unknown): Promise<T> {
  const { url, key } = config();
  const res = await fetch(`${url}/storage/v1/${path}`, {
    method: "POST",
    headers: { apikey: key, authorization: `Bearer ${key}`, "content-type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`Supabase Storage ${res.status}: ${text.slice(0, 300)}`);
  return JSON.parse(text) as T;
}

export type DownloadFile = { name: string; size: number | null };

export async function listDownloads(): Promise<DownloadFile[]> {
  const items = await storage<{ name: string; id: string | null; metadata: { size?: number } | null }[]>(
    `object/list/${BUCKET}`,
    { prefix: "", limit: 100, sortBy: { column: "name", order: "asc" } },
  );
  // Solo archivos de la raíz del bucket (las carpetas vienen con id null) y sin el marcador vacío de Supabase.
  return items
    .filter((i) => i.id && i.name !== ".emptyFolderPlaceholder")
    .map((i) => ({ name: i.name, size: i.metadata?.size ?? null }));
}

// Link firmado que vence en 2 minutos y fuerza la descarga con el nombre del archivo.
export async function signedDownloadUrl(name: string) {
  const { url } = config();
  const { signedURL } = await storage<{ signedURL: string }>(
    `object/sign/${BUCKET}/${name.split("/").map(encodeURIComponent).join("/")}`,
    { expiresIn: 120 },
  );
  return `${url}/storage/v1${signedURL}&download=${encodeURIComponent(name)}`;
}
