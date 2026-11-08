import type { GateType } from '@logiclab/circuit-domain';

export const GATE_CENTER_Y = 115;

const AND_PATH = 'M230,65 H280 A50,50 0 0 1 280,165 H230 Z';
const OR_PATH = 'M228,65 Q258,115 228,165 Q300,165 335,115 Q300,65 228,65 Z';
const XOR_BACK = 'M214,65 Q244,115 214,165';
const NOT_PATH = 'M230,75 L310,115 L230,155 Z';

interface Geometry {
  body: string;
  back?: string;
  bodyEnd: number;
  bubble: boolean;
  inputX: number;
}

const GEOMETRY: Record<GateType, Geometry> = {
  and: { body: AND_PATH, bodyEnd: 330, bubble: false, inputX: 230 },
  nand: { body: AND_PATH, bodyEnd: 330, bubble: true, inputX: 230 },
  or: { body: OR_PATH, bodyEnd: 335, bubble: false, inputX: 239 },
  nor: { body: OR_PATH, bodyEnd: 335, bubble: true, inputX: 239 },
  xor: { body: OR_PATH, back: XOR_BACK, bodyEnd: 335, bubble: false, inputX: 225 },
  xnor: { body: OR_PATH, back: XOR_BACK, bodyEnd: 335, bubble: true, inputX: 225 },
  not: { body: NOT_PATH, bodyEnd: 310, bubble: true, inputX: 230 },
};

export function gateOutputX(type: GateType): number {
  const geometry = GEOMETRY[type];
  return geometry.bodyEnd + (geometry.bubble ? 16 : 0);
}

export function gateInputX(type: GateType): number {
  return GEOMETRY[type].inputX;
}

export function GateShape({ type }: { type: GateType }) {
  const geometry = GEOMETRY[type];
  return (
    <g className="gate-shape">
      <path d={geometry.body} />
      {geometry.back !== undefined && <path d={geometry.back} fill="none" />}
      {geometry.bubble && <circle cx={geometry.bodyEnd + 8} cy={GATE_CENTER_Y} r={8} />}
      <text x={type === 'not' ? 258 : 272} y={GATE_CENTER_Y + 5} className="gate-name">
        {type.toUpperCase()}
      </text>
    </g>
  );
}

export function GateSymbol({ type, title }: { type: GateType; title: string }) {
  const inputs = type === 'not' ? [GATE_CENTER_Y] : [90, 140];
  return (
    <svg viewBox="195 55 175 120" className="gate-symbol" role="img" aria-label={title}>
      {inputs.map((y) => (
        <line key={y} x1={196} y1={y} x2={gateInputX(type)} y2={y} className="stub" />
      ))}
      <line
        x1={gateOutputX(type)}
        y1={GATE_CENTER_Y}
        x2={369}
        y2={GATE_CENTER_Y}
        className="stub"
      />
      <GateShape type={type} />
    </svg>
  );
}
