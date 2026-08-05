"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveCustomFieldDefs } from "@/app/app/actions";
import { Button, Field, Input, Select, Alert } from "@/components/ui";
import { Plus, Trash2, GripVertical } from "lucide-react";

export interface FieldDef {
  id?: string;
  label: string;
  type: string;
  options?: string;
  required: boolean;
  position: number;
  active: boolean;
}

const TYPES = [
  { value: "TEXT", label: "Texto" },
  { value: "NUMBER", label: "Número" },
  { value: "DATE", label: "Fecha" },
  { value: "BOOLEAN", label: "Sí / No" },
  { value: "SELECT", label: "Lista de opciones" },
];

export default function CustomFieldsManager({ entityType, initial }: { entityType: string; initial: FieldDef[] }) {
  const router = useRouter();
  const [fields, setFields] = useState<FieldDef[]>(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  function update(i: number, patch: Partial<FieldDef>) {
    setFields((fs) => fs.map((f, idx) => (idx === i ? { ...f, ...patch } : f)));
    setOk(false);
  }

  function add() {
    setFields((fs) => [...fs, { label: "", type: "TEXT", options: "", required: false, position: fs.length, active: true }]);
  }

  function remove(i: number) {
    setFields((fs) => fs.filter((_, idx) => idx !== i));
    setOk(false);
  }

  function move(i: number, dir: -1 | 1) {
    setFields((fs) => {
      const next = [...fs];
      const j = i + dir;
      if (j < 0 || j >= next.length) return fs;
      [next[i], next[j]] = [next[j], next[i]];
      return next.map((f, idx) => ({ ...f, position: idx }));
    });
  }

  async function save() {
    setError(null);
    if (fields.some((f) => !f.label.trim())) {
      setError("Todos los campos deben tener un nombre.");
      return;
    }
    setSaving(true);
    const r = await saveCustomFieldDefs({
      entityType,
      fields: fields.map((f, i) => ({
        id: f.id,
        label: f.label.trim(),
        type: f.type,
        options: f.options ? f.options.split(",").map((s) => s.trim()).filter(Boolean) : undefined,
        required: f.required,
        position: i,
        active: true,
      })),
    });
    setSaving(false);
    if (r?.error) {
      setError(r.error);
      return;
    }
    setOk(true);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      {error && <Alert kind="error">{error}</Alert>}
      {ok && <Alert kind="success">Campos personalizados guardados.</Alert>}

      {fields.length === 0 ? (
        <p className="text-sm text-slate-500">No hay campos personalizados. Agrega los primeros para capturar información específica de tu negocio.</p>
      ) : (
        <div className="space-y-3">
          {fields.map((f, i) => (
            <div key={i} className="flex flex-wrap items-start gap-3 rounded-xl border border-slate-200 bg-white p-3">
              <div className="flex flex-col gap-1 pt-2">
                <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="text-slate-300 hover:text-slate-500 disabled:opacity-30"><GripVertical className="h-4 w-4 rotate-0" /></button>
                <button type="button" onClick={() => move(i, 1)} disabled={i === fields.length - 1} className="text-slate-300 hover:text-slate-500 disabled:opacity-30"><GripVertical className="h-4 w-4 rotate-180" /></button>
              </div>
              <div className="grid flex-1 gap-3 sm:grid-cols-2">
                <Field label="Nombre del campo">
                  <Input value={f.label} onChange={(e) => update(i, { label: e.target.value })} placeholder="Ej: Tipo de cable, Marca de panel..." />
                </Field>
                <Field label="Tipo">
                  <Select value={f.type} onChange={(e) => update(i, { type: e.target.value })}>
                    {TYPES.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </Select>
                </Field>
                {f.type === "SELECT" && (
                  <div className="sm:col-span-2">
                    <Field label="Opciones (separadas por coma)">
                      <Input value={f.options ?? ""} onChange={(e) => update(i, { options: e.target.value })} placeholder="Rojo, Azul, Verde" />
                    </Field>
                  </div>
                )}
                <label className="flex items-center gap-2 text-sm text-slate-600">
                  <input type="checkbox" checked={f.required} onChange={(e) => update(i, { required: e.target.checked })} className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500" />
                  Obligatorio
                </label>
              </div>
              <button type="button" onClick={() => remove(i)} className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <Button type="button" onClick={add} className="btn-secondary text-sm"><Plus className="h-4 w-4" /> Agregar campo</Button>
        {fields.length > 0 && (
          <Button type="button" onClick={save} loading={saving} className="btn-primary text-sm">Guardar campos</Button>
        )}
      </div>
    </div>
  );
}
