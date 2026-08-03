import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: {
    default: "TimePro — Eficientador de tiempo para proyectos, entregas y firmas digitales",
    template: "%s | TimePro",
  },
  description:
    "TimePro es el sistema en la nube para gestionar proyectos, órdenes de trabajo, entregas, instalaciones y firmas digitales. Creado para empresas de Guatemala. Precios en quetzales desde Q149/mes.",
  keywords: [
    "gestión de proyectos Guatemala",
    "órdenes de trabajo",
    "firmas digitales",
    "software entregas e instalaciones",
    "SaaS Guatemala",
    "quetzales",
    "TimePro",
  ],
  openGraph: {
    title: "TimePro — Controla tus proyectos y entregas desde tu celular",
    description: "Proyectos, entregas, instalaciones y firmas digitales en un solo sistema. Hecho en Guatemala, precios en quetzales.",
    type: "website",
    locale: "es_GT",
  },
};

export const viewport: Viewport = {
  themeColor: "#0f766e",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={cn(inter.variable, "font-sans")}>{children}</body>
    </html>
  );
}
