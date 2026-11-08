import type { Experiment } from '@logiclab/learning-content';

export function labelOf(experiment: Experiment, id: string): string {
  const instance = experiment.circuit.model.instances.find((item) => item.instanceId === id);
  return instance?.label ?? id;
}

export function meaningOf(experiment: Experiment, id: string, value: string | undefined): string {
  const meaning = experiment.meanings[id];
  if (meaning === undefined || value === undefined) return '…';
  return value === '1' ? meaning.on : meaning.off;
}

export function describeValue(
  experiment: Experiment,
  id: string,
  value: string | undefined,
): string {
  if (value === undefined) return 'checking…';
  return `${meaningOf(experiment, id, value)} (${value})`;
}
