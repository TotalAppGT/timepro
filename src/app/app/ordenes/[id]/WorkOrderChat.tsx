"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { sendWorkOrderMessage } from "@/app/app/actions";
import { Button } from "@/components/ui";
import { Send, ImagePlus, X } from "lucide-react";
import { timeAgo } from "@/lib/utils";

export interface ChatMessage {
  id: string;
  authorName: string;
  content: string;
  attachments: string[] | null;
  createdAt: string;
  isMine: boolean;
}

export function WorkOrderChat({ workOrderId, userName: _userName, messages: initial }: { workOrderId: string; userName: string; messages: ChatMessage[] }) {
  const router = useRouter();
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [text, setText] = useState("");
  const [uploads, setUploads] = useState<string[]>([]);
  const [sending, setSending] = useState(false);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [initial.length]);

  function pickFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []).slice(0, 4 - uploads.length);
    if (files.length === 0) return;
    const readers = files.map(
      (f) => new Promise<string>((resolve) => { const r = new FileReader(); r.onload = () => resolve(String(r.result)); r.readAsDataURL(f); })
    );
    Promise.all(readers).then((results) => { setUploads((u) => [...u, ...results].slice(0, 4)); });
    e.target.value = "";
  }

  function removeUpload(i: number) { setUploads((u) => u.filter((_, idx) => idx !== i)); }

  async function send() {
    if (!text.trim() && uploads.length === 0) return;
    setSending(true);
    const r = await sendWorkOrderMessage(workOrderId, text, uploads.length ? uploads : undefined);
    if (r?.ok) { setText(""); setUploads([]); router.refresh(); }
    setSending(false);
  }

  function onKey(e: React.KeyboardEvent) { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }

  return (
    <div className="flex flex-col rounded-2xl border border-slate-200 bg-white">
      <div className="border-b border-slate-100 px-5 py-3">
        <h3 className="text-sm font-bold text-slate-900">Chat de la orden</h3>
        <p className="text-xs text-slate-400">Comunicación en tiempo real entre oficina y técnico</p>
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto p-4" style={{ maxHeight: "420px" }}>
        {initial.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-400">Aún no hay mensajes. Usa el chat para coordinar con tu equipo.</p>
        ) : (
          initial.map((m) => (
            <div key={m.id} className={`flex ${m.isMine ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${m.isMine ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-800"}`}>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold opacity-70">{m.isMine ? "Tú" : m.authorName.split(" ")[0]}</span>
                  <span className="text-[10px] opacity-50">{timeAgo(m.createdAt)}</span>
                </div>
                <p className="mt-1 text-sm whitespace-pre-wrap break-words">{m.content}</p>
                {m.attachments && m.attachments.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {m.attachments.map((url, i) => (
                      <img key={i} src={url} alt="" className="h-20 w-20 rounded-lg object-cover border border-white/20" />
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>
      {uploads.length > 0 && (
        <div className="flex gap-2 border-t border-slate-100 px-4 py-2">
          {uploads.map((url, i) => (
            <div key={i} className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-slate-200">
              <img src={url} alt="" className="h-full w-full object-cover" />
              <button onClick={() => removeUpload(i)} className="absolute -right-0.5 -top-0.5 grid h-5 w-5 place-items-center rounded-full bg-slate-700 text-white">
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="flex items-end gap-2 border-t border-slate-100 p-3">
        <button type="button" onClick={() => fileInputRef.current?.click()} className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-500 hover:bg-brand-50 hover:text-brand-600">
          <ImagePlus className="h-5 w-5" />
          <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={pickFiles} />
        </button>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKey}
          placeholder="Escribe un mensaje..."
          className="input min-h-[40px] flex-1 resize-none py-2 text-sm"
          rows={1}
        />
        <Button type="button" onClick={send} loading={sending} disabled={!text.trim() && uploads.length === 0} className="btn-primary h-10 w-10 shrink-0 p-0">
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
