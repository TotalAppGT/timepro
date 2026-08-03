"use client";

import { useState } from "react";
import { ensureApprovalLink } from "@/app/app/actions";
import { Button, Alert } from "@/components/ui";
import { Share2, Link2, Copy, MessageCircle, Check } from "lucide-react";

export function ApprovalLinkCard({
  type,
  entityId,
  entityLabel,
  existingLink,
  sharePhone,
  disabled,
}: {
  type: "WORKORDER" | "PROJECT";
  entityId: string;
  entityLabel: string;
  existingLink?: string | null;
  sharePhone?: string | null;
  disabled?: boolean;
}) {
  const [link, setLink] = useState<string | null>(existingLink || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function generate() {
    setLoading(true);
    setError(null);
    const r = await ensureApprovalLink({ type, id: entityId });
    if (r?.error) setError(r.error);
    else if (r?.link) setLink(r.link);
    setLoading(false);
  }

  async function copy() {
    if (!link) return;
    await navigator.clipboard?.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const waText = encodeURIComponent(
    `Hola! Te compartimos el enlace para confirmar y firmar la aprobación de: ${entityLabel}.\n\n${link ?? ""}\n\nGracias.`
  );
  const waPhone = sharePhone ? sharePhone.replace(/\D/g, "") : "";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-center gap-2">
        <Share2 className="h-4 w-4 text-brand-600" />
        <h3 className="text-sm font-bold text-slate-900">Link de aprobación y firma</h3>
      </div>
      <p className="mt-1 text-xs text-slate-500">
        Genera un enlace público para que el cliente confirme, firme y deje su nombre. Sin registrarse.
      </p>

      {link ? (
        <div className="mt-3 space-y-3">
          <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2.5">
            <Link2 className="h-4 w-4 shrink-0 text-slate-400" />
            <span className="min-w-0 flex-1 truncate text-xs text-slate-600">{link}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={copy} className="btn-secondary text-xs">
              {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />} {copied ? "Copiado" : "Copiar link"}
            </Button>
            <a
              href={`https://wa.me/${waPhone ? waPhone : "502"}/?text=${waText}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary text-xs"
            >
              <MessageCircle className="h-4 w-4" /> Enviar por WhatsApp
            </a>
            <a href={link} target="_blank" rel="noopener noreferrer" className="btn-ghost text-xs">
              Ver portal
            </a>
          </div>
        </div>
      ) : (
        <Button type="button" onClick={generate} loading={loading} disabled={disabled} className="btn-primary mt-3 text-sm">
          <Link2 className="h-4 w-4" /> {loading ? "Generando..." : "Generar link de aprobación"}
        </Button>
      )}
      {error && <div className="mt-3"><Alert kind="error">{error}</Alert></div>}
    </div>
  );
}
