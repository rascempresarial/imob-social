"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Post, postRedeMeta, postStatusMeta } from "@/lib/types";
import PageHeader from "@/components/PageHeader";
import { IconCalendar, IconExternalLink } from "@/components/icons";

function ymd(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

export default function CalendarioPage() {
  const [cursor, setCursor] = useState(() => new Date());
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();

  const load = useCallback(async () => {
    const from = new Date(year, month, 1).toISOString();
    const to = new Date(year, month + 1, 0, 23, 59, 59).toISOString();
    const res = await fetch(`/api/posts?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`);
    const data = await res.json();
    setPosts(data.data ?? []);
  }, [year, month]);

  useEffect(() => {
    load();
  }, [load]);

  const postsByDay = useMemo(() => {
    const map = new Map<string, Post[]>();
    for (const p of posts) {
      if (!p.data_publicacao) continue;
      const key = ymd(new Date(p.data_publicacao));
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(p);
    }
    return map;
  }, [posts]);

  const cells = useMemo(() => {
    const first = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startOffset = first.getDay();
    const totalCells = Math.ceil((startOffset + daysInMonth) / 7) * 7;
    const out: { date: Date | null }[] = [];
    for (let i = 0; i < totalCells; i++) {
      const dayNum = i - startOffset + 1;
      out.push({ date: dayNum >= 1 && dayNum <= daysInMonth ? new Date(year, month, dayNum) : null });
    }
    return out;
  }, [year, month]);

  const todayKey = ymd(new Date());
  const selectedPosts = selectedDay ? postsByDay.get(selectedDay) ?? [] : [];

  return (
    <div>
      <PageHeader
        icon={<IconCalendar className="w-full h-full" />}
        title="Calendário editorial"
        action={
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCursor(new Date(year, month - 1, 1))}
              className="px-3 py-1.5 text-sm rounded-lg border border-navy-200 text-navy-700 hover:bg-navy-100"
            >
              ←
            </button>
            <span className="text-sm font-medium text-navy-900 w-36 text-center">
              {MONTHS[month]} {year}
            </span>
            <button
              onClick={() => setCursor(new Date(year, month + 1, 1))}
              className="px-3 py-1.5 text-sm rounded-lg border border-navy-200 text-navy-700 hover:bg-navy-100"
            >
              →
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-7 gap-px bg-navy-100 rounded-xl overflow-hidden border border-navy-100">
        {WEEKDAYS.map((w) => (
          <div key={w} className="bg-navy-800 text-white text-xs font-medium px-2 py-2 text-center">
            {w}
          </div>
        ))}
        {cells.map((cell, i) => {
          const key = cell.date ? ymd(cell.date) : `empty-${i}`;
          const dayPosts = cell.date ? postsByDay.get(key) ?? [] : [];
          const isToday = key === todayKey;
          return (
            <div
              key={key}
              onClick={() => cell.date && setSelectedDay(key)}
              className={`bg-white min-h-[100px] p-2 ${cell.date ? "cursor-pointer hover:bg-navy-100/40" : "bg-paper"}`}
            >
              {cell.date && (
                <>
                  <div className={`text-xs mb-1 ${isToday ? "font-semibold text-navy-900" : "text-navy-500"}`}>
                    {cell.date.getDate()}
                  </div>
                  <div className="space-y-1">
                    {dayPosts.slice(0, 3).map((p) => {
                      const meta = postStatusMeta(p.status);
                      return (
                        <div
                          key={p.id}
                          className="text-[11px] rounded px-1.5 py-0.5 truncate"
                          style={{ backgroundColor: meta.color + "22", color: meta.color }}
                        >
                          {p.imovel?.codigo ?? "sem imóvel"} · {p.tipo}
                        </div>
                      );
                    })}
                    {dayPosts.length > 3 && <div className="text-[11px] text-navy-400">+{dayPosts.length - 3} mais</div>}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {selectedDay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-900/40 px-4" onClick={() => setSelectedDay(null)}>
          <div className="w-full max-w-md bg-white rounded-xl border border-navy-100 shadow-xl max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-navy-100">
              <h2 className="text-sm font-semibold text-navy-900">
                Posts em {new Date(selectedDay + "T00:00:00").toLocaleDateString("pt-BR")}
              </h2>
              <button onClick={() => setSelectedDay(null)} className="text-navy-500 hover:text-navy-900 text-sm">
                Fechar
              </button>
            </div>
            <div className="p-5 space-y-3">
              {selectedPosts.length === 0 && <p className="text-sm text-navy-400">Nenhum post neste dia.</p>}
              {selectedPosts.map((p) => {
                const meta = postStatusMeta(p.status);
                return (
                  <div key={p.id} className="border border-navy-100 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-navy-900">{p.imovel ? `${p.imovel.codigo}, ${p.imovel.titulo}` : "Sem imóvel"}</span>
                      <span className="text-xs rounded-full px-2 py-0.5" style={{ backgroundColor: meta.color + "1A", color: meta.color }}>
                        {meta.label}
                      </span>
                    </div>
                    <div className="text-xs text-navy-500 capitalize">
                      {p.tipo} · {postRedeMeta(p.rede).label}
                    </div>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-navy-500">
                      <span>Anunciado: {p.anunciado ? "Sim" : "Não"}</span>
                      {p.created_by && <span>Responsável: {p.created_by}</span>}
                    </div>
                    {p.link_criativo && (
                      <a
                        href={p.link_criativo}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-navy-700 hover:text-navy-900 underline mt-1.5"
                      >
                        <IconExternalLink className="w-3 h-3" />
                        Ver criativo
                      </a>
                    )}
                    {p.copy && <p className="text-xs text-navy-600 mt-2 line-clamp-3">{p.copy}</p>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
