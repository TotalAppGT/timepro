"use server";

import { sendEmail } from "@/lib/email";
import { rateLimit } from "@/lib/rate-limit";

export async function sendContactMessage(input: { name: string; email: string; phone: string; message: string }) {
  const key = `contact:${input.email.toLowerCase()}`;
  const rl = rateLimit({ key, limit: 5, windowMs: 60 * 60 * 1000 });
  if (!rl.ok) return { ok: false, error: "Demasiados intentos. Intenta más tarde." };

  const to = process.env.OWNER_EMAIL || "totalappgt@gmail.com";
  const res = await sendEmail({
    to,
    subject: `Nuevo mensaje de contacto (${input.name})`,
    html: `
      <p><strong>Nombre:</strong> ${input.name}</p>
      <p><strong>Correo:</strong> ${input.email}</p>
      <p><strong>Teléfono:</strong> ${input.phone || "—"}</p>
      <hr/>
      <p>${input.message.replace(/\n/g, "<br/>")}</p>
    `,
  });

  if (!res.ok) return { ok: false, error: "No se pudo enviar el mensaje. Escríbenos por WhatsApp al 5830 3182." };
  return { ok: true };
}
