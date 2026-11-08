import type { CircuitDocument } from '@logiclab/circuit-domain';
import type { SimulationResult, TruthTableResult } from '@logiclab/simulator-core';
import type { WorkerLike } from './endpoints';
import { isWorkerResponse, type WorkerRequest, type WorkerResponse } from './protocol';

export type ClientOutcome<T> =
  | { kind: 'RESULT'; revision: number; result: T }
  | { kind: 'STALE'; revision: number }
  | { kind: 'TIMEOUT'; revision: number }
  | { kind: 'FAILED'; revision: number; message: string };

interface Pending {
  revision: number;
  resolve: (response: WorkerResponse | 'TIMEOUT') => void;
  timer: ReturnType<typeof setTimeout>;
}

export interface SimulationClientOptions {
  timeoutMs?: number;
}

export class SimulationClient {
  private worker: WorkerLike;
  private readonly pending = new Map<string, Pending>();
  private readonly latestRevision = new Map<string, number>();
  private sequence = 0;
  private readonly timeoutMs: number;

  constructor(
    private readonly createWorker: () => WorkerLike,
    options: SimulationClientOptions = {},
  ) {
    this.timeoutMs = options.timeoutMs ?? 5000;
    this.worker = this.start();
  }

  simulate(
    circuit: CircuitDocument,
    inputs: Record<string, string>,
    revision: number,
    channel = 'default',
  ): Promise<ClientOutcome<SimulationResult>> {
    const request = {
      type: 'SIMULATE' as const,
      requestId: this.nextId(),
      revision,
      circuit,
      inputs,
    };
    return this.send(request, channel);
  }

  truthTable(
    circuit: CircuitDocument,
    revision: number,
    channel = 'default',
  ): Promise<ClientOutcome<TruthTableResult>> {
    const request = { type: 'TRUTH_TABLE' as const, requestId: this.nextId(), revision, circuit };
    return this.send(request, channel);
  }

  dispose(): void {
    for (const entry of this.pending.values()) clearTimeout(entry.timer);
    this.pending.clear();
    this.worker.terminate();
  }

  private start(): WorkerLike {
    const worker = this.createWorker();
    worker.onMessage((data) => this.receive(data));
    return worker;
  }

  private nextId(): string {
    this.sequence += 1;
    return `req-${this.sequence}`;
  }

  private receive(data: unknown): void {
    if (!isWorkerResponse(data)) return;
    const entry = this.pending.get(data.requestId);
    if (entry === undefined) return;
    clearTimeout(entry.timer);
    this.pending.delete(data.requestId);
    entry.resolve(data);
  }

  private restart(): void {
    this.worker.terminate();
    for (const [id, entry] of this.pending) {
      clearTimeout(entry.timer);
      this.pending.delete(id);
      entry.resolve('TIMEOUT');
    }
    this.worker = this.start();
  }

  private send<T>(request: WorkerRequest, channel: string): Promise<ClientOutcome<T>> {
    const key = `${request.type}:${channel}`;
    this.latestRevision.set(key, Math.max(this.latestRevision.get(key) ?? -1, request.revision));
    return new Promise<WorkerResponse | 'TIMEOUT'>((resolve) => {
      const timer = setTimeout(() => this.restart(), this.timeoutMs);
      this.pending.set(request.requestId, { revision: request.revision, resolve, timer });
      this.worker.postMessage(request);
    }).then((response) => this.toOutcome<T>(request.revision, key, response));
  }

  private toOutcome<T>(
    revision: number,
    key: string,
    response: WorkerResponse | 'TIMEOUT',
  ): ClientOutcome<T> {
    if (response === 'TIMEOUT') return { kind: 'TIMEOUT', revision };
    if (revision < (this.latestRevision.get(key) ?? -1)) return { kind: 'STALE', revision };
    if (response.type === 'FAILED') return { kind: 'FAILED', revision, message: response.message };
    return { kind: 'RESULT', revision, result: response.result as T };
  }
}
