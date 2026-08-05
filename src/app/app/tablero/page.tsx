import Link from "next/link";
import { Plus, Columns3 } from "lucide-react";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import KanbanBoard from "./KanbanBoard";

export const metadata = { title: "Tablero de órdenes" };

export default async function TableroPage() {
  const ctx = await requireSession();

  const orders = await prisma.workOrder.findMany({
    where: { organizationId: ctx.orgId },
    include: { customer: { select: { name: true } }, assignedTo: { select: { name: true } } },
    orderBy: [{ scheduledAt: "asc" }, { createdAt: "desc" }],
  });

  const cards = orders.map((o) => ({
    id: o.id,
    code: o.code,
    title: o.title,
    type: o.type,
    status: o.status,
    priority: o.priority,
    scheduledAt: o.scheduledAt ? o.scheduledAt.toISOString() : null,
    customerName: o.customer?.name ?? null,
    assignedName: o.assignedTo?.name ?? null,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
            <Columns3 className="h-6 w-6 text-brand-600" /> Tablero de órdenes
          </h1>
          <p className="text-sm text-slate-500">Arrastra las órdenes entre etapas para actualizar su estado</p>
        </div>
        <Link href="/app/ordenes/nueva" className="btn-primary">
          <Plus className="h-4 w-4" /> Nueva orden
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white py-14 text-center">
          <p className="text-sm text-slate-500">Aún no hay órdenes. Crea la primera para verla en el tablero.</p>
          <Link href="/app/ordenes/nueva" className="btn-primary mt-4">
            Crear primera orden
          </Link>
        </div>
      ) : (
        <KanbanBoard initial={cards} />
      )}
    </div>
  );
}
