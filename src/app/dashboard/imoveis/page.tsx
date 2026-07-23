"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Corretor, Imovel, imovelFinalidadeMeta, imovelStatusMeta } from "@/lib/types";
import Badge from "@/components/Badge";
import ImovelModal from "@/components/ImovelModal";
import PageHeader from "@/components/PageHeader";
import { IconBuilding, IconExternalLink, IconSearch } from "@/components/icons";
import { SkeletonTableRows } from "@/components/Skeleton";
import Pagination from "@/components/Pagination";
import { useConfirm, useToast } from "@/components/UIProvider";

const PAGE_SIZE = 20;

export default function ImoveisPage() {
  const [imoveis, setImoveis] = useState<Imovel[]>([]);
  const [corretores, setCorretores] = useState<Corretor[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Imovel | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [corretorFilter, setCorretorFilter] = useState("");
  const confirmDialog = useConfirm();
  const toast = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("action") === "new") {
      setEditing(null);
      setModalOpen(true);
      router.replace("/dashboard/imoveis");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetch("/api/corretores").then((r) => r.json()).then((d) => setCorretores(d.data ?? []));
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), pageSize: String(PAGE_SIZE) });
    if (search) params.set("q", search);
    if (corretorFilter) params.set("corretor_id", corretorFilter);
    const res = await fetch(`/api/imoveis?${params.toString()}`);
    const data = await res.json();
    setImoveis(data.data ?? []);
    setCount(data.count ?? 0);
    setLoading(false);
  }, [page, search, corretorFilter]);

  useEffect(() => {
    load();
  }, [load]);

  async function togglePatrocinado(im: Imovel) {
    await fetch(`/api/imoveis/${im.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ patrocinado: !im.patrocinado }),
    });
    load();
  }

  async function handleDelete(id: string) {
    const ok = await confirmDialog({
      title: "Excluir imóvel",
      message: "Excluir este imóvel? Posts vinculados ficarão sem imóvel associado.",
      confirmLabel: "Excluir",
      danger: true,
    });
    if (!ok) return;
    await fetch(`/api/imoveis/${id}`, { method: "DELETE" });
    toast("Imóvel excluído.", "success");
    load();
  }

  return (
    <div>
      <PageHeader
        icon={<IconBuilding className="w-full h-full" />}
        title="Imóveis"
        subtitle="Cadastro central, o status daqui reflete em todos os posts vinculados"
        action={
          <button
            onClick={() => {
              setEditing(null);
              setModalOpen(true);
            }}
            className="px-4 py-2 text-sm rounded-lg bg-navy-800 text-white hover:bg-navy-700"
          >
            + Novo imóvel
          </button>
        }
      />

      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="relative w-48 shrink-0">
          <IconSearch className="w-3.5 h-3.5 text-navy-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value);
              setPage(1);
            }}
            placeholder="Buscar por KSI..."
            className="inp pl-8 py-1.5 text-xs"
          />
        </div>
        <div className="w-48 shrink-0">
          <select
            value={corretorFilter}
            onChange={(e) => {
              setCorretorFilter(e.target.value);
              setPage(1);
            }}
            className="inp py-1.5 text-xs"
          >
            <option value="">Todos os corretores</option>
            {corretores.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>
        </div>
        {(search || corretorFilter) && (
          <button
            onClick={() => {
              setSearchInput("");
              setSearch("");
              setCorretorFilter("");
              setPage(1);
            }}
            className="text-xs text-navy-500 hover:text-navy-800 underline"
          >
            Limpar filtros
          </button>
        )}
      </div>

      <div className="rounded-xl border border-navy-100 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-navy-100 text-left text-navy-500">
              <th className="px-4 py-3 font-medium">KSI</th>
              <th className="px-4 py-3 font-medium">Título</th>
              <th className="px-4 py-3 font-medium">Negócio</th>
              <th className="px-4 py-3 font-medium">Patrocinado / ADS</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Valor</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {loading && <SkeletonTableRows cols={7} />}
            {!loading && imoveis.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-navy-400">
                  Nenhum imóvel cadastrado ainda.
                </td>
              </tr>
            )}
            {!loading &&
              imoveis.map((im) => {
                const meta = imovelStatusMeta(im.status);
                const finalidadeMeta = imovelFinalidadeMeta(im.finalidade);
                return (
                  <tr key={im.id} className="border-b border-navy-100 last:border-0">
                    <td className="px-4 py-3 font-mono text-xs text-navy-700">{im.codigo}</td>
                    <td className="px-4 py-3 text-navy-900">
                      <span className="inline-flex items-center gap-1.5">
                        {im.titulo}
                        {im.link_site && (
                          <a
                            href={im.link_site}
                            target="_blank"
                            rel="noreferrer"
                            className="text-navy-400 hover:text-navy-800"
                            title="Ver no site"
                          >
                            <IconExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge label={finalidadeMeta.label} color={finalidadeMeta.color} />
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => togglePatrocinado(im)}
                        className={`text-xs rounded-full px-2.5 py-0.5 font-medium ${
                          im.patrocinado ? "bg-navy-800 text-white" : "bg-navy-100 text-navy-500"
                        }`}
                      >
                        {im.patrocinado ? "Sim" : "Não"}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <Badge label={meta.label} color={meta.color} />
                    </td>
                    <td className="px-4 py-3 text-navy-600">
                      {im.valor ? im.valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "·"}
                    </td>
                    <td className="px-4 py-3 text-right space-x-3">
                      <button
                        onClick={() => {
                          setEditing(im);
                          setModalOpen(true);
                        }}
                        className="text-navy-600 hover:text-navy-900 text-xs font-medium"
                      >
                        Editar
                      </button>
                      <button onClick={() => handleDelete(im.id)} className="text-red-600 hover:text-red-800 text-xs font-medium">
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

      {modalOpen && <ImovelModal initial={editing} onClose={() => setModalOpen(false)} onSaved={load} />}
    </div>
  );
}
