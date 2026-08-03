import Link from "next/link";
import { Plus, FileText, Download } from "lucide-react";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { EmptyState } from "@/components/ui";
import { formatDateTime } from "@/lib/utils";

export const metadata = { title: "Documentos" };

const TYPE_LABELS: Record<string, string> = {
  COTIZACION: "Cotización",
  ORDEN_TRABAJO: "Orden de trabajo",
  ACTA_ENTREGA: "Acta de entrega",
  PARTE_TRABAJO: "Parte de trabajo",
  FACTURA: "Factura",
  CUSTOM: "Documento",
};

export default async function DocumentsPage() {
  const ctx = await requireSession();
  const docs = await prisma.document.findMany({
    where: { organizationId: ctx.orgId },
    include: { customer: true, workOrder: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Documentos</h1>
          <p className="text-sm text-slate-500">Cotizaciones, actas de entrega, órdenes y partes de trabajo en PDF</p>
        </div>
        <Link href="/app/documentos/crear" className="btn-primary">
          <Plus className="h-4 w-4" /> Crear documento
        </Link>
      </div>

      {docs.length === 0 ? (
        <EmptyState
          icon={<FileText className="h-7 w-7" />}
          title="Aún no hay documentos"
          description="Crea cotizaciones, actas de entrega o partes de trabajo con tu logo y colores."
          action={<Link href="/app/documentos/crear" className="btn-primary">Crear documento</Link>}
        />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="table-th">Documento</th>
                  <th className="table-th">Tipo</th>
                  <th className="table-th">Cliente</th>
                  <th className="table-th">Orden</th>
                  <th className="table-th">Creado</th>
                  <th className="table-th"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {docs.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50">
                    <td className="table-td">
                      <Link href={`/app/documentos/${d.id}`} className="font-semibold text-brand-700 hover:underline">{d.number}</Link>
                      <p className="text-xs text-slate-400">{d.title}</p>
                    </td>
                    <td className="table-td">{TYPE_LABELS[d.type] || d.type}</td>
                    <td className="table-td">{d.customer?.name || "—"}</td>
                    <td className="table-td">{d.workOrder ? d.workOrder.code : "—"}</td>
                    <td className="table-td text-xs">{formatDateTime(d.createdAt)}</td>
                    <td className="table-td text-right">
                      <a href={`/api/pdf/${d.id}`} target="_blank" className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-brand-700">
                        <Download className="h-4 w-4" /> PDF
                      </a>
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
