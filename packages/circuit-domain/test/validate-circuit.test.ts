import registryFile from '@logiclab/contracts/registry/mvp-component-definitions-1.0.json';
import { describe, expect, it } from 'vitest';
import {
  validateCircuit,
  type CircuitDocument,
  type ComponentDefinition,
  type DefinitionResolver,
} from '../src';

const definitions = registryFile.definitions as unknown as ComponentDefinition[];
const resolver: DefinitionResolver = {
  resolve: (id, version) =>
    definitions.find((item) => item.definitionId === id && item.version === version),
  hasDefinition: (id) => definitions.some((item) => item.definitionId === id),
};

function andCircuit(): CircuitDocument {
  return {
    schemaVersion: '1.0',
    metadata: { documentId: 'doc-1', name: 'AND' },
    model: {
      circuitId: 'c-1',
      name: 'AND',
      instances: [
        {
          instanceId: 'a',
          definition: { definitionId: 'io.input', version: '1.0' },
          parameters: {},
        },
        {
          instanceId: 'b',
          definition: { definitionId: 'io.input', version: '1.0' },
          parameters: {},
        },
        {
          instanceId: 'g',
          definition: { definitionId: 'logic.and', version: '1.0' },
          parameters: {},
        },
        {
          instanceId: 'y',
          definition: { definitionId: 'io.output', version: '1.0' },
          parameters: {},
        },
      ],
      nets: [
        {
          netId: 'n-a',
          width: 1,
          endpoints: [
            { instanceId: 'a', pinId: 'out' },
            { instanceId: 'g', pinId: 'a' },
          ],
        },
        {
          netId: 'n-b',
          width: 1,
          endpoints: [
            { instanceId: 'b', pinId: 'out' },
            { instanceId: 'g', pinId: 'b' },
          ],
        },
        {
          netId: 'n-y',
          width: 1,
          endpoints: [
            { instanceId: 'g', pinId: 'y' },
            { instanceId: 'y', pinId: 'in' },
          ],
        },
      ],
      ports: [],
    },
    layout: { componentPositions: {}, netRoutes: {} },
  };
}

const codes = (document: CircuitDocument) =>
  validateCircuit(document, resolver).diagnostics.map((item) => item.code);

describe('circuit-domain validation', () => {
  it('accepts a valid AND circuit and resolves its nets', () => {
    const result = validateCircuit(andCircuit(), resolver);
    expect(result.diagnostics).toEqual([]);
    expect(result.resolved?.nets.get('n-y')?.driver).toEqual({
      kind: 'PIN',
      instanceId: 'g',
      pinId: 'y',
    });
  });

  it('TEST-DOM-001 rejects duplicate instance IDs', () => {
    const document = andCircuit();
    document.model.instances.push({ ...document.model.instances[0]! });
    expect(codes(document)).toContain('INSTANCE_ID_DUPLICATE');
  });

  it('TEST-DOM-004 rejects a net with only one connection', () => {
    const document = andCircuit();
    document.model.nets.push({
      netId: 'n-x',
      width: 1,
      endpoints: [{ instanceId: 'y', pinId: 'in' }],
    });
    document.model.nets = document.model.nets.filter((net) => net.netId !== 'n-y');
    expect(codes(document)).toContain('NET_TOO_FEW_ENDPOINTS');
  });

  it('TEST-DOM-006 rejects a pin on two nets', () => {
    const document = andCircuit();
    document.model.nets[1]!.endpoints.push({ instanceId: 'g', pinId: 'a' });
    expect(codes(document)).toContain('PIN_MULTIPLE_NETS');
  });

  it('TEST-DOM-007 rejects input-to-input connection as a net with no driver', () => {
    const document = andCircuit();
    document.model.nets[0]!.endpoints = [
      { instanceId: 'g', pinId: 'a' },
      { instanceId: 'y', pinId: 'in' },
    ];
    document.model.nets = document.model.nets.filter((net) => net.netId !== 'n-y');
    expect(codes(document)).toContain('NET_NO_DRIVER');
  });

  it('TEST-DOM-010 rejects parameters that the definition does not allow', () => {
    const document = andCircuit();
    document.model.instances[0]!.parameters = { initialValue: '2', colour: 'red' };
    const found = validateCircuit(document, resolver).diagnostics.filter(
      (item) => item.code === 'PARAMETER_INVALID',
    );
    expect(found).toHaveLength(2);
  });

  it('TEST-DOM-011 treats an INPUT port as the driver of its net (BRL-21)', () => {
    const document = andCircuit();
    document.model.instances = document.model.instances.filter((item) => item.instanceId !== 'a');
    document.model.nets[0]!.endpoints = [{ instanceId: 'g', pinId: 'a' }];
    document.model.ports = [
      { portId: 'p-a', name: 'A', direction: 'INPUT', width: 1, netId: 'n-a' },
    ];
    const result = validateCircuit(document, resolver);
    expect(result.diagnostics).toEqual([]);
    expect(result.resolved?.nets.get('n-a')?.driver).toEqual({ kind: 'PORT', portId: 'p-a' });
  });

  it('reports an unconnected required input as a readiness error', () => {
    const document = andCircuit();
    document.model.nets = document.model.nets.filter((net) => net.netId !== 'n-b');
    document.model.instances = document.model.instances.filter((item) => item.instanceId !== 'b');
    const result = validateCircuit(document, resolver);
    expect(result.resolved).toBeDefined();
    expect(result.diagnostics.map((item) => [item.code, item.stage])).toEqual([
      ['INPUT_NOT_DRIVEN', 'READINESS'],
    ]);
  });

  it('warns about layout entries for components that do not exist', () => {
    const document = andCircuit();
    document.layout.componentPositions['ghost'] = { x: 0, y: 0 };
    const [item] = validateCircuit(document, resolver).diagnostics;
    expect(item?.code).toBe('LAYOUT_UNKNOWN_INSTANCE');
    expect(item?.severity).toBe('WARNING');
  });
});
