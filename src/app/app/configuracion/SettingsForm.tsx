"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateOrgSettings, updateOrgLogo } from "@/app/app/actions";
import { Input, Button, Field, Alert } from "@/components/ui";
import { Upload } from "lucide-react";

export function SettingsForm({ org, isOwner }: { org: any; isOwner: boolean }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [loading, setLoading] = useState(false);
  const [logoLoading, setLogoLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setOk(false);
    const fd = new FormData(e.currentTarget);
    const res = await updateOrgSettings({
      name: String(fd.get("name") || ""),
      phone: String(fd.get("phone") || ""),
      address: String(fd.get("address") || ""),
      nit: String(fd.get("nit") || ""),
      brandColor: String(fd.get("brandColor") || "#0f766e"),
      whatsappPhone: String(fd.get("whatsappPhone") || ""),
      notifyWhatsApp: fd.get("notifyWhatsApp") === "on",
      notifyEmail: fd.get("notifyEmail") === "on",
    });
    if (res?.error) setError(res.error);
    else setOk(true);
    setLoading(false);
    router.refresh();
  }

  async function onLogo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoLoading(true);
    setError(null);
    const reader = new FileReader();
    reader.onload = async () => {
      const r = await updateOrgLogo(String(reader.result));
      if (r?.error) setError(r.error);
      setLogoLoading(false);
      router.refresh();
    };
    reader.readAsDataURL(file);
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-4 p-6">
      {error && <Alert kind="error">{error}</Alert>}
      {ok && <Alert kind="success">Cambios guardados correctamente.</Alert>}

      <div>
        <h2 className="mb-3 text-sm font-bold text-slate-900">Datos de la empresa</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nombre de la empresa *">
            <Input name="name" required defaultValue={org.name} disabled={!isOwner} />
          </Field>
          <Field label="NIT">
            <Input name="nit" defaultValue={org.nit || ""} disabled={!isOwner} />
          </Field>
        </div>
        <div className="mt-4">
          <Field label="Dirección">
            <Input name="address" defaultValue={org.address || ""} disabled={!isOwner} />
          </Field>
        </div>
        <div className="mt-4">
          <Field label="Teléfono">
            <Input name="phone" defaultValue={org.phone || ""} disabled={!isOwner} />
          </Field>
        </div>
      </div>

      <div className="border-t border-slate-100 pt-4">
        <h2 className="mb-3 text-sm font-bold text-slate-900">Marca personalizada {!isOwner && "(solo propietario)"}</h2>
        {isOwner && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Color de marca</label>
              <div className="flex items-center gap-3">
                <input type="color" name="brandColor" defaultValue={org.brandColor || "#0f766e"} className="h-10 w-14 cursor-pointer rounded-lg border border-slate-300" />
                <span className="text-xs text-slate-400">Se usa en documentos PDF y acentos.</span>
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Logo (aparece en tus PDFs)</label>
              <label className="btn-secondary w-full cursor-pointer text-sm">
                <Upload className="h-4 w-4" /> {logoLoading ? "Subiendo..." : org.logoUrl ? "Cambiar logo" : "Subir logo"}
                <input type="file" accept="image/png,image/jpeg" className="hidden" onChange={onLogo} />
              </label>
              {org.logoUrl && <img src={org.logoUrl} alt="logo" className="mt-2 h-12 object-contain" />}
            </div>
          </div>
        )}
      </div>

      {isOwner && (
        <div className="border-t border-slate-100 pt-4">
          <h2 className="mb-3 text-sm font-bold text-slate-900">Notificaciones</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 text-sm">
              <input type="checkbox" name="notifyWhatsApp" defaultChecked={org.notifyWhatsApp} className="h-4 w-4 rounded border-slate-300 text-brand-600" />
              WhatsApp (avisa al equipo cuando hay órdenes)
            </label>
            <label className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 text-sm">
              <input type="checkbox" name="notifyEmail" defaultChecked={org.notifyEmail} className="h-4 w-4 rounded border-slate-300 text-brand-600" />
              Correo electrónico (documentos firmados, avisos)
            </label>
          </div>
          <div className="mt-4">
            <Field label="Número de WhatsApp para envíos (formato 502...)">
              <Input name="whatsappPhone" defaultValue={org.whatsappPhone || ""} placeholder="50200000000" />
            </Field>
          </div>
        </div>
      )}

      {isOwner && (
        <div className="flex justify-end">
          <Button type="submit" loading={loading} className="btn-primary">
            Guardar configuración
          </Button>
        </div>
      )}
    </form>
  );
}
