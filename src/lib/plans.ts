export type PlanCode = "BASIC" | "PRO" | "ENTERPRISE";

export interface PlanFeature {
  text: string;
  included: boolean;
}

export interface Plan {
  code: PlanCode;
  name: string;
  tagline: string;
  priceMonthly: number; // en Quetzales
  priceYearly: number; // 10 meses (2 meses gratis)
  maxUsers: number; // Infinity para ilimitado
  maxPhotos: number;
  highlights: string[];
  features: PlanFeature[];
  popular?: boolean;
}

export const PLANS: Plan[] = [
  {
    code: "BASIC",
    name: "Básico",
    tagline: "Para emprendedores que quieren ordenar sus trabajos.",
    priceMonthly: 149,
    priceYearly: 1490,
    maxUsers: 1,
    maxPhotos: 20,
    highlights: ["Proyectos ilimitados", "Órdenes de trabajo", "Firmas digitales", "Documentos PDF"],
    features: [
      { text: "1 usuario", included: true },
      { text: "Proyectos ilimitados", included: true },
      { text: "Órdenes de trabajo y entregas", included: true },
      { text: "Firmas digitales en PDF", included: true },
      { text: "Creador de documentos (cotización, acta, OT)", included: true },
      { text: "Clientes ilimitados", included: true },
      { text: "Notificaciones por WhatsApp", included: true },
      { text: "Notificaciones por correo", included: true },
      { text: "Hasta 20 fotos por orden", included: true },
      { text: "Portal de cliente para firmar", included: false },
      { text: "Usuarios adicionales", included: false },
      { text: "Reportes y analítica avanzada", included: false },
      { text: "Marca personalizada (logo y color)", included: false },
      { text: "API y webhooks", included: false },
      { text: "Soporte prioritario", included: false },
    ],
  },
  {
    code: "PRO",
    name: "Pro",
    tagline: "Para equipos pequeños que trabajan en campo.",
    priceMonthly: 299,
    priceYearly: 2990,
    maxUsers: 5,
    maxPhotos: 100,
    popular: true,
    highlights: ["Todo lo de Básico", "Hasta 5 usuarios", "Portal de cliente", "Fotos y GPS"],
    features: [
      { text: "Hasta 5 usuarios", included: true },
      { text: "Proyectos ilimitados", included: true },
      { text: "Órdenes de trabajo y entregas", included: true },
      { text: "Firmas digitales en PDF", included: true },
      { text: "Creador de documentos", included: true },
      { text: "Clientes ilimitados", included: true },
      { text: "Notificaciones por WhatsApp", included: true },
      { text: "Notificaciones por correo", included: true },
      { text: "Hasta 100 fotos por orden", included: true },
      { text: "Portal de cliente para firmar", included: true },
      { text: "Geolocalización del técnico", included: true },
      { text: "Reportes y analítica avanzada", included: true },
      { text: "Marca personalizada (logo y color)", included: false },
      { text: "API y webhooks", included: false },
      { text: "Soporte prioritario", included: false },
    ],
  },
  {
    code: "ENTERPRISE",
    name: "Empresa",
    tagline: "Para empresas con operaciones grandes y sucursales.",
    priceMonthly: 599,
    priceYearly: 5990,
    maxUsers: Infinity,
    maxPhotos: 1000,
    highlights: ["Todo lo de Pro", "Usuarios ilimitados", "API y webhooks", "Soporte prioritario"],
    features: [
      { text: "Usuarios ilimitados", included: true },
      { text: "Proyectos ilimitados", included: true },
      { text: "Órdenes de trabajo y entregas", included: true },
      { text: "Firmas digitales en PDF", included: true },
      { text: "Creador de documentos", included: true },
      { text: "Clientes ilimitados", included: true },
      { text: "Notificaciones por WhatsApp", included: true },
      { text: "Notificaciones por correo", included: true },
      { text: "Fotos ilimitadas", included: true },
      { text: "Portal de cliente para firmar", included: true },
      { text: "Geolocalización del técnico", included: true },
      { text: "Reportes y analítica avanzada", included: true },
      { text: "Marca personalizada (logo y color)", included: true },
      { text: "API y webhooks", included: true },
      { text: "Soporte prioritario", included: true },
    ],
  },
];

export function getPlan(code: string): Plan {
  return PLANS.find((p) => p.code === code) ?? PLANS[0];
}

export function formatQ(amount: number | string | null | undefined): string {
  const n = Number(amount ?? 0);
  return (
    "Q" +
    n.toLocaleString("es-GT", {
      minimumFractionDigits: n % 1 === 0 ? 0 : 2,
      maximumFractionDigits: 2,
    })
  );
}

export function trialDays(): number {
  const d = Number(process.env.TRIAL_DAYS ?? 14);
  return Number.isFinite(d) && d > 0 ? d : 14;
}
