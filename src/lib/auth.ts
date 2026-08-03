import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getPlan } from "@/lib/plans";

export const SESSION_COOKIE = "tp_session";
const TOKEN_MAX_AGE = 60 * 60 * 24 * 7; // 7 días

export interface SessionUser {
  id: string;
  orgId: string;
  name: string;
  email: string;
  role: string;
  isOwner: boolean;
}

function secretKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("Falta AUTH_SECRET en las variables de entorno");
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(user: SessionUser): Promise<string> {
  return new SignJWT({
    orgId: user.orgId,
    name: user.name,
    email: user.email,
    role: user.role,
    isOwner: user.isOwner,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(`${TOKEN_MAX_AGE}s`)
    .sign(secretKey());
}

export async function verifySessionToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey(), { algorithms: ["HS256"] });
    if (!payload.sub || !payload.orgId) return null;
    return {
      id: payload.sub,
      orgId: payload.orgId as string,
      name: (payload.name as string) ?? "",
      email: (payload.email as string) ?? "",
      role: (payload.role as string) ?? "TECHNICIAN",
      isOwner: Boolean(payload.isOwner),
    };
  } catch {
    return null;
  }
}

export async function setSessionCookie(token: string): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: TOKEN_MAX_AGE,
  });
}

export async function destroySessionCookie(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export async function getSession(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export interface AuthContext extends SessionUser {
  planCode: string;
  planName: string;
  maxUsers: number;
  subscriptionStatus: string;
  trialEndsAt: Date | null;
}

export async function requireSession(): Promise<AuthContext> {
  const session = await getSession();
  if (!session) redirect("/iniciar-sesion?next=/app");

  const org = await prisma.organization.findUnique({
    where: { id: session.orgId },
    select: {
      planCode: true,
      subscriptionStatus: true,
      trialEndsAt: true,
    },
  });

  const plan = getPlan(org?.planCode ?? "BASIC");

  return {
    ...session,
    planCode: org?.planCode ?? "BASIC",
    planName: plan.name,
    maxUsers: plan.maxUsers,
    subscriptionStatus: org?.subscriptionStatus ?? "TRIAL",
    trialEndsAt: org?.trialEndsAt ?? null,
  };
}

export async function requireOwner(): Promise<AuthContext> {
  const ctx = await requireSession();
  if (!ctx.isOwner) redirect("/app");
  return ctx;
}

export function canAccessFeature(ctx: AuthContext, feature: string): boolean {
  const enterprise = ctx.planCode === "ENTERPRISE";
  const pro = ctx.planCode === "PRO" || enterprise;
  switch (feature) {
    case "portal":
    case "reports":
    case "gps":
      return pro;
    case "branding":
    case "api":
    case "priorit":
      return enterprise;
    default:
      return true;
  }
}
