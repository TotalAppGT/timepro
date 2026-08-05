import Link from "next/link";
import { Inbox, Plus, CheckCircle2, Clock, UserCheck } from "lucide-react";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { STATUS_COLORS, STATUS_LABELS, WORKORDER_TYPES, formatDate, daysUntil } from "@/lib/utils";
import { Badge, EmptyState } from "@/components/ui";

export const metadata = { title: "Mis pendientes" };

export default async function PendientesPage() {
  const ctx = await requireSession();

  const mine = await prisma.workOrder.findMany({
    where: {
      organizationId: ctx.orgId,
      assignedToId: ctx.id,
      status: { in: ["PENDIENTE", "EN_RUTA", "EN_EJECUCION", "REVISION"] },
    },
    include: { customer: true, project: true },
    orderBy: [{ scheduledAt: "asc" }, { priority: "desc" }],
  });

  const pending = mine.filter((o) => o.status === "PENDIENTE");
  const active = mine.filter((o) => o.status !== "PENDIENTE");
  const overdue = mine.filter((o) => o.scheduledAt && o.scheduledAt < new Date() && o.status !== "COMPLETADO");

  const prioCls: Record<string, string> = {
    BAJA: "bg-slate-100 text-slate-600",
    MEDIA: "bg-sky-100 text-sky-700",
    ALTA: "bg-amber-100 text-amber-700",
    URGENTE: "bg-rose-100 text-rose-700",
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
            <Inbox className="h-6 w-6 text-brand-600" /> Mis pendientes
          </h1>
          <p className="text-sm text-slate-500">Órdenes asignadas a ti que requieren acción</p>
        </div>
        <div className="flex gap-2">
          <Link href="/app/tablero" className="btn-secondary text-sm">Tablero</Link>
          <Link href="/app/ordenes/nueva" className="btn-primary text-sm"><Plus className="h-4 w-4" /> Nueva orden</Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat icon={<UserCheck className="h-4 w-4" />} label="Asignadas a mí" value={mine.length} />
        <Stat icon={<Clock className="h-4 w-4" />} label="Pendientes" value={pending.length} />
        <Stat icon={<CheckCircle2 className="h-4 w-4" />} label="En curso" value={active.length} />
        <Stat icon={<Clock className="h-4 w-4" />} label="Atrasadas" value={overdue.length} warn={overdue.length > 0} />
      </div>

      {overdue.length > 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm font-semibold text-amber-800">Tienes {overdue.length} {overdue.length === 1 ? "orden atrasada" : "órdenes atrasadas"}.</p>
        </div>
      )}

      {mine.length === 0 ? (
        <EmptyState
          icon={<Inbox className="h-7 w-7" />}
          title="Nada pendiente"
          description="No tienes órdenes asignadas. Cuando te asignen una, aparecerá aquí."
          action={<Link href="/app/ordenes" className="btn-primary">Ver todas las órdenes</Link>}
        />
      ) : (
        <div className="card overflow-hidden">
          <ul className="divide-y divide-slate-100">
            {mine.map((o) => {
              const days = o.scheduledAt ? daysUntil(o.scheduledAt) : null;
              const isLate = o.scheduledAt && o.scheduledAt < new Date();
              return (
                <li key={o.id}>
                  <Link href={`/app/ordenes/${o.id}`} className="flex flex-col gap-2 px-5 py-4 hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-brand-700">{o.code}</span>
                        <Badge className={STATUS_COLORS[o.status] || "bg-slate-100 text-slate-600"}>{STATUS_LABELS[o.status] || o.status}</Badge>
                        <Badge className={prioCls[o.priority] ?? "bg-slate-100 text-slate-600"}>
                          {o.priority === "URGENTE" ? "Urgente" : o.priority === "ALTA" ? "Alta" : o.priority === "BAJA" ? "Baja" : "Media"}
                        </Badge>
                      </div>
                      <p className="mt-1 truncate text-sm font-medium text-slate-800">{o.title}</p>
                      <p className="mt-0.5 text-xs text-slate-400">
                        {WORKORDER_TYPES[o.type] || o.type}
                        {o.customer?.name ? ` · ${o.customer.name}` : ""}
                        {o.project?.name ? ` · ${o.project.name}` : ""}
                      </p>
                    </div>
                    <div className="shrink-0 text-left sm:text-right">
                      {o.scheduledAt ? (
                        <p className={`text-xs font-medium ${isLate ? "text-rose-600" : "text-slate-500"}`}>
                          {isLate ? "Atrasada · " : ""}Programada {formatDate(o.scheduledAt)}
                          {days !== null && !isLate && ` · en ${days} día${days === 1 ? "" : "s"}`}
                        </p>
                      ) : (
                        <p className="text-xs text-slate-400">Sin fecha programada</p>
                      )}
                      {o.totalAmount ? <p className="mt-1 text-xs font-semibold text-slate-700">Q {Number(o.totalAmount).toLocaleString("es-GT")}</p> : null}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

function Stat({ icon, label, value, warn }: { icon: React.ReactNode; label: string; value: number; warn?: boolean }) {
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-500">{label}</span>
        <span className={`grid h-7 w-7 place-items-center rounded-lg ${warn ? "bg-rose-100 text-rose-600" : "bg-brand-50 text-brand-600"}`}>{icon}</span>
      </div>
      <p className={`mt-1.5 text-2xl font-extrabold ${warn ? "text-rose-600" : "text-slate-900"}`}>{value}</p>
    </div>
  );
}
