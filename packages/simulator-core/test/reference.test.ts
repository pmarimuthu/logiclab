import { builtinRegistry } from '@logiclab/component-registry';
import {
  circuitCases,
  combinations,
  examples,
  gateCases,
  invalidFixtures,
  type ReferenceCase,
} from '@logiclab/test-fixtures';
import { describe, expect, it } from 'vitest';
import { generateTruthTable, simulate } from '../src';

const registry = builtinRegistry();

function checkCase(item: ReferenceCase): void {
  for (const bits of combinations(item.inputs.length)) {
    const inputs = Object.fromEntries(item.inputs.map((id, index) => [id, String(bits[index])]));
    const result = simulate(
      { requestId: 'r', circuit: item.document, mode: 'COMBINATIONAL', inputs },
      registry,
    );
    expect(result.status, `${item.name} ${bits.join('')}`).toBe('COMPLETED');
    for (const [outputId, formula] of Object.entries(item.outputs)) {
      expect(result.outputs[outputId], `${item.name} ${outputId} @ ${bits.join('')}`).toBe(
        String(formula(...bits)),
      );
    }
  }
}

describe('reference gates', () => {
  for (const item of gateCases()) {
    it(`${item.testId} ${item.name} matches its truth table`, () => checkCase(item));
  }
});

describe('reference circuits', () => {
  for (const item of circuitCases()) {
    it(`${item.testId} ${item.name} matches the reference vectors`, () => checkCase(item));
  }

  it('TEST-CIR-001 blueprint examples give the reference truth tables', () => {
    const and = generateTruthTable(examples.andGate, registry).table;
    expect(and?.rows.map((row) => row.outputs.join(''))).toEqual(['0', '0', '0', '1']);
    const half = generateTruthTable(examples.halfAdder, registry).table;
    expect(half?.outputs).toEqual(['sum-out', 'carry-out']);
    expect(half?.rows.map((row) => row.outputs.join(''))).toEqual(['00', '10', '10', '01']);
  });
});

describe('invalid circuits', () => {
  for (const fixture of invalidFixtures()) {
    it(`${fixture.testId} ${fixture.name} is refused with ${fixture.expectedCode}`, () => {
      const result = simulate(
        { requestId: 'r', circuit: fixture.document, mode: 'COMBINATIONAL' },
        registry,
      );
      expect(result.status).toBe('INVALID');
      expect(result.outputs).toEqual({});
      expect(result.diagnostics.map((item) => item.code)).toContain(fixture.expectedCode);
    });
  }
});
