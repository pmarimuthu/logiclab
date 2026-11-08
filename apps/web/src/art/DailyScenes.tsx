import { isOn, type SceneProps } from './scene-types';

function Person({ x, belted }: { x: number; belted: boolean }) {
  return (
    <g>
      <rect x={x - 38} y={78} width={76} height={110} rx={14} className="seat" />
      <rect x={x - 20} y={64} width={40} height={18} rx={6} className="seat" />
      <circle cx={x} cy={96} r={14} className="skin" />
      <rect x={x - 22} y={112} width={44} height={60} rx={10} className="shirt" />
      {belted ? (
        <line x1={x - 20} y1={114} x2={x + 20} y2={170} className="belt on" />
      ) : (
        <line x1={x + 30} y1={100} x2={x + 30} y2={176} className="belt" />
      )}
    </g>
  );
}

export function SeatbeltScene({ a, b, y }: SceneProps) {
  const warn = isOn(y);
  return (
    <svg
      viewBox="0 0 320 220"
      className="scene"
      role="img"
      aria-label={`Car. Driver belt ${isOn(a) ? 'fastened' : 'open'}, passenger belt ${isOn(b) ? 'fastened' : 'open'}. Warning light ${warn ? 'on' : 'off'}.`}
    >
      <rect width={320} height={220} className="car-inside" />
      <rect x={20} y={10} width={280} height={44} rx={10} className="dashboard" />
      <g className={warn ? 'warning on' : 'warning'}>
        <circle cx={100} cy={32} r={15} />
        <circle cx={100} cy={25} r={4} className="icon" />
        <line x1={93} y1={30} x2={107} y2={42} className="icon-line" />
      </g>
      <text x={124} y={37} className={warn ? 'dash-text warn' : 'dash-text safe'}>
        {warn ? 'FASTEN SEAT BELT!' : 'All safe ✓'}
      </text>
      <Person x={90} belted={isOn(a)} />
      <Person x={230} belted={isOn(b)} />
      <text x={90} y={208} className="scene-label">
        Driver
      </text>
      <text x={230} y={208} className="scene-label">
        Passenger
      </text>
    </svg>
  );
}

function Student({ x, pressed }: { x: number; pressed: boolean }) {
  return (
    <g>
      <circle cx={x} cy={108} r={13} className="skin" />
      <rect x={x - 14} y={121} width={28} height={30} rx={8} className="shirt" />
      {pressed ? (
        <>
          <line x1={x + 10} y1={126} x2={x + 26} y2={88} className="arm-line" />
          <circle cx={x + 27} cy={85} r={5} className="skin" />
        </>
      ) : (
        <line x1={x + 10} y1={128} x2={x + 26} y2={146} className="arm-line" />
      )}
      <rect x={x - 50} y={150} width={100} height={10} className="desk" />
      <rect x={x - 44} y={160} width={6} height={32} className="desk" />
      <rect x={x + 38} y={160} width={6} height={32} className="desk" />
      <circle cx={x + 34} cy={146} r={5} className={pressed ? 'push on' : 'push'} />
    </g>
  );
}

export function ExamHallScene({ a, b, y }: SceneProps) {
  const quiet = isOn(y);
  return (
    <svg
      viewBox="0 0 320 220"
      className="scene"
      role="img"
      aria-label={`Exam hall. Student 1 ${isOn(a) ? 'pressing' : 'not pressing'} help, student 2 ${isOn(b) ? 'pressing' : 'not pressing'} help. All-quiet light ${quiet ? 'on' : 'off'}.`}
    >
      <rect width={320} height={220} className="classroom" />
      <rect x={95} y={14} width={130} height={40} rx={8} className={quiet ? 'quiet on' : 'quiet'} />
      <text x={160} y={40} className="quiet-text">
        ALL QUIET
      </text>
      <Student x={80} pressed={isOn(a)} />
      <Student x={240} pressed={isOn(b)} />
      <text x={80} y={208} className="scene-label">
        Student 1
      </text>
      <text x={240} y={208} className="scene-label">
        Student 2
      </text>
    </svg>
  );
}

function stairsPath(): string {
  const points: string[] = ['M10,205'];
  for (let step = 0; step < 6; step += 1) {
    const x = 10 + step * 40;
    const top = 185 - step * 20;
    points.push(`L${x},${top}`, `L${x + 40},${top}`);
  }
  points.push('L320,65', 'L320,205', 'Z');
  return points.join(' ');
}

function WallSwitch({ x, y, up, label }: { x: number; y: number; up: boolean; label: string }) {
  return (
    <g>
      <rect x={x} y={y} width={22} height={34} rx={3} className="switch-plate" />
      <rect
        x={x + 7}
        y={up ? y + 5 : y + 17}
        width={8}
        height={12}
        rx={2}
        className="switch-knob"
      />
      <text x={x + 11} y={y - 6} className="scene-label">
        {label} {up ? 'UP' : 'DOWN'}
      </text>
    </g>
  );
}

export function StaircaseScene({ a, b, y }: SceneProps) {
  const lit = isOn(y);
  return (
    <svg
      viewBox="0 0 320 220"
      className="scene"
      role="img"
      aria-label={`Staircase. Bottom switch ${isOn(a) ? 'up' : 'down'}, top switch ${isOn(b) ? 'up' : 'down'}. Light ${lit ? 'on' : 'off'}.`}
    >
      <rect width={320} height={220} className={lit ? 'room-lit' : 'room-dark'} />
      <path d={stairsPath()} className="stairs" />
      <line x1={150} y1={0} x2={150} y2={30} className="bulb-wire" />
      {lit && <circle cx={150} cy={42} r={30} className="bulb-glow" />}
      <circle cx={150} cy={42} r={12} className={lit ? 'bulb on' : 'bulb'} />
      <WallSwitch x={24} y={126} up={isOn(a)} label="Bottom" />
      <WallSwitch x={278} y={22} up={isOn(b)} label="Top" />
    </svg>
  );
}
