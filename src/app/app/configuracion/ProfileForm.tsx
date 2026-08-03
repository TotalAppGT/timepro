"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateProfile, changePassword } from "@/app/app/actions";
import { Input, Button, Field, Alert } from "@/components/ui";

export function ProfileForm({ user }: { user: any }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);

  async function handleProfile(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setOk(false);
    const fd = new FormData(e.currentTarget);
    const res = await updateProfile({ name: String(fd.get("name") || ""), phone: String(fd.get("phone") || "") });
    if (res?.error) setError(res.error);
    else setOk(true);
    setLoading(false);
    router.refresh();
  }

  async function handlePassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPwLoading(true);
    setError(null);
    setOk(false);
    const fd = new FormData(e.currentTarget);
    const res = await changePassword({
      current: String(fd.get("current") || ""),
      next: String(fd.get("next") || ""),
    });
    if (res?.error) setError(res.error);
    else {
      setOk(true);
      (e.target as HTMLFormElement).reset();
    }
    setPwLoading(false);
  }

  return (
    <div className="space-y-6">
      {error && <Alert kind="error">{error}</Alert>}
      {ok && <Alert kind="success">Guardado correctamente.</Alert>}

      <form onSubmit={handleProfile} className="card space-y-4 p-6">
        <h2 className="text-sm font-bold text-slate-900">Tu perfil</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nombre">
            <Input name="name" required defaultValue={user.name} />
          </Field>
          <Field label="Teléfono">
            <Input name="phone" defaultValue={user.phone || ""} />
          </Field>
        </div>
        <div className="flex justify-end">
          <Button type="submit" loading={loading} className="btn-primary">Guardar perfil</Button>
        </div>
      </form>

      <form onSubmit={handlePassword} className="card space-y-4 p-6">
        <h2 className="text-sm font-bold text-slate-900">Cambiar contraseña</h2>
        <Field label="Contraseña actual">
          <Input name="current" type="password" required />
        </Field>
        <Field label="Nueva contraseña" hint="Mínimo 8 caracteres">
          <Input name="next" type="password" required minLength={8} />
        </Field>
        <div className="flex justify-end">
          <Button type="submit" loading={pwLoading} className="btn-primary">Cambiar contraseña</Button>
        </div>
      </form>
    </div>
  );
}
