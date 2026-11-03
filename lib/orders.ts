import { sendEmail } from "./brevo";
import type { DlocalPayment } from "./dlocal";
import { welcomeEmail } from "./emails";
import { claimWelcome, releaseWelcome, saveCustomer, saveOrder } from "./supabase";

// Registra un pago confirmado en Supabase y manda la bienvenida una sola vez.
// Lo llaman el webhook de dLocal Go y la página de gracias (lo que llegue primero).
export async function recordPaidPayment(p: DlocalPayment, site: string) {
  const email = p.payer?.email;
  if (p.status !== "PAID" || !email) return { saved: false };

  await saveCustomer({ email, first_name: p.payer?.first_name, last_name: p.payer?.last_name, country: p.country });
  await saveOrder({
    payment_id: p.id,
    email,
    order_id: p.order_id ?? null,
    amount: p.amount ?? null,
    currency: p.currency ?? null,
    country: p.country ?? null,
    status: "paid",
    paid_at: new Date().toISOString(),
  });

  if (!(await claimWelcome(p.id))) return { saved: true, welcome: "ya enviada" };
  try {
    const mail = welcomeEmail({ site, email: email.trim().toLowerCase(), firstName: p.payer?.first_name });
    await sendEmail({ to: email, name: [p.payer?.first_name, p.payer?.last_name].filter(Boolean).join(" "), ...mail });
    return { saved: true, welcome: "enviada" };
  } catch (err) {
    // Si Brevo falla, se libera la marca para que el próximo intento (reintento del webhook) la vuelva a mandar.
    await releaseWelcome(p.id).catch(() => {});
    throw err;
  }
}
