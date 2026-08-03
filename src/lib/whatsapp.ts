export interface WhatsAppConfig {
  token: string;
  phoneNumberId: string;
  verifyToken: string;
}

export function getWhatsAppConfig(): WhatsAppConfig | null {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;
  if (!token || !phoneNumberId || !verifyToken) return null;
  return { token, phoneNumberId, verifyToken };
}

const GRAPH_VERSION = "v21.0";

export async function sendWhatsAppMessage(opts: {
  to: string; // formato internacional sin "+", ej: 50258303182
  body: string;
}): Promise<{ ok: boolean; error?: string }> {
  const config = getWhatsAppConfig();
  if (!config) return { ok: false, error: "WhatsApp no configurado" };
  try {
    const res = await fetch(`https://graph.facebook.com/${GRAPH_VERSION}/${config.phoneNumberId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: opts.to,
        type: "text",
        text: { body: opts.body },
      }),
    });
    const data = await res.json();
    if (!res.ok) return { ok: false, error: data?.error?.message ?? "Error de WhatsApp" };
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Error de WhatsApp" };
  }
}

export function normalizePhone(phone: string): string {
  let p = phone.replace(/\D/g, "");
  if (p.startsWith("502") && p.length === 12) return p;
  if (p.startsWith("0")) p = p.slice(1);
  if (p.length === 8) return "502" + p;
  return p;
}
