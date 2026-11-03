// Plantillas de correo. HTML con tablas y estilos en línea: es lo que respetan Gmail, Outlook y Apple Mail.

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]!));

export function welcomeEmail(p: { site: string; email: string; firstName?: string }) {
  const accessUrl = `${p.site}/acceso?email=${encodeURIComponent(p.email)}`;
  const hola = p.firstName ? `¡Hola, ${esc(p.firstName)}!` : "¡Hola!";
  const step = (n: string, title: string, text: string) => `
    <tr><td style="padding:0 0 14px">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
        <td valign="top" style="width:34px;padding-top:2px">
          <div style="width:26px;height:26px;border-radius:13px;background:#119564;color:#ffffff;font:700 13px/26px Arial,Helvetica,sans-serif;text-align:center">${n}</div>
        </td>
        <td valign="top" style="font:15px/1.5 Arial,Helvetica,sans-serif;color:#D2C9EE"><strong style="color:#F7F4FF">${title}</strong><br>${text}</td>
      </tr></table>
    </td></tr>`;

  const html = `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="dark light"><meta name="supported-color-schemes" content="dark light">
<title>Tu acceso a Método Atómico</title></head>
<body style="margin:0;padding:0;background:#0D0724">
<div style="display:none;max-height:0;overflow:hidden;opacity:0">Tu compra está confirmada. Entra con tu correo y descarga todo.</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#0D0724">
<tr><td align="center" style="padding:28px 14px">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px">
    <tr><td align="center" style="padding:0 0 22px">
      <img src="${p.site}/brand/metodo-atomico-logo.png" width="170" alt="Método Atómico" style="display:block;width:170px;height:auto;border:0">
    </td></tr>
    <tr><td style="background:#1D1240;border:1px solid #35276A;border-radius:20px;padding:34px 28px">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr><td style="font:700 12px Arial,Helvetica,sans-serif;letter-spacing:2px;text-transform:uppercase;color:#2FD39B;padding:0 0 10px">Compra confirmada</td></tr>
        <tr><td style="font:800 30px/1.15 Arial,Helvetica,sans-serif;color:#F7F4FF;padding:0 0 12px">${hola} Ya es tuyo.</td></tr>
        <tr><td style="font:16px/1.55 Arial,Helvetica,sans-serif;color:#D2C9EE;padding:0 0 24px">Gracias por comprar <strong style="color:#F7F4FF">Método Atómico</strong>. Todo está listo para que hagas tu primer video viral con tu IA.</td></tr>
        <tr><td align="center" style="padding:0 0 12px">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
            <td align="center" bgcolor="#119564" style="border-radius:14px">
              <a href="${accessUrl}" style="display:inline-block;padding:16px 30px;font:800 17px Arial,Helvetica,sans-serif;color:#ffffff;text-decoration:none;border-radius:14px">Entrar a mi acceso →</a>
            </td>
          </tr></table>
        </td></tr>
        <tr><td align="center" style="font:13px/1.5 Arial,Helvetica,sans-serif;color:#9A8FC4;padding:0 0 26px">Entras con este correo: <strong style="color:#F7F4FF">${esc(p.email)}</strong></td></tr>
        <tr><td style="border-top:1px solid #2E2260;padding:24px 0 6px;font:800 18px Arial,Helvetica,sans-serif;color:#F7F4FF">Así empiezas</td></tr>
        ${step("1", "Entra a tu acceso", "Pon tu correo y listo. La sesión dura 2 horas; después vuelves a entrar igual.")}
        ${step("2", "Descarga la carpeta", "Descarga el ZIP de Método Atómico y descomprímelo en tu computadora.")}
        ${step("3", "Ábrela en tu IA", "En la app de escritorio de Claude o ChatGPT, abre la carpeta y escribe «configúrame».")}
        ${step("4", "Haz tu primer video", "Escribe un tema en una frase. Tu IA hace el guion, los dibujos, la voz y los subtítulos.")}
      </table>
    </td></tr>
    <tr><td align="center" style="padding:22px 10px 0;font:13px/1.6 Arial,Helvetica,sans-serif;color:#8E82BF">
      ¿Dudas? Escríbenos por <a href="https://ig.me/m/metodoatomico_" style="color:#2FD39B;text-decoration:underline">Instagram</a>.<br>
      Este correo se envía desde una dirección que no recibe respuestas.<br>
      <a href="${p.site}" style="color:#8E82BF">metodoatomico.lat</a>
    </td></tr>
  </table>
</td></tr></table>
</body></html>`;

  const text = [
    `${p.firstName ? `¡Hola, ${p.firstName}!` : "¡Hola!"} Ya es tuyo.`,
    "Gracias por comprar Método Atómico.",
    "",
    `Entra a tu acceso: ${accessUrl}`,
    `Entras con este correo: ${p.email}`,
    "",
    "1. Entra a tu acceso con tu correo (la sesión dura 2 horas).",
    "2. Descarga el ZIP de Método Atómico y descomprímelo.",
    "3. En la app de escritorio de Claude o ChatGPT, abre la carpeta y escribe «configúrame».",
    "4. Escribe un tema en una frase y tu IA hace el video.",
    "",
    "¿Dudas? Escríbenos por Instagram: https://ig.me/m/metodoatomico_",
  ].join("\n");

  return { subject: "Tu acceso a Método Atómico ya está listo", html, text };
}
