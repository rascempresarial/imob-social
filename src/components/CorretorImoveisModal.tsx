"use client";

import { useCallback, useEffect, useState } from "react";
import Modal from "./Modal";
import Badge from "./Badge";
import { Imovel, imovelStatusMeta } from "@/lib/types";

export default function CorretorImoveisModal({
  corretorId,
  corretorNome,
  onClose,
  onChange,
}: {
  corretorId: string;
  corretorNome: string;
  onClose: () => void;
  onChange: () => void;
}) {
  const [imoveis, setImoveis] = useState<Imovel[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/imoveis?corretor_id=${corretorId}`);
    const data = await res.json();
    setImoveis(data.data ?? []);
    setLoading(false);
  }, [corretorId]);

  useEffect(() => {
    load();
  }, [load]);

  async function togglePatrocinado(im: Imovel) {
    await fetch(`/api/imoveis/${im.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ patrocinado: !im.patrocinado }),
    });
    await load();
    onChange();
  }

  return (
    <Modal title={`Imóveis de ${corretorNome}`} onClose={onClose} width="max-w-xl">
      {loading && <p className="text-sm text-navy-400">Carregando...</p>}
      {!loading && imoveis.length === 0 && (
        <p className="text-sm text-navy-400">Nenhum imóvel vinculado a este corretor ainda.</p>
      )}
      {!loading && imoveis.length > 0 && (
        <div className="space-y-2">
          {imoveis.map((im) => {
            const meta = imovelStatusMeta(im.status);
            return (
              <div key={im.id} className="flex items-center justify-between gap-3 rounded-lg border border-navy-100 p-3">
                <div className="min-w-0">
                  <p className="text-sm text-navy-900 truncate">
                    <span className="font-mono text-xs text-navy-500 mr-1.5">{im.codigo}</span>
                    {im.titulo}
                  </p>
                  <div className="mt-1">
                    <Badge label={meta.label} color={meta.color} />
                  </div>
                </div>
                <button
                  onClick={() => togglePatrocinado(im)}
                  className={`text-xs rounded-full px-2.5 py-0.5 font-medium shrink-0 ${
                    im.patrocinado ? "bg-navy-800 text-white" : "bg-navy-100 text-navy-500"
                  }`}
                >
                  {im.patrocinado ? "Patrocinado" : "Não patrocinado"}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </Modal>
  );
}
