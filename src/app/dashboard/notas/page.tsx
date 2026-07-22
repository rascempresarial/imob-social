"use client";

import { useCallback, useEffect, useState } from "react";
import { Nota } from "@/lib/types";
import PageHeader from "@/components/PageHeader";
import { IconNote, IconPin } from "@/components/icons";
import { SkeletonCards } from "@/components/Skeleton";
import { useConfirm, useToast } from "@/components/UIProvider";

export default function NotasPage() {
  const [notas, setNotas] = useState<Nota[]>([]);
  const [loading, setLoading] = useState(true);
  const [titulo, setTitulo] = useState("");
  const [conteudo, setConteudo] = useState("");
  const [saving, setSaving] = useState(false);
  const confirmDialog = useConfirm();
  const toast = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/notas");
    const data = await res.json();
    setNotas(data.data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!conteudo.trim()) return;
    setSaving(true);
    try {
      await fetch("/api/notas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ titulo, conteudo }),
      });
      setTitulo("");
      setConteudo("");
      toast("Nota adicionada.", "success");
      load();
    } finally {
      setSaving(false);
    }
  }

  async function toggleFixado(n: Nota) {
    await fetch(`/api/notas/${n.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fixado: !n.fixado }),
    });
    load();
  }

  async function handleDelete(id: string) {
    const ok = await confirmDialog({ title: "Excluir nota", message: "Excluir esta nota?", confirmLabel: "Excluir", danger: true });
    if (!ok) return;
    await fetch(`/api/notas/${id}`, { method: "DELETE" });
    toast("Nota excluída.", "success");
    load();
  }

  return (
    <div>
      <PageHeader icon={<IconNote className="w-full h-full" />} title="Notas" subtitle="Quadro rápido para lembretes da equipe" />

      <form onSubmit={handleAdd} className="rounded-xl border border-navy-100 bg-white p-4 mb-6 max-w-xl space-y-3">
        <input className="inp" placeholder="Título (opcional)" value={titulo} onChange={(e) => setTitulo(e.target.value)} />
        <textarea className="inp" rows={3} placeholder="Escreva uma nota..." value={conteudo} onChange={(e) => setConteudo(e.target.value)} />
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving || !conteudo.trim()}
            className="px-4 py-2 text-sm rounded-lg bg-navy-800 text-white hover:bg-navy-700 disabled:opacity-50"
          >
            Adicionar nota
          </button>
        </div>
      </form>

      {!loading && notas.length === 0 && <p className="text-sm text-navy-400">Nenhuma nota ainda.</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading && <SkeletonCards count={3} />}
        {!loading && notas.map((n) => (
          <div key={n.id} className={`rounded-xl border p-4 bg-white ${n.fixado ? "border-navy-500" : "border-navy-100"}`}>
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="text-sm font-semibold text-navy-900">{n.titulo || "Sem título"}</h3>
              <button onClick={() => toggleFixado(n)} className={`shrink-0 ${n.fixado ? "text-navy-800" : "text-navy-300"} hover:text-navy-800`} title="Fixar">
                <IconPin className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-navy-600 whitespace-pre-wrap">{n.conteudo}</p>
            <div className="flex items-center justify-between mt-3 pt-2 border-t border-navy-100">
              <span className="text-[11px] text-navy-400">{n.created_by ?? "·"}</span>
              <button onClick={() => handleDelete(n.id)} className="text-xs text-red-600 hover:text-red-800">
                Excluir
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
