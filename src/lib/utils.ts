import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

export function generateCode(prefix: string): string {
  const date = new Date();
  const y = date.getFullYear().toString().slice(-2);
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${prefix}-${y}${m}-${rand}`;
}

export function generateToken(bytes = 20): string {
  const arr = new Uint8Array(bytes);
  if (typeof crypto !== "undefined" && "getRandomValues" in crypto) {
    crypto.getRandomValues(arr);
  } else {
    for (let i = 0; i < bytes; i++) arr[i] = Math.floor(Math.random() * 256);
  }
  return Array.from(arr, (b) => b.toString(16).padStart(2, "0")).join("");
}

export function formatDate(d: Date | string | null | undefined): string {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("es-GT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatQ(amount: number | string | { toString(): string } | null | undefined): string {
  const n = typeof amount === "object" && amount !== null && "toString" in amount ? Number(amount.toString()) : (amount as number | string | null | undefined);
  if (n === null || n === undefined || Number.isNaN(Number(n))) return "Q 0.00";
  return new Intl.NumberFormat("es-GT", {
    style: "currency",
    currency: "GTQ",
  }).format(Number(n));
}

export function formatDateTime(d: Date | string | null | undefined): string {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleString("es-GT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function daysUntil(d: Date | string | null | undefined): number | null {
  if (!d) return null;
  const date = typeof d === "string" ? new Date(d) : d;
  return Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

export function timeAgo(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "hace un momento";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `hace ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `hace ${days} días`;
  const months = Math.floor(days / 30);
  return `hace ${months} meses`;
}

export const STATUS_LABELS: Record<string, string> = {
  PLANIFICADO: "Planificado",
  EN_PROGRESO: "En progreso",
  PENDIENTE_ENTREGA: "Pendiente de entrega",
  COMPLETADO: "Completado",
  CANCELADO: "Cancelado",
  PENDIENTE: "Pendiente",
  EN_RUTA: "En ruta",
  EN_EJECUCION: "En ejecución",
  REVISION: "En revisión",
  PAID: "Pagado",
  PENDING: "Pendiente",
};

export const STATUS_ORDER: string[] = ["PENDIENTE", "EN_RUTA", "EN_EJECUCION", "REVISION", "COMPLETADO", "CANCELADO"];

export const STATUS_COLORS: Record<string, string> = {
  PLANIFICADO: "bg-sky-100 text-sky-700",
  EN_PROGRESO: "bg-amber-100 text-amber-700",
  PENDIENTE_ENTREGA: "bg-violet-100 text-violet-700",
  COMPLETADO: "bg-emerald-100 text-emerald-700",
  CANCELADO: "bg-rose-100 text-rose-700",
  PENDIENTE: "bg-sky-100 text-sky-700",
  EN_RUTA: "bg-orange-100 text-orange-700",
  EN_EJECUCION: "bg-amber-100 text-amber-700",
  REVISION: "bg-violet-100 text-violet-700",
  PAID: "bg-emerald-100 text-emerald-700",
  PENDING: "bg-amber-100 text-amber-700",
};

export const WORKORDER_TYPES: Record<string, string> = {
  INSTALACION: "Instalación",
  ENTREGA: "Entrega",
  MANTENIMIENTO: "Mantenimiento",
  REPARACION: "Reparación",
  SERVICIO: "Servicio",
  VISITA: "Visita técnica",
};

export function errorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return "Ocurrió un error inesperado";
}

export function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}
