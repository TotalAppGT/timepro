"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession, requireOwner } from "@/lib/auth";
import { getPlan } from "@/lib/plans";
import {
  customerSchema,
  projectSchema,
  workOrderSchema,
  inviteSchema,
  orgSettingsSchema,
  profileSchema,
} from "@/lib/validation";
import { generateCode, generateToken } from "@/lib/utils";
import { logActivity } from "@/lib/activity";
import { buildAndSaveDocument } from "@/lib/documents";
import { generateDocumentPdf } from "@/lib/pdf/generator";
import { sendWorkOrderNotification, sendEmail, baseEmailLayout } from "@/lib/email";
import { sendWhatsAppMessage, normalizePhone } from "@/lib/whatsapp";
import { uploadDataUrl } from "@/lib/uploads";
import { trialDays } from "@/lib/plans";
import bcrypt from "bcryptjs";

// ============================= CLIENTES =============================

export async function createCustomer(input: unknown) {
  const ctx = await requireSession();
  const parsed = customerSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos no válidos" };

  await prisma.customer.create({
    data: {
      name: parsed.data.name,
      company: parsed.data.company,
      nit: parsed.data.nit,
      email: parsed.data.email,
      phone: parsed.data.phone,
      address: parsed.data.address,
      notes: parsed.data.notes,
      customFields: parsed.data.customFields && Object.keys(parsed.data.customFields).length ? parsed.data.customFields : undefined,
      organizationId: ctx.orgId,
    },
  });
  await logActivity({ orgId: ctx.orgId, userId: ctx.id, entityType: "CUSTOMER", action: "CREATE", description: `Cliente creado: ${parsed.data.name}` });
  revalidatePath("/app/clientes");
  return { ok: true };
}

export async function updateCustomer(id: string, input: unknown) {
  const ctx = await requireSession();
  const parsed = customerSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos no válidos" };

  const exists = await prisma.customer.findFirst({ where: { id, organizationId: ctx.orgId } });
  if (!exists) return { error: "Cliente no encontrado" };

  await prisma.customer.update({
    where: { id },
    data: {
      name: parsed.data.name,
      company: parsed.data.company,
      nit: parsed.data.nit,
      email: parsed.data.email,
      phone: parsed.data.phone,
      address: parsed.data.address,
      notes: parsed.data.notes,
      customFields: parsed.data.customFields && Object.keys(parsed.data.customFields).length ? parsed.data.customFields : undefined,
    },
  });
  revalidatePath("/app/clientes");
  return { ok: true };
}

export async function deleteCustomer(id: string) {
  const ctx = await requireSession();
  await prisma.customer.deleteMany({ where: { id, organizationId: ctx.orgId } });
  revalidatePath("/app/clientes");
  return { ok: true };
}

// ============================= PROYECTOS =============================

export async function createProject(input: unknown) {
  const ctx = await requireSession();
  const parsed = projectSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos no válidos" };

  const code = generateCode("PR");
  await prisma.project.create({
    data: {
      organizationId: ctx.orgId,
      code,
      name: parsed.data.name,
      description: parsed.data.description || null,
      customerId: parsed.data.customerId || null,
      status: parsed.data.status,
      priority: parsed.data.priority,
      startDate: parsed.data.startDate ? new Date(parsed.data.startDate) : null,
      dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
      budget: parsed.data.budget ? Number(parsed.data.budget) : null,
      createdById: ctx.id,
    },
  });
  await logActivity({ orgId: ctx.orgId, userId: ctx.id, entityType: "PROJECT", action: "CREATE", description: `Proyecto creado: ${parsed.data.name}` });
  revalidatePath("/app/proyectos");
  return { ok: true };
}

export async function updateProject(id: string, input: unknown) {
  const ctx = await requireSession();
  const parsed = projectSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos no válidos" };

  const exists = await prisma.project.findFirst({ where: { id, organizationId: ctx.orgId } });
  if (!exists) return { error: "Proyecto no encontrado" };

  await prisma.project.update({
    where: { id },
    data: {
      name: parsed.data.name,
      description: parsed.data.description || null,
      customerId: parsed.data.customerId || null,
      status: parsed.data.status,
      priority: parsed.data.priority,
      startDate: parsed.data.startDate ? new Date(parsed.data.startDate) : null,
      dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
      budget: parsed.data.budget ? Number(parsed.data.budget) : null,
    },
  });
  revalidatePath(`/app/proyectos/${id}`);
  revalidatePath("/app/proyectos");
  return { ok: true };
}

