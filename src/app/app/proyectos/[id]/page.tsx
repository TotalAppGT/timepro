import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil, Plus } from "lucide-react";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { STATUS_COLORS, STATUS_LABELS, formatQ, formatDate, formatDateTime } from "@/lib/utils";
import { Badge, EmptyState } from "@/components/ui";
import { ApprovalLinkCard } from "@/components/ApprovalLinkCard";
import { ProjectActions } from "./ProjectActions";

export const metadata = { title: "Detalle de proyecto" };

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ctx = await requireSession();

  const project = await prisma.project.findFirst({
    where: { id, organizationId: ctx.orgId },
    include: {
      customer: true,
      workOrders: {
        include: { customer: true, assignedTo: true, _count: { select: { signatures: true } } },
        orderBy: { createdAt: "desc" },
      },
      documents: { orderBy: { createdAt: "desc" }, take: 5 },
      signatures: { orderBy: { signedAt: "desc" } },
    },
  });

  if (!project) notFound();

  const completed = project.workOrders.filter((w) => w.status === "COMPLETADO").length;
  const progress = project.workOrders.length > 0 ? Math.round((completed / project.workOrders.length) * 100) : project.progress;
  const publicLink = project.publicToken ? `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/aprobacion/${project.publicToken}` : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <Link href="/app/proyectos" className="text-sm text-slate-500 hover:text-slate-700">← Proyectos</Link>
          <div className="mt-1 flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900">{project.name}</h1>
            <Badge className={STATUS_COLORS[project.status] || "bg-slate-100 text-slate-600"}>{STATUS_LABELS[project.status] || project.status}</Badge>
            <Badge className="bg-slate-100 text-slate-600">{project.code}</Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/app/proyectos/${id}/editar`} className="btn-secondary text-sm">
            <Pencil className="h-4 w-4" /> Editar
          </Link>
          <Link href={`/app/ordenes/nueva?projectId=${id}`} className="btn-primary text-sm">
            <Plus className="h-4 w-4" /> Nueva orden
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card p-5 lg:col-span-2">
          <h2 className="mb-3 text-sm font-bold text-slate-900">Información</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Info label="Cliente" value={project.customer?.name || "Sin cliente"} />
            <Info label="Prioridad" value={project.priority} />
            <Info label="Fecha de inicio" value={formatDate(project.startDate)} />
            <Info label="Fecha de entrega" value={formatDate(project.dueDate)} />
            <Info label="Presupuesto" value={project.budget ? formatQ(project.budget) : "—"} />
            <Info label="Órdenes de trabajo" value={String(project.workOrders.length)} />
          </div>
          {project.description && (
            <div className="mt-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Descripción</p>
              <p className="mt-1 text-sm text-slate-600">{project.description}</p>
            </div>
          )}

          <div className="mt-6">
            <div className="mb-1.5 flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-500">Progreso</span>
              <span className="font-bold text-brand-600">{progress}%</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-brand-600 transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>

        <div className="card p-5">
          <h2 className="mb-3 text-sm font-bold text-slate-900">Documentos</h2>
          {project.documents.length === 0 ? (
            <p className="text-sm text-slate-400">Aún no hay documentos.</p>
          ) : (
            <ul className="space-y-2">
              {project.documents.map((d) => (
                <li key={d.id} className="text-sm">
                  <Link href={`/app/documentos/${d.id}`} className="text-brand-600 hover:underline">{d.number} · {d.title}</Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {ctx.planCode !== "BASIC" && (
        <ApprovalLinkCard
          type="PROJECT"
          entityId={project.id}
          entityLabel={`${project.code} · ${project.name}`}
          existingLink={publicLink}
          sharePhone={project.customer?.phone ?? null}
        />
      )}

      <div className="card p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">Órdenes de trabajo</h2>
        </div>
        {project.workOrders.length === 0 ? (
          <EmptyState icon={<Plus className="h-6 w-6" />} title="Sin órdenes" description="Crea la primera orden de trabajo para este proyecto." action={<Link href={`/app/ordenes/nueva?projectId=${id}`} className="btn-primary">Crear orden</Link>} />
        ) : (
          <ul className="divide-y divide-slate-100">
            {project.workOrders.map((w) => (
              <li key={w.id}>
                <Link href={`/app/ordenes/${w.id}`} className="flex items-center justify-between gap-3 py-3 hover:bg-slate-50">
                  <div>
                    <p className="text-sm font-medium text-slate-800">{w.code} · {w.title}</p>
                    <p className="text-xs text-slate-400">
                      {w.customer?.name || "Sin cliente"} · {w.assignedTo?.name || "Sin asignar"} · {w._count.signatures} firma(s)
                    </p>
                  </div>
                  <Badge className={STATUS_COLORS[w.status] || "bg-slate-100 text-slate-600"}>{STATUS_LABELS[w.status] || w.status}</Badge>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="card p-5">
        <h2 className="mb-4 text-sm font-bold text-slate-900">Aprobaciones del proyecto</h2>
        {project.signatures.length === 0 ? (
          <p className="text-sm text-slate-400">Aún no hay aprobaciones. Usa el link de aprobación para que el cliente confirme y firme.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {project.signatures.map((s) => (
              <div key={s.id} className="rounded-xl border border-slate-200 p-4">
                <img src={s.imageUrl} alt={`Firma de ${s.signerName}`} className="h-16 w-full object-contain" />
                <p className="mt-2 text-sm font-semibold text-slate-800">{s.signerName}</p>
                <p className="text-xs text-slate-400">
                  {s.signerRole} · {s.signerDni ? `DPI ${s.signerDni} · ` : ""}{formatDateTime(s.signedAt)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <ProjectActions projectId={id} status={project.status} />
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
