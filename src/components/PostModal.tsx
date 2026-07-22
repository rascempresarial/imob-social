"use client";

import { useEffect, useState } from "react";
import Modal from "./Modal";
import Field from "./Field";
import { Imovel, Post, POST_REDES, POST_STATUSES, POST_TIPOS } from "@/lib/types";
import { IconAlert, IconBookmark, IconComment, IconEye, IconHeart } from "./icons";
import { useToast } from "./UIProvider";

type Draft = Partial<Post>;

function toLocalInput(value: string | null | undefined) {
  if (!value) return "";
  const d = new Date(value);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function PostModal({
  initial,
  onClose,
  onSaved,
}: {
  initial?: Post | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const editing = !!initial;
  const [draft, setDraft] = useState<Draft>(initial ?? { tipo: "feed", rede: "instagram_facebook", status: "rascunho", anunciado: false });
  const [imoveis, setImoveis] = useState<Imovel[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  useEffect(() => {
    fetch("/api/imoveis").then((r) => r.json()).then((d) => setImoveis(d.data ?? []));
  }, []);

  function set<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
  }

  const imovelSelecionado = imoveis.find((im) => im.id === draft.imovel_id);
  const imovelIndisponivel = imovelSelecionado && imovelSelecionado.status !== "disponivel";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const url = editing ? `/api/posts/${initial!.id}` : "/api/posts";
      const method = editing ? "PATCH" : "POST";
      const payload = {
        ...draft,
        data_publicacao: draft.data_publicacao ? new Date(draft.data_publicacao).toISOString() : null,
      };
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Erro ao salvar.");
        return;
      }
      toast(editing ? "Post atualizado." : "Post criado.", "success");
      onSaved();
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title={editing ? "Editar post" : "Novo post"} onClose={onClose} width="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Imóvel">
            <select className="inp" value={draft.imovel_id ?? ""} onChange={(e) => set("imovel_id", e.target.value || null)}>
              <option value="">Selecione...</option>
              {imoveis.map((im) => (
                <option key={im.id} value={im.id}>
                  {im.codigo}, {im.titulo}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Rede">
            <select className="inp" value={draft.rede ?? "instagram_facebook"} onChange={(e) => set("rede", e.target.value as Post["rede"])}>
              {POST_REDES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </Field>
        </div>

        {imovelSelecionado && (
          <div className="text-xs text-navy-600 -mt-2">
            Edifício: {imovelSelecionado.edificio ?? "·"} · ID: {imovelSelecionado.codigo}
            {imovelIndisponivel && (
              <span className="ml-2 inline-flex items-center gap-1 text-red-600 font-medium">
                <IconAlert className="w-3.5 h-3.5" />
                este imóvel está marcado como &quot;{imovelSelecionado.status}&quot;, não disponível
              </span>
            )}
          </div>
        )}

        <div className="grid grid-cols-3 gap-4">
          <Field label="Tipo">
            <select className="inp" value={draft.tipo ?? "feed"} onChange={(e) => set("tipo", e.target.value as Post["tipo"])}>
              {POST_TIPOS.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Status">
            <select className="inp" value={draft.status ?? "rascunho"} onChange={(e) => set("status", e.target.value as Post["status"])}>
              {POST_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Data de publicação">
            <input
              type="datetime-local"
              className="inp"
              value={toLocalInput(draft.data_publicacao)}
              onChange={(e) => set("data_publicacao", e.target.value)}
            />
          </Field>
        </div>

        <Field label="Link do criativo">
          <input
            className="inp"
            value={draft.link_criativo ?? ""}
            onChange={(e) => set("link_criativo", e.target.value)}
            placeholder="https://drive.google.com/..."
          />
        </Field>

        <Field label="Copy / legenda">
          <textarea
            className="inp"
            rows={5}
            value={draft.copy ?? ""}
            onChange={(e) => set("copy", e.target.value)}
          />
        </Field>

        <label className="flex items-center gap-2 text-sm text-navy-800">
          <input type="checkbox" checked={draft.anunciado ?? false} onChange={(e) => set("anunciado", e.target.checked)} />
          Anunciado (impulsionado/patrocinado)
        </label>

        {draft.status === "reprovado" && (
          <Field label="Motivo da reprovação">
            <textarea
              className="inp"
              rows={2}
              value={draft.motivo_reprovacao ?? ""}
              onChange={(e) => set("motivo_reprovacao", e.target.value)}
            />
          </Field>
        )}

        {editing && (
          <div>
            <p className="text-xs font-medium text-navy-800 mb-2">Métricas de performance (opcional)</p>
            <div className="grid grid-cols-4 gap-3">
              <MetricField icon={<IconEye className="w-3.5 h-3.5" />} label="Alcance" value={draft.alcance} onChange={(v) => set("alcance", v)} />
              <MetricField icon={<IconHeart className="w-3.5 h-3.5" />} label="Curtidas" value={draft.curtidas} onChange={(v) => set("curtidas", v)} />
              <MetricField
                icon={<IconComment className="w-3.5 h-3.5" />}
                label="Comentários"
                value={draft.comentarios}
                onChange={(v) => set("comentarios", v)}
              />
              <MetricField
                icon={<IconBookmark className="w-3.5 h-3.5" />}
                label="Salvamentos"
                value={draft.salvamentos}
                onChange={(v) => set("salvamentos", v)}
              />
            </div>
          </div>
        )}

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

function MetricField({
  icon,
  label,
  value,
  onChange,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | null | undefined;
  onChange: (value: number | null) => void;
}) {
  return (
    <div>
      <label className="flex items-center gap-1 text-[11px] text-navy-500 mb-1">
        {icon}
        {label}
      </label>
      <input
        type="number"
        min={0}
        className="inp"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))}
      />
    </div>
  );
}
