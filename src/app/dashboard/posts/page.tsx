"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Imovel, Post, POST_REDES, POST_STATUSES, PostStatus, postRedeMeta, postStatusMeta } from "@/lib/types";
import Badge from "@/components/Badge";
import PostModal from "@/components/PostModal";
import PageHeader from "@/components/PageHeader";
import PostsKanban from "@/components/PostsKanban";
import Pagination from "@/components/Pagination";
import { SkeletonTableRows } from "@/components/Skeleton";
import { IconAlert, IconEye, IconHeart, IconKanban, IconLayers, IconSearch, IconTable } from "@/components/icons";
import { useConfirm, useToast } from "@/components/UIProvider";

const PAGE_SIZE = 20;

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [view, setView] = useState<"tabela" | "kanban">("tabela");
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [imovelFilter, setImovelFilter] = useState("");
  const [redeFilter, setRedeFilter] = useState("");
  const [fromFilter, setFromFilter] = useState("");
  const [toFilter, setToFilter] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [imoveis, setImoveis] = useState<Imovel[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Post | null>(null);
  const confirmDialog = useConfirm();
  const toast = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    fetch("/api/imoveis").then((r) => r.json()).then((d) => setImoveis(d.data ?? []));
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    if (searchParams.get("action") === "new") {
      setEditing(null);
      setModalOpen(true);
      router.replace("/dashboard/posts");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter) params.set("status", statusFilter);
    if (imovelFilter) params.set("imovel_id", imovelFilter);
    if (redeFilter) params.set("rede", redeFilter);
    if (fromFilter) params.set("from", new Date(fromFilter).toISOString());
    if (toFilter) params.set("to", new Date(toFilter + "T23:59:59").toISOString());
    if (search) params.set("q", search);
    if (view === "tabela") {
      params.set("page", String(page));
      params.set("pageSize", String(PAGE_SIZE));
    }
    const res = await fetch(`/api/posts?${params.toString()}`);
    const data = await res.json();
    setPosts(data.data ?? []);
    setCount(data.count ?? 0);
    setLoading(false);
  }, [statusFilter, imovelFilter, redeFilter, fromFilter, toFilter, search, page, view]);

  useEffect(() => {
    load();
  }, [load]);

  function handleFilterChange(value: string) {
    setStatusFilter(value);
    setPage(1);
  }

  const hasActiveFilters = !!(imovelFilter || redeFilter || fromFilter || toFilter || search);

  function clearFilters() {
    setImovelFilter("");
    setRedeFilter("");
    setFromFilter("");
    setToFilter("");
    setSearchInput("");
    setSearch("");
    setPage(1);
  }

  async function handleDelete(id: string) {
    const ok = await confirmDialog({ title: "Excluir post", message: "Excluir este post?", confirmLabel: "Excluir", danger: true });
    if (!ok) return;
    await fetch(`/api/posts/${id}`, { method: "DELETE" });
    toast("Post excluído.", "success");
    load();
  }

  async function setStatus(id: string, status: string) {
    await fetch(`/api/posts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const meta = postStatusMeta(status);
    toast(`Status atualizado para "${meta.label}".`, "success");
    load();
  }

  return (
    <div>
      <PageHeader
        icon={<IconLayers className="w-full h-full" />}
        title="Posts"
        subtitle="Calendário de conteúdo, aprovação e status de publicação"
        action={
          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-lg border border-navy-200 p-0.5">
              <button
                onClick={() => setView("tabela")}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium ${
                  view === "tabela" ? "bg-navy-800 text-white" : "text-navy-600 hover:bg-navy-100"
                }`}
              >
                <IconTable className="w-3.5 h-3.5" />
                Tabela
              </button>
              <button
                onClick={() => setView("kanban")}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium ${
                  view === "kanban" ? "bg-navy-800 text-white" : "text-navy-600 hover:bg-navy-100"
                }`}
              >
                <IconKanban className="w-3.5 h-3.5" />
                Kanban
              </button>
            </div>
            <button
              onClick={() => {
                setEditing(null);
                setModalOpen(true);
              }}
              className="px-4 py-2 text-sm rounded-lg bg-navy-800 text-white hover:bg-navy-700"
            >
              + Novo post
            </button>
          </div>
        }
      />

      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => handleFilterChange("")}
          className={`text-xs rounded-full px-3 py-1 font-medium border ${
            statusFilter === "" ? "bg-navy-800 text-white border-navy-800" : "border-navy-200 text-navy-600"
          }`}
        >
          Todos
        </button>
        {POST_STATUSES.map((s) => (
          <button
            key={s.value}
            onClick={() => handleFilterChange(s.value)}
            className={`text-xs rounded-full px-3 py-1 font-medium border ${
              statusFilter === s.value ? "text-white border-transparent" : "border-navy-200 text-navy-600"
            }`}
            style={statusFilter === s.value ? { backgroundColor: s.color } : undefined}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-5">
        <div className="relative w-48 shrink-0">
          <IconSearch className="w-3.5 h-3.5 text-navy-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value);
              setPage(1);
            }}
            placeholder="Buscar na copy..."
            className="inp pl-8 py-1.5 text-xs"
          />
        </div>
        <div className="w-36 shrink-0">
          <select
            value={imovelFilter}
            onChange={(e) => {
              setImovelFilter(e.target.value);
              setPage(1);
            }}
            className="inp py-1.5 text-xs"
          >
            <option value="">Todos os imóveis</option>
            {imoveis.map((im) => (
              <option key={im.id} value={im.id}>
                {im.codigo}
              </option>
            ))}
          </select>
        </div>
        <div className="w-40 shrink-0">
          <select
            value={redeFilter}
            onChange={(e) => {
              setRedeFilter(e.target.value);
              setPage(1);
            }}
            className="inp py-1.5 text-xs"
          >
            <option value="">Todas as redes</option>
            {POST_REDES.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>
        <div className="w-36 shrink-0">
          <input
            type="date"
            value={fromFilter}
            onChange={(e) => {
              setFromFilter(e.target.value);
              setPage(1);
            }}
            className="inp py-1.5 text-xs"
          />
        </div>
        <span className="text-xs text-navy-400">até</span>
        <div className="w-36 shrink-0">
          <input
            type="date"
            value={toFilter}
            onChange={(e) => {
              setToFilter(e.target.value);
              setPage(1);
            }}
            className="inp py-1.5 text-xs"
          />
        </div>
        {hasActiveFilters && (
          <button onClick={clearFilters} className="text-xs text-navy-500 hover:text-navy-800 underline">
            Limpar filtros
          </button>
        )}
      </div>

      {view === "kanban" ? (
        loading ? (
          <p className="text-sm text-navy-400">Carregando...</p>
        ) : (
          <PostsKanban
            posts={posts}
            onStatusChange={(id, status) => setStatus(id, status)}
            onEdit={(p) => {
              setEditing(p);
              setModalOpen(true);
            }}
          />
        )
      ) : (
        <>
          <div className="rounded-xl border border-navy-100 bg-white overflow-hidden overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-navy-100 text-left text-navy-500">
                  <th className="px-4 py-3 font-medium">KSI</th>
                  <th className="px-4 py-3 font-medium">Data</th>
                  <th className="px-4 py-3 font-medium">Rede</th>
                  <th className="px-4 py-3 font-medium">Tipo</th>
                  <th className="px-4 py-3 font-medium">Publicação</th>
                  <th className="px-4 py-3 font-medium">Anunciado</th>
                  <th className="px-4 py-3 font-medium">Métricas</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {loading && <SkeletonTableRows cols={9} />}
                {!loading && posts.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center text-navy-400">
                      Nenhum post encontrado.
                    </td>
                  </tr>
                )}
                {!loading &&
                  posts.map((p) => {
                    const meta = postStatusMeta(p.status);
                    const imovelIndisponivel = p.imovel && p.imovel.status !== "disponivel";
                    const hasMetrics = p.alcance != null || p.curtidas != null;
                    return (
                      <tr
                        key={p.id}
                        onClick={() => {
                          setEditing(p);
                          setModalOpen(true);
                        }}
                        className="border-b border-navy-100 last:border-0 align-top cursor-pointer hover:bg-navy-100/40"
                      >
                        <td className="px-4 py-3">
                          <div className="text-navy-900">{p.imovel ? `${p.imovel.codigo}, ${p.imovel.titulo}` : "·"}</div>
                          {imovelIndisponivel && (
                            <div className="flex items-center gap-1 text-xs text-red-600 mt-0.5">
                              <IconAlert className="w-3.5 h-3.5" />
                              imóvel {p.imovel!.status}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-navy-600 whitespace-nowrap">
                          {p.data_publicacao ? new Date(p.data_publicacao).toLocaleDateString("pt-BR") : "·"}
                        </td>
                        <td className="px-4 py-3 text-navy-600">{postRedeMeta(p.rede).label}</td>
                        <td className="px-4 py-3 text-navy-600 capitalize">{p.tipo}</td>
                        <td className="px-4 py-3 text-navy-600 whitespace-nowrap">
                          {p.data_publicacao
                            ? new Date(p.data_publicacao).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })
                            : "·"}
                        </td>
                        <td className="px-4 py-3 text-navy-600">{p.anunciado ? "Sim" : "Não"}</td>
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
                          <Badge label={meta.label} color={meta.color} />
                        </td>
                        <td className="px-4 py-3 text-right whitespace-nowrap space-x-2" onClick={(e) => e.stopPropagation()}>
                          {p.status === "em_revisao" && (
                            <>
                              <button onClick={() => setStatus(p.id, "aprovado")} className="text-green-700 hover:text-green-900 text-xs font-medium">
                                Aprovar
                              </button>
                              <button onClick={() => setStatus(p.id, "reprovado")} className="text-red-600 hover:text-red-800 text-xs font-medium">
                                Reprovar
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => {
                              setEditing(p);
                              setModalOpen(true);
                            }}
                            className="text-navy-600 hover:text-navy-900 text-xs font-medium"
                          >
                            Editar
                          </button>
                          <button onClick={() => handleDelete(p.id)} className="text-red-600 hover:text-red-800 text-xs font-medium">
                            Excluir
                          </button>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
          <Pagination page={page} pageSize={PAGE_SIZE} count={count} onPageChange={setPage} />
        </>
      )}

      {modalOpen && <PostModal initial={editing} onClose={() => setModalOpen(false)} onSaved={load} />}
    </div>
  );
}
