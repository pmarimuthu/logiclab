import { diagnostic, type Diagnostic } from './diagnostics';
import type { ResolvedInstance } from './resolved';
import type { CircuitDocument, DefinitionResolver } from './types';
import { validateParameters } from './validate-parameters';

export interface InstanceValidation {
  diagnostics: Diagnostic[];
  instances: Map<string, ResolvedInstance>;
}

export function validateInstances(
  document: CircuitDocument,
  resolver: DefinitionResolver,
): InstanceValidation {
  const diagnostics: Diagnostic[] = [];
  const instances = new Map<string, ResolvedInstance>();
  const seen = new Set<string>();

  for (const instance of document.model.instances) {
    const id = instance.instanceId;
    if (seen.has(id)) {
      diagnostics.push(
        diagnostic({
          code: 'INSTANCE_ID_DUPLICATE',
          stage: 'STRUCTURE',
          message: `Component ID "${id}" is used more than once. Give each component a unique ID.`,
          entityType: 'INSTANCE',
          entityId: id,
        }),
      );
      continue;
    }
    seen.add(id);
    const { definitionId, version } = instance.definition;
    const definition = resolver.resolve(definitionId, version);
    if (definition === undefined) {
      const known = resolver.hasDefinition(definitionId);
      diagnostics.push(
        diagnostic({
          code: known ? 'DEFINITION_VERSION_NOT_FOUND' : 'DEFINITION_NOT_FOUND',
          stage: 'STRUCTURE',
          message: known
            ? `${id}: version ${version} of "${definitionId}" is not available. Use a supported version.`
            : `${id}: component type "${definitionId}" is not known. Replace it with a supported component.`,
          entityType: 'INSTANCE',
          entityId: id,
          details: { definitionId, version },
        }),
      );
      continue;
    }
    diagnostics.push(...validateParameters(instance, definition.parameterSchema));
    instances.set(id, { instance, definition });
  }

  for (const id of Object.keys(document.layout.componentPositions)) {
    if (!seen.has(id)) {
      diagnostics.push(
        diagnostic({
          code: 'LAYOUT_UNKNOWN_INSTANCE',
          stage: 'STRUCTURE',
          severity: 'WARNING',
          message: `Layout has a position for "${id}", but no such component exists. It will be ignored.`,
          entityType: 'LAYOUT',
          entityId: id,
        }),
      );
    }
  }
  return { diagnostics, instances };
}
