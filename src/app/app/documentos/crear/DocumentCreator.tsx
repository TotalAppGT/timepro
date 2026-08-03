"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createDocument } from "@/app/app/actions";
import { Input, Textarea, Select, Button, Field, Alert } from "@/components/ui";
import { Plus, Trash2 } from "lucide-react";

export function DocumentCreator({
  customers,
  projects,
  workOrders,
}: {
  customers: { id: string; name: string }[];
  projects: { id: string; name: string; code: string }[];
  workOrders: { id: string; code: string; title: string }[];
}) {
  const router = useRouter();
  const params = useSearchParams();
  const preWorkOrder = params.get("workOrderId") || "";

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState("COTIZACION");
  const [items, setItems] = useState([{ description: "", qty: "1", unitPrice: "" }]);
  const [useItems, setUseItems] = useState(false);
  const [taxRate, setTaxRate] = useState("12");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const fd = new FormData(e.currentTarget);

    const parsedItems = items
      .map((it) => ({
        description: it.description,
        qty: Number(it.qty) || 0,
        unitPrice: Number(it.unitPrice) || 0,
      }))
      .filter((it) => it.description);

    const res = await createDocument({
      type,
      title: String(fd.get("title") || ""),
      workOrderId: String(fd.get("workOrderId") || "") || undefined,
      projectId: String(fd.get("projectId") || "") || undefined,
      customerId: String(fd.get("customerId") || "") || undefined,
      description: String(fd.get("description") || ""),
      notes: String(fd.get("notes") || ""),
      terms: String(fd.get("terms") || ""),
      items: useItems ? parsedItems : [],
      taxRate: Number(taxRate) || 0,
      includeSignature: fd.get("includeSignature") === "on",
      includeChecklist: fd.get("includeChecklist") === "on",
      includePhotos: fd.get("includePhotos") === "on",
    });

    if (res?.error) {
      setError(res.error);
      setLoading(false);
    } else {
      router.push(res.id ? `/app/documentos/${res.id}` : "/app/documentos");
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-4 p-6">
      {error && <Alert kind="error">{error}</Alert>}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Tipo de documento">
          <Select value={type} onChange={(e) => setType(e.target.value)} name="type">
            <option value="COTIZACION">Cotización</option>
            <option value="ORDEN_TRABAJO">Orden de trabajo</option>
            <option value="ACTA_ENTREGA">Acta de entrega / instalación</option>
            <option value="PARTE_TRABAJO">Parte de trabajo</option>
            <option value="FACTURA">Factura</option>
            <option value="CUSTOM">Documento personalizado</option>
          </Select>
        </Field>
        <Field label="Título del documento *">
          <Input name="title" required placeholder="Ej: Cotización instalación aire acondicionado" />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Cliente">
          <Select name="customerId">
            <option value="">Sin cliente</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </Select>
        </Field>
        <Field label="Proyecto">
          <Select name="projectId">
            <option value="">Sin proyecto</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.code} · {p.name}</option>
            ))}
          </Select>
        </Field>
        <Field label="Orden de trabajo">
          <Select name="workOrderId" defaultValue={preWorkOrder}>
            <option value="">Sin orden</option>
            {workOrders.map((w) => (
              <option key={w.id} value={w.id}>{w.code} · {w.title}</option>
            ))}
          </Select>
        </Field>
      </div>

      <Field label="Descripción / Detalle del servicio">
        <Textarea name="description" placeholder="Detalla el alcance del documento" />
      </Field>

      {/* Partidas */}
      <div>
        <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-700">
          <input type="checkbox" checked={useItems} onChange={(e) => setUseItems(e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500" />
          Incluir partidas (productos / servicios con precios)
        </label>
        {useItems && (
          <div className="mt-3 space-y-2">
            <div className="hidden grid-cols-12 gap-2 px-1 text-xs font-semibold text-slate-400 sm:grid">
              <span className="col-span-6">Descripción</span>
              <span className="col-span-2">Cant.</span>
              <span className="col-span-3">P. unitario (Q)</span>
              <span className="col-span-1"></span>
            </div>
            {items.map((item, i) => (
              <div key={i} className="grid grid-cols-12 gap-2">
                <input
                  className="input col-span-6"
                  value={item.description}
                  onChange={(e) => setItems((arr) => arr.map((x, idx) => (idx === i ? { ...x, description: e.target.value } : x)))}
                  placeholder="Descripción"
                />
                <input
                  className="input col-span-2"
                  type="number"
                  value={item.qty}
                  onChange={(e) => setItems((arr) => arr.map((x, idx) => (idx === i ? { ...x, qty: e.target.value } : x)))}
                  placeholder="1"
                />
                <input
                  className="input col-span-3"
                  type="number"
                  step="0.01"
                  value={item.unitPrice}
                  onChange={(e) => setItems((arr) => arr.map((x, idx) => (idx === i ? { ...x, unitPrice: e.target.value } : x)))}
                  placeholder="0.00"
                />
                <button type="button" onClick={() => setItems((arr) => arr.filter((_, idx) => idx !== i))} className="col-span-1 rounded-lg p-2 text-slate-400 hover:text-rose-600">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            <Button type="button" onClick={() => setItems((arr) => [...arr, { description: "", qty: "1", unitPrice: "" }])} className="btn-secondary text-xs">
              <Plus className="h-3.5 w-3.5" /> Agregar partida
            </Button>
            <div className="flex items-center gap-2 pt-2">
              <label className="text-sm text-slate-600">IVA %:</label>
              <Input type="number" value={taxRate} onChange={(e) => setTaxRate(e.target.value)} className="w-20" />
            </div>
          </div>
        )}
      </div>

      {/* Opciones de anexos */}
      <div>
        <p className="mb-2 text-sm font-medium text-slate-700">Anexos (según la orden seleccionada)</p>
        <div className="flex flex-wrap gap-4 text-sm text-slate-600">
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" name="includeSignature" className="h-4 w-4 rounded border-slate-300 text-brand-600" /> Firmas
          </label>
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" name="includeChecklist" className="h-4 w-4 rounded border-slate-300 text-brand-600" /> Checklist
          </label>
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" name="includePhotos" className="h-4 w-4 rounded border-slate-300 text-brand-600" /> Fotos de evidencia
          </label>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Observaciones">
          <Textarea name="notes" placeholder="Notas adicionales" />
        </Field>
        <Field label="Condiciones / Términos">
          <Textarea name="terms" placeholder="Condiciones de pago, garantía, vigencia..." />
        </Field>
      </div>

      <div className="flex justify-end gap-3">
        <Button type="button" onClick={() => router.back()} className="btn-secondary">Cancelar</Button>
        <Button type="submit" loading={loading} className="btn-primary">Generar documento PDF</Button>
      </div>
    </form>
  );
}