export async function deleteProject(id: string) {
  const ctx = await requireSession();
  await prisma.project.deleteMany({ where: { id, organizationId: ctx.orgId } });
  revalidatePath("/app/proyectos");
  return { ok: true };
}

export async function updateProjectStatus(id: string, status: string) {
  const ctx = await requireSession();
  const valid = ["PLANIFICADO", "EN_PROGRESO", "PENDIENTE_ENTREGA", "COMPLETADO", "CANCELADO"];
  if (!valid.includes(status)) return { error: "Estado no válido" };
  await prisma.project.updateMany({ where: { id, organizationId: ctx.orgId }, data: { status } });
  revalidatePath(`/app/proyectos/${id}`);
  revalidatePath("/app/proyectos");
  return { ok: true };
}

// ============================= ÓRDENES DE TRABAJO =============================

export async function createWorkOrder(input: unknown) {
  const ctx = await requireSession();
  const parsed = workOrderSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos no válidos" };

  const code = generateCode("OT");
  const wo = await prisma.workOrder.create({
    data: {
      organizationId: ctx.orgId,
      code,
      title: parsed.data.title,
      type: parsed.data.type,
      projectId: parsed.data.projectId || null,
      customerId: parsed.data.customerId || null,
      assignedToId: parsed.data.assignedToId || null,
      description: parsed.data.description || null,
      priority: parsed.data.priority,
      scheduledAt: parsed.data.scheduledAt ? new Date(parsed.data.scheduledAt) : null,
      address: parsed.data.address || null,
      location: parsed.data.location || null,
      totalAmount: parsed.data.totalAmount ? Number(parsed.data.totalAmount) : null,
      checklist: [],
      photos: [],
      customFields: parsed.data.customFields && Object.keys(parsed.data.customFields).length ? parsed.data.customFields : {},
      publicToken: generateToken(16),
    },
    include: {
      customer: true,
      assignedTo: true,
      project: true,
    },
  });

  await logActivity({ orgId: ctx.orgId, userId: ctx.id, entityType: "WORK_ORDER", entityId: wo.id, action: "CREATE", description: `Orden creada: ${wo.code}` });

  // Notificación al técnico asignado
  if (wo.assignedTo) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    await sendWorkOrderNotification({
      to: wo.assignedTo.email,
      name: wo.assignedTo.name,
      workOrderTitle: wo.title,
      code: wo.code,
      detailUrl: `${appUrl}/app/ordenes/${wo.id}`,
    }).catch(() => {});
    const org = await prisma.organization.findUnique({ where: { id: ctx.orgId } });
    if (org?.notifyWhatsApp && wo.assignedTo.phone) {
      sendWhatsAppMessage({
        to: normalizePhone(wo.assignedTo.phone),
        body: `🔧 TimePro: Tienes una nueva orden de trabajo ${wo.code}: ${wo.title}.`,
      }).catch(() => {});
    }
  }

  revalidatePath("/app/ordenes");
  return { ok: true, id: wo.id };
}

export async function updateWorkOrder(id: string, input: unknown) {
  const ctx = await requireSession();
  const parsed = workOrderSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos no válidos" };

  const exists = await prisma.workOrder.findFirst({ where: { id, organizationId: ctx.orgId } });
  if (!exists) return { error: "Orden no encontrada" };

  await prisma.workOrder.update({
    where: { id },
    data: {
      title: parsed.data.title,
      type: parsed.data.type,
      projectId: parsed.data.projectId || null,
      customerId: parsed.data.customerId || null,
      assignedToId: parsed.data.assignedToId || null,
      description: parsed.data.description || null,
      priority: parsed.data.priority,
      scheduledAt: parsed.data.scheduledAt ? new Date(parsed.data.scheduledAt) : null,
      address: parsed.data.address || null,
      location: parsed.data.location || null,
      totalAmount: parsed.data.totalAmount ? Number(parsed.data.totalAmount) : null,
      customFields: parsed.data.customFields && Object.keys(parsed.data.customFields).length ? parsed.data.customFields : {},
    },
  });
  revalidatePath(`/app/ordenes/${id}`);
  revalidatePath("/app/ordenes");
  return { ok: true };
}

