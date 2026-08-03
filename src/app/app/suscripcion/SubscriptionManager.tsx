"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBillingOrder, activateSubscriptionByReference, cancelSubscription, extendTrial } from "@/app/app/actions";
import { Button, Input, Alert, Badge } from "@/components/ui";
import { Check, Sparkles } from "lucide-react";

export function SubscriptionManager({
  orgStatus,
  currentPlanCode,
  plans,
  orders,
}: {
  orgStatus: string;
  currentPlanCode: string;
  plans: { code: string; name: string; priceMonthly: number; priceYearly: number; popular?: boolean }[];
  orders: { id: string; code: string; planCode: string; amount: number; status: string; period: string; createdAt: string }[];
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [selected, setSelected] = useState<{ planCode: string; period: "MONTHLY" | "YEARLY" }>({ planCode: "PRO", period: "MONTHLY" });
  const [reference, setReference] = useState("");

  async function order() {
    setLoading("order");
    setError(null);
    setInfo(null);
    const r = await createBillingOrder(selected);
    if (r?.error) {
      setError(r.error);
      setInfo(null);
    } else {
      setInfo(`Orden de pago creada: ${r.code}. Deposita Q${r.amount} y confirma con tu referencia.`);
    }
    setLoading(null);
    router.refresh();
  }

  async function confirmReference() {
    setLoading("confirm");
    setError(null);
    setInfo(null);
    const r = await activateSubscriptionByReference(reference.trim());
    if (r?.error) setError(r.error);
    else setInfo("¡Suscripción activada! Tu plan ya está vigente.");
    setLoading(null);
    router.refresh();
  }

  async function cancel() {
    if (!window.confirm("¿Seguro que quieres cancelar tu suscripción? Tu información estará disponible 6 meses.")) return;
    setLoading("cancel");
    const r = await cancelSubscription();
    if (r?.error) setError(r.error);
    setLoading(null);
    router.refresh();
  }

  async function trial() {
    setLoading("trial");
    const r = await extendTrial(14);
    if (r?.error) setError(r.error);
    else setInfo("Prueba extendida 14 días más.");
    setLoading(null);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      {error && <Alert kind="error">{error}</Alert>}
      {info && <Alert kind="success">{info}</Alert>}

      {orgStatus === "TRIAL" && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-brand-200 bg-brand-50 p-4">
          <p className="flex items-center gap-2 text-sm font-semibold text-brand-800">
            <Sparkles className="h-4 w-4" /> Estás en la prueba gratis. Elige tu plan cuando estés listo.
          </p>
          <Button type="button" onClick={trial} loading={loading === "trial"} className="btn-secondary text-xs">Extender prueba 14 días</Button>
        </div>
      )}

      {/* Selector de planes */}
      <div className="grid gap-4 lg:grid-cols-3">
        {plans.map((p) => (
          <div
            key={p.code}
            onClick={() => setSelected({ ...selected, planCode: p.code })}
            className={`cursor-pointer rounded-2xl border p-5 transition-all ${
              selected.planCode === p.code ? "border-brand-600 ring-2 ring-brand-600/30" : "border-slate-200 hover:border-brand-300"
            } ${p.code === currentPlanCode ? "bg-brand-50/50" : "bg-white"}`}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900">{p.name}</h3>
              {p.code === currentPlanCode && <Badge className="bg-emerald-100 text-emerald-700">Actual</Badge>}
            </div>
            <div className="mt-3 flex items-end gap-1">
              <span className="text-3xl font-extrabold text-slate-900">{p.priceMonthly}</span>
              <span className="mb-1 text-sm text-slate-500">Q/mes</span>
            </div>
            <p className="mt-1 text-xs text-slate-400">Anual: {formatQ(p.priceYearly)} (2 meses gratis)</p>
            <div className="mt-4">
              <div className="flex rounded-lg bg-slate-100 p-1 text-xs font-semibold">
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setSelected({ ...selected, planCode: p.code, period: "MONTHLY" }); }}
                  className={`flex-1 rounded-md px-2 py-1.5 ${selected.period === "MONTHLY" && selected.planCode === p.code ? "bg-white text-slate-900 shadow" : "text-slate-500"}`}
                >
                  Mensual
                </button>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setSelected({ ...selected, planCode: p.code, period: "YEARLY" }); }}
                  className={`flex-1 rounded-md px-2 py-1.5 ${selected.period === "YEARLY" && selected.planCode === p.code ? "bg-white text-slate-900 shadow" : "text-slate-500"}`}
                >
                  Anual
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <Button type="button" onClick={order} loading={loading === "order"} className="btn-primary">
          {loading === "order" ? "Generando..." : currentPlanCode === selected.planCode ? "Renovar plan" : "Adquirir plan"}
        </Button>
        {orgStatus === "ACTIVE" && (
          <Button type="button" onClick={cancel} loading={loading === "cancel"} className="btn-danger">
            Cancelar suscripción
          </Button>
        )}
      </div>

      {/* Confirmación manual */}
      <div className="card p-5">
        <h2 className="mb-2 text-sm font-bold text-slate-900">Confirmar pago por transferencia / depósito</h2>
        <p className="mb-3 text-sm text-slate-500">
          Después de depositar, escribe tu número de referencia (ej: <code className="rounded bg-slate-100 px-1">PAGO-2508-XXXX</code>) y confirma.
          Se activa de inmediato.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Input value={reference} onChange={(e) => setReference(e.target.value)} placeholder="Referencia de tu orden" />
          <Button type="button" onClick={confirmReference} loading={loading === "confirm"} className="btn-primary sm:w-auto">
            Confirmar pago
          </Button>
        </div>
      </div>

      {/* Historial */}
      {orders.length > 0 && (
        <div className="card overflow-hidden">
          <h2 className="border-b border-slate-100 p-4 text-sm font-bold text-slate-900">Historial de órdenes</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="table-th">Referencia</th>
                  <th className="table-th">Plan</th>
                  <th className="table-th">Periodo</th>
                  <th className="table-th">Monto</th>
                  <th className="table-th">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((o) => (
                  <tr key={o.id}>
                    <td className="table-td font-mono text-xs">{o.code}</td>
                    <td className="table-td">{plans.find((p) => p.code === o.planCode)?.name || o.planCode}</td>
                    <td className="table-td text-xs">{o.period === "YEARLY" ? "Anual" : "Mensual"}</td>
                    <td className="table-td">{formatQ(o.amount)}</td>
                    <td className="table-td">
                      <Badge className={o.status === "PAID" ? "bg-emerald-100 text-emerald-700" : o.status === "PENDING" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-500"}>
                        {o.status === "PAID" ? <><Check className="h-3 w-3" /> Pagado</> : o.status === "PENDING" ? "Pendiente" : o.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function formatQ(n: number): string {
  return "Q" + n.toLocaleString("es-GT", { maximumFractionDigits: 0 });
}
