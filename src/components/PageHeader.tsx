export default function PageHeader({
  icon,
  title,
  subtitle,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="fade-slide-in flex items-start justify-between gap-4 mb-6">
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
  );
}
