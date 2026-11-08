import { diagnostic, type Diagnostic } from './diagnostics';
import type { ComponentInstance, ParameterSchema, ParameterSpec } from './types';

type ParameterValue = string | number | boolean;

function typeMatches(spec: ParameterSpec, value: ParameterValue): boolean {
  switch (spec.type) {
    case 'string':
      return typeof value === 'string';
    case 'boolean':
      return typeof value === 'boolean';
    case 'number':
      return typeof value === 'number' && Number.isFinite(value);
    case 'integer':
      return typeof value === 'number' && Number.isInteger(value);
  }
}

function checkValue(name: string, spec: ParameterSpec, value: ParameterValue): string | undefined {
  if (!typeMatches(spec, value)) return `Parameter "${name}" must be a ${spec.type}.`;
  if (spec.enum !== undefined && !spec.enum.includes(value)) {
    return `Parameter "${name}" must be one of: ${spec.enum.join(', ')}.`;
  }
  if (typeof value === 'number') {
    if (spec.minimum !== undefined && value < spec.minimum) {
      return `Parameter "${name}" must be at least ${spec.minimum}.`;
    }
    if (spec.maximum !== undefined && value > spec.maximum) {
      return `Parameter "${name}" must be at most ${spec.maximum}.`;
    }
  }
  if (typeof value === 'string' && spec.maxLength !== undefined && value.length > spec.maxLength) {
    return `Parameter "${name}" must be at most ${spec.maxLength} characters.`;
  }
  return undefined;
}

export function validateParameters(
  instance: ComponentInstance,
  schema: ParameterSchema | undefined,
): Diagnostic[] {
  const problems: string[] = [];
  const specs = schema?.properties ?? {};
  for (const [name, value] of Object.entries(instance.parameters)) {
    const spec = specs[name];
    if (spec === undefined) {
      problems.push(`Parameter "${name}" is not supported by this component. Remove it.`);
      continue;
    }
    const problem = checkValue(name, spec, value);
    if (problem !== undefined) problems.push(problem);
  }
  for (const name of schema?.required ?? []) {
    if (!(name in instance.parameters)) {
      problems.push(`Parameter "${name}" is required. Set a value for it.`);
    }
  }
  return problems.map((message) =>
    diagnostic({
      code: 'PARAMETER_INVALID',
      stage: 'STRUCTURE',
      message: `${instance.instanceId}: ${message}`,
      entityType: 'INSTANCE',
      entityId: instance.instanceId,
    }),
  );
}

export function parameterValue(
  instance: ComponentInstance,
  schema: ParameterSchema | undefined,
  name: string,
): ParameterValue | undefined {
  return instance.parameters[name] ?? schema?.properties[name]?.default;
}
