import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil } from "lucide-react";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { STATUS_COLORS, STATUS_LABELS, WORKORDER_TYPES, formatQ, formatDateTime, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui";
import { ApprovalLinkCard } from "@/components/ApprovalLinkCard";
import { WorkOrderClient } from "./WorkOrderClient";
import { WorkOrderChat } from "./WorkOrderChat";

export const metadata = { title: "Orden de trabajo" };

export default async function WorkOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ctx = await requireSession();

  const wo = await prisma.workOrder.findFirst({
    where: { id, organizationId: ctx.orgId },
    include: {
      customer: true,
      project: true,
      assignedTo: true,
      signatures: { orderBy: { signedAt: "desc" } },
      documents: { orderBy: { createdAt: "desc" } },
      messages: { orderBy: { createdAt: "asc" } },
    },
  });
  if (!wo) notFound();

  const checklist = (wo.checklist as { text: string; done: boolean }[]) ?? [];
  const photos = (wo.photos as string[]) ?? [];
  const publicLink = wo.publicToken ? `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/aprobacion/${wo.publicToken}` : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <Link href="/app/ordenes" className="text-sm text-slate-500 hover:text-slate-700">← Órdenes de trabajo</Link>
          <div className="mt-1 flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900">{wo.title}</h1>
            <Badge className="bg-slate-100 text-slate-600">{wo.code}</Badge>
            <Badge className="bg-slate-100 text-slate-600">{WORKORDER_TYPES[wo.type] || wo.type}</Badge>
            <Badge className={STATUS_COLORS[wo.status] || "bg-slate-100 text-slate-600"}>{STATUS_LABELS[wo.status] || wo.status}</Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/app/ordenes/${id}/editar`} className="btn-secondary text-sm">
            <Pencil className="h-4 w-4" /> Editar
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Info label="Cliente" value={wo.customer?.name || "—"} />
        <Info label="Proyecto" value={wo.project ? `${wo.project.code} · ${wo.project.name}` : "—"} />
        <Info label="Responsable" value={wo.assignedTo?.name || "—"} />
        <Info label="Programada" value={formatDateTime(wo.scheduledAt)} />
        <Info label="Monto" value={wo.totalAmount ? formatQ(wo.totalAmount) : "—"} />
        <Info label="Dirección" value={wo.address || "—"} />
        <Info label="Ubicación" value={wo.location || "—"} />
        <Info label="Completada" value={formatDate(wo.completedAt)} />
      </div>

      {(wo.customFields && typeof wo.customFields === "object" && Object.keys(wo.customFields as object).length > 0) && (
        <div className="card p-5">
          <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">Información específica</p>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {Object.entries(wo.customFields as Record<string, unknown>).map(([k, v]) => {
              const label = k;
              const value = v === true ? "Sí" : v === false ? "No" : v === null || v === undefined || v === "" ? "—" : String(v);
              return <Info key={k} label={label} value={value} />;
            })}
          </div>
        </div>
      )}

      {ctx.planCode !== "BASIC" && (
        <ApprovalLinkCard
          type="WORKORDER"
          entityId={wo.id}
          entityLabel={`${wo.code} · ${wo.title}`}
          existingLink={publicLink}
          sharePhone={wo.customer?.phone ?? null}
        />
      )}

      {wo.description && (
        <div className="card p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Descripción</p>
          <p className="mt-1 whitespace-pre-wrap text-sm text-slate-600">{wo.description}</p>
        </div>
      )}

      <WorkOrderClient
        workOrderId={wo.id}
        status={wo.status}
        isOwner={ctx.isOwner}
        checklist={checklist}
        photos={photos}
        maxPhotos={ctx.planCode === "ENTERPRISE" ? 1000 : ctx.planCode === "PRO" ? 100 : 20}
        canPortal={ctx.planCode !== "BASIC"}
      />

      <WorkOrderChat
        workOrderId={wo.id}
        userName={ctx.name}
        messages={wo.messages.map((m) => ({
          id: m.id,
          authorName: m.authorName,
          content: m.content,
          attachments: m.attachments as string[] | null,
          createdAt: m.createdAt.toISOString(),
          isMine: m.userId === ctx.id,
        }))}
      />

      <div className="card p-5">
        <h2 className="mb-4 text-sm font-bold text-slate-900">Firmas capturadas</h2>
        {wo.signatures.length === 0 ? (
          <p className="text-sm text-slate-400">Aún no hay firmas. Usa el panel de firma digital para capturar la conformidad del cliente.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {wo.signatures.map((s) => (
              <div key={s.id} className="rounded-xl border border-slate-200 p-4">
                <img src={s.imageUrl} alt={`Firma de ${s.signerName}`} className="h-16 w-full object-contain" />
                <p className="mt-2 text-sm font-semibold text-slate-800">{s.signerName}</p>
                <p className="text-xs text-slate-400">
                  {s.signerRole === "CLIENTE" ? "Cliente" : s.signerRole} · {s.signerDni ? `DPI ${s.signerDni} · ` : ""}{formatDateTime(s.signedAt)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card p-5">
        <h2 className="mb-4 text-sm font-bold text-slate-900">Documentos generados</h2>
        {wo.documents.length === 0 ? (
          <p className="text-sm text-slate-400">Aún no hay documentos para esta orden.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {wo.documents.map((d) => (
              <li key={d.id} className="flex items-center justify-between gap-3 py-2.5">
                <div>
                  <p className="text-sm font-medium text-slate-800">{d.title}</p>
                  <p className="text-xs text-slate-400">{d.number} · {new Date(d.createdAt).toLocaleString("es-GT")}</p>
                </div>
                <div className="flex gap-2">
                  <a href={`/api/pdf/${d.id}`} target="_blank" className="btn-secondary text-xs">Descargar PDF</a>
                  <a href={`/app/documentos/${d.id}`} className="btn-ghost text-xs">Ver</a>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</p>
      <p className="mt-0.5 truncate text-sm font-medium text-slate-800" title={value}>{value}</p>
    </div>
  );
}
