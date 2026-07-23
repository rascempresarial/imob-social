import Link from "next/link";
import { IconChevronLeft } from "./icons";

export default function PageHeader({
  icon,
  title,
  subtitle,
  action,
  backHref,
  backLabel,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  backHref?: string;
  backLabel?: string;
}) {
  return (
    <div className="fade-slide-in mb-6">
      {backHref && (
        <Link
          href={backHref}
          className="inline-flex items-center gap-1 text-xs text-navy-500 hover:text-navy-800 mb-3"
        >
          <IconChevronLeft className="w-3.5 h-3.5" />
          {backLabel ?? "Voltar"}
        </Link>
      )}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="shrink-0 w-9 h-9 rounded-lg bg-navy-800 text-white flex items-center justify-center">
            <span className="w-[18px] h-[18px]">{icon}</span>
          </div>
          <div>
            <h1 className="text-xl font-semibold text-navy-900">{title}</h1>
            {subtitle && <p className="text-sm text-navy-500 mt-0.5">{subtitle}</p>}
          </div>
        </div>
        {action}
      </div>
    </div>
  );
}
