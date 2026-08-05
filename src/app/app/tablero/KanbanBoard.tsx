"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { moveWorkOrderKanban } from "@/app/app/actions";
import { STATUS_LABELS, WORKORDER_TYPES, formatDate } from "@/lib/utils";

export interface CardData {
  id: string;
  code: string;
  title: string;
  type: string;
  status: string;
  priority: string;
  scheduledAt: string | null;
  customerName: string | null;
  assignedName: string | null;
}

const COLUMNS: { status: string; accent: string }[] = [
  { status: "PENDIENTE", accent: "#0284c7" },
  { status: "EN_RUTA", accent: "#ea580c" },
  { status: "EN_EJECUCION", accent: "#d97706" },
  { status: "REVISION", accent: "#7c3aed" },
  { status: "COMPLETADO", accent: "#059669" },
  { status: "CANCELADO", accent: "#e11d48" },
];

const PRIORITY = {
  BAJA: { label: "Baja", cls: "bg-slate-100 text-slate-600" },
  MEDIA: { label: "Media", cls: "bg-sky-100 text-sky-700" },
  ALTA: { label: "Alta", cls: "bg-amber-100 text-amber-700" },
  URGENTE: { label: "Urgente", cls: "bg-rose-100 text-rose-700" },
} as const;

export default function KanbanBoard({ initial }: { initial: CardData[] }) {
  const router = useRouter();
  const [cards, setCards] = useState<CardData[]>(initial);
  const [dragging, setDragging] = useState<string | null>(null);

  const grouped = COLUMNS.map((col) => ({
    ...col,
    items: cards.filter((c) => c.status === col.status),
  }));

  async function onDrop(status: string) {
    if (!dragging) return;
    const card = cards.find((c) => c.id === dragging);
    if (!card || card.status === status) {
      setDragging(null);
      return;
    }
    const prev = card.status;
    setCards((cs) => cs.map((c) => (c.id === dragging ? { ...c, status } : c)));
    setDragging(null);
    const r = await moveWorkOrderKanban(dragging, status);
    if (r?.error) {
      setCards((cs) => cs.map((c) => (c.id === dragging ? { ...c, status: prev } : c)));
    }
    router.refresh();
  }

  return (
    <div className="grid auto-cols-[15rem] grid-flow-col gap-3 overflow-x-auto pb-4 lg:auto-cols-[17rem]">
      {grouped.map((col) => (
        <div
          key={col.status}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => onDrop(col.status)}
          className={`flex min-h-[70vh] flex-col rounded-2xl bg-slate-100 p-2.5 ${dragging ? "ring-2 ring-brand-400/60" : ""}`}
        >
          <div className="mb-2 flex items-center justify-between px-1">
            <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
              <span className="h-2 w-2 rounded-full" style={{ background: col.accent }} />
              {STATUS_LABELS[col.status]}
            </span>
            <span className="grid h-5 min-w-5 place-items-center rounded-full bg-white px-1.5 text-[11px] font-bold text-slate-600">
              {col.items.length}
            </span>
          </div>

          <div className="flex flex-1 flex-col gap-2">
            {col.items.length === 0 && (
              <div className="grid flex-1 place-items-center rounded-xl border-2 border-dashed border-slate-200 py-8 text-xs text-slate-400">
                Sin órdenes
              </div>
            )}
            {col.items.map((card) => (
              <div
                key={card.id}
                draggable
                onDragStart={() => setDragging(card.id)}
                onDragEnd={() => setDragging(null)}
                className={`cursor-grab rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition-all hover:shadow-md active:cursor-grabbing ${
                  dragging === card.id ? "opacity-40" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <Link href={`/app/ordenes/${card.id}`} className="min-w-0 text-sm font-semibold text-slate-800 hover:text-brand-700">
                    {card.code}
                  </Link>
                  <span className={`badge shrink-0 ${PRIORITY[card.priority as keyof typeof PRIORITY]?.cls ?? "bg-slate-100 text-slate-600"}`}>
                    {PRIORITY[card.priority as keyof typeof PRIORITY]?.label ?? card.priority}
                  </span>
                </div>
                <p className="mt-1 line-clamp-2 text-xs text-slate-600">{card.title}</p>
                <div className="mt-2 space-y-0.5 text-[11px] text-slate-400">
                  <p>{WORKORDER_TYPES[card.type] || card.type}</p>
                  {card.customerName && <p className="truncate">Cliente: {card.customerName}</p>}
                  {card.assignedName && <p className="truncate">Técnico: {card.assignedName}</p>}
                  {card.scheduledAt && <p>Programada: {formatDate(card.scheduledAt)}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}