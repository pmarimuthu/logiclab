export { SimulationClient, type ClientOutcome, type SimulationClientOptions } from './client';
export {
  attachSimulationWorker,
  fromBrowserWorker,
  type WorkerLike,
  type WorkerScopeLike,
} from './endpoints';
export { handleWorkerMessage } from './handler';
export type {
  SimulationResult,
  TruthTable,
  TruthTableResult,
  TruthTableRow,
} from '@logiclab/simulator-core';
export {
  PROTOCOL_VERSION,
  isWorkerRequest,
  isWorkerResponse,
  type WorkerRequest,
  type WorkerResponse,
} from './protocol';
