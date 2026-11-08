export interface LockerKey {
  label: string;
  turned: boolean;
}

interface BankLockerProps {
  open: boolean;
  keys: LockerKey[];
}

const STEEL = 'url(#locker-steel)';
const KEY_X = 510;
const KEY_YS = [104, 152];
const OPEN_DOOR = 'matrix(0.6,-0.1,0,1,290.4,45.6)';

function Keyhole({ lock, y }: { lock: LockerKey; y: number }) {
  return (
    <g className="locker-key" data-turned={lock.turned}>
      <text x={KEY_X} y={y - 17} className="locker-key-label">
        {lock.label}
      </text>
      <circle cx={KEY_X} cy={y} r={12} className="escutcheon" />
      {lock.turned ? (
        <g className="key">
          <rect x={KEY_X - 2} y={y - 3} width={22} height={6} rx={2} />
          <circle cx={KEY_X + 27} cy={y} r={7} />
          <circle cx={KEY_X + 27} cy={y} r={2} className="key-hole" />
        </g>
      ) : (
        <g className="slot">
          <circle cx={KEY_X} cy={y - 3} r={3} />
          <rect x={KEY_X - 1.5} y={y - 2} width={3} height={8} />
        </g>
      )}
    </g>
  );
}

function DoorFace({ keys }: { keys: LockerKey[] }) {
  return (
    <g>
      <rect x={456} y={48} width={108} height={144} rx={3} fill={STEEL} className="locker-door" />
      <rect x={480} y={55} width={60} height={16} rx={2} className="number-plate" />
      <text x={510} y={67} className="number-text">
        No. 107
      </text>
      <rect x={463} y={100} width={7} height={52} rx={3} className="locker-handle" />
      {keys.map((lock, index) => (
        <Keyhole key={lock.label} lock={lock} y={KEY_YS[index] ?? 104} />
      ))}
    </g>
  );
}

function Inside() {
  return (
    <g>
      <rect x={456} y={48} width={108} height={144} className="locker-inside" />
      <rect x={470} y={136} width={80} height={44} rx={2} className="deposit-box" />
      <rect x={502} y={152} width={16} height={5} rx={2} className="locker-handle" />
      <polygon points="478,136 484,124 504,124 510,136" className="gold" />
      <polygon points="508,136 514,124 534,124 540,136" className="gold" />
      <polygon points="493,124 499,112 519,112 525,124" className="gold" />
    </g>
  );
}

export function BankLocker({ open, keys }: BankLockerProps) {
  return (
    <g data-testid="locker" data-state={open ? 'open' : 'closed'}>
      <defs>
        <linearGradient id="locker-steel" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#d9dee4" />
          <stop offset="0.5" stopColor="#b4bcc6" />
          <stop offset="1" stopColor="#8f99a5" />
        </linearGradient>
      </defs>
      <rect x={448} y={40} width={124} height={160} rx={5} className="locker-frame" />
      <rect x={562} y={62} width={6} height={14} rx={1} className="hinge" />
      <rect x={562} y={164} width={6} height={14} rx={1} className="hinge" />
      {open ? (
        <>
          <Inside />
          <g transform={OPEN_DOOR}>
            <DoorFace keys={keys} />
          </g>
        </>
      ) : (
        <DoorFace keys={keys} />
      )}
    </g>
  );
}
