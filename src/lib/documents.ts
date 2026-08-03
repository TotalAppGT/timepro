import { prisma } from "@/lib/prisma";
import { generateDocumentPdf, type DocData, type DocType, type OrgHeader } from "@/lib/pdf/generator";
import { generateCode, formatDateTime } from "@/lib/utils";

export interface BuildDocInput {
  org: OrgHeader;
  docType: DocType;
  data: DocData;
  title: string;
  workOrderId?: string;
  projectId?: string;
  customerId?: string;
}

export async function buildAndSaveDocument(input: BuildDocInput): Promise<{ id: string; pdf: Uint8Array; code: string }> {
  const code = generateCode(input.org.invoicePrefix || "TP");
  const pdf = await generateDocumentPdf({
    org: input.org,
    docType: input.docType,
    data: { ...input.data, code },
  });

  const doc = await prisma.document.create({
    data: {
      organizationId: input.org.id,
      workOrderId: input.workOrderId,
      projectId: input.projectId,
      customerId: input.customerId,
      type: input.docType,
      title: input.title,
      number: code,
      data: input.data as unknown as object,
      pdfData: Buffer.from(pdf),
    },
  });

  return { id: doc.id, pdf, code };
}

export function docDataFromWorkOrder(wo: {
  code: string;
  title: string;
  description: string | null;
  scheduledAt: Date | null;
  completedAt: Date | null;
  totalAmount: string | null;
  address: string | null;
  customer?: { name: string; nit?: string | null; address?: string | null; phone?: string | null } | null;
  project?: { name: string; code: string } | null;
  assignedTo?: { name: string } | null;
}): DocData {
  return {
    code: wo.code,
    date: formatDateTime(wo.completedAt ?? wo.scheduledAt ?? new Date()),
    scheduledAt: wo.scheduledAt ? formatDateTime(wo.scheduledAt) : undefined,
    title: wo.title,
    description: wo.description || undefined,
    clientName: wo.customer?.name,
    clientNit: wo.customer?.nit || undefined,
    clientAddress: wo.customer?.address || wo.address || undefined,
    clientPhone: wo.customer?.phone || undefined,
    projectName: wo.project?.name,
    projectCode: wo.project?.code,
    assignedTo: wo.assignedTo?.name,
    total: wo.totalAmount ? Number(wo.totalAmount) : undefined,
  };
}
