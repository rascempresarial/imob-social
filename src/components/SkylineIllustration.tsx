const GOLD = "#C9A24B";
const SHADE_A = "#132A52";
const SHADE_B = "#1B3A6B";

const VIEW_W = 380;
const VIEW_H = 320;

const FLOORS = 22;
const TOWER_H = 280;
const TOWER_W = 96;
const TOTAL_TWIST = 70;
const CENTER_X = 190;
const BASE_Y = VIEW_H;

function buildFloors() {
  const floorH = TOWER_H / FLOORS;
  const floors: { y: number; angle: number; shade: string }[] = [];
  for (let i = 0; i < FLOORS; i++) {
    const y = BASE_Y - (i + 1) * floorH;
    const angle = (i / (FLOORS - 1)) * TOTAL_TWIST;
    floors.push({ y, angle, shade: i % 2 === 0 ? SHADE_A : SHADE_B });
  }
  return { floors, floorH };
}

export default function SkylineIllustration() {
  const { floors, floorH } = buildFloors();

  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      preserveAspectRatio="xMidYMax slice"
      className="absolute inset-0 w-full h-full"
      aria-hidden="true"
    >
      {[
        [40, 30],
        [130, 46],
        [230, 22],
        [320, 90],
      ].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r={0.9} fill="#E7ECF5" className="star" style={{ animationDelay: `${i * 1.1}s` }} />
      ))}

      {floors.map((f, i) => (
        <rect
          key={i}
          x={CENTER_X - TOWER_W / 2}
          y={f.y}
          width={TOWER_W}
          height={floorH + 0.6}
          rx={2}
          fill={f.shade}
          transform={`rotate(${f.angle} ${CENTER_X} ${f.y + floorH / 2})`}
        />
      ))}
      {floors.map((f, i) => (
        <rect
          key={`edge-${i}`}
          x={CENTER_X - TOWER_W / 2}
          y={f.y}
          width={TOWER_W}
          height={1}
          fill={GOLD}
          opacity={0.4}
          transform={`rotate(${f.angle} ${CENTER_X} ${f.y + floorH / 2})`}
        />
      ))}

      <ellipse cx={CENTER_X} cy={BASE_Y - 1} rx={TOWER_W * 0.75} ry={6} fill={GOLD} opacity={0.12} />
    </svg>
  );
}
