import Link from "next/link";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CustomerForm } from "../CustomerForm";

export const metadata = { title: "Nuevo cliente" };

export default async function NewCustomerPage() {
  const ctx = await requireSession();
  const customFields = await prisma.customFieldDef.findMany({
    where: { organizationId: ctx.orgId, entityType: "CUSTOMER", active: true },
    orderBy: { position: "asc" },
  });
  const customFieldDefs = customFields.map((f) => ({
    id: f.id,
    label: f.label,
    type: f.type,
    options: Array.isArray(f.options) ? (f.options as string[]) : [],
    required: f.required,
  }));
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link href="/app/clientes" className="text-sm text-slate-500 hover:text-slate-700">← Volver a clientes</Link>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Nuevo cliente</h1>
      </div>
      <CustomerForm customFieldDefs={customFieldDefs} />
    </div>
  );
}
