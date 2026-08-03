"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SignaturePad } from "@/components/SignaturePad";
import { Button, Input, Select, Textarea, Field, Alert, Badge } from "@/components/ui";
import { CheckCircle2, ClipboardList, UserRound } from "lucide-react";

const ROLES = [
  { value: "CLIENTE", label: "Cliente" },
  { value: "REPRESENTANTE", label: "Representante autorizado" },
  { value: "ENCARGADO", label: "Encargado / Administrador" },
  { value: "PROPIETARIO", label: "Propietario" },
];

export function AprobacionForm({
  token,
  orgName,
  brandColor,
  summary,
  confirmations,
  signatures,
  alreadySigned,
}: {
  token: string;
  orgName: string;
  brandColor: string;
  summary: {
    type: string;
    code: string;
    title: string;
    description?: string | null;
    customer?: string | null;
    phone?: string | null;
    address?: string | null;
    assignedTo?: string | null;
    scheduledAt?: string | null;
  };
  confirmations: string[];
  signatures: { name: string; role: string; signedAt: string; imageUrl: string }[];
  alreadySigned: boolean;
}) {
  const [checked, setChecked] = useState<boolean[]>(() => confirmations.map(() => false));
  const [signature, setSignature] = useState<string | null>(null);
  const [signatureValid, setSignatureValid] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(alreadySigned);
  const router = useRouter();

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!signature || !signatureValid) {
      setError("Captura tu firma para continuar.");
      return;
    }
    if (!checked.some(Boolean)) {
      setError("Marca al menos una casilla de confirmación.");
      return;
    }
    setLoading(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch(`/api/aprobacion/${token}/enviar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: String(fd.get("name") || "").trim(),
          role: String(fd.get("role") || "CLIENTE"),
          dni: String(fd.get("dni") || "").trim(),
          email: String(fd.get("email") || "").trim(),
          comments: String(fd.get("comments") || "").trim(),
          confirmations: confirmations.filter((_, i) => checked[i]),
          signature,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Ocurrió un error. Intenta de nuevo.");
        setLoading(false);
        return;
      }
      setDone(true);
      router.refresh();
    } catch {
      setError("Error de conexión. Intenta de nuevo.");
    }
    setLoading(false);
  }

  if (done) {
    return (
      <div className="mt-6 rounded-3xl border border-emerald-200 bg-white p-8 text-center shadow-sm">
        <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-500" />
        <h2 className="mt-4 text-xl font-bold text-slate-900">¡{summary.type === "PROYECTO" ? "Proyecto" : "Servicio"} aprobado!</h2>
        <p className="mt-2 text-sm text-slate-500">
          Tu confirmación quedó registrada con fecha, hora y datos. {orgName} tiene el documento de respaldo.
        </p>
        {signatures.map((s, i) => (
          <div key={i} className="mx-auto mt-5 max-w-xs rounded-2xl border border-slate-200 p-4">
            {s.imageUrl && <img src={s.imageUrl} alt="" className="h-14 w-full object-contain" />}
            <p className="mt-2 text-sm font-semibold text-slate-800">{s.name}</p>
            <p className="text-xs text-slate-400">
              {s.role} · {new Date(s.signedAt).toLocaleString("es-GT")}
            </p>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="px-6 py-5" style={{ backgroundColor: `${brandColor}14` }}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: brandColor }}>
              {summary.type === "PROYECTO" ? "Proyecto" : "Orden de trabajo"} · {summary.code}
            </p>
            <h2 className="mt-1 text-lg font-bold text-slate-900">{summary.title}</h2>
            {summary.customer && <p className="mt-0.5 text-sm text-slate-500">Cliente: {summary.customer}</p>}
            {summary.scheduledAt && (
              <p className="text-xs text-slate-400">Fecha del servicio: {new Date(summary.scheduledAt).toLocaleDateString("es-GT")}</p>
            )}
          </div>
          <Badge className="bg-slate-100 text-slate-600">Pendiente de firma</Badge>
        </div>
      </div>

      <form onSubmit={submit} className="space-y-6 px-6 py-6">
        {error && <Alert kind="error">{error}</Alert>}

        <div>
          <div className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4 text-slate-400" />
            <h3 className="text-sm font-bold text-slate-900">Confirmaciones</h3>
          </div>
          <p className="mt-1 text-xs text-slate-400">Marca las casillas que correspondan:</p>
          <div className="mt-3 space-y-2">
            {confirmations.map((c, i) => (
              <label
                key={i}
                className={`flex items-start gap-3 rounded-xl border p-3 text-sm transition-colors ${checked[i] ? "border-brand-400 bg-brand-50/50" : "border-slate-200 hover:border-slate-300"}`}
              >
                <input
                  type="checkbox"
                  checked={checked[i]}
                  onChange={(ev) => setChecked((prev) => prev.map((v, j) => (j === i ? ev.target.checked : v)))}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-600"
                />
                <span className="text-slate-700">{c}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2">
            <UserRound className="h-4 w-4 text-slate-400" />
            <h3 className="text-sm font-bold text-slate-900">Datos de quien recibe / acepta</h3>
          </div>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <Field label="Nombre completo *">
              <Input name="name" required placeholder="Ej: María Fernanda López" />
            </Field>
            <Field label="Rol *">
              <Select name="role" defaultValue="CLIENTE">
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </Select>
            </Field>
            <Field label="DPI / NIT (opcional)">
              <Input name="dni" placeholder="Número de documento" />
            </Field>
            <Field label="Correo electrónico (opcional)">
              <Input name="email" type="email" placeholder="correo@cliente.com" />
            </Field>
          </div>
        </div>

        <Field label="Observaciones o comentarios (opcional)">
          <Textarea name="comments" rows={3} placeholder="Escribe cualquier observación sobre el servicio recibido..." />
        </Field>

        <div>
          <h3 className="text-sm font-bold text-slate-900">Firma digital</h3>
          <p className="mt-1 text-xs text-slate-400">
            Al firmar confirmas que la información es correcta y aceptas el servicio descrito. Queda registrado con fecha y hora.
          </p>
          <div className="mt-3">
            <SignaturePad onChange={setSignature} onValidChange={setSignatureValid} height={170} />
          </div>
        </div>

        <Button type="submit" loading={loading} disabled={!signatureValid} className="btn-primary w-full py-3">
          {loading ? "Registrando..." : "Confirmar y firmar"}
        </Button>
        <p className="pb-1 text-center text-[11px] text-slate-400">
          Este formulario es un respaldo digital de conformidad emitido por {orgName}.
        </p>
      </form>
    </div>
  );
}
