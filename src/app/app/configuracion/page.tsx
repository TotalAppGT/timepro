import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SettingsForm } from "./SettingsForm";
import { ProfileForm } from "./ProfileForm";

export const metadata = { title: "Configuración" };

export default async function SettingsPage() {
  const ctx = await requireSession();
  const [org, user] = await Promise.all([
    prisma.organization.findUnique({ where: { id: ctx.orgId } }),
    prisma.user.findUnique({ where: { id: ctx.id } }),
  ]);
  if (!org || !user) return null;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Configuración</h1>
        <p className="text-sm text-slate-500">Datos de tu empresa, marca y notificaciones.</p>
      </div>
      <SettingsForm org={org} isOwner={ctx.isOwner} />
      <ProfileForm user={user} />
    </div>
  );
}
