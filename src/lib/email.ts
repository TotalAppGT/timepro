import { Resend } from "resend";

let resend: Resend | null = null;
export function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  if (!resend) resend = new Resend(key);
  return resend;
}

export function emailFrom(): string {
  return process.env.EMAIL_FROM || "TimePro <onboarding@resend.dev>";
}

export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
}): Promise<{ ok: boolean; error?: string }> {
  const client = getResend();
  if (!client) return { ok: false, error: "RESEND_API_KEY no configurada" };
  try {
    const { error } = await client.emails.send({
      from: emailFrom(),
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Error de correo" };
  }
}

export function baseEmailLayout(title: string, content: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:24px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.06);">
        <tr>
          <td style="background:#0f766e;padding:24px 32px;">
            <span style="color:#ffffff;font-size:22px;font-weight:bold;">⏱ TimePro</span>
          </td>
        </tr>
        <tr>
          <td style="padding:32px;">
            <h1 style="margin:0 0 16px;font-size:20px;color:#0f172a;">${title}</h1>
            <div style="font-size:15px;line-height:1.6;color:#334155;">${content}</div>
          </td>
        </tr>
        <tr>
          <td style="padding:20px 32px;border-top:1px solid #e2e8f0;color:#94a3b8;font-size:12px;">
            TimePro · Total App GT · Guatemala · WhatsApp ${process.env.OWNER_PHONE || "58303182"}
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function sendWelcomeEmail(opts: {
  to: string;
  name: string;
  company: string;
  loginUrl: string;
  trialDays: number;
}): Promise<{ ok: boolean; error?: string }> {
  const content = `
    <p>¡Hola <strong>${opts.name}</strong>!</p>
    <p>Tu empresa <strong>${opts.company}</strong> ya está lista en <strong>TimePro</strong>, tu eficientador de tiempo para proyectos, entregas, instalaciones y firmas digitales.</p>
    <p>Cuentas con una <strong>prueba gratis de ${opts.trialDays} días</strong> en el plan completo. Sin tarjeta de crédito.</p>
    <p style="margin-top:24px;">
      <a href="${opts.loginUrl}" style="background:#0f766e;color:#ffffff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">Entrar a mi cuenta</a>
    </p>
    <p style="margin-top:24px;color:#64748b;">Si tienes dudas, escríbenos por WhatsApp al ${process.env.OWNER_PHONE || "58303182"}.</p>
  `;
  return sendEmail({ to: opts.to, subject: `¡Bienvenido a TimePro, ${opts.name}! 🎉`, html: baseEmailLayout("Tu cuenta está lista", content) });
}

export async function sendWorkOrderNotification(opts: {
  to: string;
  name: string;
  workOrderTitle: string;
  code: string;
  detailUrl: string;
}): Promise<{ ok: boolean; error?: string }> {
  const content = `
    <p>Hola <strong>${opts.name}</strong>,</p>
    <p>Se te ha asignado la orden de trabajo <strong>${opts.workOrderTitle}</strong> (${opts.code}).</p>
    <p style="margin-top:24px;">
      <a href="${opts.detailUrl}" style="background:#0f766e;color:#ffffff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">Ver orden</a>
    </p>
  `;
  return sendEmail({ to: opts.to, subject: `Nueva orden de trabajo: ${opts.code}`, html: baseEmailLayout("Tienes una nueva orden 📋", content) });
}

export async function sendDocumentSignedNotification(opts: {
  to: string;
  name: string;
  documentTitle: string;
  number: string;
  pdfUrl: string;
}): Promise<{ ok: boolean; error?: string }> {
  const content = `
    <p>Hola <strong>${opts.name}</strong>,</p>
    <p>El documento <strong>${opts.documentTitle}</strong> (${opts.number}) fue firmado digitalmente y está listo.</p>
    <p style="margin-top:24px;">
      <a href="${opts.pdfUrl}" style="background:#0f766e;color:#ffffff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">Descargar PDF</a>
    </p>
  `;
  return sendEmail({ to: opts.to, subject: `Documento firmado: ${opts.number}`, html: baseEmailLayout("Documento firmado ✍️", content) });
}
