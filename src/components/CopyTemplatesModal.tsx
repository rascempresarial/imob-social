"use client";

import { useCallback, useEffect, useState } from "react";
import Modal from "./Modal";
import { CopyTemplate } from "@/lib/types";
import { useConfirm, useToast } from "./UIProvider";
import { IconCopy } from "./icons";

export default function CopyTemplatesModal({ rede, onClose }: { rede: string; onClose: () => void }) {
  const [templates, setTemplates] = useState<CopyTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [titulo, setTitulo] = useState("");
  const [texto, setTexto] = useState("");
  const [saving, setSaving] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const confirmDialog = useConfirm();
  const toast = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/copy-templates?rede=${rede}`);
    const data = await res.json();
    setTemplates(data.data ?? []);
    setLoading(false);
  }, [rede]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!titulo.trim() || !texto.trim()) return;
    setSaving(true);
    try {
      await fetch("/api/copy-templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rede, titulo, texto }),
      });
      setTitulo("");
      setTexto("");
      toast("Modelo salvo.", "success");
      load();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    const ok = await confirmDialog({ title: "Excluir modelo", message: "Excluir este modelo de copy?", confirmLabel: "Excluir", danger: true });
    if (!ok) return;
    await fetch(`/api/copy-templates/${id}`, { method: "DELETE" });
    toast("Modelo excluído.", "success");
    load();
  }

  function copy(t: CopyTemplate) {
    navigator.clipboard.writeText(t.texto);
    setCopiedId(t.id);
    setTimeout(() => setCopiedId(null), 1500);
  }

  return (
    <Modal title="Modelos de copy" onClose={onClose} width="max-w-xl">
      {loading && <p className="text-sm text-navy-400">Carregando...</p>}
      {!loading && templates.length === 0 && <p className="text-sm text-navy-400 mb-4">Nenhum modelo ainda.</p>}
      <div className="space-y-2 mb-5">
        {templates.map((t) => (
          <div key={t.id} className="rounded-lg border border-navy-100 p-3">
            <div className="flex items-start justify-between gap-2 mb-1">
              <p className="text-sm font-medium text-navy-900">{t.titulo}</p>
              <div className="flex items-center gap-3 shrink-0">
                <button onClick={() => copy(t)} className="flex items-center gap-1 text-xs text-navy-600 hover:text-navy-900">
                  <IconCopy className="w-3.5 h-3.5" />
                  {copiedId === t.id ? "Copiado!" : "Copiar"}
                </button>
                <button onClick={() => handleDelete(t.id)} className="text-xs text-red-600 hover:text-red-800">
                  Excluir
                </button>
              </div>
            </div>
            <p className="text-xs text-navy-600 whitespace-pre-wrap">{t.texto}</p>
          </div>
        ))}
      </div>

      <form onSubmit={handleAdd} className="space-y-2 border-t border-navy-100 pt-4">
        <input className="inp" placeholder="Título do modelo" value={titulo} onChange={(e) => setTitulo(e.target.value)} />
        <textarea
          className="inp"
          rows={3}
          placeholder="Texto da legenda..."
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
        />
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving || !titulo.trim() || !texto.trim()}
            className="px-4 py-2 text-sm rounded-lg bg-navy-800 text-white hover:bg-navy-700 disabled:opacity-50"
          >
            Adicionar modelo
          </button>
        </div>
      </form>
    </Modal>
  );
}
