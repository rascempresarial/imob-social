"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Imovel, Midia } from "@/lib/types";
import PageHeader from "@/components/PageHeader";
import { IconImage } from "@/components/icons";
import { Skeleton } from "@/components/Skeleton";
import { useConfirm, useToast } from "@/components/UIProvider";

export default function MidiaPage() {
  const [imoveis, setImoveis] = useState<Imovel[]>([]);
  const [imovelId, setImovelId] = useState("");
  const [midias, setMidias] = useState<Midia[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const confirmDialog = useConfirm();
  const toast = useToast();

  useEffect(() => {
    fetch("/api/imoveis").then((r) => r.json()).then((d) => setImoveis(d.data ?? []));
  }, []);

  const load = useCallback(async () => {
    if (!imovelId) {
      setMidias([]);
      return;
    }
    setLoading(true);
    const res = await fetch(`/api/midias?imovel_id=${imovelId}`);
    const data = await res.json();
    setMidias(data.data ?? []);
    setLoading(false);
  }, [imovelId]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const file = fileRef.current?.files?.[0];
    if (!file || !imovelId) {
      setError("Selecione um imóvel e um arquivo.");
      return;
    }
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("imovel_id", imovelId);
      const res = await fetch("/api/midias", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Erro ao enviar arquivo.");
        return;
      }
      if (fileRef.current) fileRef.current.value = "";
      toast("Mídia enviada.", "success");
      load();
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(id: string) {
    const ok = await confirmDialog({ title: "Excluir mídia", message: "Excluir esta mídia?", confirmLabel: "Excluir", danger: true });
    if (!ok) return;
    await fetch(`/api/midias/${id}`, { method: "DELETE" });
    toast("Mídia excluída.", "success");
    load();
  }

  return (
    <div>
      <PageHeader icon={<IconImage className="w-full h-full" />} title="Mídia" subtitle="Fotos e vídeos por imóvel" />

      <div className="max-w-xl mb-6">
        <label className="block text-xs font-medium text-navy-800 mb-1">Imóvel</label>
        <select className="inp" value={imovelId} onChange={(e) => setImovelId(e.target.value)}>
          <option value="">Selecione um imóvel...</option>
          {imoveis.map((im) => (
            <option key={im.id} value={im.id}>
              {im.codigo}, {im.titulo}
            </option>
          ))}
        </select>
      </div>

      {imovelId && (
        <>
          <form onSubmit={handleUpload} className="flex items-center gap-3 mb-6">
            <input ref={fileRef} type="file" accept="image/*,video/*" className="text-sm text-navy-700" />
            <button
              type="submit"
              disabled={uploading}
              className="px-4 py-2 text-sm rounded-lg bg-navy-800 text-white hover:bg-navy-700 disabled:opacity-50 whitespace-nowrap"
            >
              {uploading ? "Enviando..." : "Enviar"}
            </button>
          </form>
          {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

          {!loading && midias.length === 0 && <p className="text-sm text-navy-400">Nenhuma mídia para este imóvel ainda.</p>}

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {loading &&
              Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="aspect-square" />)}
            {!loading && midias.map((m) => (
              <div key={m.id} className="rounded-lg border border-navy-100 bg-white overflow-hidden">
                <div className="aspect-square bg-paper flex items-center justify-center">
                  {m.tipo === "foto" && m.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={m.url} alt={m.nome_arquivo ?? ""} className="w-full h-full object-cover" />
                  ) : m.tipo === "video" && m.url ? (
                    <video src={m.url} className="w-full h-full object-cover" controls />
                  ) : (
                    <span className="text-xs text-navy-400">sem preview</span>
                  )}
                </div>
                <div className="p-2 flex items-center justify-between gap-2">
                  <span className="text-xs text-navy-600 truncate">{m.nome_arquivo}</span>
                  <button onClick={() => handleDelete(m.id)} className="text-red-600 hover:text-red-800 text-xs shrink-0">
                    Excluir
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
