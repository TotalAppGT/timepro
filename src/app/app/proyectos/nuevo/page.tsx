import Link from "next/link";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProjectForm } from "../ProjectForm";

export const metadata = { title: "Nuevo proyecto" };

export default async function NewProjectPage() {
  const ctx = await requireSession();
  const customers = await prisma.customer.findMany({
    where: { organizationId: ctx.orgId },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link href="/app/proyectos" className="text-sm text-slate-500 hover:text-slate-700">← Volver a proyectos</Link>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Nuevo proyecto</h1>
      </div>
      <ProjectForm customers={customers} />
    </div>
  );
}
