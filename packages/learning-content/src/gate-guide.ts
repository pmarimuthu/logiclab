import { buildCircuit, type GateType, type LogicValue } from '@logiclab/circuit-domain';
import type { GateGuide, PointSection, SignalLabel } from './types';

export interface GuideInput {
  type: GateType;
  rule: string;
  remember: string[];
  example: PointSection;
  a: SignalLabel;
  b?: SignalLabel;
  y: SignalLabel;
  check: { question: string; a: LogicValue; b?: LogicValue; answer: LogicValue; explain: string };
  experimentId?: string;
}

export function defineGuide(input: GuideInput): GateGuide {
  const unary = input.b === undefined;
  const inputIds = unary ? ['input-a'] : ['input-a', 'input-b'];
  const labels: Record<string, SignalLabel> = { 'input-a': input.a, 'output-y': input.y };
  if (input.b !== undefined) labels['input-b'] = input.b;
  const checkInputs: Record<string, LogicValue> = { 'input-a': input.check.a };
  if (!unary) checkInputs['input-b'] = input.check.b ?? '0';

  const guide: GateGuide = {
    type: input.type,
    name: input.type.toUpperCase(),
    rule: input.rule,
    remember: input.remember,
    example: input.example,
    labels,
    quickCheck: {
      question: input.check.question,
      inputs: checkInputs,
      answer: input.check.answer,
      explain: input.check.explain,
    },
    circuit: buildCircuit({
      id: `guide-${input.type}`,
      name: `${input.type.toUpperCase()} gate`,
      sources: inputIds.map((id) => ({
        id,
        kind: 'input' as const,
        label: labels[id]?.name ?? id,
      })),
      gates: [{ id: 'gate', type: input.type, inputs: inputIds }],
      outputs: [{ id: 'output-y', from: 'gate', label: input.y.name }],
    }),
    inputIds,
    outputId: 'output-y',
  };
  if (input.experimentId !== undefined) guide.experimentId = input.experimentId;
  return guide;
}
