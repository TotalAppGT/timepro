import { MessageCircle, Mail, MapPin, Clock } from "lucide-react";
import { LandingNav } from "@/components/LandingNav";
import { LandingFooter } from "@/components/LandingFooter";
import { ContactForm } from "./ContactForm";

export const metadata = { title: "Contacto" };

export default function ContactPage() {
  const whatsapp = process.env.NEXT_PUBLIC_OWNER_WHATSAPP || "50258303182";
  return (
    <main className="min-h-screen bg-slate-50">
      <LandingNav />
      <section className="py-16">
        <div className="container-x">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">Hablemos</h1>
            <p className="mt-4 text-slate-500">
              ¿Tienes dudas o quieres una demostración? Escríbenos y te atendemos el mismo día.
            </p>
          </div>

          <div className="mt-12 grid gap-8 lg:grid-cols-5">
            <div className="space-y-4 lg:col-span-2">
              {[
                { icon: MessageCircle, title: "WhatsApp", value: "5830 3182", href: `https://wa.me/${whatsapp}` },
                { icon: Mail, title: "Correo", value: process.env.OWNER_EMAIL || "totalappgt@gmail.com", href: `mailto:${process.env.OWNER_EMAIL || "totalappgt@gmail.com"}` },
                { icon: MapPin, title: "Ubicación", value: "Guatemala, Guatemala 🇬🇹" },
                { icon: Clock, title: "Horario", value: "Lunes a sábado · 8:00 a 18:00" },
              ].map((c, i) => (
                <div key={i} className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
                    <c.icon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="font-semibold text-slate-900">{c.title}</p>
                    {c.href ? (
                      <a href={c.href} target="_blank" rel="noreferrer" className="text-sm text-brand-600 hover:underline">{c.value}</a>
                    ) : (
                      <p className="text-sm text-slate-500">{c.value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="lg:col-span-3">
              <ContactForm />
            </div>
          </div>
        </div>
      </section>
      <LandingFooter />
    </main>
  );
}
