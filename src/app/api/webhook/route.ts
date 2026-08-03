import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

/**
 * Webhook general de TimePro.
 * Permite que otros sistemas (Total App GT u otros) disparen acciones:
 *  - { action: "confirm_payment", reference: "PAGO-XXXX" }  → activa una suscripción
 *  - { action: "ping" } → verificación de salud
 * Protegido con GENERAL_WEBHOOK_TOKEN.
 */
export async function POST(req: Request) {
  const expected = process.env.GENERAL_WEBHOOK_TOKEN;
  if (expected) {
    const auth = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
    const queryToken = new URL(req.url).searchParams.get("token");
    if (auth !== expected && queryToken !== expected) {
      return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 });
    }
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "JSON inválido" }, { status: 400 });
  }

  switch (body?.action) {
    case "ping":
      return NextResponse.json({ ok: true, message: "pong", service: "timepro", time: new Date().toISOString() });

    case "confirm_payment": {
      const reference = String(body.reference || "").toUpperCase();
      if (!reference) return NextResponse.json({ ok: false, error: "Falta reference" }, { status: 400 });

      const order = await prisma.billingOrder.findFirst({ where: { code: reference } });
      if (!order || order.status !== "PENDING") {
        return NextResponse.json({ ok: false, error: "Orden no encontrada o ya procesada" }, { status: 404 });
      }

      const periodDays = order.period === "YEARLY" ? 365 : 30;
      const renewsAt = new Date(Date.now() + periodDays * 24 * 60 * 60 * 1000);

      await prisma.$transaction([
        prisma.billingOrder.update({ where: { id: order.id }, data: { status: "PAID", paidAt: new Date(), paymentMethod: body.paymentMethod || "TRANSFERENCIA" } }),
        prisma.organization.update({
          where: { id: order.organizationId },
          data: { planCode: order.planCode, subscriptionStatus: "ACTIVE", renewsAt, trialEndsAt: null },
        }),
      ]);

      return NextResponse.json({ ok: true, message: `Suscripción ${order.planCode} activada`, order: reference });
    }

    case "extend_trial": {
      const orgId = String(body.orgId || "");
      const days = Number(body.days) || 14;
      const org = await prisma.organization.findUnique({ where: { id: orgId } });
      if (!org) return NextResponse.json({ ok: false, error: "Organización no encontrada" }, { status: 404 });
      const now = new Date();
      const trialEndsAt = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
      await prisma.organization.update({
        where: { id: orgId },
        data: { subscriptionStatus: "TRIAL", trialStartedAt: now, trialEndsAt },
      });
      return NextResponse.json({ ok: true, trialEndsAt });
    }

    default:
      return NextResponse.json({ ok: false, error: "Acción desconocida" }, { status: 400 });
  }
}
