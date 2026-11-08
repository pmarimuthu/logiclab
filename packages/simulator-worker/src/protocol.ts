import type { CircuitDocument } from '@logiclab/circuit-domain';
import type { SimulationResult, TruthTableResult } from '@logiclab/simulator-core';

export const PROTOCOL_VERSION = 1;

export type WorkerRequest =
  | {
      type: 'SIMULATE';
      requestId: string;
      revision: number;
      circuit: CircuitDocument;
      inputs: Record<string, string>;
    }
  | {
      type: 'TRUTH_TABLE';
      requestId: string;
      revision: number;
      circuit: CircuitDocument;
      maxInputs?: number;
    };

export type WorkerResponse =
  | { type: 'SIMULATION_RESULT'; requestId: string; revision: number; result: SimulationResult }
  | { type: 'TRUTH_TABLE_RESULT'; requestId: string; revision: number; result: TruthTableResult }
  | { type: 'FAILED'; requestId: string; revision: number; message: string };

export function isWorkerRequest(value: unknown): value is WorkerRequest {
  if (typeof value !== 'object' || value === null) return false;
  const message = value as Record<string, unknown>;
  return (
    (message['type'] === 'SIMULATE' || message['type'] === 'TRUTH_TABLE') &&
    typeof message['requestId'] === 'string' &&
    typeof message['revision'] === 'number' &&
    typeof message['circuit'] === 'object'
  );
}

export function isWorkerResponse(value: unknown): value is WorkerResponse {
  if (typeof value !== 'object' || value === null) return false;
  const message = value as Record<string, unknown>;
  return (
    typeof message['type'] === 'string' &&
    typeof message['requestId'] === 'string' &&
    typeof message['revision'] === 'number'
  );
}
