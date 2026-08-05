import { LandingNav } from "@/components/LandingNav";
import { LandingFooter } from "@/components/LandingFooter";

export const metadata = { title: "Términos y Condiciones" };

export default function TermsPage() {
  const email = process.env.OWNER_EMAIL || "totalappgt@gmail.com";
  const phone = process.env.OWNER_PHONE || "5830 3182";
  const date = "Agosto 2026";

  return (
    <main className="min-h-screen bg-white">
      <LandingNav />
      <section className="py-16">
        <div className="container-x max-w-3xl">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">Términos y Condiciones</h1>
          <p className="mt-2 text-sm text-slate-500">Última actualización: {date}</p>

          <div className="mt-10 space-y-8 text-[15px] leading-relaxed text-slate-600">
            <div>
              <h2 className="mb-2 text-lg font-bold text-slate-900">1. Aceptación de los términos</h2>
              <p>
                Al crear una cuenta en TimePro aceptas estos Términos y Condiciones y la Política de Privacidad. Si no estás de acuerdo, no utilices el servicio.
              </p>
            </div>
            <div>
              <h2 className="mb-2 text-lg font-bold text-slate-900">2. El servicio</h2>
              <p>
                TimePro es un software como servicio (SaaS) que permite gestionar proyectos, órdenes de trabajo, entregas, instalaciones, firmas digitales y
                documentos. El servicio se provee por suscripción mensual o anual, facturada en Quetzales (Q).
              </p>
            </div>
            <div>
              <h2 className="mb-2 text-lg font-bold text-slate-900">3. Cuentas y registro</h2>
              <ul className="list-disc space-y-1 pl-5">
                <li>Debes proporcionar información veraz al registrarte.</li>
                <li>Eres responsable de mantener la confidencialidad de tus credenciales de acceso.</li>
                <li>Una cuenta puede incluir varios usuarios según el plan contratado.</li>
                <li>Los datos de cada empresa son privados y no se comparten entre clientes.</li>
              </ul>
            </div>
            <div>
              <h2 className="mb-2 text-lg font-bold text-slate-900">4. Planes, precios y prueba gratuita</h2>
              <ul className="list-disc space-y-1 pl-5">
                <li>La prueba gratuita de 14 días no requiere tarjeta de crédito.</li>
                <li>Los precios se publican en el sitio en Quetzales y pueden ajustarse con aviso previo.</li>
                <li>El pago anual equivale a 10 meses (2 meses de descuento).</li>
                <li>Al finalizar la prueba, para continuar usando el servicio deberás contratar un plan.</li>
              </ul>
            </div>
            <div>
              <h2 className="mb-2 text-lg font-bold text-slate-900">5. Pagos y facturación</h2>
              <p>
                Aceptamos tarjeta de crédito/débito y transferencia o depósito bancario. La suscripción se renueva automáticamente en el periodo elegido hasta que
                se cancele. Emitimos comprobante de cada pago recibido.
              </p>
            </div>
            <div>
              <h2 className="mb-2 text-lg font-bold text-slate-900">6. Cancelación</h2>
              <p>
                Puedes cancelar tu suscripción en cualquier momento desde la configuración o contactándonos. No hay permanencia. Tras la cancelación tendrás 6 meses
                para descargar tu información antes de que sea eliminada.
              </p>
            </div>
            <div>
              <h2 className="mb-2 text-lg font-bold text-slate-900">7. Uso adecuado</h2>
              <p>
                No puedes usar TimePro para actividades ilegales, enviar spam, vulnerar derechos de terceros o intentar acceder a información de otros clientes.
                Nos reservamos el derecho de suspender cuentas que infrinjan estas reglas.
              </p>
            </div>
            <div>
              <h2 className="mb-2 text-lg font-bold text-slate-900">8. Validez de firmas digitales</h2>
              <p>
                Las firmas capturadas a través de la plataforma, junto con su registro de fecha, hora, datos del firmante y evidencia asociada, constituyen evidencia
                de conformidad del servicio. No constituyen asesoría legal; cada empresa es responsable del uso que dé a sus documentos.
              </p>
            </div>
            <div>
              <h2 className="mb-2 text-lg font-bold text-slate-900">9. Limitación de responsabilidad</h2>
              <p>
                El servicio se ofrece &ldquo;tal cual&rdquo;. No garantizamos disponibilidad ininterrumpida, aunque trabajamos para mantener una disponibilidad superior al 99%.
                No somos responsables por daños indirectos derivados del uso del servicio.
              </p>
            </div>
            <div>
              <h2 className="mb-2 text-lg font-bold text-slate-900">10. Contacto</h2>
              <p>
                Para cualquier duda sobre estos términos escríbenos a {email} o por WhatsApp al {phone}.
              </p>
            </div>
          </div>
        </div>
      </section>
      <LandingFooter />
    </main>
  );
}
