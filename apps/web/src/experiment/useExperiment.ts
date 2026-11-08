import type { LogicValue } from '@logiclab/circuit-domain';
import type { Experiment, ExperimentStep } from '@logiclab/learning-content';
import { useReducer } from 'react';

export interface Observation {
  stepTitle: string;
  inputs: string[];
  output: string;
}

export interface ExperimentState {
  stepIndex: number;
  finished: boolean;
  inputs: Record<string, string>;
  inputsAtStart: Record<string, string>;
  outputAtStart: string | undefined;
  answers: Record<string, LogicValue>;
  observations: Observation[];
}

type Action =
  | { type: 'TOGGLE'; id: string }
  | { type: 'SET_INPUTS'; inputs: Record<string, string> }
  | { type: 'ANSWER'; stepId: string; value: LogicValue }
  | {
      type: 'NEXT';
      output: string | undefined;
      step: ExperimentStep;
      inputIds: string[];
      last: boolean;
    }
  | { type: 'RESTART'; experiment: Experiment };

export function initialState(experiment: Experiment): ExperimentState {
  const inputs = Object.fromEntries(experiment.inputIds.map((id) => [id, '0']));
  return {
    stepIndex: 0,
    finished: false,
    inputs,
    inputsAtStart: inputs,
    outputAtStart: undefined,
    answers: {},
    observations: [],
  };
}

function reducer(state: ExperimentState, action: Action): ExperimentState {
  switch (action.type) {
    case 'TOGGLE':
      return {
        ...state,
        inputs: { ...state.inputs, [action.id]: state.inputs[action.id] === '1' ? '0' : '1' },
      };
    case 'SET_INPUTS':
      return { ...state, inputs: { ...action.inputs } };
    case 'ANSWER':
      return { ...state, answers: { ...state.answers, [action.stepId]: action.value } };
    case 'NEXT': {
      const observations =
        action.step.target === undefined || action.output === undefined
          ? state.observations
          : [
              ...state.observations,
              {
                stepTitle: action.step.title,
                inputs: action.inputIds.map((id) => state.inputs[id] ?? '0'),
                output: action.output,
              },
            ];
      return {
        ...state,
        observations,
        finished: action.last,
        stepIndex: action.last ? state.stepIndex : state.stepIndex + 1,
        inputsAtStart: state.inputs,
        outputAtStart: action.output,
      };
    }
    case 'RESTART':
      return initialState(action.experiment);
  }
}

export function useExperiment(experiment: Experiment) {
  return useReducer(reducer, experiment, initialState);
}

export function targetReached(step: ExperimentStep, inputs: Record<string, string>): boolean {
  if (step.target === undefined) return true;
  return Object.entries(step.target).every(([id, value]) => inputs[id] === value);
}
