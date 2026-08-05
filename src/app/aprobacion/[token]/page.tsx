import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AprobacionForm } from "./AprobacionForm";

export const metadata: Metadata = { title: "Aprobación y firma" };

const DEFAULT_CONFIRMATIONS = [
  "Confirmo que recibí el servicio de forma satisfactoria.",
  "Confirmo que el personal se comportó de forma profesional y puntual.",
  "Autorizo que esta firma electrónica sirva como constancia de aceptación.",
];

export default async function AprobacionPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  const [workOrder, project] = await Promise.all([
    prisma.workOrder.findUnique({
      where: { publicToken: token },
      include: { organization: true, customer: true, assignedTo: true, signatures: { orderBy: { signedAt: "desc" } } },
    }),
    prisma.project.findUnique({
      where: { publicToken: token },
      include: { organization: true, customer: true, signatures: { orderBy: { signedAt: "desc" } } },
    }),
  ]);

  const wo = workOrder;
  const pj = project;
  if (!wo && !pj) notFound();

  const entity = wo ?? pj!;
  const org = entity.organization;
  const signatures = (wo?.signatures ?? pj?.signatures ?? []).map((s) => ({
    name: s.signerName,
    role: s.signerRole,
    signedAt: s.signedAt.toISOString(),
    imageUrl: s.imageUrl,
  }));

  const summary = {
    type: wo ? "ORDEN_DE_TRABAJO" : "PROYECTO",
    code: wo?.code ?? pj!.code,
    title: wo?.title ?? pj!.name,
    description: wo?.description ?? pj!.description,
    customer: wo?.customer?.name ?? pj?.customer?.name,
    phone: wo?.customer?.phone ?? pj?.customer?.phone,
    address: wo?.address ?? pj?.customer?.address,
    assignedTo: wo?.assignedTo?.name,
    scheduledAt: wo?.scheduledAt?.toISOString(),
  };

  const confirmations = DEFAULT_CONFIRMATIONS;

  return (
    <main className="min-h-screen bg-slate-50 py-8 sm:py-12">
      <div className="mx-auto max-w-2xl px-4">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-slate-400">{org.name}</p>
          <h1 className="mt-1 text-2xl font-extrabold text-slate-900 sm:text-3xl">Aprobación y conformidad</h1>
          <p className="mt-2 text-sm text-slate-500">
            {summary.type === "PROYECTO" ? "Acepta y aprueba la entrega del proyecto" : "Confirma la recepción del servicio"} con tu firma digital.
          </p>
        </div>

        <AprobacionForm
          token={token}
          orgName={org.name}
          brandColor={org.brandColor}
          summary={summary}
          confirmations={confirmations}
          signatures={signatures}
          alreadySigned={signatures.length > 0}
        />
      </div>
    </main>
  );
}
