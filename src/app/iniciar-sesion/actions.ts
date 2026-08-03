"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validation";
import { setSessionCookie, createSessionToken, destroySessionCookie } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import bcrypt from "bcryptjs";

export async function loginUser(input: { email: string; password: string }) {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) return { error: "Correo o contraseña no válidos" };

  const email = parsed.data.email.toLowerCase().trim();
  const rl = rateLimit({ key: `login:${email}`, limit: 10, windowMs: 15 * 60 * 1000 });
  if (!rl.ok) return { error: "Demasiados intentos. Intenta en unos minutos." };

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.active) return { error: "Correo o contraseña incorrectos" };

  const valid = await bcrypt.compare(parsed.data.password, user.passwordHash);
  if (!valid) return { error: "Correo o contraseña incorrectos" };

  const token = await createSessionToken({
    id: user.id,
    orgId: user.organizationId,
    name: user.name,
    email: user.email,
    role: user.role,
    isOwner: user.isOwner,
  });
  await setSessionCookie(token);

  redirect("/app");
}

export async function logoutUser() {
  await destroySessionCookie();
  redirect("/");
}
