import type { DefinitionResolver } from '@logiclab/circuit-domain';
import { builtinRegistry } from '@logiclab/component-registry';
import { handleWorkerMessage } from './handler';

export interface WorkerLike {
  postMessage(message: unknown): void;
  onMessage(listener: (data: unknown) => void): void;
  terminate(): void;
}

export interface WorkerScopeLike {
  postMessage(message: unknown): void;
  addEventListener(type: 'message', listener: (event: { data: unknown }) => void): void;
}

export function attachSimulationWorker(
  scope: WorkerScopeLike,
  resolver: DefinitionResolver = builtinRegistry(),
): void {
  scope.addEventListener('message', (event) => {
    scope.postMessage(handleWorkerMessage(event.data, resolver));
  });
}

export function fromBrowserWorker(worker: Worker): WorkerLike {
  return {
    postMessage: (message) => worker.postMessage(message),
    onMessage: (listener) => {
      worker.addEventListener('message', (event: MessageEvent) => listener(event.data));
    },
    terminate: () => worker.terminate(),
  };
}
