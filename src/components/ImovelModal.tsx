"use client";

import { useEffect, useState } from "react";
import Modal from "./Modal";
import Field from "./Field";
import { Corretor, Imovel, IMOVEL_STATUSES } from "@/lib/types";
import { useToast } from "./UIProvider";

type Draft = Partial<Imovel>;

export default function ImovelModal({
  initial,
  onClose,
  onSaved,
}: {
  initial?: Imovel | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const editing = !!initial;
  const [draft, setDraft] = useState<Draft>(initial ?? { status: "disponivel" });
  const [corretores, setCorretores] = useState<Corretor[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [creatingCorretor, setCreatingCorretor] = useState(false);
  const [novoCorretorNome, setNovoCorretorNome] = useState("");
  const [novoCorretorTelefone, setNovoCorretorTelefone] = useState("");
  const [savingCorretor, setSavingCorretor] = useState(false);
  const toast = useToast();

  useEffect(() => {
    fetch("/api/corretores").then((r) => r.json()).then((d) => setCorretores(d.data ?? []));
  }, []);

  function set<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
  }

  async function handleCreateCorretor() {
    if (!novoCorretorNome.trim()) return;
    setSavingCorretor(true);
    try {
      const res = await fetch("/api/corretores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: novoCorretorNome, telefone: novoCorretorTelefone }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast(data.error ?? "Erro ao criar corretor.", "error");
        return;
      }
      setCorretores((prev) => [...prev, data.data].sort((a, b) => a.nome.localeCompare(b.nome)));
      set("corretor_id", data.data.id);
      setCreatingCorretor(false);
      setNovoCorretorNome("");
      setNovoCorretorTelefone("");
      toast("Corretor criado.", "success");
    } finally {
      setSavingCorretor(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const url = editing ? `/api/imoveis/${initial!.id}` : "/api/imoveis";
      const method = editing ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Erro ao salvar.");
        return;
      }
      toast(editing ? "Imóvel atualizado." : "Imóvel criado.", "success");
      onSaved();
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title={editing ? "Editar imóvel" : "Novo imóvel"} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Código (KSI)">
            <input
              className="inp"
              value={draft.codigo ?? ""}
              onChange={(e) => set("codigo", e.target.value)}
              placeholder="AP-1023"
              required
            />
          </Field>
          <Field label="Status">
            <select className="inp" value={draft.status ?? "disponivel"} onChange={(e) => set("status", e.target.value as Imovel["status"])}>
              {IMOVEL_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <Field label="Título">
          <input
            className="inp"
            value={draft.titulo ?? ""}
            onChange={(e) => set("titulo", e.target.value)}
            placeholder="Apartamento 2 quartos, vista mar"
            required
          />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Patrocinado / ADS">
            <button
              type="button"
              onClick={() => set("patrocinado", !draft.patrocinado)}
              className={`w-full inp text-left flex items-center justify-between ${
                draft.patrocinado ? "border-navy-800" : ""
              }`}
            >
              <span>{draft.patrocinado ? "Sim" : "Não"}</span>
              <span
                className={`text-[10px] rounded-full px-2 py-0.5 font-medium ${
                  draft.patrocinado ? "bg-navy-800 text-white" : "bg-navy-100 text-navy-500"
                }`}
              >
                {draft.patrocinado ? "Ativo" : "Inativo"}
              </span>
            </button>
          </Field>
          <Field label="Corretor">
            <select
              className="inp"
              value={draft.corretor_id ?? ""}
              onChange={(e) => {
                if (e.target.value === "__new__") {
                  setCreatingCorretor(true);
                  return;
                }
                set("corretor_id", e.target.value || null);
              }}
            >
              <option value="">Sem corretor</option>
              {corretores.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome}
                </option>
              ))}
              <option value="__new__">+ Cadastrar novo corretor</option>
            </select>
          </Field>
        </div>
        {creatingCorretor && (
          <div className="rounded-lg border border-navy-100 bg-paper p-3 flex items-end gap-2">
            <div className="flex-1">
              <label className="block text-xs font-medium text-navy-800 mb-1">Nome do corretor</label>
              <input
                className="inp"
                autoFocus
                value={novoCorretorNome}
                onChange={(e) => setNovoCorretorNome(e.target.value)}
                placeholder="Ex: Ana Corretora"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-medium text-navy-800 mb-1">Telefone (opcional)</label>
              <input
                className="inp"
                value={novoCorretorTelefone}
                onChange={(e) => setNovoCorretorTelefone(e.target.value)}
              />
            </div>
            <button
              type="button"
              onClick={handleCreateCorretor}
              disabled={savingCorretor || !novoCorretorNome.trim()}
              className="px-3 py-2 text-xs rounded-lg bg-navy-800 text-white hover:bg-navy-700 disabled:opacity-50 whitespace-nowrap h-[38px]"
            >
              {savingCorretor ? "Salvando..." : "Adicionar"}
            </button>
            <button
              type="button"
              onClick={() => {
                setCreatingCorretor(false);
                setNovoCorretorNome("");
                setNovoCorretorTelefone("");
              }}
              className="px-2 py-2 text-xs text-navy-500 hover:text-navy-800 h-[38px]"
            >
              Cancelar
            </button>
          </div>
        )}
        <Field label="Endereço">
          <input className="inp" value={draft.endereco ?? ""} onChange={(e) => set("endereco", e.target.value)} />
        </Field>
        <Field label="Valor (R$)">
          <input
            type="number"
            className="inp"
            value={draft.valor ?? ""}
            onChange={(e) => set("valor", e.target.value ? Number(e.target.value) : null)}
          />
        </Field>
        <Field label="Link do imóvel no site">
          <input
            className="inp"
            value={draft.link_site ?? ""}
            onChange={(e) => set("link_site", e.target.value)}
            placeholder="https://seusite.com.br/imoveis/ap-1023"
          />
        </Field>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm rounded-lg text-navy-700 hover:bg-navy-100">
            Cancelar
          </button>
          <button type="submit" disabled={saving} className="px-4 py-2 text-sm rounded-lg bg-navy-800 text-white hover:bg-navy-700 disabled:opacity-50">
            {saving ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
