import type { CircuitDocument } from '@logiclab/circuit-domain';
import {
  SimulationClient,
  fromBrowserWorker,
  type ClientOutcome,
  type SimulationResult,
  type TruthTableResult,
} from '@logiclab/simulator-worker';
import { useEffect, useId, useState } from 'react';

export type SimulationOutcome = ClientOutcome<SimulationResult>;
export type TruthTableOutcome = ClientOutcome<TruthTableResult>;

interface SimulationState {
  outcome?: SimulationOutcome;
  circuit?: CircuitDocument;
  inputs?: Record<string, string>;
}

export interface LiveSimulation {
  outcome: SimulationOutcome | undefined;
  upToDate: boolean;
}

let client: SimulationClient | undefined;
let revision = 0;

function simulationClient(): SimulationClient {
  client ??= new SimulationClient(() =>
    fromBrowserWorker(
      new Worker(new URL('./simulation.worker.ts', import.meta.url), { type: 'module' }),
    ),
  );
  return client;
}

function nextRevision(): number {
  revision += 1;
  return revision;
}

export function useSimulation(
  circuit: CircuitDocument,
  inputs: Record<string, string>,
): LiveSimulation {
  const channel = useId();
  const [state, setState] = useState<SimulationState>({});
  useEffect(() => {
    let active = true;
    void simulationClient()
      .simulate(circuit, inputs, nextRevision(), channel)
      .then((next) => {
        if (active && next.kind !== 'STALE') setState({ outcome: next, circuit, inputs });
      });
    return () => {
      active = false;
    };
  }, [circuit, inputs, channel]);
  return {
    outcome: state.outcome,
    upToDate: state.circuit === circuit && state.inputs === inputs,
  };
}

export function useTruthTable(circuit: CircuitDocument): TruthTableOutcome | undefined {
  const channel = useId();
  const [outcome, setOutcome] = useState<TruthTableOutcome>();
  useEffect(() => {
    let active = true;
    void simulationClient()
      .truthTable(circuit, nextRevision(), channel)
      .then((next) => {
        if (active && next.kind !== 'STALE') setOutcome(next);
      });
    return () => {
      active = false;
    };
  }, [circuit, channel]);
  return outcome;
}

export function outputsOf(live: LiveSimulation): Record<string, string> | undefined {
  if (!live.upToDate || live.outcome?.kind !== 'RESULT') return undefined;
  return live.outcome.result.status === 'COMPLETED' ? live.outcome.result.outputs : undefined;
}
