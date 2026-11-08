import type { Bit } from '@logiclab/circuit-domain';

export type GateModel = (inputs: readonly Bit[]) => Bit;

const bit = (value: boolean): Bit => (value ? 1 : 0);
const first = (inputs: readonly Bit[]): Bit => inputs[0] ?? 0;
const second = (inputs: readonly Bit[]): Bit => inputs[1] ?? 0;

const MODELS: Readonly<Record<string, GateModel>> = Object.freeze({
  'model.logic.and@1.0': (x) => bit(first(x) === 1 && second(x) === 1),
  'model.logic.or@1.0': (x) => bit(first(x) === 1 || second(x) === 1),
  'model.logic.not@1.0': (x) => bit(first(x) === 0),
  'model.logic.nand@1.0': (x) => bit(!(first(x) === 1 && second(x) === 1)),
  'model.logic.nor@1.0': (x) => bit(!(first(x) === 1 || second(x) === 1)),
  'model.logic.xor@1.0': (x) => bit(first(x) !== second(x)),
  'model.logic.xnor@1.0': (x) => bit(first(x) === second(x)),
});

const SOURCE_MODEL_KEYS: ReadonlySet<string> = new Set([
  'model.io.input@1.0',
  'model.io.constant@1.0',
  'model.io.output@1.0',
]);

export function gateModel(modelId: string, version: string): GateModel | undefined {
  return MODELS[`${modelId}@${version}`];
}

export function isSupportedSourceModel(modelId: string, version: string): boolean {
  return SOURCE_MODEL_KEYS.has(`${modelId}@${version}`);
}
