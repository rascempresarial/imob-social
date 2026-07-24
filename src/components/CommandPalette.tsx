"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  IconBuilding,
  IconCalendar,
  IconHistory,
  IconHome,
  IconInstagram,
  IconKey,
  IconLayers,
  IconLinkedin,
  IconNote,
  IconPlus,
  IconSettings,
  IconTarget,
  IconUsers,
} from "./icons";

interface Command {
  id: string;
  label: string;
  group: "Navegar" | "Criar";
  href: string;
  icon: React.ReactNode;
}

const COMMANDS: Command[] = [
  { id: "nav-visao", label: "Visão geral", group: "Navegar", href: "/dashboard", icon: <IconHome className="w-4 h-4" /> },
  { id: "nav-calendario", label: "Calendário editorial", group: "Navegar", href: "/dashboard/calendario", icon: <IconCalendar className="w-4 h-4" /> },
  { id: "nav-posts", label: "Posts", group: "Navegar", href: "/dashboard/posts", icon: <IconLayers className="w-4 h-4" /> },
  { id: "nav-imoveis", label: "Imóveis", group: "Navegar", href: "/dashboard/imoveis", icon: <IconBuilding className="w-4 h-4" /> },
  { id: "nav-corretores", label: "Corretores", group: "Navegar", href: "/dashboard/corretores", icon: <IconUsers className="w-4 h-4" /> },
  { id: "nav-notas", label: "Notas", group: "Navegar", href: "/dashboard/notas", icon: <IconNote className="w-4 h-4" /> },
  { id: "nav-planejamento-instagram", label: "Planejamento Instagram", group: "Navegar", href: "/dashboard/planejamento/instagram", icon: <IconInstagram className="w-4 h-4" /> },
  { id: "nav-planejamento-linkedin", label: "Planejamento LinkedIn", group: "Navegar", href: "/dashboard/planejamento/linkedin", icon: <IconLinkedin className="w-4 h-4" /> },
  { id: "nav-planejamento-meta-ads", label: "Planejamento Meta ADS", group: "Navegar", href: "/dashboard/planejamento/meta-ads", icon: <IconTarget className="w-4 h-4" /> },
  { id: "new-post", label: "Novo post", group: "Criar", href: "/dashboard/posts?action=new", icon: <IconPlus className="w-4 h-4" /> },
  { id: "new-imovel", label: "Novo imóvel", group: "Criar", href: "/dashboard/imoveis?action=new", icon: <IconPlus className="w-4 h-4" /> },
];

const ADMIN_COMMANDS: Command[] = [
  { id: "nav-configuracoes", label: "Configurações", group: "Navegar", href: "/dashboard/configuracoes", icon: <IconSettings className="w-4 h-4" /> },
  { id: "nav-chaves", label: "Chaves de acesso", group: "Navegar", href: "/dashboard/configuracoes/chaves", icon: <IconKey className="w-4 h-4" /> },
  { id: "nav-auditoria", label: "Auditoria", group: "Navegar", href: "/dashboard/configuracoes/auditoria", icon: <IconHistory className="w-4 h-4" /> },
];

export default function CommandPalette({ isAdmin }: { isAdmin: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const allCommands = useMemo(() => (isAdmin ? [...COMMANDS, ...ADMIN_COMMANDS] : COMMANDS), [isAdmin]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allCommands;
    return allCommands.filter((c) => c.label.toLowerCase().includes(q));
  }, [query, allCommands]);

  useEffect(() => {
    function handleKeydown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") setOpen(false);
    }
    function handleOpenEvent() {
      setOpen(true);
    }
    window.addEventListener("keydown", handleKeydown);
    window.addEventListener("open-command-palette", handleOpenEvent);
    return () => {
      window.removeEventListener("keydown", handleKeydown);
      window.removeEventListener("open-command-palette", handleOpenEvent);
    };
  }, []);

  useEffect(() => {
    if (open) {
      setQuery("");
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [open]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  function select(cmd: Command) {
    setOpen(false);
    router.push(cmd.href);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (results[activeIndex]) select(results[activeIndex]);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[15vh] px-4 bg-navy-900/40" onClick={() => setOpen(false)}>
      <div
        className="w-full max-w-lg bg-white rounded-xl border border-navy-100 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Buscar página ou ação..."
          className="w-full px-4 py-3 text-sm border-b border-navy-100 outline-none text-navy-900 placeholder:text-navy-400"
        />
        <div className="max-h-80 overflow-y-auto py-1">
          {results.length === 0 && <p className="px-4 py-6 text-sm text-navy-400 text-center">Nada encontrado.</p>}
          {results.map((c, i) => (
            <button
              key={c.id}
              onClick={() => select(c)}
              onMouseEnter={() => setActiveIndex(i)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left ${
                i === activeIndex ? "bg-navy-100 text-navy-900" : "text-navy-700"
              }`}
            >
              <span className="text-navy-400">{c.icon}</span>
              {c.label}
              <span className="ml-auto text-[11px] text-navy-400">{c.group}</span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3 px-4 py-2 border-t border-navy-100 text-[11px] text-navy-400">
          <span>↑↓ navegar</span>
          <span>↵ selecionar</span>
          <span>esc fechar</span>
        </div>
      </div>
    </div>
  );
}
