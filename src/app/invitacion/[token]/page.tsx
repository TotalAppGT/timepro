import { notFound } from "next/navigation";
import Link from "next/link";
import { Timer } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { InviteAcceptForm } from "./InviteAcceptForm";

export const metadata = { title: "Aceptar invitación" };

export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  const invite = await prisma.invite.findUnique({
    where: { token },
    include: { organization: { select: { name: true } } },
  });

  if (!invite || invite.status !== "PENDING" || invite.expiresAt < new Date()) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
        <div className="w-full max-w-sm rounded-3xl border border-slate-800 bg-slate-900 p-8 text-center">
          <h1 className="text-xl font-bold text-white">Invitación no válida</h1>
          <p className="mt-2 text-sm text-slate-400">Esta invitación expiró o ya fue utilizada. Pide a tu empresa que te envíe una nueva.</p>
          <Link href="/" className="btn-primary mt-6 w-full">Ir al inicio</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-brand-600/20 blur-3xl" />
      </div>
      <div className="relative w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-600 text-white">
            <Timer className="h-6 w-6" />
          </span>
          <h1 className="mt-4 text-2xl font-bold text-white">
            Te invitaron a <span className="text-brand-400">{invite.organization.name}</span>
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Como {invite.role === "ADMIN" ? "administrador" : "técnico"} en TimePro. Crea tu cuenta para empezar.
          </p>
        </div>
        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-7 shadow-2xl backdrop-blur">
          <InviteAcceptForm token={token} email={invite.email} />
        </div>
      </div>
    </main>
  );
}
