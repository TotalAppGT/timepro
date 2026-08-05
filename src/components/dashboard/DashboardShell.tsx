"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  ClipboardList,
  FileText,
  Settings,
  CreditCard,
  LogOut,
  Menu,
  X,
  Timer,
  Sparkles,
  Inbox,
  Columns3,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { logoutUser } from "@/app/iniciar-sesion/actions";
import { PLANS, formatQ } from "@/lib/plans";

const NAV = [
  { href: "/app", label: "Inicio", icon: LayoutDashboard, exact: true },
  { href: "/app/pendientes", label: "Mis pendientes", icon: Inbox },
  { href: "/app/tablero", label: "Tablero", icon: Columns3 },
  { href: "/app/proyectos", label: "Proyectos", icon: FolderKanban },
  { href: "/app/clientes", label: "Clientes", icon: Users },
  { href: "/app/ordenes", label: "Órdenes de trabajo", icon: ClipboardList },
  { href: "/app/documentos", label: "Documentos", icon: FileText },
  { href: "/app/equipo", label: "Equipo", icon: Users },
  { href: "/app/configuracion", label: "Configuración", icon: Settings },
  { href: "/app/suscripcion", label: "Suscripción", icon: CreditCard },
];

interface ShellProps {
  orgName: string;
  userName: string;
  userEmail: string;
  userRole: string;
  isOwner: boolean;
  planCode: string;
  subscriptionStatus: string;
  trialEndsAt: Date | null;
  pendingOrders: number;
  children: React.ReactNode;
}

function daysLeft(date: Date | null): number {
  if (!date) return 0;
  return Math.max(0, Math.ceil((new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
}

export function DashboardShell({
  orgName,
  userName,
  userEmail: _userEmail,
  userRole,
  isOwner,
  planCode,
  subscriptionStatus,
  trialEndsAt,
  pendingOrders,
  children,
}: ShellProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const plan = PLANS.find((p) => p.code === planCode) ?? PLANS[0];
  const trialDays = daysLeft(trialEndsAt);
  const inTrial = subscriptionStatus === "TRIAL";

  const SidebarContent = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 px-5 py-5">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-600 text-white">
          <Timer className="h-5 w-5" />
        </span>
        <div className="leading-tight">
          <p className="font-bold text-white">Time<span className="text-brand-400">Pro</span></p>
          <p className="max-w-[130px] truncate text-xs text-slate-400">{orgName}</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-2">
        {NAV.map((item) => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                active ? "bg-brand-600 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"
              )}
            >
              <item.icon className="h-4.5 w-4.5 h-[18px] w-[18px]" />
              <span className="flex-1">{item.label}</span>
              {item.href === "/app/suscripcion" && pendingOrders > 0 && (
                <span className="grid h-5 min-w-5 place-items-center rounded-full bg-amber-500 px-1 text-[10px] font-bold text-slate-950">
                  {pendingOrders}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-3 px-3 py-4">
        {inTrial && (
          <div className="rounded-xl border border-brand-500/40 bg-slate-900 p-3">
            <p className="flex items-center gap-1.5 text-xs font-semibold text-brand-300">
              <Sparkles className="h-3.5 w-3.5" /> Prueba gratis
            </p>
            <p className="mt-1 text-xs text-slate-400">
              {trialDays > 0 ? `Te quedan ${trialDays} días.` : "Tu prueba terminó."}
            </p>
            <Link href="/app/suscripcion" className="mt-2 block text-center rounded-lg bg-brand-600 px-2 py-1.5 text-xs font-semibold text-white hover:bg-brand-500">
              {trialDays > 0 ? "Ver planes" : "Activar plan"}
            </Link>
          </div>
        )}
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-3">
          <p className="text-xs font-semibold text-slate-300">Plan {plan.name}</p>
          <p className="mt-0.5 text-xs text-slate-500">{inTrial ? "Prueba activa" : `${formatQ(plan.priceMonthly)}/mes`}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-slate-100">
      {/* Sidebar desktop */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 bg-slate-950 lg:block">{SidebarContent}</aside>

      {/* Sidebar móvil */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-slate-950/60" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-64 bg-slate-950 shadow-2xl animate-fade-in">{SidebarContent}</aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col lg:pl-64">
        {/* Topbar */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-4 border-b border-slate-200 bg-white/90 px-4 backdrop-blur sm:px-6">
          <div className="flex items-center gap-3">
            <button className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden" onClick={() => setOpen(true)}>
              <Menu className="h-5 w-5" />
            </button>
            <div className="hidden sm:block">
              <p className="text-sm font-semibold text-slate-900">{orgName}</p>
              <p className="text-xs text-slate-400">{userRole === "OWNER" ? "Propietario" : userRole === "ADMIN" ? "Administrador" : "Técnico"}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isOwner && (
              <Link href="/app/suscripcion" className="hidden rounded-xl border border-brand-200 bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700 hover:bg-brand-100 sm:block">
                {inTrial ? `Prueba gratis · ${trialDays} días` : `Plan ${plan.name}`}
              </Link>
            )}
            <button
              onClick={() => logoutUser()}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
              title="Cerrar sesión"
            >
              <span className="hidden sm:inline">{userName.split(" ")[0]}</span>
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl flex-1 p-4 sm:p-6">{children}</main>
        <X className="hidden" />
      </div>
    </div>
  );
}
