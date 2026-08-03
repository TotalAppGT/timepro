import Link from "next/link";
import { Suspense } from "react";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { WorkOrderForm } from "./WorkOrderForm";

export const metadata = { title: "Nueva orden" };

export default async function NewWorkOrderPage() {
  const ctx = await requireSession();
  const [customers, projects, technicians] = await Promise.all([
    prisma.customer.findMany({ where: { organizationId: ctx.orgId }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.project.findMany({ where: { organizationId: ctx.orgId }, orderBy: { createdAt: "desc" }, select: { id: true, name: true, code: true } }),
    prisma.user.findMany({ where: { organizationId: ctx.orgId, active: true }, orderBy: { name: "asc" }, select: { id: true, name: true, role: true } }),
  ]);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link href="/app/ordenes" className="text-sm text-slate-500 hover:text-slate-700">← Volver a órdenes</Link>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Nueva orden de trabajo</h1>
      </div>
      <Suspense fallback={null}>
        <WorkOrderForm customers={customers} projects={projects} technicians={technicians} />
      </Suspense>
    </div>
  );
}
