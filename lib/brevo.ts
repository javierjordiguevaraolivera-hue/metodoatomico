// Correos transaccionales por la API de Brevo (https://developers.brevo.com/reference/sendtransacemail).

export async function sendEmail(m: { to: string; name?: string; subject: string; html: string; text: string }) {
  const key = process.env.BREVO_API_KEY;
  const sender = process.env.BREVO_SENDER_EMAIL;
  if (!key || !sender) throw new Error("Faltan BREVO_API_KEY o BREVO_SENDER_EMAIL");
  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: { "api-key": key, "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify({
      sender: { email: sender, name: process.env.BREVO_SENDER_NAME || "Método Atómico" },
      to: [{ email: m.to, ...(m.name ? { name: m.name } : {}) }],
      subject: m.subject,
      htmlContent: m.html,
      textContent: m.text,
      tags: ["acceso"],
    }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Brevo ${res.status}: ${(await res.text()).slice(0, 300)}`);
  return (await res.json()) as { messageId?: string };
}