export async function updateWorkOrderStatus(id: string, status: string) {
  const ctx = await requireSession();
  const valid = ["PENDIENTE", "EN_RUTA", "EN_EJECUCION", "REVISION", "COMPLETADO", "CANCELADO"];
  if (!valid.includes(status)) return { error: "Estado no válido" };

  await prisma.workOrder.update({
    where: { id },
    data: {
      status,
      ...(status === "COMPLETADO" ? { completedAt: new Date() } : {}),
    },
  });
  await logActivity({ orgId: ctx.orgId, userId: ctx.id, entityType: "WORK_ORDER", entityId: id, action: "STATUS", description: `Estado cambiado a ${status}` });
  revalidatePath(`/app/ordenes/${id}`);
  revalidatePath("/app/ordenes");
  revalidatePath("/app/tablero");
  revalidatePath("/app/pendientes");
  return { ok: true };
}

// ============================= TABLERO KANBAN =============================

export async function moveWorkOrderKanban(id: string, status: string) {
  const ctx = await requireSession();
  const valid = ["PENDIENTE", "EN_RUTA", "EN_EJECUCION", "REVISION", "COMPLETADO", "CANCELADO"];
  if (!valid.includes(status)) return { error: "Estado no válido" };

  const exists = await prisma.workOrder.findFirst({ where: { id, organizationId: ctx.orgId } });
  if (!exists) return { error: "Orden no encontrada" };

  await prisma.workOrder.update({
    where: { id },
    data: {
      status,
      ...(status === "COMPLETADO" ? { completedAt: new Date() } : {}),
    },
  });
  await logActivity({ orgId: ctx.orgId, userId: ctx.id, entityType: "WORK_ORDER", entityId: id, action: "STATUS", description: `Orden ${exists.code} movida a ${status}` });
  revalidatePath("/app/tablero");
  revalidatePath("/app/ordenes");
  revalidatePath("/app/pendientes");
  return { ok: true };
}

// ============================= CAMPOS PERSONALIZADOS =============================

export async function getCustomFields(entityType: string) {
  const ctx = await requireSession();
  if (!["WORK_ORDER", "CUSTOMER"].includes(entityType)) return { fields: [] };
  const fields = await prisma.customFieldDef.findMany({
    where: { organizationId: ctx.orgId, entityType, active: true },
    orderBy: { position: "asc" },
  });
  return { fields };
}

export async function saveCustomFieldDefs(input: {
  entityType: string;
  fields: { id?: string; label: string; type: string; options?: string[]; required: boolean; position: number; active: boolean }[];
}) {
  const ctx = await requireOwner();
  if (!["WORK_ORDER", "CUSTOMER"].includes(input.entityType)) return { error: "Tipo no válido" };

  const existing = await prisma.customFieldDef.findMany({
    where: { organizationId: ctx.orgId, entityType: input.entityType },
    select: { id: true },
  });
  const existingIds = new Set(existing.map((e) => e.id));
  const submittedIds = new Set(input.fields.map((f) => f.id).filter(Boolean) as string[]);

  // Marcar como inactivos los que ya no están
  for (const e of existing) {
    if (!submittedIds.has(e.id)) {
      await prisma.customFieldDef.update({ where: { id: e.id }, data: { active: false } });
    }
  }

  for (const f of input.fields) {
    const options = f.type === "SELECT" ? (f.options ?? []).filter(Boolean) : undefined;
    if (f.id && existingIds.has(f.id)) {
      await prisma.customFieldDef.update({
        where: { id: f.id },
        data: { label: f.label, type: f.type, options, required: f.required, position: f.position, active: true },
      });
    } else {
      await prisma.customFieldDef.create({
        data: {
          organizationId: ctx.orgId,
          entityType: input.entityType,
          label: f.label,
          type: f.type,
          options,
          required: f.required,
          position: f.position,
          active: true,
        },
      });
    }
  }

  revalidatePath("/app/configuracion");
  return { ok: true };
}

