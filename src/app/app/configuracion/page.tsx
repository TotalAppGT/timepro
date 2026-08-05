import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SettingsForm } from "./SettingsForm";
import { ProfileForm } from "./ProfileForm";
import CustomFieldsManager from "./CustomFieldsManager";

export const metadata = { title: "Configuración" };

export default async function SettingsPage() {
  const ctx = await requireSession();
  const [org, user, woFields, customerFields] = await Promise.all([
    prisma.organization.findUnique({ where: { id: ctx.orgId } }),
    prisma.user.findUnique({ where: { id: ctx.id } }),
    prisma.customFieldDef.findMany({ where: { organizationId: ctx.orgId, entityType: "WORK_ORDER", active: true }, orderBy: { position: "asc" } }),
    prisma.customFieldDef.findMany({ where: { organizationId: ctx.orgId, entityType: "CUSTOMER", active: true }, orderBy: { position: "asc" } }),
  ]);
  if (!org || !user) return null;

  const mapFields = (fs: typeof woFields) =>
    fs.map((f) => ({
      id: f.id,
      label: f.label,
      type: f.type,
      options: Array.isArray(f.options) ? (f.options as string[]).join(", ") : "",
      required: f.required,
      position: f.position,
      active: f.active,
    }));

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Configuración</h1>
        <p className="text-sm text-slate-500">Datos de tu empresa, marca y notificaciones.</p>
      </div>
      <SettingsForm org={org} isOwner={ctx.isOwner} />
      <ProfileForm user={user} />

      {ctx.isOwner && (
        <>
          <section className="card p-5">
            <h2 className="text-sm font-bold text-slate-900">Campos personalizados — Órdenes de trabajo</h2>
            <p className="mt-1 text-xs text-slate-500">Define campos extra que aparecerán al crear una orden (ej: marca de equipo, tipo de cable, color).</p>
            <div className="mt-4">
              <CustomFieldsManager entityType="WORK_ORDER" initial={mapFields(woFields)} />
            </div>
          </section>
          <section className="card p-5">
            <h2 className="text-sm font-bold text-slate-900">Campos personalizados — Clientes</h2>
            <p className="mt-1 text-xs text-slate-500">Datos adicionales de tus clientes (ej: zona, departamento, forma de pago).</p>
            <div className="mt-4">
              <CustomFieldsManager entityType="CUSTOMER" initial={mapFields(customerFields)} />
            </div>
          </section>
        </>
      )}
    </div>
  );
}
