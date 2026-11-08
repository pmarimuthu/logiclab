import type { CircuitDocument } from '@logiclab/circuit-domain';
import { examples, fullAdder, multiLevel } from '@logiclab/test-fixtures';

export interface StarterCircuit {
  key: string;
  label: string;
  document: CircuitDocument;
}

export const STARTER_CIRCUITS: readonly StarterCircuit[] = [
  { key: 'and', label: 'AND gate (example file)', document: examples.andGate },
  { key: 'half-adder', label: 'Half adder (example file)', document: examples.halfAdder },
  { key: 'full-adder', label: 'Full adder', document: fullAdder() },
  { key: 'and-or', label: '(A AND B) OR C', document: multiLevel() },
];

export function inputIds(document: CircuitDocument): string[] {
  return document.model.instances
    .filter((item) => item.definition.definitionId === 'io.input')
    .map((item) => item.instanceId);
}

export function outputIds(document: CircuitDocument): string[] {
  return document.model.instances
    .filter((item) => item.definition.definitionId === 'io.output')
    .map((item) => item.instanceId);
}

export function initialInputs(document: CircuitDocument): Record<string, string> {
  const values: Record<string, string> = {};
  for (const item of document.model.instances) {
    if (item.definition.definitionId !== 'io.input') continue;
    values[item.instanceId] = String(item.parameters['initialValue'] ?? '0');
  }
  return values;
}

function prettify(instanceId: string): string {
  const words = instanceId
    .replace(/^input-/, 'input ')
    .replace(/^output-/, 'output ')
    .split(/[-_\s]+/)
    .filter((word) => word.length > 0);
  return words.map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

export function displayName(document: CircuitDocument, instanceId: string): string {
  const instance = document.model.instances.find((item) => item.instanceId === instanceId);
  return instance?.label ?? prettify(instanceId);
}
