import Link from "next/link";
import {
  ClipboardList,
  FolderKanban,
  Users,
  FileSignature,
  Plus,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { STATUS_COLORS, STATUS_LABELS, WORKORDER_TYPES, formatQ, timeAgo, formatDate } from "@/lib/utils";
import { MonthlyChart, StatusPie } from "@/components/dashboard/Charts";
import { getPlan } from "@/lib/plans";

export default async function DashboardPage() {
  const ctx = await requireSession();

  const [
    projectsCount,
    customersCount,
    workOrders,
    signaturesMonth,
    recentOrders,
    overdue,
    technicians,
  ] = await Promise.all([
    prisma.project.count({ where: { organizationId: ctx.orgId } }),
    prisma.customer.count({ where: { organizationId: ctx.orgId } }),
    prisma.workOrder.findMany({ where: { organizationId: ctx.orgId }, select: { status: true, createdAt: true, completedAt: true, totalAmount: true } }),
    prisma.signature.count({
      where: { organizationId: ctx.orgId, signedAt: { gte: new Date(new Date().setDate(1)) } },
    }),
    prisma.workOrder.findMany({
      where: { organizationId: ctx.orgId },
      orderBy: { createdAt: "desc" },
      take: 6,
      include: { customer: true, assignedTo: true },
    }),
    prisma.workOrder.findMany({
      where: {
        organizationId: ctx.orgId,
        status: { in: ["PENDIENTE", "EN_RUTA", "EN_EJECUCION", "REVISION"] },
        scheduledAt: { lt: new Date() },
      },
      orderBy: { scheduledAt: "asc" },
      take: 5,
      include: { customer: true },
    }),
    prisma.workOrder.findMany({
      where: { organizationId: ctx.orgId },
      select: { assignedToId: true, assignedTo: { select: { name: true } }, status: true },
    }),
  ]);

  const pending = workOrders.filter((w) => w.status === "PENDIENTE").length;
  const inProgress = workOrders.filter((w) => ["EN_RUTA", "EN_EJECUCION", "REVISION"].includes(w.status)).length;
  const completed = workOrders.filter((w) => w.status === "COMPLETADO").length;
  const cancelled = workOrders.filter((w) => w.status === "CANCELADO").length;

  // Datos mensuales últimos 6 meses
  const monthLabels = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  const monthly = Array.from({ length: 6 }).map((_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    const y = d.getFullYear();
    const m = d.getMonth();
    return {
      label: monthLabels[m],
      creadas: workOrders.filter((w) => w.createdAt.getFullYear() === y && w.createdAt.getMonth() === m).length,
      completadas: workOrders.filter((w) => w.completedAt && w.completedAt.getFullYear() === y && w.completedAt.getMonth() === m).length,
    };
  });

  const statusData = [
    { name: "Pendientes", value: pending, status: "PENDIENTE" },
    { name: "En progreso", value: inProgress, status: "EN_PROGRESO" },
    { name: "Completadas", value: completed, status: "COMPLETADO" },
    { name: "Canceladas", value: cancelled, status: "CANCELADO" },
  ].filter((d) => d.value > 0);

  const plan = getPlan(ctx.planCode);
  const totalMonth = workOrders.length;

  // Métricas financieras y de rendimiento
  const totalRevenue = workOrders.reduce((s, w) => s + (Number(w.totalAmount) || 0), 0);
  const completedThisMonth = workOrders.filter((w) => w.completedAt && w.completedAt.getMonth() === new Date().getMonth() && w.completedAt.getFullYear() === new Date().getFullYear()).length;

  const techMap = new Map<string, { name: string; total: number; done: number }>();
  for (const w of technicians) {
    if (!w.assignedToId) continue;
    const t = techMap.get(w.assignedToId) ?? { name: w.assignedTo?.name ?? "Técnico", total: 0, done: 0 };
    t.total += 1;
    if (w.status === "COMPLETADO") t.done += 1;
    techMap.set(w.assignedToId, t);
  }
  const techStats = Array.from(techMap.values()).sort((a, b) => b.total - a.total).slice(0, 5);

  const kpis = [
    { label: "Proyectos", value: projectsCount, icon: FolderKanban, href: "/app/proyectos" },
    { label: "Clientes", value: customersCount, icon: Users, href: "/app/clientes" },
    { label: "Órdenes totales", value: totalMonth, icon: ClipboardList, href: "/app/ordenes" },
    { label: "Firmas este mes", value: signaturesMonth, icon: FileSignature, href: "/app/ordenes" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Hola, {ctx.name.split(" ")[0]} 👋</h1>
          <p className="text-sm text-slate-500">Así va tu operación hoy · Plan {plan.name}</p>
        </div>
        <Link href="/app/ordenes/nueva" className="btn-primary">
          <Plus className="h-4 w-4" /> Nueva orden
        </Link>
      </div>

      {ctx.subscriptionStatus === "TRIAL" && ctx.trialEndsAt && (
        <div className="flex flex-col justify-between gap-3 rounded-2xl border border-brand-200 bg-brand-50 p-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-semibold text-brand-800">
              Estás en la prueba gratis de 14 días · termina el {formatDate(ctx.trialEndsAt)}
            </p>
            <p className="text-xs text-brand-700">Activa tu plan cuando quieras para no interrumpir tu operación.</p>
          </div>
          <Link href="/app/suscripcion" className="btn-primary text-sm">Elegir plan</Link>
        </div>
      )}

      {overdue.length > 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <p className="flex items-center gap-2 text-sm font-semibold text-amber-800">
            <AlertTriangle className="h-4 w-4" /> Tienes {overdue.length} órdenes atrasadas
          </p>
          <div className="mt-2 space-y-1">
            {overdue.map((o) => (
              <Link key={o.id} href={`/app/ordenes/${o.id}`} className="block text-xs text-amber-700 hover:underline">
                {o.code} · {o.title} · programada {formatDate(o.scheduledAt)}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpis.map((k) => (
          <Link key={k.label} href={k.href} className="card group p-5 transition-all hover:-translate-y-0.5 hover:shadow-soft">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">{k.label}</span>
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-50 text-brand-600 group-hover:bg-brand-600 group-hover:text-white">
                <k.icon className="h-4.5 w-4.5 h-[18px] w-[18px]" />
              </span>
            </div>
            <p className="mt-2 text-3xl font-extrabold text-slate-900">{k.value}</p>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Gráfico mensual */}
        <div className="card p-5 lg:col-span-2">
          <h2 className="mb-4 text-sm font-bold text-slate-900">Actividad últimos 6 meses</h2>
          <MonthlyChart data={monthly} />
        </div>
        {/* Distribución por estado */}
        <div className="card p-5">
          <h2 className="mb-4 text-sm font-bold text-slate-900">Órdenes por estado</h2>
          {statusData.length === 0 ? (
            <p className="text-sm text-slate-400">Aún no hay órdenes. Crea tu primera orden para ver estadísticas.</p>
          ) : (
            <StatusPie data={statusData} />
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Órdenes recientes */}
        <div className="card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">Órdenes recientes</h2>
            <Link href="/app/ordenes" className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:underline">
              Ver todas <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className="text-sm text-slate-400">No hay órdenes todavía.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {recentOrders.map((o) => (
                <li key={o.id}>
                  <Link href={`/app/ordenes/${o.id}`} className="flex items-center justify-between gap-3 py-3 hover:bg-slate-50">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-800">
                        {o.code} · {o.title}
                      </p>
                      <p className="text-xs text-slate-400">
                        {WORKORDER_TYPES[o.type]} · {o.customer?.name || "Sin cliente"} · {o.assignedTo ? o.assignedTo.name : "Sin asignar"}
                      </p>
                    </div>
                    <span className={`badge shrink-0 ${STATUS_COLORS[o.status] || "bg-slate-100 text-slate-600"}`}>
                      {STATUS_LABELS[o.status] || o.status}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Actividad reciente */}
        <div className="card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">Última actividad</h2>
            <span className="flex items-center gap-1 text-xs text-emerald-600">
              <CheckCircle2 className="h-3.5 w-3.5" /> en tiempo real
            </span>
          </div>
          <ActivityFeed orgId={ctx.orgId} />
        </div>
      </div>

      {/* Métricas gerenciales */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card p-5 lg:col-span-1">
          <h2 className="mb-4 text-sm font-bold text-slate-900">Pipeline de órdenes</h2>
          {workOrders.length === 0 ? (
            <p className="text-sm text-slate-400">Crea órdenes para ver el pipeline.</p>
          ) : (
            <div className="space-y-3">
              {[
                { label: "Pendientes", value: pending, color: "bg-sky-500" },
                { label: "En ruta", value: workOrders.filter((w) => w.status === "EN_RUTA").length, color: "bg-orange-500" },
                { label: "En ejecución", value: workOrders.filter((w) => w.status === "EN_EJECUCION").length, color: "bg-amber-500" },
                { label: "En revisión", value: workOrders.filter((w) => w.status === "REVISION").length, color: "bg-violet-500" },
                { label: "Completadas", value: completed, color: "bg-emerald-500" },
                { label: "Canceladas", value: cancelled, color: "bg-rose-400" },
              ].map((row) => {
                const pct = totalMonth > 0 ? Math.round((row.value / totalMonth) * 100) : 0;
                return (
                  <div key={row.label}>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-600">{row.label}</span>
                      <span className="font-bold text-slate-800">{row.value} · {pct}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div className={`h-full rounded-full ${row.color}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="card p-5 lg:col-span-1">
          <h2 className="mb-4 text-sm font-bold text-slate-900">Rendimiento del equipo</h2>
          {techStats.length === 0 ? (
            <p className="text-sm text-slate-400">Asigna órdenes a técnicos para ver el rendimiento.</p>
          ) : (
            <ul className="space-y-3">
              {techStats.map((t) => (
                <li key={t.name} className="flex items-center gap-3">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
                    {t.name.charAt(0)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-800">{t.name}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                        <div className="h-full rounded-full bg-brand-500" style={{ width: `${t.total > 0 ? Math.round((t.done / t.total) * 100) : 0}%` }} />
                      </div>
                      <span className="text-xs text-slate-500">{t.done}/{t.total}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card p-5 lg:col-span-1">
          <h2 className="mb-4 text-sm font-bold text-slate-900">Resumen financiero</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
              <span className="text-sm text-slate-500">Completadas este mes</span>
              <span className="text-sm font-bold text-slate-900">{completedThisMonth}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
              <span className="text-sm text-slate-500">Monto total registrado</span>
              <span className="text-sm font-bold text-brand-700">{formatQ(totalRevenue)}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
              <span className="text-sm text-slate-500">Canceladas</span>
              <span className="text-sm font-bold text-rose-600">{cancelled}</span>
            </div>
            <Link href="/app/tablero" className="btn-secondary mt-2 w-full text-sm">
              Ver tablero <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

async function ActivityFeed({ orgId }: { orgId: string }) {
  const logs = await prisma.activityLog.findMany({
    where: { organizationId: orgId },
    orderBy: { createdAt: "desc" },
    take: 8,
    include: { user: { select: { name: true } } },
  });
  if (logs.length === 0) return <p className="text-sm text-slate-400">Aún no hay actividad registrada.</p>;
  return (
    <ul className="space-y-3">
      {logs.map((l) => (
        <li key={l.id} className="flex gap-3">
          <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-500" />
          <div className="min-w-0">
            <p className="text-sm text-slate-700">{l.description || l.action}</p>
            <p className="text-xs text-slate-400">
              {l.user?.name || "Sistema"} · {timeAgo(l.createdAt)}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
