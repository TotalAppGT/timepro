import { requireSession, requireOwner } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getPlan } from "@/lib/plans";
import { Badge } from "@/components/ui";
import { TeamManager } from "./TeamManager";

export const metadata = { title: "Equipo" };

export default async function TeamPage() {
  const ctx = await requireSession();
  const isOwner = ctx.isOwner;

  const [users, invites, org] = await Promise.all([
    prisma.user.findMany({
      where: { organizationId: ctx.orgId },
      orderBy: { createdAt: "asc" },
    }),
    prisma.invite.findMany({
      where: { organizationId: ctx.orgId, status: "PENDING" },
      orderBy: { createdAt: "desc" },
    }),
    prisma.organization.findUnique({ where: { id: ctx.orgId }, select: { planCode: true } }),
  ]);

  const plan = getPlan(org?.planCode ?? "BASIC");
  const used = users.filter((u) => u.active).length;
  const limit = plan.maxUsers;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Equipo</h1>
          <p className="text-sm text-slate-500">
            {used} de {limit === Infinity ? "ilimitados" : limit} usuarios usados en tu plan {plan.name}
          </p>
        </div>
      </div>

      {limit !== Infinity && used >= limit && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Alcanzaste el límite de usuarios de tu plan.{" "}
          <a href="/app/suscripcion" className="font-semibold underline">Mejora tu plan</a> para agregar más.
        </div>
      )}

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="table-th">Miembro</th>
                <th className="table-th">Rol</th>
                <th className="table-th">Estado</th>
                <th className="table-th"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50">
                  <td className="table-td">
                    <p className="font-semibold text-slate-800">{u.name} {u.isOwner && <span className="text-xs text-brand-600">(Propietario)</span>}</p>
                    <p className="text-xs text-slate-400">{u.email}</p>
                  </td>
                  <td className="table-td">
                    <Badge className={u.isOwner ? "bg-brand-100 text-brand-700" : u.role === "ADMIN" ? "bg-sky-100 text-sky-700" : "bg-slate-100 text-slate-600"}>
                      {u.isOwner ? "Propietario" : u.role === "ADMIN" ? "Administrador" : "Técnico"}
                    </Badge>
                  </td>
                  <td className="table-td">
                    <Badge className={u.active ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}>{u.active ? "Activo" : "Inactivo"}</Badge>
                  </td>
                  <td className="table-td text-right">{isOwner && !u.isOwner && <TeamManager userId={u.id} role={u.role} />}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {invites.length > 0 && (
        <div className="card p-5">
          <h2 className="mb-3 text-sm font-bold text-slate-900">Invitaciones pendientes</h2>
          <ul className="divide-y divide-slate-100">
            {invites.map((inv) => (
              <li key={inv.id} className="flex items-center justify-between py-2.5">
                <div>
                  <p className="text-sm font-medium text-slate-800">{inv.email}</p>
                  <p className="text-xs text-slate-400">{inv.role === "ADMIN" ? "Administrador" : "Técnico"} · expira {new Date(inv.expiresAt).toLocaleDateString("es-GT")}</p>
                </div>
                <TeamManager revokeInviteId={inv.id} />
              </li>
            ))}
          </ul>
        </div>
      )}

      {isOwner && <TeamManager inviteMode planName={plan.name} />}
    </div>
  );
}
