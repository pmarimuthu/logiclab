import type { CircuitDocument } from '@logiclab/circuit-domain';
import type { GateType } from './build';
import { branching, fullAdder, gateCircuit, halfAdder, multiLevel, withConstant } from './valid';

type Bit = 0 | 1;
type Formula = (...bits: Bit[]) => Bit;

export interface ReferenceCase {
  testId: string;
  name: string;
  document: CircuitDocument;
  inputs: string[];
  outputs: Record<string, Formula>;
}

const b = (value: boolean | number): Bit => (value ? 1 : 0);
const at = (bits: Bit[], index: number): Bit => bits[index] ?? 0;

export const GATE_FORMULAS: Record<GateType, Formula> = {
  and: (...x) => b(at(x, 0) && at(x, 1)),
  or: (...x) => b(at(x, 0) || at(x, 1)),
  not: (...x) => b(!at(x, 0)),
  nand: (...x) => b(!(at(x, 0) && at(x, 1))),
  nor: (...x) => b(!(at(x, 0) || at(x, 1))),
  xor: (...x) => b(at(x, 0) !== at(x, 1)),
  xnor: (...x) => b(at(x, 0) === at(x, 1)),
};

export const GATE_TEST_IDS: Record<GateType, string> = {
  and: 'TEST-GATE-001',
  or: 'TEST-GATE-002',
  not: 'TEST-GATE-003',
  nand: 'TEST-GATE-004',
  nor: 'TEST-GATE-005',
  xor: 'TEST-GATE-006',
  xnor: 'TEST-GATE-007',
};

export const gateCases = (): ReferenceCase[] =>
  (Object.keys(GATE_FORMULAS) as GateType[]).map((type) => ({
    testId: GATE_TEST_IDS[type],
    name: `${type.toUpperCase()} gate`,
    document: gateCircuit(type),
    inputs: type === 'not' ? ['input-a'] : ['input-a', 'input-b'],
    outputs: { 'output-y': GATE_FORMULAS[type] },
  }));

export const circuitCases = (): ReferenceCase[] => [
  {
    testId: 'TEST-CIR-002',
    name: '(A AND B) OR C',
    document: multiLevel(),
    inputs: ['input-a', 'input-b', 'input-c'],
    outputs: { 'output-y': (a, bb, c) => b((a && bb) || c) },
  },
  {
    testId: 'TEST-CIR-003',
    name: 'branching net',
    document: branching(),
    inputs: ['input-a', 'input-b'],
    outputs: { 'not-out': (a) => b(!a), 'and-out': (a, bb) => b(a && bb) },
  },
  {
    testId: 'TEST-CIR-004',
    name: 'half adder',
    document: halfAdder(),
    inputs: ['input-a', 'input-b'],
    outputs: { 'sum-out': (a, bb) => b(a !== bb), 'carry-out': (a, bb) => b(a && bb) },
  },
  {
    testId: 'TEST-CIR-005',
    name: 'full adder',
    document: fullAdder(),
    inputs: ['input-a', 'input-b', 'input-cin'],
    outputs: {
      'sum-out': (a, bb, c) => b((a ^ bb ^ c) === 1),
      'cout-out': (a, bb, c) => b((a && bb) || (c && a !== bb)),
    },
  },
  {
    testId: 'TEST-CIR-006',
    name: 'constant source',
    document: withConstant(),
    inputs: ['input-a'],
    outputs: { 'output-y': (a) => a },
  },
];

export function combinations(count: number): Bit[][] {
  return Array.from({ length: 2 ** count }, (_, row) =>
    Array.from({ length: count }, (_, column) => b((row >> (count - 1 - column)) & 1)),
  );
}
