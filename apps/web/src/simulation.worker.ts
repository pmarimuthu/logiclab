import { attachSimulationWorker, type WorkerScopeLike } from '@logiclab/simulator-worker';

attachSimulationWorker(self as unknown as WorkerScopeLike);
