import {
  hasErrors,
  validateCircuit,
  type CircuitDocument,
  type DefinitionResolver,
  type Diagnostic,
} from '@logiclab/circuit-domain';
import { buildPlan, type EvaluationPlan } from './plan';

export type Prepared =
  | { ok: true; plan: EvaluationPlan; diagnostics: Diagnostic[] }
  | { ok: false; diagnostics: Diagnostic[] };

export function prepareCircuit(document: CircuitDocument, resolver: DefinitionResolver): Prepared {
  const validation = validateCircuit(document, resolver);
  if (validation.resolved === undefined || hasErrors(validation.diagnostics)) {
    return { ok: false, diagnostics: validation.diagnostics };
  }
  const planned = buildPlan(validation.resolved);
  if (!planned.ok) {
    return { ok: false, diagnostics: [...validation.diagnostics, ...planned.diagnostics] };
  }
  return { ok: true, plan: planned.plan, diagnostics: validation.diagnostics };
}
