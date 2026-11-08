import type { Bit } from '@logiclab/circuit-domain';
import type { EvaluationPlan } from './plan';

export interface Evaluation {
  netValues: Map<string, Bit>;
  outputs: Map<string, Bit>;
  evaluatedComponents: number;
}

export function evaluatePlan(plan: EvaluationPlan, inputs: ReadonlyMap<string, Bit>): Evaluation {
  const netValues = new Map<string, Bit>();
  for (const source of plan.sources) {
    if (source.outputNet === undefined) continue;
    const value =
      source.kind === 'INPUT' ? (inputs.get(source.instanceId) ?? source.initial) : source.initial;
    netValues.set(source.outputNet, value);
  }
  for (const step of plan.steps) {
    const values = step.inputNets.map((netId) => netValues.get(netId) ?? 0);
    const result = step.model(values);
    if (step.outputNet !== undefined) netValues.set(step.outputNet, result);
  }
  const outputs = new Map<string, Bit>();
  for (const output of plan.outputs) {
    outputs.set(
      output.instanceId,
      output.netId === undefined ? 0 : (netValues.get(output.netId) ?? 0),
    );
  }
  return {
    netValues,
    outputs,
    evaluatedComponents: plan.sources.length + plan.steps.length + plan.outputs.length,
  };
}
