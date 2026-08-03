import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProjectForm } from "../../ProjectForm";

export const metadata = { title: "Editar proyecto" };

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ctx = await requireSession();

  const [project, customers] = await Promise.all([
    prisma.project.findFirst({ where: { id, organizationId: ctx.orgId } }),
    prisma.customer.findMany({ where: { organizationId: ctx.orgId }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);
  if (!project) notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link href={`/app/proyectos/${id}`} className="text-sm text-slate-500 hover:text-slate-700">← Volver al proyecto</Link>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Editar proyecto</h1>
      </div>
      <ProjectForm customers={customers} initial={project} />
    </div>
  );
}