export async function saveWorkOrderExecution(
  id: string,
  input: { checklist?: { text: string; done: boolean }[]; notes?: string; photos?: string[] }
) {
  const ctx = await requireSession();
  const plan = getPlan(ctx.planCode);
  const photos = (input.photos ?? []).slice(0, plan.maxPhotos);

  const wo = await prisma.workOrder.findFirst({ where: { id, organizationId: ctx.orgId } });
  if (!wo) return { error: "Orden no encontrada" };

  // Guardar fotos (base64 -> data URL) 
  const storedPhotos: string[] = [];
  for (const photo of photos) {
    const stored = await uploadDataUrl(photo, `orgs/${ctx.orgId}/photos`);
    storedPhotos.push(stored.url);
  }

  const previous = (wo.photos as string[]) ?? [];
  const merged = [...previous, ...storedPhotos].slice(0, plan.maxPhotos);

  await prisma.workOrder.update({
    where: { id },
    data: {
      checklist: input.checklist ?? [],
      description: input.notes && input.notes.trim() ? input.notes : wo.description,
      photos: merged,
    },
  });
  await logActivity({ orgId: ctx.orgId, userId: ctx.id, entityType: "WORK_ORDER", entityId: id, action: "EXECUTION", description: "Ejecución actualizada" });
  revalidatePath(`/app/ordenes/${id}`);
  return { ok: true };
}

export async function addSignature(
  workOrderId: string,
  input: { signerName: string; signerDni?: string; signerRole: string; signerEmail?: string; imageUrl: string }
) {
  const ctx = await requireSession();
  const wo = await prisma.workOrder.findFirst({ where: { id: workOrderId, organizationId: ctx.orgId } });
  if (!wo) return { error: "Orden no encontrada" };

  const stored = await uploadDataUrl(input.imageUrl, `orgs/${ctx.orgId}/signatures`);

  const sig = await prisma.signature.create({
    data: {
      organizationId: ctx.orgId,
      workOrderId,
      userId: ctx.id,
      signerName: input.signerName,
      signerDni: input.signerDni || null,
      signerRole: input.signerRole,
      signerEmail: input.signerEmail || null,
      imageUrl: stored.url,
      ip: null,
      userAgent: null,
    },
  });

  await prisma.workOrder.update({ where: { id: workOrderId }, data: { status: "COMPLETADO", completedAt: new Date() } });

  await logActivity({
    orgId: ctx.orgId,
    userId: ctx.id,
    entityType: "WORK_ORDER",
    entityId: workOrderId,
    action: "SIGNATURE",
    description: `Firma capturada de ${input.signerName}`,
  });

  // Notificar al propietario/administradores
  const org = await prisma.organization.findUnique({ where: { id: ctx.orgId } });
  if (org?.notifyEmail) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const emails = await prisma.user.findMany({
      where: { organizationId: ctx.orgId, role: { in: ["OWNER", "ADMIN"] } },
      select: { email: true, name: true },
    });
    for (const u of emails) {
      sendEmail({
        to: u.email,
        subject: `Nueva firma en ${wo.code}`,
        html: baseEmailLayout("Firma capturada ✍️", `<p>La orden ${wo.code} (${wo.title}) fue firmada por <strong>${input.signerName}</strong>.</p><p><a href="${appUrl}/app/ordenes/${workOrderId}">Ver orden</a></p>`),
      }).catch(() => {});
    }
  }

  return { ok: true, id: sig.id };
}

export async function deleteWorkOrder(id: string) {
  const ctx = await requireSession();
  await prisma.workOrder.deleteMany({ where: { id, organizationId: ctx.orgId } });
  revalidatePath("/app/ordenes");
  return { ok: true };
}

// ============================= DOCUMENTOS =============================

