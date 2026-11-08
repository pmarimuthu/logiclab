import type { CircuitDocument } from '@logiclab/circuit-domain';
import { buildCircuit, type GateType } from './build';

const AB = [
  { id: 'input-a', kind: 'input' as const },
  { id: 'input-b', kind: 'input' as const },
];

export function gateCircuit(type: GateType): CircuitDocument {
  const unary = type === 'not';
  return buildCircuit({
    id: `${type}-gate`,
    name: `${type.toUpperCase()} Gate`,
    sources: unary ? AB.slice(0, 1) : AB,
    gates: [{ id: `${type}-1`, type, inputs: unary ? ['input-a'] : ['input-a', 'input-b'] }],
    outputs: [{ id: 'output-y', from: `${type}-1` }],
  });
}

export const multiLevel = (): CircuitDocument =>
  buildCircuit({
    id: 'and-or',
    name: '(A AND B) OR C',
    sources: [...AB, { id: 'input-c', kind: 'input' }],
    gates: [
      { id: 'and-1', type: 'and', inputs: ['input-a', 'input-b'] },
      { id: 'or-1', type: 'or', inputs: ['and-1', 'input-c'] },
    ],
    outputs: [{ id: 'output-y', from: 'or-1' }],
  });

export const branching = (): CircuitDocument =>
  buildCircuit({
    id: 'branching',
    name: 'Branching net',
    sources: AB,
    gates: [
      { id: 'not-1', type: 'not', inputs: ['input-a'] },
      { id: 'and-1', type: 'and', inputs: ['input-a', 'input-b'] },
    ],
    outputs: [
      { id: 'not-out', from: 'not-1' },
      { id: 'and-out', from: 'and-1' },
    ],
  });

export const halfAdder = (): CircuitDocument =>
  buildCircuit({
    id: 'half-adder',
    name: 'Half Adder',
    sources: AB,
    gates: [
      { id: 'xor-1', type: 'xor', inputs: ['input-a', 'input-b'] },
      { id: 'and-1', type: 'and', inputs: ['input-a', 'input-b'] },
    ],
    outputs: [
      { id: 'sum-out', from: 'xor-1' },
      { id: 'carry-out', from: 'and-1' },
    ],
  });

export const fullAdder = (): CircuitDocument =>
  buildCircuit({
    id: 'full-adder',
    name: 'Full Adder',
    sources: [...AB, { id: 'input-cin', kind: 'input' }],
    gates: [
      { id: 'xor-1', type: 'xor', inputs: ['input-a', 'input-b'] },
      { id: 'xor-2', type: 'xor', inputs: ['xor-1', 'input-cin'] },
      { id: 'and-1', type: 'and', inputs: ['input-a', 'input-b'] },
      { id: 'and-2', type: 'and', inputs: ['xor-1', 'input-cin'] },
      { id: 'or-1', type: 'or', inputs: ['and-1', 'and-2'] },
    ],
    outputs: [
      { id: 'sum-out', from: 'xor-2' },
      { id: 'cout-out', from: 'or-1' },
    ],
  });

export const withConstant = (): CircuitDocument =>
  buildCircuit({
    id: 'and-constant',
    name: 'A AND 1',
    sources: [
      AB[0] ?? { id: 'input-a', kind: 'input' },
      { id: 'one', kind: 'constant', value: '1' },
    ],
    gates: [{ id: 'and-1', type: 'and', inputs: ['input-a', 'one'] }],
    outputs: [{ id: 'output-y', from: 'and-1' }],
  });
