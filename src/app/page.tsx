import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  FileSignature,
  ClipboardList,
  Truck,
  Wrench,
  FileText,
  MapPin,
  Camera,
  Bell,
  Smartphone,
  MessageCircle,
  Users,
  ShieldCheck,
  Clock,
  TrendingUp,
  Zap,
} from "lucide-react";
import { LandingNav } from "@/components/LandingNav";
import { LandingFooter } from "@/components/LandingFooter";
import { PLANS } from "@/lib/plans";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      <LandingNav />

      {/* HERO */}
      <section className="relative overflow-hidden bg-slate-950">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-brand-600/30 blur-3xl animate-blob" />
          <div className="absolute top-40 right-0 h-96 w-96 rounded-full bg-sky-600/20 blur-3xl animate-blob" style={{ animationDelay: "2s" }} />
        </div>
        <div className="container-x relative py-20 lg:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-500/40 bg-brand-500/10 px-4 py-1.5 text-xs font-semibold text-brand-300">
              🇬🇹 Hecho en Guatemala · Precios en Quetzales
            </span>
            <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Recupera tu tiempo. Controla tus{" "}
              <span className="bg-gradient-to-r from-brand-400 to-sky-400 bg-clip-text text-transparent">proyectos, entregas e instalaciones</span>{" "}
              desde un solo lugar.
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-300">
              TimePro digitaliza tus órdenes de trabajo, entregas e instalaciones con <strong className="text-white">firmas digitales</strong>,
              evidencias fotográficas y documentos PDF listos para enviar por WhatsApp. Sin papel, sin WhatsApp perdido, sin Excel descontrolado.
            </p>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/registro" className="btn-primary w-full px-8 py-3.5 text-base sm:w-auto">
                Comenzar prueba gratis de 14 días <ArrowRight className="h-4 w-4" />
              </Link>
              <a href="#funciones" className="btn-secondary w-full border-slate-700 bg-slate-900 px-8 py-3.5 text-base text-white hover:bg-slate-800 sm:w-auto">
                Ver funciones
              </a>
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-slate-400">
              <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-brand-400" /> Sin tarjeta de crédito</span>
              <span className="inline-flex items-center gap-1.5"><Clock className="h-4 w-4 text-brand-400" /> Operativo en 5 minutos</span>
              <span className="inline-flex items-center gap-1.5"><MessageCircle className="h-4 w-4 text-brand-400" /> Soporte real por WhatsApp</span>
            </div>
          </div>

          {/* Preview mock */}
          <div className="relative mx-auto mt-16 max-w-4xl">
            <div className="absolute inset-0 -z-10 rounded-3xl bg-gradient-to-tr from-brand-500/20 to-sky-500/20 blur-2xl" />
            <div className="overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl">
              <div className="flex items-center gap-1.5 border-b border-slate-800 px-4 py-3">
                <span className="h-3 w-3 rounded-full bg-rose-500" />
                <span className="h-3 w-3 rounded-full bg-amber-500" />
                <span className="h-3 w-3 rounded-full bg-emerald-500" />
                <span className="ml-3 text-xs text-slate-500">app.timepro.gt/dashboard</span>
              </div>
              <div className="grid gap-3 p-4 sm:grid-cols-4">
                {[
                  { label: "Proyectos activos", value: "12", icon: ClipboardList, up: "+3 esta semana" },
                  { label: "Órdenes pendientes", value: "7", icon: Wrench, up: "2 para hoy" },
                  { label: "Firmas digitales", value: "34", icon: FileSignature, up: "+8 hoy" },
                  { label: "Completadas", value: "89%", icon: CheckCircle2, up: "en tiempo" },
                ].map((k) => (
                  <div key={k.label} className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400">{k.label}</span>
                      <k.icon className="h-4 w-4 text-brand-400" />
                    </div>
                    <p className="mt-2 text-2xl font-bold text-white">{k.value}</p>
                    <p className="mt-1 text-xs text-emerald-400">{k.up}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PROBLEMA */}
      <section className="border-b border-slate-200 bg-slate-50 py-20">
        <div className="container-x grid items-center gap-10 lg:grid-cols-2">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              ¿Suena familiar? Tus técnicos trabajan, pero la información se pierde.
            </h2>
            <ul className="mt-6 space-y-3 text-slate-600">
              {[
                "Órdenes de trabajo escritas en papel que se pierden o se mojan en el campo.",
                "Seguimientos por WhatsApp que se pierden entre cientos de mensajes.",
                "Entregas e instalaciones sin evidencia ni firma del cliente.",
                "Nadie sabe en qué va cada proyecto ni quién es el responsable.",
                "Reclamos y garantías sin documentación de respaldo.",
              ].map((t, i) => (
                <li key={i} className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 text-sm shadow-sm">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-rose-100 text-rose-600">✕</span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-3xl bg-slate-950 p-8 text-slate-300">
            <p className="text-sm font-medium uppercase tracking-widest text-brand-400">TimePro lo cambia todo</p>
            <div className="mt-4 space-y-4">
              {[
                { icon: Zap, title: "Libera hasta 4 horas al día", text: "Automatiza la creación de órdenes, documentos y notificaciones." },
                { icon: TrendingUp, title: "Cada entrega queda documentada", text: "Firma digital, fotos, GPS y PDF generado al instante." },
                { icon: Users, title: "Todo tu equipo sincronizado", text: "Oficina y campo conectados en tiempo real, desde el celular." },
              ].map((b, i) => (
                <div key={i} className="flex gap-4">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-600/20 text-brand-400">
                    <b.icon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="font-semibold text-white">{b.title}</p>
                    <p className="text-sm text-slate-400">{b.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FUNCIONES */}
      <section id="funciones" className="bg-white py-20">
        <div className="container-x">
          <div className="mx-auto max-w-2xl text-center">
            <span className="badge bg-brand-100 text-brand-700">Funciones</span>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Todo lo que necesitas para controlar tu operación
            </h2>
            <p className="mt-4 text-slate-500">
              De la cotización a la entrega firmada, TimePro cubre todo el ciclo de tu servicio.
            </p>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: ClipboardList, title: "Órdenes de trabajo", text: "Crea y asigna órdenes de instalación, entrega o mantenimiento con checklist, prioridad y responsable." },
              { icon: FileSignature, title: "Firmas digitales", text: "El cliente firma en tu celular. La firma queda con fecha, hora y datos, lista en el PDF." },
              { icon: FileText, title: "Creador de documentos PDF", text: "Cotizaciones, órdenes, actas de entrega y partes de trabajo con tu logo y colores." },
              { icon: Truck, title: "Entregas e instalaciones", text: "Registra cada entrega con evidencia fotográfica, ubicación y conformidad del cliente." },
              { icon: Camera, title: "Evidencia fotográfica", text: "Fotos antes/después por orden. Todo queda guardado y adjunto al reporte." },
              { icon: MessageCircle, title: "Notificaciones WhatsApp", text: "Avisos automáticos al cliente y al equipo: asignado, en camino, finalizado, PDF firmado." },
              { icon: MapPin, title: "Geolocalización", text: "Sabe dónde trabaja cada técnico y a qué hora llegó al punto." },
              { icon: Bell, title: "Seguimiento en tiempo real", text: "Tablero con KPIs: órdenes, pendientes, completadas, cumplimiento de fechas." },
              { icon: Smartphone, title: "Portal del cliente", text: "Comparte un enlace para que tu cliente vea su orden y la firme desde su celular." },
              { icon: ShieldCheck, title: "Seguridad y respaldo", text: "Datos cifrados, acceso por rol y copias de seguridad en la nube." },
              { icon: Users, title: "Equipos y roles", text: "Administradores y técnicos con permisos. Invita a tu equipo en segundos." },
              { icon: Zap, title: "API y webhooks", text: "Conecta TimePro con tus otros sistemas mediante API y webhooks. (Plan Empresa)" },
            ].map((f, i) => (
              <div key={i} className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-brand-300 hover:shadow-soft">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-600 transition-colors group-hover:bg-brand-600 group-hover:text-white">
                  <f.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-base font-bold text-slate-900">{f.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CÓMO FUNCIONA */}
      <section id="como-funciona" className="bg-slate-950 py-20">
        <div className="container-x">
          <div className="mx-auto max-w-2xl text-center">
            <span className="badge bg-brand-500/15 text-brand-300">Cómo funciona</span>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">De la orden a la firma en 3 pasos</h2>
          </div>
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {[
              { n: "1", icon: ClipboardList, title: "Crea la orden", text: "Registra el proyecto, el cliente y la orden de trabajo. Asígnala a tu técnico." },
              { n: "2", icon: Wrench, title: "Ejecuta en campo", text: "Tu técnico abre la orden desde su celular: checklist, fotos, ubicación y datos del cliente." },
              { n: "3", icon: FileSignature, title: "Firma y entrega", text: "El cliente firma en pantalla. TimePro genera el PDF firmado y lo envía por WhatsApp y correo." },
            ].map((s) => (
              <div key={s.n} className="relative rounded-2xl border border-slate-800 bg-slate-900 p-8">
                <span className="absolute -top-4 left-6 grid h-8 w-8 place-items-center rounded-full bg-brand-500 font-bold text-slate-950">{s.n}</span>
                <s.icon className="h-8 w-8 text-brand-400" />
                <h3 className="mt-4 text-lg font-bold text-white">{s.title}</h3>
                <p className="mt-2 text-sm text-slate-400">{s.text}</p>
              </div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Link href="/registro" className="btn-primary px-8 py-3.5 text-base">
              Probar TimePro gratis <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* PRECIOS */}
      <section id="precios" className="bg-slate-50 py-20">
        <div className="container-x">
          <div className="mx-auto max-w-2xl text-center">
            <span className="badge bg-brand-100 text-brand-700">Precios en Quetzales</span>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Planes claros, sin permanencia
            </h2>
            <p className="mt-4 text-slate-500">
              Paga por mes o por año (2 meses gratis). Cancela cuando quieras. Todos los planes incluyen prueba gratis de 14 días.
            </p>
          </div>
          <div className="mt-14 grid gap-6 lg:grid-cols-3">
            {PLANS.map((p) => (
              <div
                key={p.code}
                className={`relative flex flex-col rounded-2xl border p-7 transition-all ${
                  p.popular ? "border-brand-600 bg-white shadow-soft ring-2 ring-brand-600/30" : "border-slate-200 bg-white shadow-sm"
                }`}
              >
                {p.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-600 px-3 py-1 text-xs font-bold text-white">
                    MÁS POPULAR
                  </span>
                )}
                <h3 className="text-lg font-bold text-slate-900">{p.name}</h3>
                <p className="mt-1 text-sm text-slate-500">{p.tagline}</p>
                <div className="mt-5 flex items-end gap-1">
                  <span className="text-4xl font-extrabold text-slate-900">{p.priceMonthly}</span>
                  <span className="mb-1 text-sm text-slate-500">Q/mes</span>
                </div>
                <p className="mt-1 text-xs text-slate-400">o Q{p.priceYearly}/año (2 meses gratis)</p>
                <ul className="mt-6 flex-1 space-y-2.5">
                  {p.highlights.map((h) => (
                    <li key={h} className="flex items-start gap-2 text-sm text-slate-700">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                      {h}
                    </li>
                  ))}
                </ul>
                <Link href={`/registro?plan=${p.code}`} className={p.popular ? "btn-primary mt-7 w-full" : "btn-secondary mt-7 w-full"}>
                  Comenzar prueba gratis
                </Link>
              </div>
            ))}
          </div>
          <p className="mt-8 text-center text-sm text-slate-400">
            Todos los precios no incluyen IVA. Pago por tarjeta, transferencia o depósito bancario. <Link href="/precios" className="font-semibold text-brand-600 hover:underline">Ver detalle completo →</Link>
          </p>
        </div>
      </section>

      {/* TESTIMONIOS */}
      <section className="bg-white py-20">
        <div className="container-x">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">Empresas que ya dejaron el papel</h2>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              { quote: "Antes cada instalación era un caos: papeles, fotos en el celular de cada técnico. Ahora el cliente firma y el PDF sale solo.", name: "Carlos Méndez", role: "Instalaciones eléctricas · Guatemala" },
              { quote: "El portal para que el cliente firme desde su teléfono nos cambió la vida. Cerramos más rápido cada entrega.", name: "Ana Reyes", role: "Distribuidora de equipos · Mixco" },
              { quote: "Sabemos exactamente dónde está cada técnico y qué hizo. Los reclamos por garantía bajaron muchísimo.", name: "Rodrigo Samayoa", role: "Empresa de mantenimiento · Antigua" },
            ].map((t, i) => (
              <figure key={i} className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
                <blockquote className="text-sm leading-relaxed text-slate-600">“{t.quote}”</blockquote>
                <figcaption className="mt-4">
                  <p className="text-sm font-bold text-slate-900">{t.name}</p>
                  <p className="text-xs text-slate-500">{t.role}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-slate-200 bg-slate-50 py-20">
        <div className="container-x max-w-3xl">
          <h2 className="text-center text-3xl font-extrabold tracking-tight text-slate-900">Preguntas frecuentes</h2>
          <div className="mt-10 space-y-4">
            {[
              { q: "¿Necesito tarjeta de crédito para probar?", a: "No. La prueba gratis de 14 días se activa al registrarte, sin tarjeta y sin compromiso." },
              { q: "¿Cómo funcionan los pagos en Guatemala?", a: "Puedes pagar con tarjeta o mediante transferencia/depósito bancario en Quetzales. Al pagar, tu suscripción se activa de inmediato." },
              { q: "¿Mis documentos firmados tienen validez?", a: "La firma digital capturada en pantalla incluye fecha, hora y datos del firmante, lo que la convierte en evidencia de conformidad del servicio prestado, con más trazabilidad que el papel." },
              { q: "¿Funciona desde el celular?", a: "Sí, TimePro es 100% web y responsivo. Tus técnicos trabajan desde su celular en campo, sin instalar nada." },
              { q: "¿Puedo cancelar cuando quiera?", a: "Sí, sin permanencia. Si cancelas, tus datos se mantienen disponibles por 6 meses y puedes descargar tu información." },
              { q: "¿Mis datos están seguros?", a: "Toda la información viaja cifrada (HTTPS), el acceso es por usuario con contraseña encriptada y tus datos viven en servidores en la nube con respaldos automáticos." },
            ].map((f, i) => (
              <details key={i} className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm open:ring-1 open:ring-brand-300">
                <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold text-slate-900">
                  {f.q}
                  <span className="ml-4 text-brand-600 transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="bg-slate-950 py-20">
        <div className="container-x text-center">
          <h2 className="mx-auto max-w-2xl text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Empieza a controlar tus proyectos hoy mismo
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-slate-400">
            Regístrate gratis, crea tu primera orden y prueba la firma digital en menos de 5 minutos.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/registro" className="btn-primary px-8 py-3.5 text-base">Crear cuenta gratis</Link>
            <a href={`https://wa.me/${process.env.NEXT_PUBLIC_OWNER_WHATSAPP || "50258303182"}`} target="_blank" rel="noreferrer" className="btn-secondary border-slate-700 bg-slate-900 px-8 py-3.5 text-base text-white hover:bg-slate-800">
              <MessageCircle className="h-4 w-4" /> Hablar por WhatsApp
            </a>
          </div>
        </div>
      </section>

      <LandingFooter />

      {/* Botón flotante de WhatsApp */}
      <a
        href={`https://wa.me/${process.env.NEXT_PUBLIC_OWNER_WHATSAPP || "50258303182"}?text=${encodeURIComponent("Hola, quiero información de TimePro")}`}
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-6 right-6 z-50 grid h-14 w-14 place-items-center rounded-full bg-emerald-500 text-white shadow-2xl transition-transform hover:scale-110"
        aria-label="WhatsApp"
      >
        <MessageCircle className="h-7 w-7" />
      </a>
    </main>
  );
}
