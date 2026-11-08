import type { CircuitDocument } from '@logiclab/circuit-domain';
import { displayName } from '../circuits';
import type { TruthTableOutcome } from '../simulation';

interface TruthTableViewProps {
  circuit: CircuitDocument;
  outcome: TruthTableOutcome | undefined;
}

export function TruthTableView({ circuit, outcome }: TruthTableViewProps) {
  const table = outcome?.kind === 'RESULT' ? outcome.result.table : undefined;
  return (
    <section aria-labelledby="truth-title" className="panel">
      <h2 id="truth-title">Truth table</h2>
      {table === undefined ? (
        <p className="muted">Truth table is not available for this circuit.</p>
      ) : (
        <table className="truth-table" data-testid="truth-table">
          <thead>
            <tr>
              {table.inputs.map((id) => (
                <th key={id} scope="col">
                  {displayName(circuit, id)}
                </th>
              ))}
              {table.outputs.map((id) => (
                <th key={id} scope="col" className="output-col">
                  {displayName(circuit, id)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row, index) => (
              <tr key={index}>
                {row.inputs.map((value, column) => (
                  <td key={`i${column}`}>{value}</td>
                ))}
                {row.outputs.map((value, column) => (
                  <td key={`o${column}`} className="output-col">
                    {value}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