export async function createDocument(input: {
  type: string;
  title: string;
  workOrderId?: string;
  projectId?: string;
  customerId?: string;
  description?: string;
  items?: { description: string; qty: number; unitPrice: number }[];
  taxRate?: number;
  notes?: string;
  terms?: string;
  includeSignature?: boolean;
  includeChecklist?: boolean;
  includePhotos?: boolean;
}) {
  const ctx = await requireSession();
  const org = await prisma.organization.findUnique({ where: { id: ctx.orgId } });
  if (!org) return { error: "Organización no encontrada" };

  const customer = input.customerId
    ? await prisma.customer.findFirst({ where: { id: input.customerId, organizationId: ctx.orgId } })
    : null;
  const project = input.projectId
    ? await prisma.project.findFirst({ where: { id: input.projectId, organizationId: ctx.orgId } })
    : null;
  const workOrder = input.workOrderId
    ? await prisma.workOrder.findFirst({
        where: { id: input.workOrderId, organizationId: ctx.orgId },
        include: { customer: true, project: true, assignedTo: true },
      })
    : null;

  const items = (input.items ?? []).map((it) => ({
    description: it.description,
    qty: Number(it.qty) || 0,
    unitPrice: Number(it.unitPrice) || 0,
    amount: (Number(it.qty) || 0) * (Number(it.unitPrice) || 0),
  }));
  const subtotal = items.reduce((s, i) => s + i.amount, 0);
  const taxRate = Number(input.taxRate) || 0;
  const tax = (subtotal * taxRate) / 100;
  const total = subtotal + tax;

  const signatures: { name: string; role: string; imageUrl?: string; signedAt?: string }[] = [];
  if (workOrder) {
    const sigs = await prisma.signature.findMany({
      where: { workOrderId: workOrder.id },
      orderBy: { signedAt: "asc" },
    });
    for (const s of sigs) {
      signatures.push({
        name: s.signerName,
        role: s.signerRole === "CLIENTE" ? "Cliente" : s.signerRole,
        imageUrl: s.imageUrl,
        signedAt: s.signedAt.toLocaleString("es-GT"),
      });
    }
  }

  const data: any = {
    code: generateCode("DOC"),
    date: new Date().toLocaleString("es-GT"),
    clientName: customer?.name || workOrder?.customer?.name,
    clientNit: customer?.nit || workOrder?.customer?.nit || undefined,
    clientAddress: customer?.address || workOrder?.customer?.address || undefined,
    clientPhone: customer?.phone || workOrder?.customer?.phone || undefined,
    projectName: project?.name || workOrder?.project?.name,
    projectCode: project?.code || workOrder?.project?.code,
    assignedTo: workOrder?.assignedTo?.name,
    scheduledAt: workOrder?.scheduledAt ? workOrder.scheduledAt.toLocaleString("es-GT") : undefined,
    description: input.description || workOrder?.description || undefined,
    notes: input.notes || undefined,
    terms: input.terms || "Documento generado con TimePro. El firmante acepta la conformidad del servicio descrito.",
    items,
    subtotal,
    taxRate,
    tax,
    total,
    checklist: input.includeChecklist && workOrder ? ((workOrder.checklist as { text: string; done: boolean }[]) ?? []) : [],
    photos: input.includePhotos && workOrder ? ((workOrder.photos as string[]) ?? []) : [],
    signatures: input.includeSignature ? signatures : [],
  };

  const result = await buildAndSaveDocument({
    org: {
      id: ctx.orgId,
      name: org.name,
      nit: org.nit || undefined,
      address: org.address || undefined,
      phone: org.phone || undefined,
      brandColor: org.brandColor,
      logoUrl: org.logoUrl || undefined,
      invoicePrefix: org.invoicePrefix,
    },
    docType: input.type as any,
    data,
    title: input.title,
    workOrderId: workOrder?.id,
    projectId: project?.id,
    customerId: customer?.id,
  });

  await logActivity({ orgId: ctx.orgId, userId: ctx.id, entityType: "DOCUMENT", entityId: result.id, action: "CREATE", description: `Documento creado: ${result.code}` });
  revalidatePath("/app/documentos");
  return { ok: true, id: result.id };
}

export async function deleteDocument(id: string) {
  const ctx = await requireSession();
  await prisma.document.deleteMany({ where: { id, organizationId: ctx.orgId } });
  revalidatePath("/app/documentos");
  return { ok: true };
}

