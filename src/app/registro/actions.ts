"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validation";
import { slugify, errorMessage } from "@/lib/utils";
import { setSessionCookie, createSessionToken } from "@/lib/auth";
import { trialDays, PLANS } from "@/lib/plans";
import { sendWelcomeEmail } from "@/lib/email";
import { rateLimit } from "@/lib/rate-limit";
import bcrypt from "bcryptjs";

export async function registerUser(input: {
  name: string;
  company: string;
  email: string;
  phone: string;
  password: string;
  plan?: string;
}) {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return { error: first?.message ?? "Datos no válidos" };
  }

  const email = parsed.data.email.toLowerCase().trim();
  const rl = rateLimit({ key: `register:${email}`, limit: 3, windowMs: 60 * 60 * 1000 });
  if (!rl.ok) return { error: "Demasiados intentos. Intenta más tarde." };

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { error: "Este correo ya está registrado. Inicia sesión." };

  const plan = PLANS.find((p) => p.code === parsed.data.plan);
  const planCode = plan?.code ?? "BASIC";

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  const days = trialDays();
  const now = new Date();
  const trialEnd = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

  try {
    const org = await prisma.$transaction(async (tx) => {
      const slug = slugify(parsed.data.company);
      let uniqueSlug = slug;
      let n = 2;
      while (await tx.organization.findUnique({ where: { slug: uniqueSlug } })) {
        uniqueSlug = `${slug}-${n++}`;
      }

      const organization = await tx.organization.create({
        data: {
          name: parsed.data.company,
          slug: uniqueSlug,
          planCode,
          subscriptionStatus: "TRIAL",
          trialStartedAt: now,
          trialEndsAt: trialEnd,
          renewsAt: trialEnd,
        },
      });

      const user = await tx.user.create({
        data: {
          organizationId: organization.id,
          name: parsed.data.name,
          email,
          phone: parsed.data.phone || null,
          passwordHash,
          role: "OWNER",
          isOwner: true,
        },
      });

      return { org: organization, user };
    });

    const token = await createSessionToken({
      id: org.user.id,
      orgId: org.org.id,
      name: org.user.name,
      email: org.user.email,
      role: org.user.role,
      isOwner: true,
    });
    await setSessionCookie(token);

    const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/app`;
    await sendWelcomeEmail({ to: email, name: org.user.name, company: org.org.name, loginUrl, trialDays: days });

    redirect("/app");
  } catch (e) {
    return { error: errorMessage(e) };
  }
}
