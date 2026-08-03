import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Escribe tu nombre completo").max(80),
  company: z.string().min(2, "Escribe el nombre de tu empresa").max(80),
  email: z.string().email("Correo electrónico no válido").max(120),
  phone: z.string().min(8, "Número de teléfono no válido").max(20).optional().or(z.literal("")),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres").max(72),
  plan: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Correo electrónico no válido"),
  password: z.string().min(1, "Escribe tu contraseña"),
});

export const customerSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio").max(100),
  company: z.string().max(120).optional().or(z.literal("")),
  nit: z.string().max(20).optional().or(z.literal("")),
  email: z.string().email("Correo no válido").optional().or(z.literal("")),
  phone: z.string().max(20).optional().or(z.literal("")),
  address: z.string().max(200).optional().or(z.literal("")),
  notes: z.string().max(1000).optional().or(z.literal("")),
});

export const projectSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio").max(120),
  customerId: z.string().optional().or(z.literal("")),
  description: z.string().max(2000).optional().or(z.literal("")),
  status: z.enum(["PLANIFICADO", "EN_PROGRESO", "PENDIENTE_ENTREGA", "COMPLETADO", "CANCELADO"]).default("PLANIFICADO"),
  priority: z.enum(["BAJA", "MEDIA", "ALTA", "URGENTE"]).default("MEDIA"),
  startDate: z.string().optional().or(z.literal("")),
  dueDate: z.string().optional().or(z.literal("")),
  budget: z.string().optional().or(z.literal("")),
});

export const workOrderSchema = z.object({
  title: z.string().min(1, "El título es obligatorio").max(150),
  type: z.enum(["INSTALACION", "ENTREGA", "MANTENIMIENTO", "REPARACION", "SERVICIO", "VISITA"]).default("INSTALACION"),
  projectId: z.string().optional().or(z.literal("")),
  customerId: z.string().optional().or(z.literal("")),
  assignedToId: z.string().optional().or(z.literal("")),
  description: z.string().max(3000).optional().or(z.literal("")),
  priority: z.enum(["BAJA", "MEDIA", "ALTA", "URGENTE"]).default("MEDIA"),
  scheduledAt: z.string().optional().or(z.literal("")),
  address: z.string().max(250).optional().or(z.literal("")),
  location: z.string().max(250).optional().or(z.literal("")),
  totalAmount: z.string().optional().or(z.literal("")),
});

export const inviteSchema = z.object({
  email: z.string().email("Correo no válido"),
  role: z.enum(["ADMIN", "TECHNICIAN"]).default("TECHNICIAN"),
});

export const profileSchema = z.object({
  name: z.string().min(2).max(80),
  phone: z.string().max(20).optional().or(z.literal("")),
});

export const orgSettingsSchema = z.object({
  name: z.string().min(2).max(80),
  phone: z.string().max(30).optional().or(z.literal("")),
  address: z.string().max(200).optional().or(z.literal("")),
  nit: z.string().max(20).optional().or(z.literal("")),
  brandColor: z.string().max(9),
  whatsappPhone: z.string().max(30).optional().or(z.literal("")),
  notifyWhatsApp: z.boolean().default(false),
  notifyEmail: z.boolean().default(true),
});

export const documentSchema = z.object({
  type: z.enum(["COTIZACION", "ORDEN_TRABAJO", "ACTA_ENTREGA", "ACTA_ACEPTACION", "PARTE_TRABAJO", "FACTURA", "CUSTOM"]),
  title: z.string().min(1).max(150),
  customerId: z.string().optional().or(z.literal("")),
  projectId: z.string().optional().or(z.literal("")),
  workOrderId: z.string().optional().or(z.literal("")),
  data: z.any().optional(),
});
