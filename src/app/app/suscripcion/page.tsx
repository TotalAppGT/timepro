import { requireOwner } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PLANS, getPlan, formatQ } from "@/lib/plans";
import { SubscriptionManager } from "./SubscriptionManager";

export const metadata = { title: "Suscripción" };

export default async function SubscriptionPage() {
  const ctx = await requireOwner();

  const [org, orders] = await Promise.all([
    prisma.organization.findUnique({ where: { id: ctx.orgId } }),
    prisma.billingOrder.findMany({ where: { organizationId: ctx.orgId }, orderBy: { createdAt: "desc" }, take: 10 }),
  ]);
  if (!org) return null;

  const currentPlan = getPlan(org.planCode);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Suscripción</h1>
        <p className="text-sm text-slate-500">
          Plan actual: <strong>{currentPlan.name}</strong> · Estado:{" "}
          <span className="font-semibold text-slate-700">
            {org.subscriptionStatus === "TRIAL" ? "Prueba gratis" : org.subscriptionStatus === "ACTIVE" ? "Activa" : org.subscriptionStatus === "CANCELLED" ? "Cancelada" : org.subscriptionStatus}
          </span>
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="grid gap-4 sm:grid-cols-3">
          <Info label="Renovación" value={org.renewsAt ? new Date(org.renewsAt).toLocaleDateString("es-GT") : "—"} />
          <Info label="Trial termina" value={org.trialEndsAt ? new Date(org.trialEndsAt).toLocaleDateString("es-GT") : "—"} />
          <Info label="Pago" value={`${formatQ(currentPlan.priceMonthly)}/mes (${currentPlan.name})`} />
        </div>
      </div>

      <SubscriptionManager
        orgStatus={org.subscriptionStatus}
        currentPlanCode={org.planCode}
        plans={PLANS.map((p) => ({
          code: p.code,
          name: p.name,
          priceMonthly: p.priceMonthly,
          priceYearly: p.priceYearly,
          popular: Boolean(p.popular),
        }))}
        orders={orders.map((o) => ({
          id: o.id,
          code: o.code,
          planCode: o.planCode,
          amount: Number(o.amount),
          status: o.status,
          period: o.period,
          createdAt: o.createdAt.toISOString(),
        }))}
      />

      <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600">
        <h3 className="mb-2 font-bold text-slate-900">Métodos de pago</h3>
        <p className="mb-1">1. <strong>Transferencia o depósito bancario</strong>: genera tu referencia de pago, deposita el monto y confirma la referencia. Activación casi inmediata.</p>
        <p>2. <strong>Tarjeta de crédito/débito</strong>: se habilita próximamente con activación automática (pagos recurrentes).</p>
        <p className="mt-2 text-xs text-slate-400">
          ¿Dudas? Escríbenos por WhatsApp al {process.env.OWNER_PHONE || "5830 3182"}.
        </p>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-slate-800">{value}</p>
    </div>
  );
}
