import type { GateType } from '@logiclab/circuit-domain';
import { GATE_CENTER_Y, GateShape, gateInputX, gateOutputX } from './GateSymbol';

export interface DiagramSignal {
  id: string;
  label: string;
  value: string | undefined;
  meaning: string;
}

interface GateDiagramProps {
  gate: GateType;
  inputs: DiagramSignal[];
  output: DiagramSignal;
}

const wireClass = (value: string | undefined): string =>
  value === '1' ? 'wire on' : value === '0' ? 'wire off' : 'wire unknown';

function InputBox({ signal, y }: { signal: DiagramSignal; y: number }) {
  return (
    <g className={signal.value === '1' ? 'input-box on' : 'input-box'}>
      <rect x={6} y={y - 24} width={168} height={48} rx={8} />
      <text x={16} y={y - 5} className="box-label">
        {signal.label}
      </text>
      <text x={16} y={y + 15} className="box-value">
        {signal.value ?? '–'} · {signal.meaning}
      </text>
    </g>
  );
}

function Lamp({ output }: { output: DiagramSignal }) {
  return (
    <g>
      <circle
        cx={472}
        cy={GATE_CENTER_Y}
        r={28}
        className={output.value === '1' ? 'lamp-big on' : 'lamp-big'}
      />
      <text x={472} y={GATE_CENTER_Y + 7} className="lamp-value">
        {output.value ?? '–'}
      </text>
      <text x={472} y={GATE_CENTER_Y + 50} className="lamp-label">
        {output.label}
      </text>
      <text x={472} y={GATE_CENTER_Y + 68} className="lamp-meaning">
        {output.meaning}
      </text>
    </g>
  );
}

export function GateDiagram({ gate, inputs, output }: GateDiagramProps) {
  const ys = inputs.length === 1 ? [GATE_CENTER_Y] : [90, 140];
  const outX = gateOutputX(gate);
  const endX = 444;
  const description = `${inputs.map((s) => `${s.label} is ${s.value ?? 'unknown'}`).join(', ')}. ${output.label} is ${output.value ?? 'unknown'} (${output.meaning}).`;
  return (
    <svg viewBox="0 32 540 184" className="gate-diagram" role="img" aria-label={description}>
      {inputs.map((signal, index) => {
        const y = ys[index] ?? GATE_CENTER_Y;
        return (
          <g key={signal.id}>
            <line
              x1={174}
              y1={y}
              x2={gateInputX(gate)}
              y2={y}
              className={wireClass(signal.value)}
            />
            <text x={196} y={y - 7} className="wire-value">
              {signal.value ?? '–'}
            </text>
            <InputBox signal={signal} y={y} />
          </g>
        );
      })}
      <GateShape type={gate} />
      <line
        x1={outX}
        y1={GATE_CENTER_Y}
        x2={endX}
        y2={GATE_CENTER_Y}
        className={wireClass(output.value)}
      />
      <text x={(outX + endX) / 2 - 4} y={GATE_CENTER_Y - 7} className="wire-value">
        {output.value ?? '–'}
      </text>
      <Lamp output={output} />
    </svg>
  );
}
