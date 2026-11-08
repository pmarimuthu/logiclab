import { AND_LOCKER } from './experiments/and-locker';
import { OR_DOORBELL } from './experiments/or-doorbell';
import { XOR_STAIRCASE } from './experiments/xor-staircase';
import type { Experiment } from './types';

export * from './types';
export { BASICS, HOW_TO_USE } from './basics';
export { GATE_GUIDES } from './gates';

export const EXPERIMENTS: readonly Experiment[] = [AND_LOCKER, OR_DOORBELL, XOR_STAIRCASE];

export function findExperiment(id: string): Experiment | undefined {
  return EXPERIMENTS.find((item) => item.id === id);
}
