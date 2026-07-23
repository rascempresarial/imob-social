"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  IconBuilding,
  IconCalendar,
  IconGlobe,
  IconHome,
  IconInstagram,
  IconLayers,
  IconLinkedin,
  IconLogout,
  IconNote,
  IconSearch,
  IconSettings,
  IconUsers,
  IconYoutube,
} from "./icons";

const NAV = [
  { href: "/dashboard", label: "Visão geral", icon: IconHome },
  { href: "/dashboard/calendario", label: "Calendário editorial", icon: IconCalendar },
  { href: "/dashboard/posts", label: "Posts", icon: IconLayers },
  { href: "/dashboard/notas", label: "Notas", icon: IconNote },
];

const CADASTROS = [
  { href: "/dashboard/imoveis", label: "Imóveis", icon: IconBuilding },
  { href: "/dashboard/corretores", label: "Corretores", icon: IconUsers },
];

const SOCIAL_LINKS = [
  { href: "https://www.instagram.com/pedrogranadoimoveis", label: "Instagram", icon: IconInstagram },
  { href: "https://br.linkedin.com/company/pedrogranadoimoveis", label: "LinkedIn", icon: IconLinkedin },
  { href: "https://www.youtube.com/user/pedrogranadoimoveis", label: "YouTube", icon: IconYoutube },
  { href: "https://www.pedrogranado.com.br/", label: "Site", icon: IconGlobe },
];

function NavLink({ href, label, icon: Icon, active }: { href: string; label: string; icon: typeof IconHome; active: boolean }) {
  return (
    <Link
      href={href}
      className={`relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
        active ? "bg-white text-navy-800 font-medium" : "text-white/70 hover:bg-white/10 hover:text-white"
      }`}
    >
      {active && <span className="nav-active-bar" />}
      <Icon className="w-[18px] h-[18px] shrink-0" />
      {label}
    </Link>
  );
}

export default function Sidebar({ label, isAdmin }: { label: string; isAdmin: boolean }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  const isActive = (href: string) => (href === "/dashboard" ? pathname === href : pathname?.startsWith(href));

  return (
    <aside className="w-60 shrink-0 bg-navy-800 min-h-screen flex flex-col">
      <div className="px-5 py-6 border-b border-white/10">
        <span className="text-white font-semibold tracking-tight text-lg">Gestão de redes</span>
        <div className="flex items-center gap-2 mt-2">
          <span className="pulse-dot" />
          <p className="text-xs text-white/40 truncate">{label}</p>
        </div>
      </div>
      <div className="px-3 pt-4">
        <button
          onClick={() => window.dispatchEvent(new Event("open-command-palette"))}
          className="w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-white/50 border border-white/10 hover:bg-white/10 hover:text-white transition-colors"
        >
          <IconSearch className="w-[16px] h-[16px] shrink-0" />
          Buscar
          <span className="ml-auto text-[10px] border border-white/15 rounded px-1.5 py-0.5">⌘K</span>
        </button>
      </div>
      <nav className="flex-1 flex flex-col px-3 py-4 space-y-1 overflow-y-auto">
        {NAV.map((item) => (
          <NavLink key={item.href} {...item} active={!!isActive(item.href)} />
        ))}

        <div className="pt-4 mt-3 border-t border-white/10">
          <p className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-wider text-white/35">Cadastros</p>
          <div className="space-y-1">
            {CADASTROS.map((item) => (
              <NavLink key={item.href} {...item} active={!!isActive(item.href)} />
            ))}
          </div>
        </div>
      </nav>
      <div className="px-3 py-4 border-t border-white/10">
        <div className="flex items-center justify-center gap-4 mb-4">
          {SOCIAL_LINKS.map((s) => (
            <a
              key={s.href}
              href={s.href}
              target="_blank"
              rel="noreferrer"
              title={s.label}
              className="text-white/40 hover:text-white transition-colors"
            >
              <s.icon className="w-[18px] h-[18px]" />
            </a>
          ))}
        </div>
        {isAdmin && (
          <NavLink
            href="/dashboard/configuracoes"
            label="Configurações"
            icon={IconSettings}
            active={!!isActive("/dashboard/configuracoes")}
          />
        )}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-white/70 hover:bg-white/10 hover:text-white transition-colors"
        >
          <IconLogout className="w-[18px] h-[18px]" />
          Sair
        </button>
      </div>
    </aside>
  );
}
