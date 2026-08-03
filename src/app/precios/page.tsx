import Link from "next/link";
import { CheckCircle2, MinusCircle } from "lucide-react";
import { LandingNav } from "@/components/LandingNav";
import { LandingFooter } from "@/components/LandingFooter";
import { PLANS, formatQ } from "@/lib/plans";

export const metadata = { title: "Precios en Quetzales" };

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <LandingNav />
      <section className="py-16">
        <div className="container-x">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">Precios en Quetzales 🇬🇹</h1>
            <p className="mt-4 text-lg text-slate-500">
              Tres planes pensados para empresas de servicios en Guatemala. Sin permanencia, cancela cuando quieras.
            </p>
            <div className="mx-auto mt-6 inline-flex items-center gap-2 rounded-full bg-brand-50 px-4 py-2 text-sm font-medium text-brand-700 ring-1 ring-brand-200">
              ✅ Pago anual = 2 meses gratis
            </div>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {PLANS.map((p) => (
              <div
                key={p.code}
                className={`relative flex flex-col rounded-2xl border p-7 ${
                  p.popular ? "border-brand-600 bg-white shadow-soft ring-2 ring-brand-600/30" : "border-slate-200 bg-white shadow-sm"
                }`}
              >
                {p.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-600 px-3 py-1 text-xs font-bold text-white">MÁS POPULAR</span>
                )}
                <h2 className="text-lg font-bold text-slate-900">{p.name}</h2>
                <p className="mt-1 text-sm text-slate-500">{p.tagline}</p>
                <div className="mt-5 flex items-end gap-1">
                  <span className="text-5xl font-extrabold text-slate-900">{p.priceMonthly}</span>
                  <span className="mb-1.5 text-sm text-slate-500">Q/mes</span>
                </div>
                <p className="mt-1 text-sm text-slate-400">Facturación anual: <strong className="text-slate-700">{formatQ(p.priceYearly)}</strong> ({formatQ(Math.round(p.priceYearly / 12))}/mes)</p>
                <div className="mt-6 flex-1">
                  <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Incluye</h3>
                  <ul className="space-y-2.5">
                    {p.features.map((f) => (
                      <li key={f.text} className={`flex items-start gap-2 text-sm ${f.included ? "text-slate-700" : "text-slate-300"}`}>
                        {f.included ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" /> : <MinusCircle className="mt-0.5 h-4 w-4 shrink-0 text-slate-300" />}
                        {f.text}
                      </li>
                    ))}
                  </ul>
                </div>
                <Link href={`/registro?plan=${p.code}`} className={p.popular ? "btn-primary mt-7 w-full" : "btn-secondary mt-7 w-full"}>
                  Comenzar prueba gratis
                </Link>
              </div>
            ))}
          </div>

          <div className="mt-12 grid gap-4 rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-600 sm:grid-cols-2">
            <div>
              <h3 className="mb-2 font-bold text-slate-900">Formas de pago</h3>
              <ul className="space-y-1.5">
                <li>💳 Tarjeta de crédito / débito (activación automática)</li>
                <li>🏦 Transferencia o depósito bancario en Quetzales</li>
                <li>📄 Emitimos comprobante/factura de tu pago</li>
              </ul>
            </div>
            <div>
              <h3 className="mb-2 font-bold text-slate-900">Preguntas</h3>
              <ul className="space-y-1.5">
                <li>❓ ¿Prueba gratis? Sí, 14 días completos sin tarjeta.</li>
                <li>❓ ¿Cambiar de plan? Puedes subir o bajar cuando quieras.</li>
                <li>❓ ¿Soporte? Real por WhatsApp al {process.env.OWNER_PHONE || "5830 3182"}.</li>
              </ul>
            </div>
          </div>

          <div className="mt-10 text-center">
            <p className="text-slate-500">¿Necesitas algo especial? </p>
            <Link href="/contacto" className="font-semibold text-brand-600 hover:underline">Contáctanos →</Link>
          </div>
        </div>
      </section>
      <LandingFooter />
    </main>
  );
}
