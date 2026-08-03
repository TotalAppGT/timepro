"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateProjectStatus, deleteProject } from "@/app/app/actions";
import { Button, Alert } from "@/components/ui";

export function ProjectActions({ projectId, status }: { projectId: string; status: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function changeStatus(next: string) {
    setLoading(true);
    setError(null);
    const m = await import("@/app/app/actions");
    const r = await m.updateProjectStatus(projectId, next);
    if (r?.error) setError(r.error);
    router.refresh();
    setLoading(false);
  }

  async function remove() {
    if (!confirm("¿Seguro que quieres eliminar este proyecto? Las órdenes quedarán sin proyecto.")) return;
    await deleteProject(projectId);
    router.push("/app/proyectos");
    router.refresh();
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {error && <Alert kind="error">{error}</Alert>}
      <span className="mr-2 text-xs font-semibold uppercase tracking-wider text-slate-400">Cambiar estado:</span>
      {["PLANIFICADO", "EN_PROGRESO", "PENDIENTE_ENTREGA", "COMPLETADO", "CANCELADO"].map((s) => (
        <Button
          key={s}
          type="button"
          onClick={() => changeStatus(s)}
          disabled={loading}
          className={status === s ? "btn-primary text-xs" : "btn-secondary text-xs"}
        >
          {s === "PLANIFICADO" ? "Planificado" : s === "EN_PROGRESO" ? "En progreso" : s === "PENDIENTE_ENTREGA" ? "Pend. entrega" : s === "COMPLETADO" ? "Completado" : "Cancelado"}
        </Button>
      ))}
      <button onClick={remove} className="ml-auto text-sm font-medium text-rose-600 hover:underline">Eliminar proyecto</button>
    </div>
  );
}
