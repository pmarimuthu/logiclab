import type { CircuitDocument, Diagnostic } from '@logiclab/circuit-domain';
import { useState } from 'react';
import { STARTER_CIRCUITS, initialInputs } from '../circuits';
import { DiagnosticsPanel } from '../components/DiagnosticsPanel';
import { FileActions } from '../components/FileActions';
import { InputSwitches, OutputIndicators } from '../components/SignalPanels';
import { TruthTableView } from '../components/TruthTableView';
import { useSimulation, useTruthTable, type SimulationOutcome } from '../simulation';

function statusText(outcome: SimulationOutcome | undefined): string {
  if (outcome === undefined) return 'Starting worker…';
  if (outcome.kind === 'TIMEOUT') return 'Timed out — worker restarted';
  if (outcome.kind === 'FAILED') return `Failed: ${outcome.message}`;
  if (outcome.kind === 'STALE') return 'Updating…';
  const { status, metrics } = outcome.result;
  if (status !== 'COMPLETED')
    return status === 'INVALID' ? 'Cannot run: fix the issues below' : status;
  return `Ready — ${metrics.evaluatedComponents} components evaluated in the worker (${metrics.elapsedWallTimeMs} ms)`;
}

export function LabView({ initialCircuit }: { initialCircuit: CircuitDocument }) {
  const [circuit, setCircuit] = useState<CircuitDocument>(initialCircuit);
  const [inputs, setInputs] = useState<Record<string, string>>(() => initialInputs(initialCircuit));
  const [fileMessages, setFileMessages] = useState<Diagnostic[]>([]);
  const { outcome } = useSimulation(circuit, inputs);
  const truthTable = useTruthTable(circuit);

  const openCircuit = (document: CircuitDocument, messages: Diagnostic[] = []): void => {
    setCircuit(document);
    setInputs(initialInputs(document));
    setFileMessages(messages);
  };
  const toggle = (id: string): void =>
    setInputs((current) => ({ ...current, [id]: current[id] === '1' ? '0' : '1' }));

  const result = outcome?.kind === 'RESULT' ? outcome.result : undefined;
  const diagnostics = [...fileMessages, ...(result?.diagnostics ?? [])];
  const starter = STARTER_CIRCUITS.find((item) => item.document === circuit);

  return (
    <div className="view lab">
      <div className="lab-bar">
        <label className="starter">
          Circuit
          <select
            data-testid="starter-select"
            value={starter?.key ?? ''}
            onChange={(event) => {
              const next = STARTER_CIRCUITS.find((item) => item.key === event.target.value);
              if (next !== undefined) openCircuit(next.document);
            }}
          >
            {starter === undefined && <option value="">{circuit.metadata.name} (opened)</option>}
            {STARTER_CIRCUITS.map((item) => (
              <option key={item.key} value={item.key}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        <FileActions circuit={circuit} onImported={openCircuit} onFailed={setFileMessages} />
        <p className="status" role="status" data-testid="status">
          {statusText(outcome)}
        </p>
      </div>
      <p className="lab-hint muted tiny">
        Pick a circuit or import a file · click an input to switch 0 ↔ 1 · watch the outputs and the
        truth table. The drag-and-connect editor comes in the next release.
      </p>
      <div className="lab-grid">
        <InputSwitches circuit={circuit} values={inputs} onToggle={toggle} />
        <OutputIndicators circuit={circuit} outputs={result?.outputs} />
        <TruthTableView circuit={circuit} outcome={truthTable} />
      </div>
      <DiagnosticsPanel title="Diagnostics" diagnostics={diagnostics} />
      <p className="muted tiny">
        Logic model only — not an analog or hardware sign-off simulator. Guest mode: nothing leaves
        your browser.
      </p>
    </div>
  );
}
