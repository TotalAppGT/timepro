import { LandingNav } from "@/components/LandingNav";
import { LandingFooter } from "@/components/LandingFooter";

export const metadata = { title: "Política de Privacidad" };

export default function PrivacyPage() {
  const owner = process.env.OWNER_NAME || "Total App GT";
  const email = process.env.OWNER_EMAIL || "totalappgt@gmail.com";
  const phone = process.env.OWNER_PHONE || "5830 3182";
  const date = "Agosto 2026";

  return (
    <main className="min-h-screen bg-white">
      <LandingNav />
      <section className="py-16">
        <div className="container-x max-w-3xl">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">Política de Privacidad</h1>
          <p className="mt-2 text-sm text-slate-500">Última actualización: {date}</p>

          <div className="prose mt-10 space-y-8 text-[15px] leading-relaxed text-slate-600">
            <div>
              <h2 className="mb-2 text-lg font-bold text-slate-900">1. Responsable del tratamiento</h2>
              <p>
                {owner}, propietario de la plataforma <strong>TimePro</strong> ("nosotros", "TimePro"), con contacto en {email} y WhatsApp {phone}.
                TimePro es una solución SaaS de gestión de proyectos, entregas, instalaciones y firmas digitales, operada en Guatemala.
              </p>
            </div>
            <div>
              <h2 className="mb-2 text-lg font-bold text-slate-900">2. Datos que recopilamos</h2>
              <p>Al crear tu cuenta y usar la plataforma podemos recopilar:</p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>Datos de cuenta: nombre, correo electrónico, teléfono, nombre de empresa.</li>
                <li>Datos de negocio que tú o tu equipo ingresan: clientes, proyectos, órdenes de trabajo, documentos.</li>
                <li>Firmas digitales, fotografías y geolocalización capturadas durante el uso de la aplicación.</li>
                <li>Datos técnicos: dirección IP, navegador, dispositivo y registros de acceso con fines de seguridad.</li>
              </ul>
            </div>
            <div>
              <h2 className="mb-2 text-lg font-bold text-slate-900">3. Uso de la información</h2>
              <p>Usamos tus datos para:</p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>Prestar y operar el servicio (multi-tenant: cada empresa solo ve su propia información).</li>
                <li>Autenticación segura y prevención de fraude.</li>
                <li>Enviarte notificaciones por correo y WhatsApp relacionadas con el servicio.</li>
                <li>Generar los documentos PDF y reportes que solicitas.</li>
                <li>Facturar tus suscripciones.</li>
                <li>Mejorar el producto con datos agregados y anónimos.</li>
              </ul>
            </div>
            <div>
              <h2 className="mb-2 text-lg font-bold text-slate-900">4. WhatsApp y correo electrónico</h2>
              <p>
                Cuando elijas activar notificaciones, podremos enviarte mensajes a través de la API de WhatsApp (Meta) y correos electrónicos (Resend).
                Estos mensajes están relacionados con tu operación: órdenes asignadas, documentos firmados, avisos de vencimiento y soporte.
                No vendemos tu información a terceros.
              </p>
            </div>
            <div>
              <h2 className="mb-2 text-lg font-bold text-slate-900">5. Almacenamiento y seguridad</h2>
              <p>
                Tus datos se almacenan cifrados en servidores en la nube con respaldos automáticos. Las contraseñas se guardan cifradas (hash) y el acceso
                a la plataforma se realiza mediante conexiones seguras (HTTPS). Limitamos el acceso a datos de cada empresa a sus propios usuarios con roles y permisos.
              </p>
            </div>
            <div>
              <h2 className="mb-2 text-lg font-bold text-slate-900">6. Retención de datos</h2>
              <p>
                Mientras tu suscripción esté activa conservamos tus datos para operar el servicio. Al cancelar, tus datos se mantienen disponibles durante 6 meses
                para que puedas descargarlos. Después de ese periodo se eliminan de forma segura.
              </p>
            </div>
            <div>
              <h2 className="mb-2 text-lg font-bold text-slate-900">7. Tus derechos</h2>
              <p>
                Tienes derecho a acceder, corregir y solicitar la eliminación de tus datos personales. Para ejercer estos derechos, escríbenos a {email} o por WhatsApp al {phone}.
              </p>
            </div>
            <div>
              <h2 className="mb-2 text-lg font-bold text-slate-900">8. Cambios a esta política</h2>
              <p>
                Podemos actualizar esta política periódicamente. Te notificaremos de cambios relevantes dentro de la plataforma o por correo. El uso continuado del
                servicio tras los cambios implica su aceptación.
              </p>
            </div>
          </div>
        </div>
      </section>
      <LandingFooter />
    </main>
  );
}
