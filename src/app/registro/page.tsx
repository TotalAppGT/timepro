import { Suspense } from "react";
import Link from "next/link";
import { Timer } from "lucide-react";
import { RegisterForm } from "./RegisterForm";

export const metadata = { title: "Crear cuenta gratis" };

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-brand-600/20 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-sky-600/10 blur-3xl" />
      </div>
      <div className="relative w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-600 text-white">
              <Timer className="h-6 w-6" />
            </span>
            <span className="text-2xl font-bold text-white">Time<span className="text-brand-400">Pro</span></span>
          </Link>
          <p className="mt-4 text-sm text-slate-400">
            Crea tu cuenta gratis · 14 días de prueba completa · Sin tarjeta de crédito
          </p>
        </div>
        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-7 shadow-2xl backdrop-blur">
          <Suspense>
            <RegisterForm />
          </Suspense>
        </div>
        <p className="mt-6 text-center text-sm text-slate-400">
          ¿Ya tienes cuenta?{" "}
          <Link href="/iniciar-sesion" className="font-semibold text-brand-400 hover:underline">
            Inicia sesión
          </Link>
        </p>
        <p className="mt-4 text-center text-xs text-slate-500">
          Al registrarte aceptas los{" "}
          <Link href="/terminos" className="underline hover:text-slate-300">términos</Link> y la{" "}
          <Link href="/privacidad" className="underline hover:text-slate-300">política de privacidad</Link>.
        </p>
      </div>
    </main>
  );
}
