"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  updateWorkOrderStatus,
  saveWorkOrderExecution,
  addSignature,
  createDocument,
} from "@/app/app/actions";
import { SignaturePad } from "@/components/SignaturePad";
import { Button, Input, Field, Alert, Badge } from "@/components/ui";
import { Plus, Trash2, Camera, CheckCircle2, FileText, Check } from "lucide-react";

export function WorkOrderClient({
  workOrderId,
  status,
  isOwner: _isOwner,
  checklist: initialChecklist,
  photos: initialPhotos,
  maxPhotos,
  canPortal,
}: {
  workOrderId: string;
  status: string;
  isOwner: boolean;
  checklist: { text: string; done: boolean }[];
  photos: string[];
  maxPhotos: number;
  canPortal: boolean;
}) {
  const router = useRouter();
  const [checklist, setChecklist] = useState(initialChecklist);
  const [photos, setPhotos] = useState(initialPhotos);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Firma
  const [signature, setSignature] = useState<string | null>(null);
  const [signatureValid, setSignatureValid] = useState(false);
  const [signerName, setSignerName] = useState("");
  const [signerDni, setSignerDni] = useState("");
  const [signing, setSigning] = useState(false);

  async function changeStatus(next: string) {
    setError(null);
    const r = await updateWorkOrderStatus(workOrderId, next);
    if (r?.error) setError(r.error);
    router.refresh();
  }

  async function saveChecklist() {
    setLoading(true);
    setError(null);
    const r = await saveWorkOrderExecution(workOrderId, { checklist, notes });
    if (r?.error) setError(r.error);
    router.refresh();
    setLoading(false);
  }

  function addItem() {
    setChecklist((c) => [...c, { text: "", done: false }]);
  }

  function updateItem(i: number, text: string) {
    setChecklist((c) => c.map((it, idx) => (idx === i ? { ...it, text } : it)));
  }

  function toggleItem(i: number) {
    setChecklist((c) => c.map((it, idx) => (idx === i ? { ...it, done: !it.done } : it)));
  }

  function removeItem(i: number) {
    setChecklist((c) => c.filter((_, idx) => idx !== i));
  }

  function onFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []).slice(0, maxPhotos - photos.length);
    if (files.length === 0) return;
    const readers = files.map(
      (f) =>
        new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result));
          reader.readAsDataURL(f);
        })
    );
    Promise.all(readers).then((results) => {
      setPhotos((p) => [...p, ...results].slice(0, maxPhotos));
      e.target.value = "";
    });
  }

  function removePhoto(i: number) {
    setPhotos((p) => p.filter((_, idx) => idx !== i));
  }

  async function savePhotos() {
    setLoading(true);
    setError(null);
    // Solo sube las fotos nuevas (las existentes ya están guardadas)
    const existing = new Set(initialPhotos);
    const newPhotos = photos.filter((p) => !existing.has(p));
    const r = await saveWorkOrderExecution(workOrderId, { checklist, notes, photos: newPhotos });
    if (r?.error) setError(r.error);
    router.refresh();
    setLoading(false);
  }

  async function sign() {
    if (!signature || !signerName.trim()) {
      setError("Captura la firma y escribe el nombre del firmante.");
      return;
    }
    setSigning(true);
    setError(null);
    const r = await addSignature(workOrderId, {
      signerName: signerName.trim(),
      signerDni: signerDni.trim(),
      signerRole: "CLIENTE",
      imageUrl: signature,
    });
    if (r?.error) setError(r.error);
    setSigning(false);
    router.refresh();
  }

  async function generateActa() {
    setLoading(true);
    setError(null);
    const r = await createDocument({
      type: "ACTA_ENTREGA",
      title: `Acta de entrega ${status}`,
      workOrderId,
      includeSignature: true,
      includeChecklist: true,
      includePhotos: true,
      terms: "Con la firma del presente, el cliente declara haber recibido conforme el servicio descrito en esta acta.",
    });
    if (r?.error) setError(r.error);
    router.refresh();
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      {error && <Alert kind="error">{error}</Alert>}

      {/* Estado */}
      <div className="card p-5">
        <h2 className="mb-3 text-sm font-bold text-slate-900">Cambiar estado</h2>
        <div className="flex flex-wrap gap-2">
          {["PENDIENTE", "EN_RUTA", "EN_EJECUCION", "REVISION", "COMPLETADO", "CANCELADO"].map((s) => (
            <Button
              key={s}
              type="button"
              onClick={() => changeStatus(s)}
              disabled={loading}
              className={status === s ? "btn-primary text-xs" : "btn-secondary text-xs"}
            >
              {s === "PENDIENTE" ? "Pendiente" : s === "EN_RUTA" ? "En ruta" : s === "EN_EJECUCION" ? "En ejecución" : s === "REVISION" ? "En revisión" : s === "COMPLETADO" ? "Completado" : "Cancelado"}
            </Button>
          ))}
        </div>
      </div>

      {/* Checklist */}
      <div className="card p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">Checklist de ejecución</h2>
          <Button type="button" onClick={addItem} className="btn-secondary text-xs"><Plus className="h-3.5 w-3.5" /> Agregar</Button>
        </div>
        {checklist.length === 0 ? (
          <p className="text-sm text-slate-400">Agrega puntos a verificar durante el trabajo (ej: revisión de conexiones, prueba de funcionamiento).</p>
        ) : (
          <div className="space-y-2">
            {checklist.map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => toggleItem(i)}
                  className={`grid h-6 w-6 shrink-0 place-items-center rounded-md border text-white ${
                    item.done ? "border-brand-600 bg-brand-600" : "border-slate-300 bg-white"
                  }`}
                >
                  {item.done && <Check className="h-4 w-4" />}
                </button>
                <input
                  value={item.text}
                  onChange={(e) => updateItem(i, e.target.value)}
                  placeholder="Punto a verificar"
                  className="input flex-1 py-2"
                />
                <button type="button" onClick={() => removeItem(i)} className="rounded-lg p-2 text-slate-400 hover:text-rose-600">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="mt-3">
          <Field label="Notas de la ejecución">
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="input" placeholder="Observaciones, incidencias, materiales usados..." />
          </Field>
        </div>
        <Button type="button" onClick={saveChecklist} loading={loading} className="btn-primary mt-3">
          Guardar checklist
        </Button>
      </div>

      {/* Evidencias */}
      <div className="card p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">Evidencia fotográfica ({photos.length}/{maxPhotos})</h2>
          <label className="btn-secondary cursor-pointer text-xs">
            <Camera className="h-3.5 w-3.5" /> Subir fotos
            <input type="file" accept="image/*" multiple capture="environment" className="hidden" onChange={onFiles} />
          </label>
        </div>
        {photos.length === 0 ? (
          <p className="text-sm text-slate-400">Sube fotos del antes/después o de la entrega. Quedan adjuntas al reporte PDF.</p>
        ) : (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            {photos.map((p, i) => (
              <div key={i} className="group relative aspect-square overflow-hidden rounded-xl border border-slate-200">
                <img src={p} alt="" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => removePhoto(i)}
                  className="absolute right-1 top-1 rounded-lg bg-slate-900/70 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
        <Button type="button" onClick={savePhotos} loading={loading} className="btn-primary mt-3">
          Guardar evidencias
        </Button>
      </div>

      {/* Firma digital */}
      <div className="card p-5">
        <div className="mb-3 flex items-center gap-2">
          <h2 className="text-sm font-bold text-slate-900">Firma digital del cliente</h2>
          <Badge className="bg-brand-100 text-brand-700">Conformidad del servicio</Badge>
        </div>
        <div className="grid gap-5 lg:grid-cols-2">
          <div>
            <Field label="Nombre del firmante *">
              <Input value={signerName} onChange={(e) => setSignerName(e.target.value)} placeholder="Nombre completo del cliente" />
            </Field>
            <div className="mt-4">
              <Field label="DPI / NIT (opcional)">
                <Input value={signerDni} onChange={(e) => setSignerDni(e.target.value)} placeholder="Número de documento" />
              </Field>
            </div>
          </div>
          <div>
            <SignaturePad onChange={setSignature} onValidChange={setSignatureValid} />
            <Button type="button" onClick={sign} loading={signing} disabled={!signatureValid} className="btn-primary mt-3 w-full">
              <CheckCircle2 className="h-4 w-4" /> Firmar y completar
            </Button>
          </div>
        </div>
      </div>

      {/* Documentos */}
      <div className="card p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">Generar documento PDF</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={generateActa} loading={loading} className="btn-primary text-sm">
            <FileText className="h-4 w-4" /> Acta de entrega / instalación
          </Button>
          <Button type="button" onClick={() => window.location.href = `/app/documentos/crear?workOrderId=${workOrderId}`} className="btn-secondary text-sm">
            Creador de documentos
          </Button>
        </div>
        {!canPortal && (
          <p className="mt-2 text-xs text-amber-600">
            El portal de firma remota del cliente está disponible en el plan Pro. Con tu plan actual el cliente firma en el dispositivo del técnico.
          </p>
        )}
      </div>
    </div>
  );
}
