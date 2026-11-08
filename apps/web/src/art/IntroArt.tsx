import type { IllustrationKey } from '@logiclab/learning-content';
import { DevicesArt } from './DevicesArt';

function Bulb({ x, on, value }: { x: number; on: boolean; value: string }) {
  return (
    <g>
      {on && <circle cx={x} cy={80} r={46} className="bulb-glow" />}
      <circle cx={x} cy={80} r={32} className={on ? 'bulb on' : 'bulb'} />
      <rect x={x - 14} y={110} width={28} height={20} rx={3} className="bulb-base" />
      <text x={x} y={92} className="big-digit">
        {value}
      </text>
    </g>
  );
}

function GateConceptArt() {
  return (
    <svg
      viewBox="0 0 320 200"
      className="scene"
      role="img"
      aria-label="Two switches go into a logic gate box, which lights a bulb."
    >
      <rect width={320} height={200} className="paper" />
      {[60, 140].map((y, index) => (
        <g key={y}>
          <rect x={14} y={y - 18} width={64} height={36} rx={8} className="toggle on" />
          <circle cx={60} cy={y} r={12} className="toggle-knob" />
          <text x={46} y={y - 24} className="scene-label">
            Input {index === 0 ? 'A' : 'B'}
          </text>
          <line x1={78} y1={y} x2={120} y2={y} className="wire on" />
        </g>
      ))}
      <rect x={120} y={40} width={86} height={120} rx={12} className="gate-box" />
      <text x={163} y={96} className="gate-box-text">
        LOGIC
      </text>
      <text x={163} y={114} className="gate-box-text">
        GATE
      </text>
      <text x={163} y={176} className="scene-label">
        follows one rule
      </text>
      <line x1={206} y1={100} x2={236} y2={100} className="wire on" />
      <g transform="translate(150 20)">
        <Bulb x={120} on value="" />
      </g>
      <text x={270} y={170} className="scene-label">
        Output
      </text>
    </svg>
  );
}

function BinaryArt() {
  return (
    <svg
      viewBox="0 0 320 200"
      className="scene"
      role="img"
      aria-label="A glowing bulb shows 1 meaning ON. A dark bulb shows 0 meaning OFF."
    >
      <rect width={320} height={200} className="paper" />
      <Bulb x={85} on value="1" />
      <Bulb x={235} on={false} value="0" />
      <text x={85} y={160} className="scene-title">
        1 = ON
      </text>
      <text x={85} y={180} className="scene-label">
        YES · TRUE
      </text>
      <text x={235} y={160} className="scene-title">
        0 = OFF
      </text>
      <text x={235} y={180} className="scene-label">
        NO · FALSE
      </text>
    </svg>
  );
}

const TABLE = [
  ['0', '0', '0'],
  ['0', '1', '0'],
  ['1', '0', '0'],
  ['1', '1', '1'],
];

function TruthTableArt() {
  return (
    <svg
      viewBox="0 0 320 200"
      className="scene"
      role="img"
      aria-label="A truth table: input columns A and B on the left that you choose, output column on the right that the gate gives."
    >
      <rect width={320} height={200} className="paper" />
      <rect x={70} y={22} width={110} height={20} rx={4} className="tag-in" />
      <text x={125} y={36} className="scene-label">
        You choose
      </text>
      <rect x={186} y={22} width={74} height={20} rx={4} className="tag-out" />
      <text x={223} y={36} className="scene-label">
        Gate gives
      </text>
      {['A', 'B', 'Output'].map((head, column) => (
        <text key={head} x={column === 2 ? 223 : 97 + column * 56} y={64} className="table-head">
          {head}
        </text>
      ))}
      <line x1={70} y1={70} x2={260} y2={70} className="table-line" />
      <line x1={183} y1={48} x2={183} y2={186} className="table-line" />
      {TABLE.map((row, index) => (
        <g key={row.join('')}>
          {index === 3 && (
            <rect x={66} y={150} width={198} height={26} rx={5} className="row-highlight" />
          )}
          {row.map((cell, column) => (
            <text
              key={column}
              x={column === 2 ? 223 : 97 + column * 56}
              y={92 + index * 26}
              className="table-cell"
            >
              {cell}
            </text>
          ))}
        </g>
      ))}
      <text x={268} y={168} className="scene-label start">
        ← one row
      </text>
      <text x={268} y={182} className="scene-label start">
        = one case
      </text>
    </svg>
  );
}

export function IntroArt({ kind }: { kind: IllustrationKey }) {
  if (kind === 'gate-concept') return <GateConceptArt />;
  if (kind === 'binary') return <BinaryArt />;
  if (kind === 'devices') return <DevicesArt />;
  return <TruthTableArt />;
}
