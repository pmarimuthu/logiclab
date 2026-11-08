import type { DefinitionResolver } from '@logiclab/circuit-domain';
import { generateTruthTable, simulate } from '@logiclab/simulator-core';
import { isWorkerRequest, type WorkerResponse } from './protocol';

export function handleWorkerMessage(data: unknown, resolver: DefinitionResolver): WorkerResponse {
  if (!isWorkerRequest(data)) {
    return { type: 'FAILED', requestId: 'unknown', revision: -1, message: 'Unknown message' };
  }
  try {
    if (data.type === 'SIMULATE') {
      const result = simulate(
        {
          requestId: data.requestId,
          circuit: data.circuit,
          mode: 'COMBINATIONAL',
          inputs: data.inputs,
        },
        resolver,
      );
      return {
        type: 'SIMULATION_RESULT',
        requestId: data.requestId,
        revision: data.revision,
        result,
      };
    }
    const result = generateTruthTable(data.circuit, resolver, data.maxInputs);
    return {
      type: 'TRUTH_TABLE_RESULT',
      requestId: data.requestId,
      revision: data.revision,
      result,
    };
  } catch (error) {
    return {
      type: 'FAILED',
      requestId: data.requestId,
      revision: data.revision,
      message: error instanceof Error ? error.message : 'Simulation failed',
    };
  }
}
