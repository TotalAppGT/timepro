"use client";

import { useState } from "react";
import { sendContactMessage } from "./actions";
import { Input, Textarea, Button, Field, Alert } from "@/components/ui";

export function ContactForm() {
  const [state, setState] = useState<{ ok?: boolean; error?: string }>({});
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setState({});
    const fd = new FormData(e.currentTarget);
    const res = await sendContactMessage({
      name: String(fd.get("name") || ""),
      email: String(fd.get("email") || ""),
      phone: String(fd.get("phone") || ""),
      message: String(fd.get("message") || ""),
    });
    setState(res);
    setLoading(false);
    if (res.ok) (e.target as HTMLFormElement).reset();
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
      {state.ok && <div className="mb-4"><Alert kind="success">¡Mensaje enviado! Te responderemos lo antes posible.</Alert></div>}
      {state.error && <div className="mb-4"><Alert kind="error">{state.error}</Alert></div>}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nombre completo">
          <Input name="name" required placeholder="Tu nombre" />
        </Field>
        <Field label="Correo electrónico">
          <Input name="email" type="email" required placeholder="correo@empresa.com" />
        </Field>
      </div>
      <div className="mt-4">
        <Field label="Teléfono (WhatsApp)">
          <Input name="phone" placeholder="502 0000 0000" />
        </Field>
      </div>
      <div className="mt-4">
        <Field label="Mensaje">
          <Textarea name="message" required placeholder="¿En qué te podemos ayudar?" />
        </Field>
      </div>
      <div className="mt-5">
        <Button type="submit" loading={loading} className="btn-primary w-full sm:w-auto">Enviar mensaje</Button>
      </div>
    </form>
  );
}
