import type { GateGuide } from '@logiclab/learning-content';
import { useTruthTable } from '../simulation';

interface MiniTruthTableProps {
  guide: GateGuide;
  current: Record<string, string>;
}

export function MiniTruthTable({ guide, current }: MiniTruthTableProps) {
  const outcome = useTruthTable(guide.circuit);
  const table = outcome?.kind === 'RESULT' ? outcome.result.table : undefined;
  if (table === undefined) return <p className="muted">Loading…</p>;
  const currentKey = guide.inputIds.map((id) => current[id] ?? '0').join('');
  return (
    <table className="truth-table compact" data-testid={`gate-table-${guide.type}`}>
      <thead>
        <tr>
          {guide.inputIds.map((id) => (
            <th key={id} scope="col">
              {id === 'input-a' ? 'A' : 'B'}
            </th>
          ))}
          <th scope="col" className="output-col">
            Out
          </th>
        </tr>
      </thead>
      <tbody>
        {table.rows.map((row) => {
          const key = row.inputs.join('');
          return (
            <tr key={key} className={key === currentKey ? 'current-row' : undefined}>
              {row.inputs.map((value, index) => (
                <td key={index}>{value}</td>
              ))}
              <td className={row.outputs[0] === '1' ? 'output-col high' : 'output-col'}>
                {row.outputs[0]}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
