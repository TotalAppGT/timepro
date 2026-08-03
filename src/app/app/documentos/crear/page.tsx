import Link from "next/link";
import { Suspense } from "react";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DocumentCreator } from "./DocumentCreator";

export const metadata = { title: "Crear documento" };

export default async function CreateDocumentPage() {
  const ctx = await requireSession();
  const [customers, projects, workOrders] = await Promise.all([
    prisma.customer.findMany({ where: { organizationId: ctx.orgId }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.project.findMany({ where: { organizationId: ctx.orgId }, orderBy: { createdAt: "desc" }, select: { id: true, name: true, code: true } }),
    prisma.workOrder.findMany({ where: { organizationId: ctx.orgId }, orderBy: { createdAt: "desc" }, select: { id: true, code: true, title: true } }),
  ]);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link href="/app/documentos" className="text-sm text-slate-500 hover:text-slate-700">← Volver a documentos</Link>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Creador de documentos PDF</h1>
        <p className="text-sm text-slate-500">Genera cotizaciones, actas de entrega, órdenes y partes de trabajo con tu marca.</p>
      </div>
      <Suspense fallback={null}>
        <DocumentCreator customers={customers} projects={projects} workOrders={workOrders} />
      </Suspense>
    </div>
  );
}
