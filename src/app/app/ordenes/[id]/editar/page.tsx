import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { WorkOrderForm } from "../../nueva/WorkOrderForm";

export const metadata = { title: "Editar orden" };

export default async function EditWorkOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ctx = await requireSession();

  const [wo, customers, projects, technicians] = await Promise.all([
    prisma.workOrder.findFirst({ where: { id, organizationId: ctx.orgId } }),
    prisma.customer.findMany({ where: { organizationId: ctx.orgId }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.project.findMany({ where: { organizationId: ctx.orgId }, orderBy: { createdAt: "desc" }, select: { id: true, name: true, code: true } }),
    prisma.user.findMany({ where: { organizationId: ctx.orgId, active: true }, orderBy: { name: "asc" }, select: { id: true, name: true, role: true } }),
  ]);
  if (!wo) notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link href={`/app/ordenes/${id}`} className="text-sm text-slate-500 hover:text-slate-700">← Volver a la orden</Link>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Editar orden</h1>
      </div>
      <WorkOrderForm customers={customers} projects={projects} technicians={technicians} initial={wo} />
    </div>
  );
}
