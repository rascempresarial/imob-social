const GOLD = "#E8B95C";
const TOWER_DARK = "#0A1420";

const VIEW_W = 380;
const VIEW_H = 320;

const CX = 190;
const TOWER_X = 100;
const TOWER_W = 180;
const CROWN_Y = 46;

function buildZigzag() {
  const amplitude = 62;
  const top = CROWN_Y + 6;
  const bottom = VIEW_H;
  const segments = 9;
  const points: string[] = [];
  for (let i = 0; i <= segments; i++) {
    const y = top + (i / segments) * (bottom - top);
    const x = CX + (i % 2 === 0 ? -amplitude : amplitude);
    points.push(`${x},${y}`);
  }
  return points.join(" ");
}

const STARS: [number, number][] = [
  [36, 28],
  [130, 22],
  [312, 40],
  [345, 95],
];

export default function SkylineIllustration() {
  const zigzag = buildZigzag();

  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      preserveAspectRatio="xMidYMax slice"
      className="absolute inset-0 w-full h-full"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="crownGradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#F4CE8A" />
          <stop offset="45%" stopColor="#DE9257" />
          <stop offset="100%" stopColor="#7C4763" />
        </linearGradient>
        <filter id="zigzagGlow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="3.2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {STARS.map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r={0.9} fill="#E7ECF5" className="star" style={{ animationDelay: `${i * 1.1}s` }} />
      ))}

      <rect x={TOWER_X} y={CROWN_Y} width={TOWER_W} height={VIEW_H - CROWN_Y} fill={TOWER_DARK} />
      <polygon
        points={`${TOWER_X},${CROWN_Y} ${TOWER_X + TOWER_W},${CROWN_Y} ${TOWER_X + TOWER_W},${CROWN_Y - 22} ${TOWER_X + 30},${CROWN_Y - 44}`}
        fill="url(#crownGradient)"
      />

      <polyline
        points={zigzag}
        fill="none"
        stroke={GOLD}
        strokeWidth={2.6}
        strokeLinejoin="round"
        strokeLinecap="round"
        opacity={0.95}
        filter="url(#zigzagGlow)"
        className="zigzag-pulse"
      />
    </svg>
  );
}
