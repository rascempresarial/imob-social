"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Post, RedeMetrica, postRedeMeta, postStatusMeta } from "@/lib/types";
import PageHeader from "@/components/PageHeader";
import Badge from "@/components/Badge";
import MetricChart from "@/components/MetricChart";
import { IconEye, IconHeart, IconInstagram, IconLinkedin, IconTarget } from "@/components/icons";
import { Skeleton } from "@/components/Skeleton";
import { useToast } from "@/components/UIProvider";

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

  useEffect(() => {
    loadTexto();
    loadPosts();
    loadMetricas();
  }, [loadTexto, loadPosts, loadMetricas]);

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
      <PageHeader icon={<config.icon className="w-full h-full" />} title={config.label} subtitle={config.subtitle} />

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
    </div>
  );
}
