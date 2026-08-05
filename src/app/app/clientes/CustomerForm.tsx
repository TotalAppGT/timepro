"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createCustomer, updateCustomer } from "@/app/app/actions";
import { Input, Textarea, Select, Button, Field, Alert } from "@/components/ui";

export function CustomerForm({ customFieldDefs = [], initial }: { customFieldDefs?: { id: string; label: string; type: string; options?: string[] | null; required: boolean }[]; initial?: any }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const customFields: Record<string, unknown> = {};
    for (const def of customFieldDefs) {
      const v = fd.get(`cf_${def.id}`);
      const raw = typeof v === "string" ? v : "";
      if (raw === "") continue;
      if (def.type === "NUMBER") customFields[def.label] = Number(raw);
      else if (def.type === "BOOLEAN") customFields[def.label] = raw === "1" || raw === "true";
      else if (def.type === "DATE") customFields[def.label] = raw;
      else customFields[def.label] = raw;
    }
    const payload = {
      name: String(fd.get("name") || ""),
      company: String(fd.get("company") || ""),
      nit: String(fd.get("nit") || ""),
      email: String(fd.get("email") || ""),
      phone: String(fd.get("phone") || ""),
      address: String(fd.get("address") || ""),
      notes: String(fd.get("notes") || ""),
      customFields: Object.keys(customFields).length ? customFields : undefined,
    };
    const res = initial?.id ? await updateCustomer(initial.id, payload) : await createCustomer(payload);
    if (res?.error) {
      setError(res.error);
      setLoading(false);
    } else {
      router.push("/app/clientes");
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-4 p-6">
      {error && <Alert kind="error">{error}</Alert>}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nombre / Razón social *">
          <Input name="name" required defaultValue={initial?.name} placeholder="Ej: María López" />
        </Field>
        <Field label="Empresa">
          <Input name="company" defaultValue={initial?.company} placeholder="Ej: Mueblería López, S.A." />
        </Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="NIT">
          <Input name="nit" defaultValue={initial?.nit} placeholder="C/F o número de NIT" />
        </Field>
        <Field label="Teléfono (WhatsApp)">
          <Input name="phone" defaultValue={initial?.phone} placeholder="502 0000 0000" />
        </Field>
      </div>
      <Field label="Correo electrónico">
        <Input name="email" type="email" defaultValue={initial?.email} placeholder="cliente@correo.com" />
      </Field>
      <Field label="Dirección">
        <Input name="address" defaultValue={initial?.address} placeholder="Zona, municipio, departamento" />
      </Field>
      <Field label="Notas">
        <Textarea name="notes" defaultValue={initial?.notes} placeholder="Referencias, condiciones especiales..." />
      </Field>
      {customFieldDefs.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
          <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">Información específica</p>
          <div className="grid gap-4 sm:grid-cols-2">
            {customFieldDefs.map((def) => {
              const initialValue = initial?.customFields?.[def.label] ?? "";
              return (
                <Field key={def.id} label={`${def.label}${def.required ? " *" : ""}`}>
                  {def.type === "TEXT" || def.type === "NUMBER" ? (
                    <Input name={`cf_${def.id}`} type={def.type === "NUMBER" ? "number" : "text"} defaultValue={String(initialValue ?? "")} required={def.required} />
                  ) : def.type === "DATE" ? (
                    <Input name={`cf_${def.id}`} type="date" defaultValue={String(initialValue ?? "")} required={def.required} />
                  ) : def.type === "BOOLEAN" ? (
                    <Select name={`cf_${def.id}`} defaultValue={String(initialValue ?? "")}>
                      <option value="">Seleccionar...</option>
                      <option value="1">Sí</option>
                      <option value="0">No</option>
                    </Select>
                  ) : (
                    <Select name={`cf_${def.id}`} defaultValue={String(initialValue ?? "")} required={def.required}>
                      <option value="">Seleccionar...</option>
                      {(def.options ?? []).map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </Select>
                  )}
                </Field>
              );
            })}
          </div>
        </div>
      )}
      <div className="flex justify-end gap-3">
        <Button type="button" onClick={() => router.back()} className="btn-secondary">Cancelar</Button>
        <Button type="submit" loading={loading} className="btn-primary">
          {initial?.id ? "Guardar cambios" : "Guardar cliente"}
        </Button>
      </div>
    </form>
  );
}
