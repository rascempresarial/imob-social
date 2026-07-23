import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { IconHistory, IconKey, IconSettings } from "@/components/icons";

const CARDS = [
  {
    href: "/dashboard/configuracoes/chaves",
    title: "Chaves de acesso",
    subtitle: "Gerar e gerenciar as chaves de login da equipe",
    icon: IconKey,
  },
  {
    href: "/dashboard/configuracoes/auditoria",
    title: "Auditoria",
    subtitle: "Histórico de ações realizadas nos posts",
    icon: IconHistory,
  },
];

export default function ConfiguracoesPage() {
  return (
    <div>
      <PageHeader icon={<IconSettings className="w-full h-full" />} title="Configurações" subtitle="Área restrita ao administrador" />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
        {CARDS.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="rounded-xl border border-navy-100 bg-white p-5 hover:border-navy-300 transition-colors"
          >
            <c.icon className="w-6 h-6 text-navy-700 mb-3" />
            <p className="text-sm font-medium text-navy-900 mb-1">{c.title}</p>
            <p className="text-xs text-navy-500">{c.subtitle}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
