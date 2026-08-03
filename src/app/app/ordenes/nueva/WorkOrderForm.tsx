"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createWorkOrder } from "@/app/app/actions";
import { Input, Textarea, Select, Button, Field, Alert } from "@/components/ui";

export function WorkOrderForm({
  customers,
  projects,
  technicians,
  initial,
}: {
  customers: { id: string; name: string }[];
  projects: { id: string; name: string; code: string }[];
  technicians: { id: string; name: string; role: string }[];
  initial?: any;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const preProject = params.get("projectId") || initial?.projectId || "";

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState(initial?.type || "INSTALACION");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const payload = {
      title: String(fd.get("title") || ""),
      type: String(fd.get("type") || "INSTALACION"),
      projectId: String(fd.get("projectId") || ""),
      customerId: String(fd.get("customerId") || ""),
      assignedToId: String(fd.get("assignedToId") || ""),
      description: String(fd.get("description") || ""),
      priority: String(fd.get("priority") || "MEDIA"),
      scheduledAt: String(fd.get("scheduledAt") || ""),
      address: String(fd.get("address") || ""),
      location: String(fd.get("location") || ""),
      totalAmount: String(fd.get("totalAmount") || ""),
    };
    const res = await createWorkOrder(payload);
    if (res?.error) {
      setError(res.error);
      setLoading(false);
    } else {
      router.push(res.id ? `/app/ordenes/${res.id}` : "/app/ordenes");
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-4 p-6">
      {error && <Alert kind="error">{error}</Alert>}

      <Field label="Título de la orden *">
        <Input name="title" required defaultValue={initial?.title} placeholder="Ej: Instalación de aire acondicionado" />
      </Field>

      <Field label="Tipo de trabajo">
        <Select name="type" value={type} onChange={(e) => setType(e.target.value)}>
          <option value="INSTALACION">Instalación</option>
          <option value="ENTREGA">Entrega</option>
          <option value="MANTENIMIENTO">Mantenimiento</option>
          <option value="REPARACION">Reparación</option>
          <option value="SERVICIO">Servicio</option>
          <option value="VISITA">Visita técnica</option>
        </Select>
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Proyecto">
          <Select name="projectId" defaultValue={preProject}>
            <option value="">Sin proyecto</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.code} · {p.name}</option>
            ))}
          </Select>
        </Field>
        <Field label="Cliente">
          <Select name="customerId" defaultValue={initial?.customerId || ""}>
            <option value="">Sin cliente</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </Select>
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Responsable / Técnico">
          <Select name="assignedToId" defaultValue={initial?.assignedToId || ""}>
            <option value="">Sin asignar</option>
            {technicians.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </Select>
        </Field>
        <Field label="Fecha programada">
          <Input name="scheduledAt" type="datetime-local" defaultValue={initial?.scheduledAt ? new Date(initial.scheduledAt).toISOString().slice(0, 16) : ""} />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Prioridad">
          <Select name="priority" defaultValue={initial?.priority || "MEDIA"}>
            <option value="BAJA">Baja</option>
            <option value="MEDIA">Media</option>
            <option value="ALTA">Alta</option>
            <option value="URGENTE">Urgente</option>
          </Select>
        </Field>
        <Field label="Monto estimado (Q)">
          <Input name="totalAmount" type="number" step="0.01" defaultValue={initial?.totalAmount || ""} placeholder="0.00" />
        </Field>
      </div>

      <Field label="Dirección del trabajo">
        <Input name="address" defaultValue={initial?.address} placeholder="Dirección donde se ejecuta" />
      </Field>
      <Field label="Ubicación / Referencia">
        <Input name="location" defaultValue={initial?.location} placeholder="Punto de referencia, notas de GPS" />
      </Field>
      <Field label="Descripción / Alcance">
        <Textarea name="description" defaultValue={initial?.description} placeholder="Qué hay que hacer, materiales, condiciones..." />
      </Field>

      <div className="flex justify-end gap-3">
        <Button type="button" onClick={() => router.back()} className="btn-secondary">Cancelar</Button>
        <Button type="submit" loading={loading} className="btn-primary">Crear orden</Button>
      </div>
    </form>
  );
}
