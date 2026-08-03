import { prisma } from "@/lib/prisma";

export async function logActivity(opts: {
  orgId: string;
  userId?: string | null;
  entityType: string;
  entityId?: string | null;
  action: string;
  description?: string;
}) {
  try {
    await prisma.activityLog.create({
      data: {
        organizationId: opts.orgId,
        userId: opts.userId || null,
        entityType: opts.entityType,
        entityId: opts.entityId || null,
        action: opts.action,
        description: opts.description,
      },
    });
  } catch {
    // el log no debe romper la operación principal
  }
}
