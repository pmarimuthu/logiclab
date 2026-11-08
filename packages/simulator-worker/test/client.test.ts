import { builtinRegistry } from '@logiclab/component-registry';
import { halfAdder } from '@logiclab/test-fixtures';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SimulationClient, handleWorkerMessage, type WorkerLike } from '../src';

const registry = builtinRegistry();

function fakeWorker(delays: number[] = [], respond = true) {
  let listener: (data: unknown) => void = () => undefined;
  const terminate = vi.fn();
  let call = 0;
  const worker: WorkerLike = {
    postMessage: (message) => {
      const delay = delays[call] ?? 0;
      call += 1;
      if (!respond) return;
      setTimeout(() => listener(handleWorkerMessage(message, registry)), delay);
    },
    onMessage: (next) => {
      listener = next;
    },
    terminate,
  };
  return { worker, terminate };
}

afterEach(() => {
  vi.useRealTimers();
});

describe('simulation worker client', () => {
  it('returns the simulation result for the current revision', async () => {
    const { worker } = fakeWorker();
    const client = new SimulationClient(() => worker);
    const outcome = await client.simulate(halfAdder(), { 'input-a': '1', 'input-b': '1' }, 1);
    expect(outcome.kind).toBe('RESULT');
    if (outcome.kind === 'RESULT') expect(outcome.result.outputs['carry-out']).toBe('1');
    client.dispose();
  });

  it('TEST-SIM-009 marks a slower older result as stale so it cannot overwrite newer work', async () => {
    const { worker } = fakeWorker([30, 0]);
    const client = new SimulationClient(() => worker);
    const older = client.simulate(halfAdder(), { 'input-a': '1' }, 1);
    const newer = client.simulate(halfAdder(), { 'input-a': '0' }, 2);
    const [first, second] = await Promise.all([older, newer]);
    expect(first.kind).toBe('STALE');
    expect(second.kind).toBe('RESULT');
    client.dispose();
  });

  it('TEST-SIM-005 restarts the worker and reports a timeout when it does not answer', async () => {
    vi.useFakeTimers();
    const workers = [fakeWorker([], false), fakeWorker()];
    let created = 0;
    const client = new SimulationClient(() => workers[created++]!.worker, { timeoutMs: 100 });
    const pending = client.simulate(halfAdder(), {}, 1);
    await vi.advanceTimersByTimeAsync(150);
    expect((await pending).kind).toBe('TIMEOUT');
    expect(workers[0]!.terminate).toHaveBeenCalled();
    expect(created).toBe(2);
    client.dispose();
  });

  it('does not mark a simulation stale because a truth table was requested later', async () => {
    const { worker } = fakeWorker([20, 0]);
    const client = new SimulationClient(() => worker);
    const simulation = client.simulate(halfAdder(), { 'input-a': '1' }, 1);
    const table = client.truthTable(halfAdder(), 2);
    const [first, second] = await Promise.all([simulation, table]);
    expect([first.kind, second.kind]).toEqual(['RESULT', 'RESULT']);
    client.dispose();
  });

  it('keeps results of independent channels, so many views can ask at once', async () => {
    const { worker } = fakeWorker([20, 10, 0]);
    const client = new SimulationClient(() => worker);
    const outcomes = await Promise.all([
      client.truthTable(halfAdder(), 1, 'card-1'),
      client.truthTable(halfAdder(), 2, 'card-2'),
      client.truthTable(halfAdder(), 3, 'card-3'),
    ]);
    expect(outcomes.map((item) => item.kind)).toEqual(['RESULT', 'RESULT', 'RESULT']);
    client.dispose();
  });

  it('computes truth tables through the worker', async () => {
    const { worker } = fakeWorker();
    const client = new SimulationClient(() => worker);
    const outcome = await client.truthTable(halfAdder(), 1);
    expect(outcome.kind === 'RESULT' && outcome.result.table?.rows.length).toBe(4);
    client.dispose();
  });

  it('answers unknown messages with FAILED instead of throwing', () => {
    expect(handleWorkerMessage({ hello: 'world' }, registry).type).toBe('FAILED');
  });
});
