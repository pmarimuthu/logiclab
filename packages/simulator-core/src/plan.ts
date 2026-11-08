import {
  diagnostic,
  pinKey,
  type Bit,
  type Diagnostic,
  type ResolvedCircuit,
} from '@logiclab/circuit-domain';
import { gateModel, isSupportedSourceModel, type GateModel } from './models';

export interface SourceNode {
  instanceId: string;
  kind: 'INPUT' | 'CONSTANT';
  outputNet: string | undefined;
  initial: Bit;
}

export interface GateStep {
  instanceId: string;
  model: GateModel;
  inputNets: string[];
  outputNet: string | undefined;
}

export interface OutputNode {
  instanceId: string;
  netId: string | undefined;
}

export interface EvaluationPlan {
  sources: SourceNode[];
  steps: GateStep[];
  outputs: OutputNode[];
  inputIds: string[];
}

export type PlanResult =
  { ok: true; plan: EvaluationPlan } | { ok: false; diagnostics: Diagnostic[] };

function unsupported(instanceId: string, modelId: string): Diagnostic {
  return diagnostic({
    code: 'SIMULATION_MODEL_UNSUPPORTED',
    stage: 'READINESS',
    message: `${instanceId}: simulation model "${modelId}" is not available in combinational mode.`,
    entityType: 'INSTANCE',
    entityId: instanceId,
  });
}

function toBit(value: unknown): Bit {
  return value === '1' || value === 1 || value === true ? 1 : 0;
}

function netOf(resolved: ResolvedCircuit, instanceId: string, pinId: string): string | undefined {
  return resolved.pinNets.get(pinKey(instanceId, pinId));
}

function orderSteps(resolved: ResolvedCircuit, steps: GateStep[]): GateStep[] | Diagnostic {
  const byId = new Map(steps.map((step) => [step.instanceId, step]));
  const dependents = new Map<string, string[]>();
  const indegree = new Map(steps.map((step) => [step.instanceId, 0]));
  for (const step of steps) {
    for (const netId of step.inputNets) {
      const driver = resolved.nets.get(netId)?.driver;
      if (driver?.kind !== 'PIN' || !byId.has(driver.instanceId)) continue;
      dependents.set(driver.instanceId, [
        ...(dependents.get(driver.instanceId) ?? []),
        step.instanceId,
      ]);
      indegree.set(step.instanceId, (indegree.get(step.instanceId) ?? 0) + 1);
    }
  }
  const ready = steps
    .filter((step) => indegree.get(step.instanceId) === 0)
    .map((s) => s.instanceId);
  const ordered: GateStep[] = [];
  while (ready.length > 0) {
    const id = ready.shift() as string;
    const step = byId.get(id);
    if (step !== undefined) ordered.push(step);
    for (const next of dependents.get(id) ?? []) {
      const remaining = (indegree.get(next) ?? 0) - 1;
      indegree.set(next, remaining);
      if (remaining === 0) ready.push(next);
    }
  }
  if (ordered.length === steps.length) return ordered;
  const looped = steps.filter((step) => !ordered.includes(step)).map((step) => step.instanceId);
  return diagnostic({
    code: 'COMBINATIONAL_CYCLE',
    stage: 'READINESS',
    message: `These components form a feedback loop: ${looped.join(', ')}. Combinational circuits cannot have loops. Remove one connection in the loop.`,
    entityType: 'CIRCUIT',
    entityId: resolved.document.model.circuitId,
    details: { instances: looped.join(',') },
  });
}

export function buildPlan(resolved: ResolvedCircuit): PlanResult {
  const plan: EvaluationPlan = { sources: [], steps: [], outputs: [], inputIds: [] };
  const diagnostics: Diagnostic[] = [];
  for (const instance of resolved.document.model.instances) {
    const entry = resolved.instances.get(instance.instanceId);
    if (entry === undefined) continue;
    const { definition } = entry;
    const id = instance.instanceId;
    const outputPin = definition.pins.find((pin) => pin.direction === 'OUTPUT');
    const outputNet = outputPin === undefined ? undefined : netOf(resolved, id, outputPin.pinId);
    const { simulationModelId: modelId, simulationModelVersion: version } = definition;
    if (definition.category === 'INPUT' || definition.category === 'CONSTANT') {
      if (!isSupportedSourceModel(modelId, version)) diagnostics.push(unsupported(id, modelId));
      const parameter = definition.category === 'INPUT' ? 'initialValue' : 'value';
      const initial = toBit(
        instance.parameters[parameter] ??
          definition.parameterSchema?.properties[parameter]?.default,
      );
      plan.sources.push({ instanceId: id, kind: definition.category, outputNet, initial });
      if (definition.category === 'INPUT') plan.inputIds.push(id);
    } else if (definition.category === 'OUTPUT') {
      if (!isSupportedSourceModel(modelId, version)) diagnostics.push(unsupported(id, modelId));
      const inputPin = definition.pins.find((pin) => pin.direction === 'INPUT');
      const netId = inputPin === undefined ? undefined : netOf(resolved, id, inputPin.pinId);
      plan.outputs.push({ instanceId: id, netId });
    } else {
      const model = definition.category === 'LOGIC_GATE' ? gateModel(modelId, version) : undefined;
      if (model === undefined) {
        diagnostics.push(unsupported(id, modelId));
        continue;
      }
      const inputNets = definition.pins
        .filter((pin) => pin.direction === 'INPUT')
        .map((pin) => netOf(resolved, id, pin.pinId) ?? '');
      plan.steps.push({ instanceId: id, model, inputNets, outputNet });
    }
  }
  if (diagnostics.length > 0) return { ok: false, diagnostics };
  const ordered = orderSteps(resolved, plan.steps);
  if (!Array.isArray(ordered)) return { ok: false, diagnostics: [ordered] };
  return { ok: true, plan: { ...plan, steps: ordered } };
}
