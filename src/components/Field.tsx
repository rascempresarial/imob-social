export default function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-navy-800 mb-1">{label}</label>
      {children}
    </div>
  );
}
