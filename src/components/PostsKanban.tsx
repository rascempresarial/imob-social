"use client";

import { useState } from "react";
import { Post, POST_STATUSES, PostStatus, postRedeMeta } from "@/lib/types";
import { IconAlert, IconEye, IconGrip, IconHeart } from "./icons";

export default function PostsKanban({
  posts,
  onStatusChange,
  onEdit,
}: {
  posts: Post[];
  onStatusChange: (id: string, status: PostStatus) => void;
  onEdit: (post: Post) => void;
}) {
  const [dragOverCol, setDragOverCol] = useState<PostStatus | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const byStatus = (status: PostStatus) => posts.filter((p) => p.status === status);

  return (
    <div className="flex gap-4 overflow-x-auto pb-2">
      {POST_STATUSES.map((s) => {
        const items = byStatus(s.value);
        const isOver = dragOverCol === s.value;
        return (
          <div
            key={s.value}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOverCol(s.value);
            }}
            onDragLeave={() => setDragOverCol((c) => (c === s.value ? null : c))}
            onDrop={(e) => {
              e.preventDefault();
              const id = e.dataTransfer.getData("text/plain");
              if (id) onStatusChange(id, s.value);
              setDragOverCol(null);
              setDraggingId(null);
            }}
            className={`w-72 shrink-0 rounded-xl border p-2 transition-colors ${
              isOver ? "border-navy-500 bg-navy-100/40" : "border-navy-100 bg-paper"
            }`}
          >
            <div className="flex items-center justify-between px-2 py-1.5 mb-1">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                <span className="text-xs font-semibold text-navy-800">{s.label}</span>
              </div>
              <span className="text-[11px] text-navy-400">{items.length}</span>
            </div>

            <div className="space-y-2 min-h-[60px]">
              {items.map((p) => {
                const imovelIndisponivel = p.imovel && p.imovel.status !== "disponivel";
                const hasMetrics = p.alcance != null || p.curtidas != null;
                return (
                  <div
                    key={p.id}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData("text/plain", p.id);
                      setDraggingId(p.id);
                    }}
                    onDragEnd={() => setDraggingId(null)}
                    onClick={() => onEdit(p)}
                    className={`rounded-lg border border-navy-100 bg-white p-3 cursor-grab active:cursor-grabbing hover:border-navy-300 transition-opacity ${
                      draggingId === p.id ? "opacity-40" : "opacity-100"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-navy-900 leading-snug">
                        {p.imovel ? `${p.imovel.codigo}, ${p.imovel.titulo}` : "Sem imóvel"}
                      </p>
                      <IconGrip className="w-3.5 h-3.5 text-navy-300 shrink-0 mt-0.5" />
                    </div>
                    <p className="text-xs text-navy-500 capitalize mt-1">
                      {p.tipo} · {postRedeMeta(p.rede).label}
                    </p>
                    {p.data_publicacao && (
                      <p className="text-[11px] text-navy-400 mt-1">
                        {new Date(p.data_publicacao).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
                      </p>
                    )}
                    {imovelIndisponivel && (
                      <div className="flex items-center gap-1 text-[11px] text-red-600 mt-1.5">
                        <IconAlert className="w-3 h-3" />
                        imóvel {p.imovel!.status}
                      </div>
                    )}
                    {hasMetrics && (
                      <div className="flex items-center gap-3 mt-2 pt-2 border-t border-navy-100 text-[11px] text-navy-500">
                        {p.alcance != null && (
                          <span className="flex items-center gap-1">
                            <IconEye className="w-3 h-3" />
                            {p.alcance}
                          </span>
                        )}
                        {p.curtidas != null && (
                          <span className="flex items-center gap-1">
                            <IconHeart className="w-3 h-3" />
                            {p.curtidas}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
