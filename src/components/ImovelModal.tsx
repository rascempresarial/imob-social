"use client";

import { useState } from "react";
import Modal from "./Modal";
import Field from "./Field";
import { Imovel, IMOVEL_STATUSES } from "@/lib/types";

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
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
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
          <Field label="Código (ID)">
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
        <Field label="Edifício">
          <input className="inp" value={draft.edificio ?? ""} onChange={(e) => set("edificio", e.target.value)} />
        </Field>
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
