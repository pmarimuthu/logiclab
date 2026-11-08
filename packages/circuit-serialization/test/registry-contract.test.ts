import { builtinDefinitions, builtinRegistry, createRegistry } from '@logiclab/component-registry';
import { describe, expect, it } from 'vitest';
import { validateComponentDefinitionSchema } from '../src';

describe('built-in component registry contract', () => {
  it('TEST-REG-001 every definition passes the component schema (r2)', () => {
    for (const definition of builtinDefinitions) {
      expect(validateComponentDefinitionSchema(definition), definition.definitionId).toEqual([]);
    }
  });

  it('TEST-REG-002 holds exactly the 10 R1 components with unique pins', () => {
    const ids = builtinDefinitions.map((item) => `${item.definitionId}@${item.version}`).sort();
    expect(ids).toEqual([
      'io.constant@1.0',
      'io.input@1.0',
      'io.output@1.0',
      'logic.and@1.0',
      'logic.nand@1.0',
      'logic.nor@1.0',
      'logic.not@1.0',
      'logic.or@1.0',
      'logic.xnor@1.0',
      'logic.xor@1.0',
    ]);
  });

  it('TEST-REG-003 pin layout keys match the pins of each definition', () => {
    for (const definition of builtinDefinitions) {
      const layout = Object.keys(definition.visualMetadata?.pinLayout ?? {}).sort();
      expect(layout).toEqual(definition.pins.map((pin) => pin.pinId).sort());
    }
  });

  it('rejects unsafe metadata and bad versions (G-12)', () => {
    const [sample] = builtinDefinitions;
    const svg = { ...sample, visualMetadata: { symbolId: 'x', svg: '<svg onload=alert(1)>' } };
    const version = { ...sample, version: 'latest' };
    expect(validateComponentDefinitionSchema(svg)).not.toEqual([]);
    expect(validateComponentDefinitionSchema(version)).not.toEqual([]);
  });

  it('resolves by exact version and reports known IDs', () => {
    const registry = builtinRegistry();
    expect(registry.resolve('logic.and', '1.0')?.name).toBe('AND');
    expect(registry.resolve('logic.and', '2.0')).toBeUndefined();
    expect(registry.hasDefinition('logic.and')).toBe(true);
    expect(registry.hasDefinition('logic.mux')).toBe(false);
  });

  it('refuses duplicate definitions', () => {
    const [sample] = builtinDefinitions;
    expect(() => createRegistry([sample!, sample!])).toThrow(/Duplicate/);
  });
});
