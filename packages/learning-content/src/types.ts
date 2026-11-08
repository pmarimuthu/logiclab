import type { CircuitDocument, GateType, LogicValue } from '@logiclab/circuit-domain';

export type IllustrationKey = 'gate-concept' | 'binary' | 'devices' | 'truth-table';

export interface PointSection {
  title: string;
  points: string[];
  illustration?: IllustrationKey;
}

export interface ValueMeaning {
  on: string;
  off: string;
  short?: string;
}

export interface SignalLabel extends ValueMeaning {
  name: string;
}

export interface QuickCheck {
  question: string;
  inputs: Record<string, LogicValue>;
  answer: LogicValue;
  explain: string;
}

export interface GateGuide {
  type: GateType;
  name: string;
  rule: string;
  remember: string[];
  example: PointSection;
  labels: Record<string, SignalLabel>;
  quickCheck: QuickCheck;
  circuit: CircuitDocument;
  inputIds: string[];
  outputId: string;
  experimentId?: string;
}

export interface Prediction {
  question: string;
  outputId: string;
}

export interface ExperimentStep {
  id: string;
  title: string;
  doThis: string[];
  target?: Record<string, LogicValue>;
  expect?: Record<string, LogicValue>;
  predict?: Prediction;
  impact: string[];
  showTruthTable?: boolean;
}

export interface Experiment {
  id: string;
  title: string;
  gate: GateType;
  story: string[];
  youWillLearn: string[];
  circuit: CircuitDocument;
  inputIds: string[];
  outputId: string;
  meanings: Record<string, ValueMeaning>;
  steps: ExperimentStep[];
  summary: string[];
}
