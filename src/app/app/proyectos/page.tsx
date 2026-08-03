import Link from "next/link";
import { Plus, FolderKanban } from "lucide-react";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { STATUS_COLORS, STATUS_LABELS, formatQ, formatDate } from "@/lib/utils";
import { EmptyState, Badge } from "@/components/ui";

export const metadata = { title: "Proyectos" };

export default async function ProjectsPage() {
  const ctx = await requireSession();
  const projects = await prisma.project.findMany({
    where: { organizationId: ctx.orgId },
    include: {
      customer: true,
      _count: { select: { workOrders: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Proyectos</h1>
          <p className="text-sm text-slate-500">{projects.length} proyectos registrados</p>
        </div>
        <Link href="/app/proyectos/nuevo" className="btn-primary">
          <Plus className="h-4 w-4" /> Nuevo proyecto
        </Link>
      </div>

      {projects.length === 0 ? (
        <EmptyState
          icon={<FolderKanban className="h-7 w-7" />}
          title="Aún no tienes proyectos"
          description="Crea tu primer proyecto para organizar tus órdenes de trabajo, entregas e instalaciones."
          action={<Link href="/app/proyectos/nuevo" className="btn-primary">Crear proyecto</Link>}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <Link key={p.id} href={`/app/proyectos/${p.id}`} className="card p-5 transition-all hover:-translate-y-0.5 hover:shadow-soft">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-slate-900">{p.name}</p>
                  <p className="text-xs text-slate-400">{p.code}</p>
                </div>
                <Badge className={STATUS_COLORS[p.status] || "bg-slate-100 text-slate-600"}>{STATUS_LABELS[p.status] || p.status}</Badge>
              </div>
              <p className="mt-3 line-clamp-2 min-h-[36px] text-xs text-slate-500">{p.description || "Sin descripción"}</p>
              <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
                <span>{p.customer?.name || "Sin cliente"}</span>
                <span>{p._count.workOrders} órdenes</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
                <span>Vence: {formatDate(p.dueDate)}</span>
                {p.budget ? <span className="font-semibold text-slate-600">{formatQ(p.budget)}</span> : null}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
