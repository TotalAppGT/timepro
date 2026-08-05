import Link from "next/link";
import { Plus, ClipboardList } from "lucide-react";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { STATUS_COLORS, STATUS_LABELS, WORKORDER_TYPES, formatDate } from "@/lib/utils";
import { EmptyState, Badge } from "@/components/ui";

export const metadata = { title: "Órdenes de trabajo" };

export default async function WorkOrdersPage() {
  const ctx = await requireSession();
  const orders = await prisma.workOrder.findMany({
    where: { organizationId: ctx.orgId },
    include: {
      customer: true,
      assignedTo: true,
      _count: { select: { signatures: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const counts = {
    all: orders.length,
    pendiente: orders.filter((o) => o.status === "PENDIENTE").length,
    progreso: orders.filter((o) => ["EN_RUTA", "EN_EJECUCION", "REVISION"].includes(o.status)).length,
    completado: orders.filter((o) => o.status === "COMPLETADO").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Órdenes de trabajo</h1>
          <p className="text-sm text-slate-500">Entregas, instalaciones, mantenimiento y servicios</p>
        </div>
        <Link href="/app/ordenes/nueva" className="btn-primary">
          <Plus className="h-4 w-4" /> Nueva orden
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        {[
          { label: `Todas (${counts.all})`, active: true },
          { label: `Pendientes (${counts.pendiente})`, active: false },
          { label: `En progreso (${counts.progreso})`, active: false },
          { label: `Completadas (${counts.completado})`, active: false },
        ].map((f, i) => (
          <span key={i} className={`badge ${f.active ? "bg-brand-600 text-white" : "bg-white text-slate-600 border border-slate-200"}`}>
            {f.label}
          </span>
        ))}
      </div>

      {orders.length === 0 ? (
        <EmptyState
          icon={<ClipboardList className="h-7 w-7" />}
          title="Aún no tienes órdenes"
          description="Crea tu primera orden de trabajo: entrega, instalación o mantenimiento."
          action={<Link href="/app/ordenes/nueva" className="btn-primary">Crear orden</Link>}
        />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="table-th">Orden</th>
                  <th className="table-th">Tipo</th>
                  <th className="table-th">Cliente</th>
                  <th className="table-th">Responsable</th>
                  <th className="table-th">Programada</th>
                  <th className="table-th">Firmas</th>
                  <th className="table-th">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50">
                    <td className="table-td">
                      <Link href={`/app/ordenes/${o.id}`} className="font-semibold text-brand-700 hover:underline">
                        {o.code}
                      </Link>
                      <p className="max-w-[220px] truncate text-xs text-slate-400">{o.title}</p>
                    </td>
                    <td className="table-td"><Badge className="bg-slate-100 text-slate-600">{WORKORDER_TYPES[o.type] || o.type}</Badge></td>
                    <td className="table-td">{o.customer?.name || "—"}</td>
                    <td className="table-td">{o.assignedTo?.name || "—"}</td>
                    <td className="table-td text-xs">{formatDate(o.scheduledAt)}</td>
                    <td className="table-td">
                      <Badge className={o._count.signatures > 0 ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}>
                        {o._count.signatures > 0 ? `${o._count.signatures} ✓` : "Sin firmar"}
                      </Badge>
                    </td>
                    <td className="table-td">
                      <Badge className={STATUS_COLORS[o.status] || "bg-slate-100 text-slate-600"}>{STATUS_LABELS[o.status] || o.status}</Badge>
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
