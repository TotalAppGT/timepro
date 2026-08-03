"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { registerUser } from "./actions";
import { Input, Button, Field, Alert } from "@/components/ui";

export function RegisterForm() {
  const params = useSearchParams();
  const defaultPlan = params.get("plan") || "BASIC";
  const [plan, setPlan] = useState(defaultPlan);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const res = await registerUser({
      name: String(fd.get("name") || ""),
      company: String(fd.get("company") || ""),
      email: String(fd.get("email") || ""),
      phone: String(fd.get("phone") || ""),
      password: String(fd.get("password") || ""),
      plan,
    });
    if (res?.error) {
      setError(res.error);
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <Alert kind="error">{error}</Alert>}

      <div className="grid grid-cols-3 gap-1 rounded-xl bg-slate-800 p-1">
        {[
          { code: "BASIC", label: "Básico" },
          { code: "PRO", label: "Pro" },
          { code: "ENTERPRISE", label: "Empresa" },
        ].map((p) => (
          <button
            key={p.code}
            type="button"
            onClick={() => setPlan(p.code)}
            className={`rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
              plan === p.code ? "bg-brand-600 text-white" : "text-slate-300 hover:text-white"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>
      <p className="text-xs text-slate-400">Empiezas en el plan {plan} con 14 días gratis. Lo pruebas y decides.</p>

      <Field label="Tu nombre completo">
        <Input name="name" required placeholder="Ej: Juan Pérez" />
      </Field>
      <Field label="Nombre de tu empresa">
        <Input name="company" required placeholder="Ej: Instalaciones Pérez, S.A." />
      </Field>
      <Field label="Correo electrónico">
        <Input name="email" type="email" required placeholder="correo@empresa.com" />
      </Field>
      <Field label="Teléfono (WhatsApp)" hint="Para avisos y soporte">
        <Input name="phone" placeholder="502 0000 0000" />
      </Field>
      <Field label="Contraseña" hint="Mínimo 8 caracteres">
        <Input name="password" type="password" required minLength={8} placeholder="••••••••" />
      </Field>

      <Button type="submit" loading={loading} className="btn-primary w-full py-3">
        Crear cuenta gratis
      </Button>
      <p className="text-center text-xs text-slate-500">Prueba gratis de 14 días · Sin tarjeta · Cancela cuando quieras</p>
    </form>
  );
}
