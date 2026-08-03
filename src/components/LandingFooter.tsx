import Link from "next/link";
import { Timer, MessageCircle, ShieldCheck, FileText } from "lucide-react";
import { Logo } from "@/components/Logo";

export function LandingFooter() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 text-slate-400">
      <div className="container-x py-14">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <Logo light />
            <p className="mt-4 max-w-sm text-sm leading-relaxed">
              TimePro es el eficientador de tiempo para proyectos, entregas, instalaciones y firmas digitales. Creado en Guatemala
              para empresas que trabajan en campo. Precios en quetzales, sin permanencia.
            </p>
            <div className="mt-5 flex items-center gap-2 text-sm">
              <MessageCircle className="h-4 w-4 text-brand-400" />
              <a href={`https://wa.me/${process.env.NEXT_PUBLIC_OWNER_WHATSAPP || "50258303182"}`} target="_blank" rel="noreferrer" className="hover:text-white">
                WhatsApp: {process.env.OWNER_PHONE || "5830 3182"}
              </a>
            </div>
          </div>
          <div>
            <h4 className="mb-4 text-sm font-semibold text-white">Producto</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/#funciones" className="hover:text-white">Funciones</Link></li>
              <li><Link href="/precios" className="hover:text-white">Precios</Link></li>
              <li><Link href="/registro" className="hover:text-white">Comenzar gratis</Link></li>
              <li><Link href="/iniciar-sesion" className="hover:text-white">Iniciar sesión</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 text-sm font-semibold text-white">Legal y contacto</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/contacto" className="hover:text-white">Contacto</Link></li>
              <li><Link href="/privacidad" className="hover:text-white">Política de privacidad</Link></li>
              <li><Link href="/terminos" className="hover:text-white">Términos y condiciones</Link></li>
              <li className="inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-brand-400" /> Datos cifrados en la nube</li>
            </ul>
          </div>
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-slate-800 pt-6 text-xs sm:flex-row">
          <p className="inline-flex items-center gap-2">
            <Timer className="h-4 w-4 text-brand-500" /> © {new Date().getFullYear()} TimePro · Total App GT · Guatemala 🇬🇹
          </p>
          <p className="inline-flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5" /> Pagos y facturación en Quetzales (Q)
          </p>
        </div>
      </div>
    </footer>
  );
}
