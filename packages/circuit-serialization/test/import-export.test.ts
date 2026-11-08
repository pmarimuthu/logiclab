import { builtinRegistry } from '@logiclab/component-registry';
import {
  circuitCases,
  exampleTexts,
  examples,
  gateCases,
  invalidFixtures,
} from '@logiclab/test-fixtures';
import { describe, expect, it } from 'vitest';
import { exportCircuitText, importCircuitText, suggestedFileName } from '../src';

const registry = builtinRegistry();
const codesOf = (text: string) => importCircuitText(text, registry).diagnostics.map((d) => d.code);

describe('circuit import and export', () => {
  it('imports the blueprint example files', () => {
    for (const text of Object.values(exampleTexts)) {
      const result = importCircuitText(text, registry);
      expect(result.ok).toBe(true);
      expect(result.diagnostics).toEqual([]);
    }
  });

  it('TEST-SER-001 round-trips every reference circuit without change', () => {
    const documents = [
      ...Object.values(examples),
      ...[...gateCases(), ...circuitCases()].map((item) => item.document),
    ];
    for (const document of documents) {
      const exported = exportCircuitText(document);
      expect(exported.ok).toBe(true);
      if (!exported.ok) continue;
      const imported = importCircuitText(exported.text, registry);
      expect(imported.ok && imported.document).toEqual(document);
    }
  });

  it('TEST-SER-004 rejects an unsupported schema version', () => {
    const text = exampleTexts.andGate.replace('"schemaVersion": "1.0"', '"schemaVersion": "2.0"');
    expect(codesOf(text)).toEqual(['DOCUMENT_SCHEMA_UNSUPPORTED']);
  });

  it('rejects text that is not JSON', () => {
    expect(codesOf('{ not json')).toEqual(['DOCUMENT_INVALID_JSON']);
  });

  it('TEST-SER-005 rejects a document that breaks the schema', () => {
    const document = JSON.parse(exampleTexts.andGate) as Record<string, unknown>;
    document['script'] = 'alert(1)';
    expect(codesOf(JSON.stringify(document))).toContain('DOCUMENT_SCHEMA_INVALID');
  });

  it('TEST-SEC-001 rejects files over the R1 size limit', () => {
    const text = exampleTexts.andGate.replace('"AND Gate Example"', `"${'x'.repeat(2_100_000)}"`);
    expect(codesOf(text)).toEqual(['DOCUMENT_TOO_LARGE']);
  });

  it('TEST-SEC-002 rejects deeply nested JSON before parsing', () => {
    expect(codesOf(`${'['.repeat(40)}${']'.repeat(40)}`)).toEqual(['DOCUMENT_TOO_DEEP']);
  });

  it('TEST-SEC-003 rejects circuits above the R1 component cap', () => {
    const result = importCircuitText(exampleTexts.andGate, registry, {
      maxBytes: 1_000_000,
      maxDepth: 32,
      maxInstances: 3,
      maxNets: 10,
    });
    expect(result.diagnostics.map((d) => d.code)).toEqual(['CIRCUIT_TOO_LARGE']);
  });

  it('TEST-SER-006 rejects unknown definitions and versions, with no document returned', () => {
    for (const fixture of invalidFixtures().filter((item) => item.stage === 'STRUCTURE')) {
      const result = importCircuitText(JSON.stringify(fixture.document), registry);
      expect(result.ok, fixture.name).toBe(false);
      expect('document' in result).toBe(false);
      expect(result.diagnostics.map((d) => d.code)).toContain(fixture.expectedCode);
    }
  });

  it('imports an unfinished circuit and reports readiness problems as warnings', () => {
    const dangling = invalidFixtures().find((item) => item.testId === 'TEST-VAL-001');
    const result = importCircuitText(JSON.stringify(dangling?.document), registry);
    expect(result.ok).toBe(true);
    expect(result.diagnostics.map((d) => [d.code, d.severity])).toEqual([
      ['INPUT_NOT_DRIVEN', 'WARNING'],
    ]);
  });

  it('suggests a safe file name', () => {
    expect(suggestedFileName(examples.halfAdder)).toBe('half-adder.logiclab.json');
  });
});
