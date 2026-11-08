import type { CircuitDocument, LogicValue } from '@logiclab/circuit-domain';
import { displayName, inputIds, outputIds } from '../circuits';

interface InputSwitchesProps {
  circuit: CircuitDocument;
  values: Record<string, string>;
  onToggle: (instanceId: string) => void;
}

export function InputSwitches({ circuit, values, onToggle }: InputSwitchesProps) {
  return (
    <section aria-labelledby="inputs-title" className="panel">
      <h2 id="inputs-title">Inputs</h2>
      <ul className="signal-list">
        {inputIds(circuit).map((id) => {
          const on = values[id] === '1';
          return (
            <li key={id}>
              <button
                type="button"
                className={on ? 'switch on' : 'switch'}
                aria-pressed={on}
                data-testid={`input-${id}`}
                onClick={() => onToggle(id)}
              >
                <span className="signal-name">{displayName(circuit, id)}</span>
                <span className="signal-value">{on ? '1' : '0'}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

interface OutputIndicatorsProps {
  circuit: CircuitDocument;
  outputs: Record<string, LogicValue> | undefined;
}

export function OutputIndicators({ circuit, outputs }: OutputIndicatorsProps) {
  return (
    <section aria-labelledby="outputs-title" className="panel">
      <h2 id="outputs-title">Outputs</h2>
      <ul className="signal-list" aria-live="polite">
        {outputIds(circuit).map((id) => {
          const value = outputs?.[id];
          const label = value === undefined ? '–' : value;
          return (
            <li key={id} className={value === '1' ? 'indicator on' : 'indicator'}>
              <span className="lamp" aria-hidden="true" />
              <span className="signal-name">{displayName(circuit, id)}</span>
              <span className="signal-value" data-testid={`output-${id}`}>
                {label}
              </span>
              <span className="visually-hidden">{value === '1' ? 'on' : 'off'}</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
