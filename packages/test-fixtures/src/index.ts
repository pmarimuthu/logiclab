import type { CircuitDocument } from '@logiclab/circuit-domain';
import andGateExample from '../examples/and-gate.logiclab.json';
import halfAdderExample from '../examples/half-adder.logiclab.json';

export * from './build';
export * from './valid';
export * from './invalid';
export * from './oracles';

export const examples: Record<'andGate' | 'halfAdder', CircuitDocument> = {
  andGate: andGateExample as unknown as CircuitDocument,
  halfAdder: halfAdderExample as unknown as CircuitDocument,
};

export const exampleTexts = {
  andGate: JSON.stringify(andGateExample, null, 2),
  halfAdder: JSON.stringify(halfAdderExample, null, 2),
};
