import type { ComponentDefinition } from '@logiclab/circuit-domain';
import builtinRegistryFile from '@logiclab/contracts/registry/mvp-component-definitions-1.0.json';
import { createRegistry, type ComponentRegistry } from './registry';

export const BUILTIN_REGISTRY_ID = builtinRegistryFile.registryId;
export const BUILTIN_REGISTRY_VERSION = builtinRegistryFile.registryVersion;

export const builtinDefinitions: readonly ComponentDefinition[] =
  builtinRegistryFile.definitions as unknown as ComponentDefinition[];

let cached: ComponentRegistry | undefined;

export function builtinRegistry(): ComponentRegistry {
  cached ??= createRegistry(builtinDefinitions);
  return cached;
}
