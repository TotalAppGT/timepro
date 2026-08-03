import Link from "next/link";
import { Timer } from "lucide-react";
import { LoginForm } from "./LoginForm";

export const metadata = { title: "Iniciar sesión" };

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-brand-600/20 blur-3xl" />
      </div>
      <div className="relative w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-600 text-white">
              <Timer className="h-6 w-6" />
            </span>
            <span className="text-2xl font-bold text-white">Time<span className="text-brand-400">Pro</span></span>
          </Link>
          <p className="mt-4 text-sm text-slate-400">Bienvenido de nuevo. Ingresa a tu cuenta.</p>
        </div>
        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-7 shadow-2xl backdrop-blur">
          <LoginForm />
        </div>
        <p className="mt-6 text-center text-sm text-slate-400">
          ¿Aún no tienes cuenta?{" "}
          <Link href="/registro" className="font-semibold text-brand-400 hover:underline">
            Crea una gratis
          </Link>
        </p>
      </div>
    </main>
  );
}
