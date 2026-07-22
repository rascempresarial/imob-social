"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Imovel, imovelStatusMeta } from "@/lib/types";
import Badge from "@/components/Badge";
import ImovelModal from "@/components/ImovelModal";
import PageHeader from "@/components/PageHeader";
import { IconBuilding } from "@/components/icons";
import { SkeletonTableRows } from "@/components/Skeleton";
import Pagination from "@/components/Pagination";
import { useConfirm, useToast } from "@/components/UIProvider";

const PAGE_SIZE = 20;

export default function ImoveisPage() {
  const [imoveis, setImoveis] = useState<Imovel[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Imovel | null>(null);
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

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/imoveis?page=${page}&pageSize=${PAGE_SIZE}`);
    const data = await res.json();
    setImoveis(data.data ?? []);
    setCount(data.count ?? 0);
    setLoading(false);
  }, [page]);

  useEffect(() => {
    load();
  }, [load]);

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

      <div className="rounded-xl border border-navy-100 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-navy-100 text-left text-navy-500">
              <th className="px-4 py-3 font-medium">Código</th>
              <th className="px-4 py-3 font-medium">Título</th>
              <th className="px-4 py-3 font-medium">Edifício</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Valor</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {loading && <SkeletonTableRows cols={6} />}
            {!loading && imoveis.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-navy-400">
                  Nenhum imóvel cadastrado ainda.
                </td>
              </tr>
            )}
            {!loading &&
              imoveis.map((im) => {
                const meta = imovelStatusMeta(im.status);
                return (
                  <tr key={im.id} className="border-b border-navy-100 last:border-0">
                    <td className="px-4 py-3 font-mono text-xs text-navy-700">{im.codigo}</td>
                    <td className="px-4 py-3 text-navy-900">{im.titulo}</td>
                    <td className="px-4 py-3 text-navy-600">{im.edificio ?? "·"}</td>
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
