import type { Metadata } from "next";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

export const metadata: Metadata = {
  title: { default: "Panel | TimePro", template: "%s | TimePro" },
};

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const ctx = await requireSession();

  const [org, user, pendingOrders] = await Promise.all([
    prisma.organization.findUnique({
      where: { id: ctx.orgId },
      select: { name: true, planCode: true, subscriptionStatus: true, trialEndsAt: true, logoUrl: true, brandColor: true },
    }),
    prisma.user.findUnique({ where: { id: ctx.id }, select: { name: true, email: true, role: true, isOwner: true } }),
    prisma.billingOrder.count({ where: { organizationId: ctx.orgId, status: "PENDING" } }),
  ]);

  return (
    <DashboardShell
      orgName={org?.name ?? ""}
      userName={user?.name ?? ""}
      userEmail={user?.email ?? ""}
      userRole={user?.role ?? "TECHNICIAN"}
      isOwner={Boolean(user?.isOwner)}
      planCode={org?.planCode ?? "BASIC"}
      subscriptionStatus={org?.subscriptionStatus ?? "TRIAL"}
      trialEndsAt={org?.trialEndsAt ?? null}
      pendingOrders={pendingOrders}
    >
      {children}
    </DashboardShell>
  );
}
