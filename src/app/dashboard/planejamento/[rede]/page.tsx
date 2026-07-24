"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Post, RedeMetrica, Roteiro, postRedeMeta, postStatusMeta } from "@/lib/types";
import PageHeader from "@/components/PageHeader";
import Badge from "@/components/Badge";
import MetricChart from "@/components/MetricChart";
import CopyTemplatesModal from "@/components/CopyTemplatesModal";
import { IconCopy, IconEye, IconFilm, IconHeart, IconInstagram, IconLinkedin, IconTarget } from "@/components/icons";
import { Skeleton } from "@/components/Skeleton";
import { useConfirm, useToast } from "@/components/UIProvider";

const CONFIG: Record<
  string,
  { label: string; icon: typeof IconInstagram; subtitle: string; postsQuery: string }
> = {
  instagram: {
    label: "Instagram",
    icon: IconInstagram,
    subtitle: "Planejamento estratégico e posts do Instagram/Facebook",
    postsQuery: "rede=instagram_facebook",
  },
  linkedin: {
    label: "LinkedIn",
    icon: IconLinkedin,
    subtitle: "Planejamento estratégico e posts do LinkedIn",
    postsQuery: "rede=linkedin",
  },
  "meta-ads": {
    label: "Meta ADS",
    icon: IconTarget,
    subtitle: "Planejamento estratégico e posts anunciados (Meta Ads)",
    postsQuery: "anunciado=true",
  },
};

