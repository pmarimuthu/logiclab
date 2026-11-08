import type { ComponentDefinition, DefinitionResolver } from '@logiclab/circuit-domain';

export interface ComponentRegistry extends DefinitionResolver {
  list(): readonly ComponentDefinition[];
}

function key(definitionId: string, version: string): string {
  return `${definitionId}@${version}`;
}

export function createRegistry(definitions: readonly ComponentDefinition[]): ComponentRegistry {
  const byKey = new Map<string, ComponentDefinition>();
  const ids = new Set<string>();
  for (const definition of definitions) {
    const id = key(definition.definitionId, definition.version);
    if (byKey.has(id)) throw new Error(`Duplicate component definition ${id}`);
    const pinIds = definition.pins.map((pin) => pin.pinId);
    if (new Set(pinIds).size !== pinIds.length) {
      throw new Error(`Component definition ${id} has duplicate pin IDs`);
    }
    byKey.set(id, Object.freeze(structuredClone(definition)));
    ids.add(definition.definitionId);
  }
  const frozenList = Object.freeze([...byKey.values()]);
  return {
    resolve: (definitionId, version) => byKey.get(key(definitionId, version)),
    hasDefinition: (definitionId) => ids.has(definitionId),
    list: () => frozenList,
  };
}
