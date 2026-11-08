function Phone() {
  return (
    <g>
      <rect x={-14} y={-26} width={28} height={50} rx={5} className="device" />
      <rect x={-10} y={-20} width={20} height={36} rx={2} className="screen" />
    </g>
  );
}

function Laptop() {
  return (
    <g>
      <rect x={-24} y={-22} width={48} height={32} rx={3} className="device" />
      <rect x={-20} y={-18} width={40} height={24} className="screen" />
      <rect x={-30} y={10} width={60} height={6} rx={2} className="device" />
    </g>
  );
}

function Atm() {
  return (
    <g>
      <rect x={-20} y={-28} width={40} height={54} rx={4} className="device" />
      <rect x={-14} y={-22} width={28} height={16} className="screen" />
      <rect x={-12} y={2} width={24} height={4} className="slot-dark" />
      <rect x={-12} y={12} width={24} height={8} className="cash" />
    </g>
  );
}

function Washer() {
  return (
    <g>
      <rect x={-22} y={-26} width={44} height={52} rx={4} className="device" />
      <circle cx={0} cy={4} r={14} className="screen" />
      <circle cx={-14} cy={-19} r={2.5} className="slot-dark" />
    </g>
  );
}

function Signal() {
  return (
    <g>
      <rect x={-10} y={-30} width={20} height={48} rx={4} className="device-dark" />
      <circle cx={0} cy={-20} r={5} className="signal-red" />
      <circle cx={0} cy={-6} r={5} className="signal-off" />
      <circle cx={0} cy={8} r={5} className="signal-off" />
      <rect x={-2} y={18} width={4} height={10} className="device-dark" />
    </g>
  );
}

function Lift() {
  return (
    <g>
      <rect x={-22} y={-28} width={44} height={56} rx={2} className="device" />
      <line x1={0} y1={-22} x2={0} y2={28} className="lift-gap" />
      <path d="M-6,-14 L0,-20 L6,-14" className="lift-arrow" />
      <path d="M-6,-6 L0,0 L6,-6" className="lift-arrow" />
    </g>
  );
}

const ITEMS = [
  { name: 'Mobile phone', Icon: Phone },
  { name: 'Laptop', Icon: Laptop },
  { name: 'ATM', Icon: Atm },
  { name: 'Washing machine', Icon: Washer },
  { name: 'Traffic signal', Icon: Signal },
  { name: 'Lift', Icon: Lift },
];

export function DevicesArt() {
  return (
    <svg
      viewBox="0 0 320 200"
      className="scene"
      role="img"
      aria-label="Devices that use logic gates: mobile phone, laptop, ATM, washing machine, traffic signal and lift."
    >
      <rect width={320} height={200} className="paper" />
      {ITEMS.map(({ name, Icon }, index) => {
        const x = 55 + (index % 3) * 105;
        const y = 50 + Math.floor(index / 3) * 95;
        return (
          <g key={name}>
            <g transform={`translate(${x} ${y})`}>
              <Icon />
            </g>
            <text x={x} y={y + 42} className="scene-label">
              {name}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