export default function PlanejamentoRedePage() {
  const params = useParams<{ rede: string }>();
  const rede = params.rede;
  const config = CONFIG[rede];

  const [conteudo, setConteudo] = useState("");
  const [loadingTexto, setLoadingTexto] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [metricas, setMetricas] = useState<RedeMetrica[]>([]);
  const [loadingMetricas, setLoadingMetricas] = useState(true);
  const [roteiros, setRoteiros] = useState<Roteiro[]>([]);
  const [loadingRoteiros, setLoadingRoteiros] = useState(true);
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [showRoteiroForm, setShowRoteiroForm] = useState(false);
  const [rTitulo, setRTitulo] = useState("");
  const [rGancho, setRGancho] = useState("");
  const [rDesenvolvimento, setRDesenvolvimento] = useState("");
  const [rCta, setRCta] = useState("");
  const [savingRoteiro, setSavingRoteiro] = useState(false);
  const confirmDialog = useConfirm();
  const toast = useToast();

  const loadTexto = useCallback(async () => {
    if (!config) return;
    setLoadingTexto(true);
    const res = await fetch(`/api/planejamentos/${rede}`);
    const data = await res.json();
    setConteudo(data.data?.conteudo ?? "");
    setSavedAt(data.data?.updated_at ?? null);
    setLoadingTexto(false);
  }, [rede, config]);

  const loadPosts = useCallback(async () => {
    if (!config) return;
    setLoadingPosts(true);
    const res = await fetch(`/api/posts?${config.postsQuery}`);
    const data = await res.json();
    setPosts(data.data ?? []);
    setLoadingPosts(false);
  }, [config]);

  const loadMetricas = useCallback(async () => {
    if (!config) return;
    setLoadingMetricas(true);
    const res = await fetch(`/api/metricas?rede=${rede}`);
    const data = await res.json();
    setMetricas(data.data ?? []);
    setLoadingMetricas(false);
  }, [rede, config]);

  const loadRoteiros = useCallback(async () => {
    if (!config) return;
    setLoadingRoteiros(true);
    const res = await fetch(`/api/roteiros?rede=${rede}`);
    const data = await res.json();
    setRoteiros(data.data ?? []);
    setLoadingRoteiros(false);
  }, [rede, config]);

  useEffect(() => {
    loadTexto();
    loadPosts();
    loadMetricas();
    loadRoteiros();
  }, [loadTexto, loadPosts, loadMetricas, loadRoteiros]);

  async function handleAddRoteiro(e: React.FormEvent) {
    e.preventDefault();
    if (!rTitulo.trim()) return;
    setSavingRoteiro(true);
    try {
      await fetch("/api/roteiros", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rede, titulo: rTitulo, gancho: rGancho, desenvolvimento: rDesenvolvimento, cta: rCta }),
      });
      setRTitulo("");
      setRGancho("");
      setRDesenvolvimento("");
      setRCta("");
      setShowRoteiroForm(false);
      toast("Roteiro salvo.", "success");
      loadRoteiros();
    } finally {
      setSavingRoteiro(false);
    }
  }

  async function handleDeleteRoteiro(id: string) {
    const ok = await confirmDialog({ title: "Excluir roteiro", message: "Excluir este roteiro?", confirmLabel: "Excluir", danger: true });
    if (!ok) return;
    await fetch(`/api/roteiros/${id}`, { method: "DELETE" });
    toast("Roteiro excluído.", "success");
    loadRoteiros();
  }

  async function handleSalvar() {
    setSaving(true);
    try {
      const res = await fetch(`/api/planejamentos/${rede}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conteudo }),
      });
      const data = await res.json();
      setSavedAt(data.data?.updated_at ?? null);
      toast("Planejamento salvo.", "success");
    } finally {
      setSaving(false);
    }
  }

  if (!config) {
    return (
      <div>
        <PageHeader icon={<IconTarget className="w-full h-full" />} title="Planejamento" subtitle="Rede não encontrada" />
      </div>
    );
  }

  const metricasPorNome = new Map<string, { mes: string; valor: number }[]>();
  for (const m of metricas) {
    if (!metricasPorNome.has(m.metrica)) metricasPorNome.set(m.metrica, []);
    metricasPorNome.get(m.metrica)!.push({ mes: m.mes, valor: m.valor });
  }

  return (
    <div>
      <PageHeader
        icon={<config.icon className="w-full h-full" />}
        title={config.label}
        subtitle={config.subtitle}
        action={
          <button
            onClick={() => setShowCopyModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg border border-navy-200 text-navy-700 hover:bg-navy-100"
          >
            <IconCopy className="w-4 h-4" />
            Modelos de copy
          </button>
        }
      />

      <div className="rounded-xl border border-navy-100 bg-white p-4 mb-8">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-navy-900">Planejamento estratégico</h2>
          {savedAt && <span className="text-[11px] text-navy-400">Salvo em {new Date(savedAt).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}</span>}
        </div>
        {loadingTexto ? (
          <Skeleton className="h-40 w-full" />
        ) : (
          <textarea
            className="inp"
            rows={8}
            placeholder="Metas, pautas, pilares de conteúdo, cronograma..."
            value={conteudo}
            onChange={(e) => setConteudo(e.target.value)}
          />
        )}
        <div className="flex justify-end mt-3">
          <button
            onClick={handleSalvar}
            disabled={saving || loadingTexto}
            className="px-4 py-2 text-sm rounded-lg bg-navy-800 text-white hover:bg-navy-700 disabled:opacity-50"
          >
            {saving ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>

      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-navy-900 flex items-center gap-1.5">
            <IconFilm className="w-4 h-4 text-navy-500" />
            Roteiros de vídeo/Reels
          </h2>
          <button
            onClick={() => setShowRoteiroForm((v) => !v)}
            className="text-xs text-navy-600 hover:text-navy-900 font-medium"
          >
            {showRoteiroForm ? "Cancelar" : "+ Novo roteiro"}
          </button>
        </div>

        {showRoteiroForm && (
          <form onSubmit={handleAddRoteiro} className="rounded-xl border border-navy-100 bg-white p-4 mb-4 space-y-3">
            <input className="inp" placeholder="Título do roteiro" value={rTitulo} onChange={(e) => setRTitulo(e.target.value)} />
            <textarea className="inp" rows={2} placeholder="Gancho (primeiros segundos)" value={rGancho} onChange={(e) => setRGancho(e.target.value)} />
            <textarea className="inp" rows={3} placeholder="Desenvolvimento" value={rDesenvolvimento} onChange={(e) => setRDesenvolvimento(e.target.value)} />
            <textarea className="inp" rows={2} placeholder="CTA (chamada final)" value={rCta} onChange={(e) => setRCta(e.target.value)} />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={savingRoteiro || !rTitulo.trim()}
                className="px-4 py-2 text-sm rounded-lg bg-navy-800 text-white hover:bg-navy-700 disabled:opacity-50"
              >
                {savingRoteiro ? "Salvando..." : "Salvar roteiro"}
              </button>
            </div>
          </form>
        )}

        {loadingRoteiros && <Skeleton className="h-24 w-full" />}
        {!loadingRoteiros && roteiros.length === 0 && !showRoteiroForm && (
          <p className="text-sm text-navy-400">Nenhum roteiro cadastrado ainda.</p>
        )}
        {!loadingRoteiros && roteiros.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {roteiros.map((r) => (
              <div key={r.id} className="rounded-xl border border-navy-100 bg-white p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <p className="text-sm font-medium text-navy-900">{r.titulo}</p>
                  <button onClick={() => handleDeleteRoteiro(r.id)} className="text-xs text-red-600 hover:text-red-800 shrink-0">
                    Excluir
                  </button>
                </div>
                <div className="space-y-1.5 text-xs text-navy-600">
                  {r.gancho && (
                    <p>
                      <span className="font-medium text-navy-800">Gancho: </span>
                      {r.gancho}
                    </p>
                  )}
                  {r.desenvolvimento && (
                    <p>
                      <span className="font-medium text-navy-800">Desenvolvimento: </span>
                      {r.desenvolvimento}
                    </p>
                  )}
                  {r.cta && (
                    <p>
                      <span className="font-medium text-navy-800">CTA: </span>
                      {r.cta}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {!loadingMetricas && metricasPorNome.size > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-navy-900 mb-3">Métricas</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {Array.from(metricasPorNome.entries()).map(([nome, serie]) => (
              <MetricChart key={nome} metrica={nome} data={serie} />
            ))}
          </div>
        </div>
      )}

      <h2 className="text-sm font-semibold text-navy-900 mb-3">Posts</h2>
      <div className="rounded-xl border border-navy-100 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-navy-100 text-left text-navy-500">
              <th className="px-4 py-3 font-medium">KSI</th>
              <th className="px-4 py-3 font-medium">Data</th>
              {rede === "meta-ads" && <th className="px-4 py-3 font-medium">Rede</th>}
              <th className="px-4 py-3 font-medium">Tipo</th>
              <th className="px-4 py-3 font-medium">Métricas</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {loadingPosts && (
              <tr>
                <td colSpan={5} className="px-4 py-6">
                  <Skeleton className="h-4 w-full" />
                </td>
              </tr>
            )}
            {!loadingPosts && posts.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-navy-400">
                  Nenhum post encontrado.
                </td>
              </tr>
            )}
            {!loadingPosts &&
              posts.map((p) => {
                const statusMeta = postStatusMeta(p.status);
                const hasMetrics = p.alcance != null || p.curtidas != null;
                return (
                  <tr key={p.id} className="border-b border-navy-100 last:border-0">
                    <td className="px-4 py-3 text-navy-900">{p.imovel ? `${p.imovel.codigo}, ${p.imovel.titulo}` : "·"}</td>
                    <td className="px-4 py-3 text-navy-600 whitespace-nowrap">
                      {p.data_publicacao ? new Date(p.data_publicacao).toLocaleDateString("pt-BR") : "·"}
                    </td>
                    {rede === "meta-ads" && <td className="px-4 py-3 text-navy-600">{postRedeMeta(p.rede).label}</td>}
                    <td className="px-4 py-3 text-navy-600 capitalize">{p.tipo}</td>
                    <td className="px-4 py-3 text-navy-600">
                      {hasMetrics ? (
                        <div className="flex items-center gap-2.5 whitespace-nowrap">
                          {p.alcance != null && (
                            <span className="flex items-center gap-1 text-xs">
                              <IconEye className="w-3.5 h-3.5 text-navy-400" />
                              {p.alcance}
                            </span>
                          )}
                          {p.curtidas != null && (
                            <span className="flex items-center gap-1 text-xs">
                              <IconHeart className="w-3.5 h-3.5 text-navy-400" />
                              {p.curtidas}
                            </span>
                          )}
                        </div>
                      ) : (
                        "·"
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Badge label={statusMeta.label} color={statusMeta.color} />
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      {showCopyModal && <CopyTemplatesModal rede={rede} onClose={() => setShowCopyModal(false)} />}
    </div>
  );
}
