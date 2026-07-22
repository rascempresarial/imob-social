"use client";

import { useCallback, useEffect, useState } from "react";
import { AccessKey } from "@/lib/types";
import PageHeader from "@/components/PageHeader";
import { IconKey } from "@/components/icons";
import { SkeletonTableRows } from "@/components/Skeleton";
import { useConfirm, useToast } from "@/components/UIProvider";

export default function ChavesPage() {
  const [keys, setKeys] = useState<AccessKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [label, setLabel] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [justCreated, setJustCreated] = useState<AccessKey | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const confirmDialog = useConfirm();
  const toast = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/access-keys");
    const data = await res.json();
    setKeys(data.data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!label.trim()) return;
    setError(null);
    setSaving(true);
    try {
      const res = await fetch("/api/access-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Erro ao criar chave.");
        return;
      }
      setJustCreated(data.data);
      setLabel("");
      load();
    } finally {
      setSaving(false);
    }
  }

  async function toggleAtivo(k: AccessKey) {
    await fetch(`/api/access-keys/${k.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !k.active }),
    });
    load();
  }

  async function handleDelete(id: string) {
    const ok = await confirmDialog({
      title: "Excluir chave",
      message: "Excluir esta chave? A pessoa não vai mais conseguir entrar com ela.",
      confirmLabel: "Excluir",
      danger: true,
    });
    if (!ok) return;
    const res = await fetch(`/api/access-keys/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) {
      toast(data.error ?? "Erro ao excluir.", "error");
      return;
    }
    toast("Chave excluída.", "success");
    load();
  }

  function copy(k: AccessKey) {
    navigator.clipboard.writeText(k.key);
    setCopiedId(k.id);
    setTimeout(() => setCopiedId(null), 1500);
  }

  return (
    <div>
      <PageHeader
        icon={<IconKey className="w-full h-full" />}
        title="Chaves de acesso"
        subtitle="Cada pessoa da equipe entra com uma chave própria, sem senha, sem email"
      />

      <form onSubmit={handleCreate} className="flex items-end gap-3 mb-6 max-w-xl">
        <div className="flex-1">
          <label className="block text-xs font-medium text-navy-800 mb-1">Nome da pessoa</label>
          <input className="inp" placeholder="Ex: Ana Corretora" value={label} onChange={(e) => setLabel(e.target.value)} />
        </div>
        <button
          type="submit"
          disabled={saving || !label.trim()}
          className="px-4 py-2 text-sm rounded-lg bg-navy-800 text-white hover:bg-navy-700 disabled:opacity-50 whitespace-nowrap h-[38px]"
        >
          {saving ? "Gerando..." : "Gerar chave"}
        </button>
      </form>
      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      {justCreated && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 mb-6 max-w-xl">
          <p className="text-sm text-green-800 mb-2">
            Chave criada para <strong>{justCreated.label}</strong>, copie e envie pra pessoa, ela não aparece de novo assim tão fácil:
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 bg-white border border-green-300 rounded px-3 py-2 text-sm font-mono text-navy-900">
              {justCreated.key}
            </code>
            <button
              onClick={() => copy(justCreated)}
              className="px-3 py-2 text-xs rounded-lg bg-navy-800 text-white hover:bg-navy-700"
            >
              {copiedId === justCreated.id ? "Copiado!" : "Copiar"}
            </button>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-navy-100 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-navy-100 text-left text-navy-500">
              <th className="px-4 py-3 font-medium">Nome</th>
              <th className="px-4 py-3 font-medium">Chave</th>
              <th className="px-4 py-3 font-medium">Último acesso</th>
              <th className="px-4 py-3 font-medium">Ativa</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {loading && <SkeletonTableRows cols={5} />}
            {!loading && keys.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-navy-400">
                  Nenhuma chave cadastrada ainda.
                </td>
              </tr>
            )}
            {!loading && keys.map((k) => (
              <tr key={k.id} className="border-b border-navy-100 last:border-0">
                <td className="px-4 py-3 text-navy-900">{k.label}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <code className="text-xs font-mono text-navy-600">{k.key}</code>
                    <button onClick={() => copy(k)} className="text-navy-400 hover:text-navy-800 text-xs">
                      {copiedId === k.id ? "Copiado!" : "Copiar"}
                    </button>
                  </div>
                </td>
                <td className="px-4 py-3 text-navy-600">
                  {k.last_used_at ? new Date(k.last_used_at).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" }) : "Nunca"}
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => toggleAtivo(k)}
                    className={`text-xs rounded-full px-2.5 py-0.5 font-medium ${
                      k.active ? "bg-green-100 text-green-700" : "bg-navy-100 text-navy-500"
                    }`}
                  >
                    {k.active ? "Ativa" : "Desativada"}
                  </button>
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => handleDelete(k.id)} className="text-red-600 hover:text-red-800 text-xs font-medium">
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
