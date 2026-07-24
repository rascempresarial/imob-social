"use client";

import { useCallback, useEffect, useState } from "react";
import { RedeMetrica } from "@/lib/types";
import PageHeader from "@/components/PageHeader";
import { IconChart, IconInstagram, IconLinkedin, IconTarget } from "@/components/icons";
import { useConfirm, useToast } from "@/components/UIProvider";

const REDES = [
  { value: "instagram", label: "Instagram", icon: IconInstagram },
  { value: "linkedin", label: "LinkedIn", icon: IconLinkedin },
  { value: "meta-ads", label: "Meta ADS", icon: IconTarget },
];

function mesAtual() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export default function MetricasConfigPage() {
  const [rede, setRede] = useState("instagram");
  const [mes, setMes] = useState(mesAtual());
  const [metricas, setMetricas] = useState<RedeMetrica[]>([]);
  const [loading, setLoading] = useState(true);
  const [novoNome, setNovoNome] = useState("");
  const [novoValor, setNovoValor] = useState("");
  const [saving, setSaving] = useState(false);
  const confirmDialog = useConfirm();
  const toast = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/metricas?rede=${rede}`);
    const data = await res.json();
    setMetricas(data.data ?? []);
    setLoading(false);
  }, [rede]);

  useEffect(() => {
    load();
  }, [load]);

  const doSalvar = useCallback(
    async (metrica: string, valor: number) => {
      const res = await fetch("/api/metricas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rede, mes: `${mes}-01`, metrica, valor }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast(data.error ?? "Erro ao salvar.", "error");
        return;
      }
      load();
    },
    [rede, mes, load, toast]
  );

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!novoNome.trim() || novoValor === "") return;
    setSaving(true);
    try {
      await doSalvar(novoNome.trim(), Number(novoValor));
      setNovoNome("");
      setNovoValor("");
      toast("Métrica salva.", "success");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    const ok = await confirmDialog({ title: "Excluir métrica", message: "Excluir este valor?", confirmLabel: "Excluir", danger: true });
    if (!ok) return;
    await fetch(`/api/metricas/${id}`, { method: "DELETE" });
    toast("Métrica excluída.", "success");
    load();
  }

  const doMes = metricas.filter((m) => m.mes.startsWith(mes));

  return (
    <div>
      <PageHeader
        icon={<IconChart className="w-full h-full" />}
        title="Métricas"
        subtitle="Números manuais por rede, exibidos nas páginas de Planejamento"
        backHref="/dashboard/configuracoes"
        backLabel="Configurações"
      />

      <div className="flex items-center gap-2 mb-4">
        {REDES.map((r) => (
          <button
            key={r.value}
            onClick={() => setRede(r.value)}
            className={`flex items-center gap-1.5 text-xs rounded-full px-3 py-1.5 font-medium border ${
              rede === r.value ? "bg-navy-800 text-white border-navy-800" : "border-navy-200 text-navy-600"
            }`}
          >
            <r.icon className="w-3.5 h-3.5" />
            {r.label}
          </button>
        ))}
      </div>

      <div className="mb-6 max-w-xs">
        <label className="block text-xs font-medium text-navy-800 mb-1">Mês</label>
        <input type="month" className="inp" value={mes} onChange={(e) => setMes(e.target.value)} />
      </div>

      <div className="rounded-xl border border-navy-100 bg-white overflow-hidden max-w-xl mb-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-navy-100 text-left text-navy-500">
              <th className="px-4 py-3 font-medium">Métrica</th>
              <th className="px-4 py-3 font-medium">Valor</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {!loading && doMes.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-navy-400">
                  Nenhuma métrica cadastrada para este mês ainda.
                </td>
              </tr>
            )}
            {!loading &&
              doMes.map((m) => (
                <tr key={m.id} className="border-b border-navy-100 last:border-0">
                  <td className="px-4 py-3 text-navy-900">{m.metrica}</td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      defaultValue={m.valor}
                      className="inp py-1 text-sm w-32"
                      onBlur={(e) => {
                        const v = Number(e.target.value);
                        if (!Number.isNaN(v) && v !== m.valor) doSalvar(m.metrica, v);
                      }}
                    />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => handleDelete(m.id)} className="text-red-600 hover:text-red-800 text-xs font-medium">
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <form onSubmit={handleAdd} className="flex items-end gap-3 max-w-xl">
        <div className="flex-1">
          <label className="block text-xs font-medium text-navy-800 mb-1">Nova métrica</label>
          <input
            className="inp"
            placeholder="Ex: Seguidores, Curtidas, Verba investida..."
            value={novoNome}
            onChange={(e) => setNovoNome(e.target.value)}
          />
        </div>
        <div className="w-32">
          <label className="block text-xs font-medium text-navy-800 mb-1">Valor</label>
          <input type="number" className="inp" value={novoValor} onChange={(e) => setNovoValor(e.target.value)} />
        </div>
        <button
          type="submit"
          disabled={saving || !novoNome.trim() || novoValor === ""}
          className="px-4 py-2 text-sm rounded-lg bg-navy-800 text-white hover:bg-navy-700 disabled:opacity-50 whitespace-nowrap h-[38px]"
        >
          + Adicionar
        </button>
      </form>
    </div>
  );
}
