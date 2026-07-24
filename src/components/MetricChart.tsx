const WIDTH = 200;
const HEIGHT = 40;
const PAD = 6;

function fmtMes(mes: string) {
  return new Date(mes + "T00:00:00").toLocaleDateString("pt-BR", { month: "short" }).replace(".", "");
}

function fmtValor(v: number) {
  return v.toLocaleString("pt-BR");
}

export default function MetricChart({ metrica, data }: { metrica: string; data: { mes: string; valor: number }[] }) {
  if (data.length === 0) return null;

  const values = data.map((d) => d.valor);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const points = data.map((d, i) => {
    const x = data.length === 1 ? WIDTH / 2 : PAD + (i / (data.length - 1)) * (WIDTH - PAD * 2);
    const y = HEIGHT - PAD - ((d.valor - min) / range) * (HEIGHT - PAD * 2);
    return { x, y };
  });

  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");

  const latest = data[data.length - 1];
  const previous = data.length > 1 ? data[data.length - 2] : null;
  const delta = previous ? ((latest.valor - previous.valor) / (previous.valor || 1)) * 100 : null;

  return (
    <div className="rounded-xl border border-navy-100 bg-white p-3">
      <div className="flex items-start justify-between mb-0.5">
        <p className="text-[11px] font-medium text-navy-500 truncate">{metrica}</p>
        {delta !== null && (
          <span
            className={`text-[10px] rounded-full px-1.5 py-0.5 font-medium shrink-0 ${
              delta > 0 ? "bg-green-100 text-green-700" : delta < 0 ? "bg-red-100 text-red-700" : "bg-navy-100 text-navy-500"
            }`}
          >
            {delta > 0 ? "+" : ""}
            {delta.toFixed(1)}%
          </span>
        )}
      </div>
      <p className="text-lg font-semibold text-navy-900 mb-1">{fmtValor(latest.valor)}</p>
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full h-9">
        <path d={pathD} fill="none" stroke="#173262" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={1.6} fill="#173262" />
        ))}
      </svg>
      <div className="flex justify-between text-[9px] text-navy-400 mt-0.5">
        <span>{fmtMes(data[0].mes)}</span>
        {data.length > 1 && <span>{fmtMes(data[data.length - 1].mes)}</span>}
      </div>
    </div>
  );
}
