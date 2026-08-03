"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { acceptInvite } from "@/app/app/actions";
import { Input, Button, Field, Alert } from "@/components/ui";

export function InviteAcceptForm({ token, email }: { token: string; email: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const r = await acceptInvite(token, {
      name: String(fd.get("name") || ""),
      email: String(fd.get("email") || ""),
      password: String(fd.get("password") || ""),
    });
    if (r?.error) {
      setError(r.error);
      setLoading(false);
    } else {
      router.push("/iniciar-sesion");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <Alert kind="error">{error}</Alert>}
      <Field label="Tu nombre completo">
        <Input name="name" required placeholder="Ej: Pedro González" />
      </Field>
      <Field label="Correo electrónico">
        <Input name="email" type="email" required defaultValue={email} />
      </Field>
      <Field label="Crea una contraseña" hint="Mínimo 8 caracteres">
        <Input name="password" type="password" required minLength={8} />
      </Field>
      <Button type="submit" loading={loading} className="btn-primary w-full py-3">
        Crear cuenta y unirme
      </Button>
    </form>
  );
}
