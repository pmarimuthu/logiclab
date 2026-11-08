import type { CircuitDocument, ComponentInstance, LogicValue, Net, NetEndpoint } from './types';

export type GateType = 'and' | 'or' | 'not' | 'nand' | 'nor' | 'xor' | 'xnor';

export const GATE_TYPES: readonly GateType[] = ['and', 'or', 'not', 'nand', 'nor', 'xor', 'xnor'];

export interface SourceSpec {
  id: string;
  kind: 'input' | 'constant';
  value?: LogicValue;
  label?: string;
}

export interface GateSpec {
  id: string;
  type: GateType;
  inputs: string[];
  label?: string;
}

export interface OutputSpec {
  id: string;
  from: string;
  label?: string;
}

export interface CircuitSpec {
  id: string;
  name: string;
  description?: string;
  sources: SourceSpec[];
  gates: GateSpec[];
  outputs: OutputSpec[];
}

const VERSION = '1.0';
const GATE_INPUT_PINS = ['a', 'b'];

function withLabel(instance: ComponentInstance, label: string | undefined): ComponentInstance {
  return label === undefined ? instance : { ...instance, label };
}

function driverPin(spec: CircuitSpec, id: string): string {
  return spec.sources.some((source) => source.id === id) ? 'out' : 'y';
}

function buildInstances(spec: CircuitSpec): ComponentInstance[] {
  return [
    ...spec.sources.map((source) =>
      withLabel(
        {
          instanceId: source.id,
          definition: {
            definitionId: source.kind === 'input' ? 'io.input' : 'io.constant',
            version: VERSION,
          },
          parameters:
            source.kind === 'input'
              ? { initialValue: source.value ?? '0' }
              : { value: source.value ?? '0' },
        },
        source.label,
      ),
    ),
    ...spec.gates.map((gate) =>
      withLabel(
        {
          instanceId: gate.id,
          definition: { definitionId: `logic.${gate.type}`, version: VERSION },
          parameters: {},
        },
        gate.label,
      ),
    ),
    ...spec.outputs.map((output) =>
      withLabel(
        {
          instanceId: output.id,
          definition: { definitionId: 'io.output', version: VERSION },
          parameters: {},
        },
        output.label,
      ),
    ),
  ];
}

function buildNets(spec: CircuitSpec): Net[] {
  const sinks = new Map<string, NetEndpoint[]>();
  const addSink = (from: string, endpoint: NetEndpoint): void => {
    sinks.set(from, [...(sinks.get(from) ?? []), endpoint]);
  };
  for (const gate of spec.gates) {
    gate.inputs.forEach((from, index) => {
      addSink(from, { instanceId: gate.id, pinId: GATE_INPUT_PINS[index] ?? `in${index}` });
    });
  }
  for (const output of spec.outputs) addSink(output.from, { instanceId: output.id, pinId: 'in' });
  return [...sinks.entries()].map(([from, endpoints]) => ({
    netId: `net-${from}`,
    width: 1,
    endpoints: [{ instanceId: from, pinId: driverPin(spec, from) }, ...endpoints],
  }));
}

function buildLayout(spec: CircuitSpec): CircuitDocument['layout'] {
  const positions: CircuitDocument['layout']['componentPositions'] = {};
  spec.sources.forEach((item, row) => (positions[item.id] = { x: 60, y: 80 + row * 100 }));
  spec.gates.forEach((item, row) => (positions[item.id] = { x: 300, y: 80 + row * 100 }));
  spec.outputs.forEach((item, row) => (positions[item.id] = { x: 540, y: 80 + row * 100 }));
  return { componentPositions: positions, netRoutes: {} };
}

export function buildCircuit(spec: CircuitSpec): CircuitDocument {
  const metadata: CircuitDocument['metadata'] = { documentId: `doc-${spec.id}`, name: spec.name };
  if (spec.description !== undefined) metadata.description = spec.description;
  return {
    schemaVersion: '1.0',
    metadata,
    model: {
      circuitId: `circuit-${spec.id}`,
      name: spec.name,
      instances: buildInstances(spec),
      nets: buildNets(spec),
      ports: [],
    },
    layout: buildLayout(spec),
  };
}

export function cloneCircuit(document: CircuitDocument): CircuitDocument {
  return structuredClone(document);
}
