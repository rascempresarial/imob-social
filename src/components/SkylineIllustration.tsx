const GOLD = "#C9A24B";

const BUILDINGS = [
  { x: 20, w: 34, h: 150, shade: "#132A52" },
  { x: 78, w: 46, h: 260, shade: "#0F2247" },
  { x: 148, w: 30, h: 110, shade: "#1B3A6B" },
  { x: 202, w: 42, h: 210, shade: "#132A52" },
  { x: 268, w: 32, h: 165, shade: "#1B3A6B" },
];

const VIEW_W = 380;
const VIEW_H = 320;

export default function SkylineIllustration() {
  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      preserveAspectRatio="xMidYMax slice"
      className="absolute inset-0 w-full h-full"
      aria-hidden="true"
    >
      <circle cx={300} cy={64} r={26} fill="none" stroke={GOLD} strokeWidth={0.75} opacity={0.5} />
      <circle cx={300} cy={64} r={1.5} fill={GOLD} opacity={0.7} />

      {[
        [40, 30],
        [130, 46],
        [230, 22],
        [320, 90],
      ].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r={0.9} fill="#E7ECF5" className="star" style={{ animationDelay: `${i * 1.1}s` }} />
      ))}

      {BUILDINGS.map((b, i) => {
        const top = VIEW_H - b.h;
        const bandY = top + Math.min(28, b.h * 0.14);
        return (
          <g key={i}>
            <rect x={b.x} y={top} width={b.w} height={b.h} fill={b.shade} />
            <rect x={b.x} y={bandY} width={b.w} height={1} fill={GOLD} opacity={0.55} />
            <line x1={b.x} y1={top} x2={b.x} y2={VIEW_H} stroke={GOLD} strokeWidth={0.5} opacity={0.25} />
          </g>
        );
      })}

      <line x1={0} y1={VIEW_H - 0.5} x2={VIEW_W} y2={VIEW_H - 0.5} stroke={GOLD} strokeWidth={0.5} opacity={0.3} />
    </svg>
  );
}
