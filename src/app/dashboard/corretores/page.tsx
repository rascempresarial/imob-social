"use client";

import { useCallback, useEffect, useState } from "react";
import { Corretor } from "@/lib/types";
import PageHeader from "@/components/PageHeader";
import { IconUsers } from "@/components/icons";
import { SkeletonTableRows } from "@/components/Skeleton";
import { useConfirm, useToast } from "@/components/UIProvider";

export default function CorretoresPage() {
  const [corretores, setCorretores] = useState<Corretor[]>([]);
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

  async function toggleAtivo(c: Corretor) {
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
      message: "Excluir este corretor? Posts vinculados ficarão sem corretor associado.",
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
      <PageHeader icon={<IconUsers className="w-full h-full" />} title="Corretores" subtitle="Equipe vinculada aos posts" />

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

      <div className="rounded-xl border border-navy-100 bg-white overflow-hidden max-w-xl">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-navy-100 text-left text-navy-500">
              <th className="px-4 py-3 font-medium">Nome</th>
              <th className="px-4 py-3 font-medium">Telefone</th>
              <th className="px-4 py-3 font-medium">Ativo</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {loading && <SkeletonTableRows cols={4} />}
            {!loading && corretores.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-navy-400">
                  Nenhum corretor cadastrado ainda.
                </td>
              </tr>
            )}
            {!loading && corretores.map((c) => (
              <tr key={c.id} className="border-b border-navy-100 last:border-0">
                <td className="px-4 py-3 text-navy-900">{c.nome}</td>
                <td className="px-4 py-3 text-navy-600">{c.telefone ?? "·"}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => toggleAtivo(c)}
                    className={`text-xs rounded-full px-2.5 py-0.5 font-medium ${
                      c.ativo ? "bg-green-100 text-green-700" : "bg-navy-100 text-navy-500"
                    }`}
                  >
                    {c.ativo ? "Ativo" : "Inativo"}
                  </button>
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => handleDelete(c.id)} className="text-red-600 hover:text-red-800 text-xs font-medium">
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
