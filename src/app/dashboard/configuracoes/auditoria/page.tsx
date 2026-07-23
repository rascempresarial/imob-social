"use client";

import { useCallback, useEffect, useState } from "react";
import { AuditLog, auditActionMeta } from "@/lib/types";
import PageHeader from "@/components/PageHeader";
import Badge from "@/components/Badge";
import Pagination from "@/components/Pagination";
import { SkeletonTableRows } from "@/components/Skeleton";
import { IconHistory } from "@/components/icons";

const PAGE_SIZE = 30;

export default function AuditoriaPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/auditoria?page=${page}&pageSize=${PAGE_SIZE}`);
    const data = await res.json();
    setLogs(data.data ?? []);
    setCount(data.count ?? 0);
    setLoading(false);
  }, [page]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div>
      <PageHeader icon={<IconHistory className="w-full h-full" />} title="Auditoria" subtitle="Histórico de ações realizadas nos posts" />

      <div className="rounded-xl border border-navy-100 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-navy-100 text-left text-navy-500">
              <th className="px-4 py-3 font-medium">Quando</th>
              <th className="px-4 py-3 font-medium">Quem</th>
              <th className="px-4 py-3 font-medium">Ação</th>
              <th className="px-4 py-3 font-medium">Detalhe</th>
            </tr>
          </thead>
          <tbody>
            {loading && <SkeletonTableRows cols={4} />}
            {!loading && logs.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-navy-400">
                  Nenhuma ação registrada ainda.
                </td>
              </tr>
            )}
            {!loading &&
              logs.map((log) => {
                const meta = auditActionMeta(log.action);
                return (
                  <tr key={log.id} className="border-b border-navy-100 last:border-0">
                    <td className="px-4 py-3 text-navy-600 whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}
                    </td>
                    <td className="px-4 py-3 text-navy-900">{log.actor}</td>
                    <td className="px-4 py-3">
                      <Badge label={meta.label} color={meta.color} />
                    </td>
                    <td className="px-4 py-3 text-navy-600">{log.detail ?? "·"}</td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      <Pagination page={page} pageSize={PAGE_SIZE} count={count} onPageChange={setPage} />
    </div>
  );
}
