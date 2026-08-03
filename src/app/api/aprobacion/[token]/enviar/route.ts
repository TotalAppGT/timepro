import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { uploadDataUrl } from "@/lib/uploads";
import { generateDocumentPdf } from "@/lib/pdf/generator";
import { generateCode, formatDateTime } from "@/lib/utils";
import { sendEmail, baseEmailLayout } from "@/lib/email";
import { sendWhatsAppMessage, normalizePhone } from "@/lib/whatsapp";

export const runtime = "nodejs";

export async function POST(req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ ok: false, error: "Solicitud inválida" }, { status: 400 });

  const name = String(body.name || "").trim();
  const signature = String(body.signature || "");
  if (!name || !signature) {
    return NextResponse.json({ ok: false, error: "Nombre y firma son obligatorios" }, { status: 400 });
  }
  const confirmations = Array.isArray(body.confirmations) ? body.confirmations.map(String) : [];
  if (confirmations.length === 0) {
    return NextResponse.json({ ok: false, error: "Marca al menos una confirmación" }, { status: 400 });
  }

  const [wo, pj] = await Promise.all([
    prisma.workOrder.findUnique({ where: { publicToken: token }, include: { organization: true, customer: true, project: true, assignedTo: true } }),
    prisma.project.findUnique({ where: { publicToken: token }, include: { organization: true, customer: true } }),
  ]);

  const entity = wo ?? pj;
  if (!entity) return NextResponse.json({ ok: false, error: "Solicitud de aprobación no encontrada" }, { status: 404 });

  const org = entity.organization;
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null;
  const userAgent = req.headers.get("user-agent") || null;

  const stored = await uploadDataUrl(signature, `orgs/${org.id}/signatures`);

  const role = String(body.role || "CLIENTE");
  const comments = String(body.comments || "").trim() || null;

  const sig = await prisma.signature.create({
    data: {
      organizationId: org.id,
      workOrderId: wo?.id ?? null,
      projectId: pj?.id ?? null,
      signerName: name,
      signerDni: body.dni ? String(body.dni) : null,
      signerRole: role,
      signerEmail: body.email ? String(body.email).trim() : null,
      formData: { confirmations, comments, formVersion: 1 },
      comments,
      imageUrl: stored.url,
      ip,
      userAgent,
    },
  });

  // Actualizar estado
  if (wo) {
    await prisma.workOrder.update({ where: { id: wo.id }, data: { status: "COMPLETADO", completedAt: new Date() } });
  }
  if (pj) {
    await prisma.project.update({ where: { id: pj.id }, data: { status: "COMPLETADO", progress: 100 } });
  }

  // Generar acta de conformidad (PDF)
  const docData = {
    code: generateCode(org.invoicePrefix || "TP"),
    date: formatDateTime(new Date()),
    scheduledAt: wo?.scheduledAt ? formatDateTime(wo.scheduledAt) : undefined,
    title: wo?.title ?? pj!.name,
    description: wo?.description ?? pj!.description ?? undefined,
    clientName: wo?.customer?.name ?? pj?.customer?.name,
    clientNit: (wo?.customer?.nit ?? pj?.customer?.nit) || undefined,
    clientAddress: (wo?.address ?? pj?.customer?.address) || undefined,
    clientPhone: (wo?.customer?.phone ?? pj?.customer?.phone) || undefined,
    projectName: wo?.project?.name,
    projectCode: wo?.project?.code,
    assignedTo: wo?.assignedTo?.name,
    total: wo?.totalAmount ? Number(wo.totalAmount) : undefined,
    signatures: [
      {
        name,
        role,
        signedAt: formatDateTime(sig.signedAt),
        imageUrl: stored.url,
      },
    ],
    notes: comments || undefined,
  };

  let pdf: Uint8Array | null = null;
  try {
    pdf = await generateDocumentPdf({
      org: {
        id: org.id,
        name: org.name,
        nit: org.nit || undefined,
        address: org.address || undefined,
        phone: org.phone || undefined,
        brandColor: org.brandColor,
        logoUrl: org.logoUrl || undefined,
        invoicePrefix: org.invoicePrefix,
      },
      docType: wo ? "ACTA_ENTREGA" : "ACTA_ACEPTACION",
      data: docData,
    });
  } catch {
    pdf = null;
  }

  const doc = pdf
    ? await prisma.document.create({
        data: {
          organizationId: org.id,
          workOrderId: wo?.id ?? null,
          projectId: pj?.id ?? null,
          customerId: (wo?.customerId ?? pj?.customerId) || null,
          type: wo ? "ACTA_ENTREGA" : "ACTA_ACEPTACION",
          title: `Acta de ${wo ? "entrega" : "aceptación"} — ${wo?.title ?? pj!.name}`,
          number: docData.code,
          data: docData as unknown as object,
          pdfData: Buffer.from(pdf),
        },
      })
    : null;

  // Notificaciones
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  if (org.notifyEmail) {
    const admins = await prisma.user.findMany({
      where: { organizationId: org.id, role: { in: ["OWNER", "ADMIN"] } },
      select: { email: true, name: true },
    });
    for (const a of admins) {
      sendEmail({
        to: a.email,
        subject: `Aprobación firmada · ${wo?.title ?? pj!.name}`,
        html: baseEmailLayout(
          "Aprobación capturada ✍️",
          `<p>La ${wo ? "orden" : "proyecto"} <strong>${wo?.code ?? pj!.code}</strong> fue aprobado por <strong>${name}</strong> desde el portal del cliente.</p>${doc ? `<p><a href="${appUrl}/app/documentos/${doc.id}">Ver acta</a></p>` : ""}`
        ),
      }).catch(() => {});
    }
  }

  if (org.notifyWhatsApp && org.whatsappPhone) {
    sendWhatsAppMessage({
      to: normalizePhone(org.whatsappPhone),
      body: `✅ TimePro: ${wo ? `Orden ${wo.code}` : `Proyecto ${pj!.code}`} aprobado por ${name}.${doc ? ` Acta: ${appUrl}/app/documentos/${doc.id}` : ""}`,
    }).catch(() => {});
  }

  // Copia al cliente si dio correo
  if (body.email && doc) {
    sendEmail({
      to: String(body.email).trim(),
      subject: `Tu acta firmada · ${wo?.title ?? pj!.name}`,
      html: baseEmailLayout("Acta firmada", `<p>Gracias por aprobar el servicio. Tu acta de ${wo ? "entrega" : "aceptación"} está disponible:</p><p><a href="${appUrl}/aprobacion/${token}">Ver mi confirmación</a></p>`),
    }).catch(() => {});
  }

  return NextResponse.json({ ok: true, id: sig.id });
}
