import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui";
import { formatQ } from "@/lib/plans";

export const metadata = { title: "Documento" };

const TYPE_LABELS: Record<string, string> = {
  COTIZACION: "Cotización",
  ORDEN_TRABAJO: "Orden de trabajo",
  ACTA_ENTREGA: "Acta de entrega",
  PARTE_TRABAJO: "Parte de trabajo",
  FACTURA: "Factura",
  CUSTOM: "Documento",
};

export default async function DocumentViewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ctx = await requireSession();
  const doc = await prisma.document.findFirst({
    where: { id, organizationId: ctx.orgId },
    include: { customer: true, workOrder: true, project: true },
  });
  if (!doc) notFound();

  const data = doc.data as any;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <Link href="/app/documentos" className="text-sm text-slate-500 hover:text-slate-700">← Documentos</Link>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">{doc.title}</h1>
          <p className="text-sm text-slate-500">{doc.number} · {TYPE_LABELS[doc.type] || doc.type} · creado {new Date(doc.createdAt).toLocaleString("es-GT")}</p>
        </div>
        <a href={`/api/pdf/${doc.id}`} target="_blank" className="btn-primary">
          Descargar PDF
        </a>
      </div>

      <div className="card p-6">
        <h2 className="mb-4 text-sm font-bold text-slate-900">Resumen del documento</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <Resumen label="Cliente" value={data.clientName || doc.customer?.name || "—"} />
          <Resumen label="NIT" value={data.clientNit || "—"} />
          <Resumen label="Proyecto" value={data.projectName || "—"} />
          <Resumen label="Orden de trabajo" value={doc.workOrder?.code || "—"} />
          <Resumen label="Fecha" value={data.date || "—"} />
          <Resumen label="Total" value={data.total ? formatQ(data.total) : "—"} />
        </div>

        {(data.items?.length ?? 0) > 0 && (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="table-th">Descripción</th>
                  <th className="table-th">Cant.</th>
                  <th className="table-th">P. unit.</th>
                  <th className="table-th">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(data.items as any[]).map((it, i) => (
                  <tr key={i}>
                    <td className="table-td">{it.description}</td>
                    <td className="table-td">{it.qty}</td>
                    <td className="table-td">{formatQ(it.unitPrice)}</td>
                    <td className="table-td font-semibold">{formatQ(it.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-3 flex justify-end text-sm">
              <div className="space-y-1 text-right">
                <p>Subtotal: <strong>{formatQ(data.subtotal)}</strong></p>
                <p>IVA ({data.taxRate ?? 0}%): <strong>{formatQ(data.tax)}</strong></p>
                <p className="text-base font-extrabold text-slate-900">Total: {formatQ(data.total)}</p>
              </div>
            </div>
          </div>
        )}

        {(data.signatures?.length ?? 0) > 0 && (
          <div className="mt-6">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">Firmas incluidas</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {(data.signatures as any[]).map((s, i) => (
                <div key={i} className="rounded-xl border border-slate-200 p-3">
                  {s.imageUrl && <img src={s.imageUrl} alt="" className="h-14 w-full object-contain" />}
                  <p className="mt-1 text-sm font-semibold text-slate-800">{s.name}</p>
                  <p className="text-xs text-slate-400">{s.role}{s.signedAt ? ` · ${s.signedAt}` : ""}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {(data.photos?.length ?? 0) > 0 && (
          <div className="mt-6">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">Fotos ({data.photos.length})</p>
            <div className="grid grid-cols-4 gap-2">
              {(data.photos as string[]).map((p, i) => (
                <img key={i} src={p} alt="" className="aspect-square w-full rounded-lg border border-slate-200 object-cover" />
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <Button type="button" className="btn-secondary" onClick={() => history.back()}>Volver</Button>
      </div>
    </div>
  );
}

function Resumen({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-slate-800">{value}</p>
    </div>
  );
}
