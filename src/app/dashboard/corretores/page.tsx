"use client";

import { useCallback, useEffect, useState } from "react";
import { CorretorComStats } from "@/lib/types";
import PageHeader from "@/components/PageHeader";
import { IconUsers } from "@/components/icons";
import { Skeleton } from "@/components/Skeleton";
import { useConfirm, useToast } from "@/components/UIProvider";

export default function CorretoresPage() {
  const [corretores, setCorretores] = useState<CorretorComStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [saving, setSaving] = useState(false);
  const confirmDialog = useConfirm();
  const toast = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/corretores");
    const data = await res.json();
    setCorretores(data.data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!nome.trim()) return;
    setSaving(true);
    try {
      await fetch("/api/corretores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, telefone }),
      });
      setNome("");
      setTelefone("");
      toast("Corretor adicionado.", "success");
      load();
    } finally {
      setSaving(false);
    }
  }

  async function toggleAtivo(c: CorretorComStats) {
    await fetch(`/api/corretores/${c.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ativo: !c.ativo }),
    });
    load();
  }

  async function handleDelete(id: string) {
    const ok = await confirmDialog({
      title: "Excluir corretor",
      message: "Excluir este corretor? Imóveis vinculados ficarão sem corretor associado.",
      confirmLabel: "Excluir",
      danger: true,
    });
    if (!ok) return;
    await fetch(`/api/corretores/${id}`, { method: "DELETE" });
    toast("Corretor excluído.", "success");
    load();
  }

  return (
    <div>
      <PageHeader icon={<IconUsers className="w-full h-full" />} title="Corretores" subtitle="Imóveis e anúncios rodando por corretor" />

      <form onSubmit={handleAdd} className="flex gap-3 mb-6 max-w-xl">
        <input className="inp" placeholder="Nome" value={nome} onChange={(e) => setNome(e.target.value)} />
        <input className="inp" placeholder="Telefone (opcional)" value={telefone} onChange={(e) => setTelefone(e.target.value)} />
        <button
          type="submit"
          disabled={saving || !nome.trim()}
          className="px-4 py-2 text-sm rounded-lg bg-navy-800 text-white hover:bg-navy-700 disabled:opacity-50 whitespace-nowrap"
        >
          + Adicionar
        </button>
      </form>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {loading &&
          Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-36 rounded-xl" />)}
        {!loading && corretores.length === 0 && (
          <p className="col-span-full text-sm text-navy-400 py-8 text-center">Nenhum corretor cadastrado ainda.</p>
        )}
        {!loading &&
          corretores.map((c) => (
            <div key={c.id} className="h-36 rounded-xl border border-navy-100 bg-white p-4 flex flex-col">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium text-navy-900 leading-snug">{c.nome}</p>
                <button
                  onClick={() => handleDelete(c.id)}
                  className="text-navy-300 hover:text-red-600 text-[11px] shrink-0"
                >
                  Excluir
                </button>
              </div>
              {c.telefone && <p className="text-xs text-navy-500 mt-1">{c.telefone}</p>}
              <button
                onClick={() => toggleAtivo(c)}
                className={`self-start mt-2 text-[11px] rounded-full px-2 py-0.5 font-medium ${
                  c.ativo ? "bg-green-100 text-green-700" : "bg-navy-100 text-navy-500"
                }`}
              >
                {c.ativo ? "Ativo" : "Inativo"}
              </button>
              <div className="mt-auto pt-3 border-t border-navy-100 space-y-1.5">
                <div className="flex items-center justify-between text-xs text-navy-600">
                  <span>Imóveis cadastrados</span>
                  <span className="font-semibold text-navy-900">{c.imoveis_count}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-navy-600">
                  <span>Anúncios rodando</span>
                  <span className="font-semibold text-navy-900">{c.anuncios_rodando}</span>
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
