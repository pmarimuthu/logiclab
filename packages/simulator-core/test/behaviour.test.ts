import { builtinRegistry } from '@logiclab/component-registry';
import {
  buildCircuit,
  cloneCircuit,
  fullAdder,
  halfAdder,
  invalidFixtures,
} from '@logiclab/test-fixtures';
import { describe, expect, it } from 'vitest';
import { generateTruthTable, simulate } from '../src';

const registry = builtinRegistry();
const run = (circuit = fullAdder(), inputs: Record<string, string> = {}) =>
  simulate({ requestId: 'r', circuit, mode: 'COMBINATIONAL', inputs }, registry);

function chain(length: number, inputs = 1) {
  const sources = Array.from({ length: inputs }, (_, index) => ({
    id: `in-${index}`,
    kind: 'input' as const,
  }));
  const gates = Array.from({ length }, (_, index) => ({
    id: `g-${index}`,
    type: index % 2 === 0 ? ('not' as const) : ('xor' as const),
    inputs:
      index === 0 ? ['in-0'] : index % 2 === 0 ? [`g-${index - 1}`] : [`g-${index - 1}`, 'in-0'],
  }));
  return buildCircuit({
    id: 'chain',
    name: 'Chain',
    sources,
    gates,
    outputs: [{ id: 'out', from: `g-${length - 1}` }],
  });
}

describe('simulation behaviour', () => {
  it('TEST-SIM-001 gives identical results for identical requests', () => {
    const first = run(fullAdder(), { 'input-a': '1', 'input-cin': '1' });
    const second = run(fullAdder(), { 'input-a': '1', 'input-cin': '1' });
    expect({ ...second, metrics: undefined }).toEqual({ ...first, metrics: undefined });
  });

  it('TEST-SIM-003 detects a feedback loop quickly without hanging', () => {
    const cycle = invalidFixtures().find((item) => item.testId === 'TEST-VAL-003');
    const started = Date.now();
    const result = run(cycle?.document);
    expect(result.status).toBe('INVALID');
    expect(result.diagnostics[0]?.details?.['instances']).toBe('xor-1,and-1');
    expect(Date.now() - started).toBeLessThan(500);
  });

  it('TEST-SIM-004 truth table has 2^n rows within the limit', () => {
    const result = generateTruthTable(fullAdder(), registry);
    expect(result.table?.rows).toHaveLength(8);
    expect(result.table?.rows[5]?.inputs).toEqual(['1', '0', '1']);
  });

  it('TEST-SIM-006 refuses truth tables above the input limit', () => {
    const result = generateTruthTable(halfAdder(), registry, 1);
    expect(result.status).toBe('LIMIT_REACHED');
    expect(result.diagnostics[0]?.code).toBe('SIMULATION_LIMIT_REACHED');
  });

  it('TEST-SER-002 layout-only changes do not change the result', () => {
    const moved = cloneCircuit(fullAdder());
    for (const position of Object.values(moved.layout.componentPositions)) position.x += 999;
    expect(run(moved, { 'input-b': '1' }).outputs).toEqual(
      run(fullAdder(), { 'input-b': '1' }).outputs,
    );
  });

  it('uses the initialValue parameter when no input is given', () => {
    const circuit = halfAdder();
    circuit.model.instances[0]!.parameters['initialValue'] = '1';
    expect(run(circuit).outputs).toEqual({ 'sum-out': '1', 'carry-out': '0' });
  });

  it('refuses unknown input IDs and values', () => {
    const result = run(halfAdder(), { 'input-z': '1', 'input-a': 'X' });
    expect(result.status).toBe('INVALID');
    expect(result.diagnostics.map((item) => item.code)).toEqual([
      'SIMULATION_INPUT_INVALID',
      'SIMULATION_INPUT_INVALID',
    ]);
  });

  it('evaluates a 200-gate chain correctly (benchmark-size smoke check)', () => {
    const result = run(chain(200), { 'in-0': '1' });
    expect(result.status).toBe('COMPLETED');
    expect(result.metrics.evaluatedComponents).toBe(202);
    expect(result.outputs['out']).toBe('1');
  });
});
