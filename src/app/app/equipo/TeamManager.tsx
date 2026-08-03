"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { inviteUser, revokeInvite, updateUserRole, removeUser } from "@/app/app/actions";
import { Input, Select, Button, Field, Alert } from "@/components/ui";
import { Mail } from "lucide-react";

export function TeamManager({
  inviteMode,
  planName,
  userId,
  role,
  revokeInviteId,
}: {
  inviteMode?: boolean;
  planName?: string;
  userId?: string;
  role?: string;
  revokeInviteId?: string;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (inviteMode) {
    return (
      <div className="card p-5">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-900">
          <Mail className="h-4 w-4 text-brand-600" /> Invitar a un miembro del equipo
        </h2>
        <InviteForm setError={setError} setLoading={setLoading} loading={loading} planName={planName} onDone={() => router.refresh()} />
        {error && <div className="mt-3"><Alert kind="error">{error}</Alert></div>}
      </div>
    );
  }

  if (revokeInviteId) {
    return (
      <button
        onClick={async () => {
          await revokeInvite(revokeInviteId);
          router.refresh();
        }}
        className="text-sm font-medium text-rose-600 hover:underline"
      >
        Revocar
      </button>
    );
  }

  if (userId) {
    return (
      <div className="flex items-center justify-end gap-2">
        <Select
          className="w-36 py-1.5 text-xs"
          value={role}
          onChange={async (e) => {
            const r = await updateUserRole(userId, e.target.value);
            if (r?.error) setError(r.error);
            router.refresh();
          }}
        >
          <option value="TECHNICIAN">Técnico</option>
          <option value="ADMIN">Administrador</option>
        </Select>
        <button
          onClick={async () => {
            if (!confirm("¿Desactivar este usuario? No podrá iniciar sesión.")) return;
            await removeUser(userId);
            router.refresh();
          }}
          className="text-sm font-medium text-rose-600 hover:underline"
        >
          Quitar
        </button>
      </div>
    );
  }

  return null;
}

function InviteForm({
  setError,
  setLoading,
  loading,
  planName,
  onDone,
}: {
  setError: (v: string | null) => void;
  setLoading: (v: boolean) => void;
  loading: boolean;
  planName?: string;
  onDone: () => void;
}) {
  const [form, setForm] = useState({ email: "", role: "TECHNICIAN" });
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        const r = await inviteUser(form);
        if (r?.error) {
          setError(r.error);
          setLoading(false);
        } else {
          setForm({ email: "", role: "TECHNICIAN" });
          setLoading(false);
          onDone();
        }
      }}
      className="grid gap-3 sm:grid-cols-3"
    >
      <div className="sm:col-span-1">
        <Field label="Correo del miembro">
          <Input type="email" required placeholder="correo@empresa.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </Field>
      </div>
      <div>
        <Field label="Rol">
          <Select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
            <option value="TECHNICIAN">Técnico</option>
            <option value="ADMIN">Administrador</option>
          </Select>
        </Field>
      </div>
      <div className="flex items-end">
        <Button type="submit" loading={loading} className="btn-primary w-full">Enviar invitación</Button>
      </div>
      {planName && <p className="text-xs text-slate-400 sm:col-span-3">El invitado recibirá un correo con el enlace para crear su cuenta.</p>}
    </form>
  );
}
