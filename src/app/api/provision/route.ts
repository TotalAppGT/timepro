import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

const PLAN_MAP: Record<string, "BASIC" | "PRO" | "ENTERPRISE"> = {
  basico: "BASIC",
  pro: "PRO",
  empresarial: "ENTERPRISE",
};

// Alta automatica de empresa (Total Suite). Protegido por PROVISION_SECRET.
export async function POST(req: NextRequest) {
  if (req.headers.get("x-provision-secret") !== (process.env.PROVISION_SECRET || "__none__")) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  const b = await req.json().catch(() => ({} as any));
  const nombre = b?.nombre;
  const adminEmail = b?.admin_email;
  const adminPassword = b?.admin_password;
  if (!nombre || !adminEmail || !adminPassword) {
    return NextResponse.json({ ok: false, error: "faltan datos" }, { status: 400 });
  }
  const plan = PLAN_MAP[String(b.plan || "basico").toLowerCase()] || "BASIC";
  try {
    const org = await prisma.organization.create({
      data: {
        name: nombre,
        slug: b.slug || `t-${Date.now().toString(36)}`,
        plan,
        planCode: plan,
        subscriptionStatus: "ACTIVE",
      },
    });
    try {
      await prisma.user.create({
        data: {
          organizationId: org.id,
          name: nombre,
          email: String(adminEmail).toLowerCase(),
          passwordHash: await bcrypt.hash(adminPassword, 10),
          role: "OWNER",
          isOwner: true,
          active: true,
        },
      });
    } catch {
      // correo ya existia; la empresa quedo creada igual
    }
    return NextResponse.json({ ok: true, organization_id: org.id, slug: org.slug });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "error" }, { status: 500 });
  }
}
