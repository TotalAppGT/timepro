import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

/**
 * Webhook de Stripe para suscripciones recurrentes.
 * Configura STRIPE_WEBHOOK_SECRET y STRIPE_SECRET_KEY para habilitarlo.
 * Nota: instala el paquete `stripe` si vas a usar este flujo:
 *   npm i stripe
 */
export async function POST(req: Request) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secretKey || !webhookSecret) {
    return NextResponse.json({ ok: false, error: "Stripe no configurado" }, { status: 503 });
  }

  let stripe: any;
  try {
    stripe = new (await import("stripe")).default(secretKey);
  } catch {
    return NextResponse.json({ ok: false, error: "Paquete stripe no instalado" }, { status: 500 });
  }

  const signature = req.headers.get("stripe-signature");
  const raw = await req.text();
  if (!signature) return NextResponse.json({ ok: false, error: "Falta firma" }, { status: 400 });

  let event: any;
  try {
    event = stripe.webhooks.constructEvent(raw, signature, webhookSecret);
  } catch {
    return NextResponse.json({ ok: false, error: "Firma inválida" }, { status: 400 });
  }

  const handleOrg = (customerId: string) => prisma.organization.findUnique({ where: { stripeCustomerId: customerId } });

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const customerId = String(session.customer || "");
      const planCode = String(session.metadata?.plan || "BASIC");
      const period = session.metadata?.period === "YEARLY" ? "YEARLY" : "MONTHLY";

      const org = await handleOrg(customerId);
      if (org) {
        const periodDays = period === "YEARLY" ? 365 : 30;
        const renewsAt = new Date(Date.now() + periodDays * 24 * 60 * 60 * 1000);
        await prisma.organization.update({
          where: { id: org.id },
          data: {
            planCode,
            subscriptionStatus: "ACTIVE",
            renewsAt,
            trialEndsAt: null,
            stripeSubscriptionId: String(session.subscription || org.stripeSubscriptionId || ""),
          },
        });
      }
      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object;
      await prisma.organization.updateMany({
        where: { stripeSubscriptionId: sub.id },
        data: { subscriptionStatus: "CANCELLED" },
      });
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object;
      if (invoice.subscription) {
        await prisma.organization.updateMany({
          where: { stripeSubscriptionId: String(invoice.subscription) },
          data: { subscriptionStatus: "PAST_DUE" },
        });
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
