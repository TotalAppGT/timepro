"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createProject } from "@/app/app/actions";
import { Input, Textarea, Select, Button, Field, Alert } from "@/components/ui";

export function ProjectForm({ customers, initial }: { customers: { id: string; name: string }[]; initial?: any }) {
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
      customerId: String(fd.get("customerId") || ""),
      description: String(fd.get("description") || ""),
      status: String(fd.get("status") || "PLANIFICADO"),
      priority: String(fd.get("priority") || "MEDIA"),
      startDate: String(fd.get("startDate") || ""),
      dueDate: String(fd.get("dueDate") || ""),
      budget: String(fd.get("budget") || ""),
    };
    const res = initial?.id ? await update(initial.id, payload) : await createProject(payload);
    if (res?.error) {
      setError(res.error);
      setLoading(false);
    } else {
      router.push("/app/proyectos");
      router.refresh();
    }
  }

  async function update(id: string, payload: any) {
    const m = await import("@/app/app/actions");
    return m.updateProject(id, payload);
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-4 p-6">
      {error && <Alert kind="error">{error}</Alert>}
      <Field label="Nombre del proyecto">
        <Input name="name" required defaultValue={initial?.name} placeholder="Ej: Instalación de paneles solares — Casa López" />
      </Field>
      <Field label="Cliente">
        <Select name="customerId" defaultValue={initial?.customerId || ""}>
          <option value="">Sin cliente</option>
          {customers.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </Select>
      </Field>
      <Field label="Descripción">
        <Textarea name="description" defaultValue={initial?.description} placeholder="Detalles del alcance del proyecto" />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Estado">
          <Select name="status" defaultValue={initial?.status || "PLANIFICADO"}>
            <option value="PLANIFICADO">Planificado</option>
            <option value="EN_PROGRESO">En progreso</option>
            <option value="PENDIENTE_ENTREGA">Pendiente de entrega</option>
            <option value="COMPLETADO">Completado</option>
            <option value="CANCELADO">Cancelado</option>
          </Select>
        </Field>
        <Field label="Prioridad">
          <Select name="priority" defaultValue={initial?.priority || "MEDIA"}>
            <option value="BAJA">Baja</option>
            <option value="MEDIA">Media</option>
            <option value="ALTA">Alta</option>
            <option value="URGENTE">Urgente</option>
          </Select>
        </Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Fecha de inicio">
          <Input name="startDate" type="date" defaultValue={initial?.startDate ? new Date(initial.startDate).toISOString().slice(0, 10) : ""} />
        </Field>
        <Field label="Fecha de entrega">
          <Input name="dueDate" type="date" defaultValue={initial?.dueDate ? new Date(initial.dueDate).toISOString().slice(0, 10) : ""} />
        </Field>
      </div>
      <Field label="Presupuesto (Q)">
        <Input name="budget" type="number" step="0.01" defaultValue={initial?.budget || ""} placeholder="0.00" />
      </Field>
      <div className="flex justify-end gap-3">
        <Button type="button" onClick={() => router.back()} className="btn-secondary">Cancelar</Button>
        <Button type="submit" loading={loading} className="btn-primary">
          {initial?.id ? "Guardar cambios" : "Crear proyecto"}
        </Button>
      </div>
    </form>
  );
}
