"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createCustomer, updateCustomer } from "@/app/app/actions";
import { Input, Textarea, Button, Field, Alert } from "@/components/ui";

export function CustomerForm({ initial }: { initial?: any }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const payload = {
      name: String(fd.get("name") || ""),
      company: String(fd.get("company") || ""),
      nit: String(fd.get("nit") || ""),
      email: String(fd.get("email") || ""),
      phone: String(fd.get("phone") || ""),
      address: String(fd.get("address") || ""),
      notes: String(fd.get("notes") || ""),
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
      <div className="flex justify-end gap-3">
        <Button type="button" onClick={() => router.back()} className="btn-secondary">Cancelar</Button>
        <Button type="submit" loading={loading} className="btn-primary">
          {initial?.id ? "Guardar cambios" : "Guardar cliente"}
        </Button>
      </div>
    </form>
  );
}