export async function regenerateDocumentPdf(id: string) {
  const ctx = await requireSession();
  const doc = await prisma.document.findFirst({ where: { id, organizationId: ctx.orgId } });
  if (!doc) return { error: "Documento no encontrado" };

  const org = await prisma.organization.findUnique({ where: { id: ctx.orgId } });
  if (!org) return { error: "Organización no encontrada" };

  const data = doc.data as any;
  const pdf = await generateDocumentPdf({
    org: {
      id: ctx.orgId,
      name: org.name,
      nit: org.nit || undefined,
      address: org.address || undefined,
      phone: org.phone || undefined,
      brandColor: org.brandColor,
      logoUrl: org.logoUrl || undefined,
      invoicePrefix: org.invoicePrefix,
    },
    docType: doc.type as any,
    data: { ...data, code: doc.number },
  });

  await prisma.document.update({
    where: { id },
    data: { pdfData: Buffer.from(pdf), updatedAt: new Date() },
  });
  revalidatePath("/app/documentos");
  return { ok: true };
}

// ============================= EQUIPO =============================

export async function inviteUser(input: unknown) {
  const ctx = await requireOwner();
  const parsed = inviteSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos no válidos" };

  const usersCount = await prisma.user.count({ where: { organizationId: ctx.orgId } });
  const plan = getPlan(ctx.planCode);
  if (usersCount >= plan.maxUsers) {
    return { error: `Tu plan ${plan.name} permite hasta ${plan.maxUsers} ${plan.maxUsers === 1 ? "usuario" : "usuarios"}. Mejora tu plan para agregar más.` };
  }

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
  if (existing) return { error: "Este correo ya pertenece a una cuenta. Usa otro o invítalo de otra forma." };

  const token = generateToken(24);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await prisma.invite.create({
    data: {
      organizationId: ctx.orgId,
      email: parsed.data.email.toLowerCase(),
      role: parsed.data.role,
      token,
      expiresAt,
    },
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const acceptUrl = `${appUrl}/invitacion/${token}`;
  await sendEmail({
    to: parsed.data.email.toLowerCase(),
    subject: `Te invitaron a unirte a ${ctx.orgId ? "TimePro" : "TimePro"}`,
    html: baseEmailLayout(
      "Tienes una invitación",
      `<p>Te invitaron a unirte a una empresa en <strong>TimePro</strong> como ${parsed.data.role === "ADMIN" ? "administrador" : "técnico"}.</p>
       <p style="margin-top:20px"><a href="${acceptUrl}" style="background:#0f766e;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;">Aceptar invitación</a></p>
       <p style="color:#64748b;font-size:12px;">El enlace expira en 7 días.</p>`
    ),
  });

  revalidatePath("/app/equipo");
  return { ok: true };
}

export async function revokeInvite(id: string) {
  const ctx = await requireOwner();
  await prisma.invite.updateMany({ where: { id, organizationId: ctx.orgId }, data: { status: "REVOKED" } });
  revalidatePath("/app/equipo");
  return { ok: true };
}

export async function updateUserRole(userId: string, role: string) {
  const ctx = await requireOwner();
  if (!["ADMIN", "TECHNICIAN"].includes(role)) return { error: "Rol no válido" };
  const target = await prisma.user.findFirst({ where: { id: userId, organizationId: ctx.orgId } });
  if (!target) return { error: "Usuario no encontrado" };
  if (target.isOwner) return { error: "No puedes cambiar el rol del propietario" };
  await prisma.user.update({ where: { id: userId }, data: { role } });
  revalidatePath("/app/equipo");
  return { ok: true };
}

export async function removeUser(userId: string) {
  const ctx = await requireOwner();
  const target = await prisma.user.findFirst({ where: { id: userId, organizationId: ctx.orgId } });
  if (!target) return { error: "Usuario no encontrado" };
  if (target.isOwner) return { error: "No puedes eliminar al propietario" };
  await prisma.user.update({ where: { id: userId }, data: { active: false } });
  revalidatePath("/app/equipo");
  return { ok: true };
}

export async function updateProfile(input: unknown) {
  const ctx = await requireSession();
  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos no válidos" };
  await prisma.user.update({ where: { id: ctx.id }, data: parsed.data });
  revalidatePath("/app/configuracion");
  return { ok: true };
}

export async function changePassword(input: { current: string; next: string }) {
  const ctx = await requireSession();
  const user = await prisma.user.findUnique({ where: { id: ctx.id } });
  if (!user) return { error: "Usuario no encontrado" };
  const valid = await bcrypt.compare(input.current, user.passwordHash);
  if (!valid) return { error: "La contraseña actual es incorrecta" };
  if (input.next.length < 8) return { error: "La nueva contraseña debe tener al menos 8 caracteres" };
  await prisma.user.update({ where: { id: ctx.id }, data: { passwordHash: await bcrypt.hash(input.next, 10) } });
  return { ok: true };
}

// ============================= CONFIGURACIÓN =============================

export async function updateOrgSettings(input: unknown) {
  const ctx = await requireOwner();
  const parsed = orgSettingsSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos no válidos" };
  await prisma.organization.update({
    where: { id: ctx.orgId },
    data: {
      name: parsed.data.name,
      phone: parsed.data.phone || null,
      address: parsed.data.address || null,
      nit: parsed.data.nit || null,
      brandColor: parsed.data.brandColor,
      whatsappPhone: parsed.data.whatsappPhone || null,
      notifyWhatsApp: parsed.data.notifyWhatsApp,
      notifyEmail: parsed.data.notifyEmail,
    },
  });
  revalidatePath("/app/configuracion");
  return { ok: true };
}

export async function updateOrgLogo(logoDataUrl: string) {
  const ctx = await requireOwner();
  if (!logoDataUrl || logoDataUrl.length > 400_000) return { error: "Imagen no válida o demasiado grande (máx ~300KB)" };
  const stored = await uploadDataUrl(logoDataUrl, `orgs/${ctx.orgId}/logo`);
  await prisma.organization.update({ where: { id: ctx.orgId }, data: { logoUrl: stored.url } });
  revalidatePath("/app/configuracion");
  return { ok: true };
}

// ============================= SUSCRIPCIÓN =============================

export async function createBillingOrder(input: { planCode: string; period: "MONTHLY" | "YEARLY" }) {
  const ctx = await requireOwner();
  const plan = getPlan(input.planCode);
  const amount = input.period === "YEARLY" ? plan.priceYearly : plan.priceMonthly;

  // Si Stripe está configurado, no creamos orden manual; el flujo lo maneja la API de checkout.
  if (process.env.STRIPE_SECRET_KEY) {
    return { error: "payment_gateway" };
  }

  const order = await prisma.billingOrder.create({
    data: {
      organizationId: ctx.orgId,
      code: generateCode("PAGO"),
      planCode: input.planCode,
      period: input.period,
      amount,
      currency: "GTQ",
      status: "PENDING",
    },
  });

  // Correo con instrucciones
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  sendEmail({
    to: ctx.email,
    subject: `Pago pendiente: ${order.code}`,
    html: baseEmailLayout(
      "Instrucciones de pago",
      `<p>Hola <strong>${ctx.name}</strong>,</p>
       <p>Para activar el plan <strong>${plan.name}</strong> (${input.period === "YEARLY" ? "anual" : "mensual"}) por <strong>Q${amount}</strong>, realiza tu transferencia o depósito y envíanos el comprobante con tu número de referencia <strong>${order.code}</strong> por WhatsApp.</p>
       <p style="margin-top:20px"><a href="${appUrl}/app/suscripcion" style="background:#0f766e;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;">Ver estado</a></p>`
    ),
  }).catch(() => {});

  revalidatePath("/app/suscripcion");
  return { ok: true, code: order.code, amount };
}

export async function activateSubscriptionByReference(reference: string) {
  const ctx = await requireOwner();
  const order = await prisma.billingOrder.findFirst({
    where: { organizationId: ctx.orgId, code: reference.toUpperCase(), status: "PENDING" },
  });
  if (!order) return { error: "No se encontró una orden pendiente con esa referencia" };

  const plan = getPlan(order.planCode);
  const periodDays = order.period === "YEARLY" ? 365 : 30;
  const renewsAt = new Date(Date.now() + periodDays * 24 * 60 * 60 * 1000);

  await prisma.$transaction([
    prisma.billingOrder.update({ where: { id: order.id }, data: { status: "PAID", paidAt: new Date(), paymentMethod: "TRANSFERENCIA" } }),
    prisma.organization.update({
      where: { id: ctx.orgId },
      data: { planCode: order.planCode, subscriptionStatus: "ACTIVE", renewsAt, trialEndsAt: null },
    }),
  ]);

  await logActivity({ orgId: ctx.orgId, userId: ctx.id, entityType: "BILLING", action: "ACTIVATE", description: `Plan ${plan.name} activado` });
  revalidatePath("/app/suscripcion");
  return { ok: true };
}

export async function cancelSubscription() {
  const ctx = await requireSession();
  if (!ctx.isOwner) return { error: "Solo el propietario puede cancelar la suscripción" };
  await prisma.organization.update({
    where: { id: ctx.orgId },
    data: { subscriptionStatus: "CANCELLED", renewsAt: null },
  });
  revalidatePath("/app/suscripcion");
  return { ok: true };
}

export async function extendTrial(days?: number) {
  const ctx = await requireSession();
  if (!ctx.isOwner) return { error: "Solo el propietario puede extender la prueba" };
  const d = days ?? trialDays();
  const now = new Date();
  const trialEndsAt = new Date(now.getTime() + d * 24 * 60 * 60 * 1000);
  await prisma.organization.update({
    where: { id: ctx.orgId },
    data: { subscriptionStatus: "TRIAL", trialEndsAt, trialStartedAt: now },
  });
  revalidatePath("/app/suscripcion");
  return { ok: true };
}

// ============================= INVITACIÓN PÚBLICA =============================

export async function acceptInvite(token: string, input: { name: string; email: string; password: string }) {
  const invite = await prisma.invite.findUnique({ where: { token } });
  if (!invite || invite.status !== "PENDING" || invite.expiresAt < new Date()) {
    return { error: "Esta invitación no es válida o ya expiró" };
  }
  const existing = await prisma.user.findUnique({ where: { email: input.email.toLowerCase() } });
  if (existing) return { error: "Este correo ya tiene una cuenta" };

  const passwordHash = await bcrypt.hash(input.password, 10);
  const user = await prisma.user.create({
    data: {
      organizationId: invite.organizationId,
      name: input.name,
      email: input.email.toLowerCase(),
      passwordHash,
      role: invite.role,
      isOwner: false,
    },
  });
  await prisma.invite.update({ where: { id: invite.id }, data: { status: "ACCEPTED" } });
  return { ok: true, userId: user.id };
}

// ============================= LINK DE APROBACIÓN =============================

export async function ensureApprovalLink(input: { type: "WORKORDER" | "PROJECT"; id: string }) {
  const ctx = await requireSession();
  const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  if (input.type === "WORKORDER") {
    const wo = await prisma.workOrder.findFirst({
      where: { id: input.id, organizationId: ctx.orgId },
      select: { publicToken: true, code: true },
    });
    if (!wo) return { error: "Orden no encontrada" };
    let token = wo.publicToken;
    if (!token) {
      token = generateToken(20);
      await prisma.workOrder.update({ where: { id: input.id }, data: { publicToken: token } });
      await logActivity({ orgId: ctx.orgId, userId: ctx.id, entityType: "WORKORDER", entityId: input.id, action: "LINK", description: `Link de aprobación generado para ${wo.code}` });
    }
    return { ok: true, link: `${base}/aprobacion/${token}` };
  }

  const p = await prisma.project.findFirst({
    where: { id: input.id, organizationId: ctx.orgId },
    select: { publicToken: true, code: true },
  });
  if (!p) return { error: "Proyecto no encontrado" };
  let token = p.publicToken;
  if (!token) {
    token = generateToken(20);
    await prisma.project.update({ where: { id: input.id }, data: { publicToken: token } });
    await logActivity({ orgId: ctx.orgId, userId: ctx.id, entityType: "PROJECT", entityId: input.id, action: "LINK", description: `Link de aprobación generado para ${p.code}` });
  }
  return { ok: true, link: `${base}/aprobacion/${token}` };
}
