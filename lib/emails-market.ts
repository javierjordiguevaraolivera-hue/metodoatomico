import { type Market, t } from "./markets";

// Correo de bienvenida de /us (inglés) e /india (hindi). Mismo diseño que el de la página principal (lib/emails.ts).
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]!));

export function marketWelcomeEmail(m: Market, p: { site: string; email: string; firstName?: string }) {
  const d = t(m).email;
  const accessUrl = `${p.site}/${m.id}/login?email=${encodeURIComponent(p.email)}`;
  const hello = esc(d.hello(p.firstName));
  const step = (n: number, title: string, text: string) => `
    <tr><td style="padding:0 0 14px">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
        <td valign="top" style="width:34px;padding-top:2px">
          <div style="width:26px;height:26px;border-radius:13px;background:#119564;color:#ffffff;font:700 13px/26px Arial,Helvetica,sans-serif;text-align:center">${n}</div>
        </td>
        <td valign="top" style="font:15px/1.5 Arial,Helvetica,sans-serif;color:#B9BEC4"><strong style="color:#ECEDEE">${esc(title)}</strong><br>${esc(text)}</td>
      </tr></table>
    </td></tr>`;

  const html = `<!doctype html>
<html lang="${m.lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="dark light"><meta name="supported-color-schemes" content="dark light">
<title>${esc(d.subject(m.brand))}</title></head>
<body style="margin:0;padding:0;background:#0E1013">
<div style="display:none;max-height:0;overflow:hidden;opacity:0">${esc(d.preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#0E1013">
<tr><td align="center" style="padding:28px 14px">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px">
    <tr><td align="center" style="padding:0 0 22px">
      <img src="${p.site}/brand/atomic-method-logo.png" width="170" alt="${esc(m.brand)}" style="display:block;width:170px;height:auto;border:0">
    </td></tr>
    <tr><td style="background:#16191D;border:1px solid #262B31;border-radius:20px;padding:34px 28px">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr><td style="font:700 12px Arial,Helvetica,sans-serif;letter-spacing:2px;text-transform:uppercase;color:#2FD39B;padding:0 0 10px">${esc(d.kicker)}</td></tr>
        <tr><td style="font:800 30px/1.2 Arial,Helvetica,sans-serif;color:#ECEDEE;padding:0 0 12px">${hello} ${esc(d.yours)}</td></tr>
        <tr><td style="font:16px/1.55 Arial,Helvetica,sans-serif;color:#B9BEC4;padding:0 0 24px">${d.thanks(esc(m.brand))}</td></tr>
        <tr><td align="center" style="padding:0 0 12px">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
            <td align="center" bgcolor="#119564" style="border-radius:14px">
              <a href="${accessUrl}" style="display:inline-block;padding:16px 30px;font:800 17px Arial,Helvetica,sans-serif;color:#ffffff;text-decoration:none;border-radius:14px">${esc(d.cta)}</a>
            </td>
          </tr></table>
        </td></tr>
        <tr><td align="center" style="font:13px/1.5 Arial,Helvetica,sans-serif;color:#8A9198;padding:0 0 26px">${esc(d.with)} <strong style="color:#ECEDEE">${esc(p.email)}</strong></td></tr>
        <tr><td style="border-top:1px solid #22262B;padding:24px 0 6px;font:800 18px Arial,Helvetica,sans-serif;color:#ECEDEE">${esc(d.start)}</td></tr>
        ${d.steps.map(([title, text], i) => step(i + 1, title, text)).join("")}
      </table>
    </td></tr>
    <tr><td align="center" style="padding:22px 10px 0;font:13px/1.6 Arial,Helvetica,sans-serif;color:#7D848B">
      ${esc(d.noReply)}<br>
      <a href="${p.site}/${m.id}" style="color:#7D848B">${esc(m.brand)}</a>
    </td></tr>
  </table>
</td></tr>
</table>
</body></html>`;

  const text = [
    `${d.hello(p.firstName)} ${d.yours}`,
    "",
    `${d.cta.replace(" →", "")}: ${accessUrl}`,
    `${d.with} ${p.email}`,
    "",
    ...d.steps.map(([title, txt], i) => `${i + 1}. ${title}: ${txt}`),
  ].join("\n");

  return { subject: d.subject(m.brand), html, text };
}
