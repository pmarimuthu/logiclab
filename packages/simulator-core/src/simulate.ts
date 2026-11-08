import {
  diagnostic,
  type Bit,
  type CircuitDocument,
  type DefinitionResolver,
  type Diagnostic,
  type LogicValue,
} from '@logiclab/circuit-domain';
import { evaluatePlan } from './evaluate';
import type { EvaluationPlan } from './plan';
import { prepareCircuit } from './prepare';

export type SimulationStatus = 'COMPLETED' | 'INVALID' | 'CANCELLED' | 'LIMIT_REACHED' | 'FAILED';

export interface SimulationRequest {
  requestId: string;
  circuit: CircuitDocument;
  mode: 'COMBINATIONAL';
  inputs?: Record<string, string>;
}

export interface SimulationResult {
  requestId: string;
  status: SimulationStatus;
  outputs: Record<string, LogicValue>;
  finalNetValues: Record<string, LogicValue>;
  diagnostics: Diagnostic[];
  metrics: { evaluatedComponents: number; elapsedWallTimeMs: number };
}

export const toLogicValue = (bit: Bit): LogicValue => (bit === 1 ? '1' : '0');

function readInputs(
  plan: EvaluationPlan,
  inputs: Record<string, string> | undefined,
): { values: Map<string, Bit>; diagnostics: Diagnostic[] } {
  const values = new Map<string, Bit>();
  const diagnostics: Diagnostic[] = [];
  const known = new Set(plan.inputIds);
  for (const [instanceId, value] of Object.entries(inputs ?? {})) {
    if (!known.has(instanceId) || (value !== '0' && value !== '1')) {
      diagnostics.push(
        diagnostic({
          code: 'SIMULATION_INPUT_INVALID',
          stage: 'SIMULATION',
          message: `Input "${instanceId}" = "${value}" is not valid. Use an input switch ID with value 0 or 1.`,
          entityType: 'INSTANCE',
          entityId: instanceId,
        }),
      );
      continue;
    }
    values.set(instanceId, value === '1' ? 1 : 0);
  }
  return { values, diagnostics };
}

function emptyResult(
  requestId: string,
  status: SimulationStatus,
  diagnostics: Diagnostic[],
  started: number,
): SimulationResult {
  return {
    requestId,
    status,
    outputs: {},
    finalNetValues: {},
    diagnostics,
    metrics: { evaluatedComponents: 0, elapsedWallTimeMs: Date.now() - started },
  };
}

export function simulate(
  request: SimulationRequest,
  resolver: DefinitionResolver,
): SimulationResult {
  const started = Date.now();
  const prepared = prepareCircuit(request.circuit, resolver);
  if (!prepared.ok) return emptyResult(request.requestId, 'INVALID', prepared.diagnostics, started);

  const inputs = readInputs(prepared.plan, request.inputs);
  if (inputs.diagnostics.length > 0) {
    return emptyResult(request.requestId, 'INVALID', inputs.diagnostics, started);
  }
  const evaluation = evaluatePlan(prepared.plan, inputs.values);
  const outputs: Record<string, LogicValue> = {};
  for (const [id, bit] of evaluation.outputs) outputs[id] = toLogicValue(bit);
  const finalNetValues: Record<string, LogicValue> = {};
  for (const [id, bit] of evaluation.netValues) finalNetValues[id] = toLogicValue(bit);
  return {
    requestId: request.requestId,
    status: 'COMPLETED',
    outputs,
    finalNetValues,
    diagnostics: prepared.diagnostics,
    metrics: {
      evaluatedComponents: evaluation.evaluatedComponents,
      elapsedWallTimeMs: Date.now() - started,
    },
  };
}
