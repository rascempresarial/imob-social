"use client";

export default function Modal({
  title,
  onClose,
  children,
  width = "max-w-lg",
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  width?: string;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-900/40 px-4">
      <div className={`w-full ${width} bg-white rounded-xl border border-navy-100 shadow-xl max-h-[85vh] overflow-y-auto`}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-navy-100">
          <h2 className="text-sm font-semibold text-navy-900">{title}</h2>
          <button onClick={onClose} className="text-navy-500 hover:text-navy-900 text-sm">
            Fechar
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
