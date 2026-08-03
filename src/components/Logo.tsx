import Link from "next/link";
import { Timer } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({ className, light = false }: { className?: string; light?: boolean }) {
  return (
    <Link href="/" className={cn("inline-flex items-center gap-2 font-bold", className)}>
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-600 text-white shadow-soft">
        <Timer className="h-5 w-5" />
      </span>
      <span className={cn("text-lg tracking-tight", light ? "text-white" : "text-slate-900")}>
        Time<span className="text-brand-600">Pro</span>
      </span>
    </Link>
  );
}
