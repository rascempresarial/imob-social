"use client";

import { IconChevronLeft, IconChevronRight } from "./icons";

export default function Pagination({
  page,
  pageSize,
  count,
  onPageChange,
}: {
  page: number;
  pageSize: number;
  count: number;
  onPageChange: (page: number) => void;
}) {
  const totalPages = Math.max(1, Math.ceil(count / pageSize));
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between mt-4">
      <p className="text-xs text-navy-500">
        {count} {count === 1 ? "resultado" : "resultados"}, página {page} de {totalPages}
      </p>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-navy-200 text-navy-700 hover:bg-navy-100 disabled:opacity-40 disabled:hover:bg-transparent"
        >
          <IconChevronLeft className="w-4 h-4" />
        </button>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-navy-200 text-navy-700 hover:bg-navy-100 disabled:opacity-40 disabled:hover:bg-transparent"
        >
          <IconChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
