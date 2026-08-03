import Link from "next/link";
import { Plus, Users } from "lucide-react";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { EmptyState, Badge } from "@/components/ui";

export const metadata = { title: "Clientes" };

export default async function CustomersPage() {
  const ctx = await requireSession();
  const customers = await prisma.customer.findMany({
    where: { organizationId: ctx.orgId },
    include: { _count: { select: { projects: true, workOrders: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Clientes</h1>
          <p className="text-sm text-slate-500">{customers.length} clientes registrados</p>
        </div>
        <Link href="/app/clientes/nuevo" className="btn-primary">
          <Plus className="h-4 w-4" /> Nuevo cliente
        </Link>
      </div>

      {customers.length === 0 ? (
        <EmptyState
          icon={<Users className="h-7 w-7" />}
          title="Aún no tienes clientes"
          description="Registra a tus clientes para asociarlos a proyectos y órdenes de trabajo."
          action={<Link href="/app/clientes/nuevo" className="btn-primary">Agregar cliente</Link>}
        />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="table-th">Cliente</th>
                  <th className="table-th">Contacto</th>
                  <th className="table-th">Proyectos</th>
                  <th className="table-th">Órdenes</th>
                  <th className="table-th"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="table-td">
                      <Link href={`/app/clientes/${c.id}`} className="font-semibold text-brand-700 hover:underline">{c.name}</Link>
                      {c.company && c.company !== c.name && <p className="text-xs text-slate-400">{c.company}</p>}
                    </td>
                    <td className="table-td">
                      {c.phone && <p className="text-sm">{c.phone}</p>}
                      {c.email && <p className="text-xs text-slate-400">{c.email}</p>}
                    </td>
                    <td className="table-td"><Badge className="bg-slate-100 text-slate-600">{c._count.projects}</Badge></td>
                    <td className="table-td"><Badge className="bg-slate-100 text-slate-600">{c._count.workOrders}</Badge></td>
                    <td className="table-td text-right">
                      <Link href={`/app/clientes/${c.id}/editar`} className="text-sm font-medium text-slate-500 hover:text-brand-700">Editar</Link>
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
