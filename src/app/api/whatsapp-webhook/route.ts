import { NextResponse } from "next/server";
import { getWhatsAppConfig } from "@/lib/whatsapp";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

// Verificación del webhook de WhatsApp (Meta)
export async function GET(req: Request) {
  const config = getWhatsAppConfig();
  if (!config) return NextResponse.json({ error: "WhatsApp no configurado" }, { status: 500 });

  const url = new URL(req.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === config.verifyToken) {
    return new NextResponse(challenge, { status: 200, headers: { "Content-Type": "text/plain" } });
  }
  return NextResponse.json({ error: "Verificación fallida" }, { status: 403 });
}

// Recepción de mensajes de WhatsApp
export async function POST(req: Request) {
  const body = await req.json();

  try {
    const entries = body?.entry ?? [];
    for (const entry of entries) {
      const changes = entry.changes ?? [];
      for (const change of changes) {
        const messages = change?.value?.messages ?? [];
        for (const msg of messages) {
          if (msg.type !== "text") continue;
          const from = msg.from; // número del remitente
          const text = msg.text?.body ?? "";

          // Un cliente responde desde el enlace compartido
          const tokenMatch = text.match(/(?:firmar|firma|s)\s*[:\-]?\s*([A-Za-z0-9]{16,40})/i);
          if (tokenMatch) {
            const wo = await prisma.workOrder.findUnique({
              where: { publicToken: tokenMatch[1] },
              select: { id: true, title: true, code: true, customer: { select: { name: true } } },
            });
            const url = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
            const reply = wo
              ? `✅ Encontramos tu orden ${wo.code}: "${wo.title}". Ábrela aquí para firmarla: ${url}/aprobacion/${tokenMatch[1]}`
              : "Lo sentimos, no encontramos esa orden. Verifica el enlace e inténtalo de nuevo.";
            // Enviamos respuesta (requiere el token configurado; aquí se omite el envío automático por simplicidad y para evitar costos)
            console.log("[whatsapp-webhook]", from, text, "→", reply);
          }
        }
      }
    }
  } catch {
    // no romper el ack
  }

  return NextResponse.json({ status: "ok" }, { status: 200 });
}
