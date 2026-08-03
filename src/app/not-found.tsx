import Link from "next/link";
import { Timer } from "lucide-react";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-4 text-center">
      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-600 text-white">
        <Timer className="h-7 w-7" />
      </span>
      <h1 className="mt-6 text-3xl font-extrabold text-white">Página no encontrada</h1>
      <p className="mt-2 text-slate-400">La página que buscas no existe o fue movida.</p>
      <Link href="/" className="btn-primary mt-8">Volver al inicio</Link>
    </main>
  );
}
