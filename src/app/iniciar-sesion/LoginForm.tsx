"use client";

import { useState } from "react";
import { loginUser } from "./actions";
import { Input, Button, Field, Alert } from "@/components/ui";

export function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const res = await loginUser({
      email: String(fd.get("email") || ""),
      password: String(fd.get("password") || ""),
    });
    if (res?.error) {
      setError(res.error);
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <Alert kind="error">{error}</Alert>}
      <Field label="Correo electrónico">
        <Input name="email" type="email" required placeholder="correo@empresa.com" autoComplete="email" />
      </Field>
      <Field label="Contraseña">
        <Input name="password" type="password" required placeholder="••••••••" autoComplete="current-password" />
      </Field>
      <Button type="submit" loading={loading} className="btn-primary w-full py-3">
        Entrar
      </Button>
    </form>
  );
}
