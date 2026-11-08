import { diagnostic, hasErrors, type Diagnostic } from './diagnostics';
import { pinKey, type ResolvedCircuit } from './resolved';
import type { CircuitDocument, DefinitionResolver } from './types';
import { validateInstances } from './validate-instances';
import { validateNets } from './validate-nets';
import { validatePorts } from './validate-ports';

export interface CircuitValidation {
  diagnostics: Diagnostic[];
  resolved?: ResolvedCircuit;
}

export function validateReadiness(resolved: ResolvedCircuit): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  for (const [instanceId, { definition }] of resolved.instances) {
    for (const pin of definition.pins) {
      if (pin.direction !== 'INPUT' || !pin.required) continue;
      if (resolved.pinNets.has(pinKey(instanceId, pin.pinId))) continue;
      diagnostics.push(
        diagnostic({
          code: 'INPUT_NOT_DRIVEN',
          stage: 'READINESS',
          message: `Input ${pin.name} of ${instanceId} (${definition.name}) is not connected. Connect it to a source before running.`,
          entityType: 'PIN',
          entityId: pinKey(instanceId, pin.pinId),
        }),
      );
    }
  }
  return diagnostics;
}

export function validateCircuit(
  document: CircuitDocument,
  resolver: DefinitionResolver,
): CircuitValidation {
  const instanceResult = validateInstances(document, resolver);
  const portResult = validatePorts(document);
  const netResult = validateNets(document, instanceResult.instances, portResult.portsByNet);
  const diagnostics = [
    ...instanceResult.diagnostics,
    ...portResult.diagnostics,
    ...netResult.diagnostics,
  ];
  if (hasErrors(diagnostics, 'STRUCTURE')) return { diagnostics };

  const resolved: ResolvedCircuit = {
    document,
    instances: instanceResult.instances,
    nets: netResult.nets,
    pinNets: netResult.pinNets,
  };
  return { diagnostics: [...diagnostics, ...validateReadiness(resolved)], resolved };
}
