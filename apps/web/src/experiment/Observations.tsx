import type { Experiment } from '@logiclab/learning-content';
import { useTruthTable } from '../simulation';
import { labelOf } from './labels';
import type { Observation } from './useExperiment';

const short = (experiment: Experiment, id: string): string =>
  experiment.meanings[id]?.short ?? labelOf(experiment, id);

export function ObservationTable({
  experiment,
  observations,
}: {
  experiment: Experiment;
  observations: Observation[];
}) {
  return (
    <div className="obs">
      <p className="stage">Your observations</p>
      {observations.length === 0 ? (
        <p className="muted tiny">Each finished step adds one row here.</p>
      ) : (
        <table className="truth-table compact" data-testid="observations">
          <thead>
            <tr>
              <th scope="col">Step</th>
              {experiment.inputIds.map((id) => (
                <th key={id} scope="col">
                  {short(experiment, id)}
                </th>
              ))}
              <th scope="col" className="output-col">
                {labelOf(experiment, experiment.outputId)}
              </th>
            </tr>
          </thead>
          <tbody>
            {observations.map((row, index) => (
              <tr key={index} title={row.stepTitle}>
                <td>{index + 1}</td>
                {row.inputs.map((value, column) => (
                  <td key={column}>{value}</td>
                ))}
                <td className={row.output === '1' ? 'output-col high' : 'output-col'}>
                  {row.output}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export function FullTruthTable({ experiment }: { experiment: Experiment }) {
  const outcome = useTruthTable(experiment.circuit);
  const table = outcome?.kind === 'RESULT' ? outcome.result.table : undefined;
  if (table === undefined) return <p className="muted">Loading truth table…</p>;
  return (
    <div className="obs">
      <p className="stage">Full {experiment.gate.toUpperCase()} truth table (from the simulator)</p>
      <table className="truth-table compact" data-testid="full-truth-table">
        <thead>
          <tr>
            {table.inputs.map((id) => (
              <th key={id} scope="col">
                {short(experiment, id)}
              </th>
            ))}
            <th scope="col" className="output-col">
              {labelOf(experiment, experiment.outputId)}
            </th>
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row) => (
            <tr key={row.inputs.join('')}>
              {row.inputs.map((value, index) => (
                <td key={index}>{value}</td>
              ))}
              <td className={row.outputs[0] === '1' ? 'output-col high' : 'output-col'}>
                {row.outputs[0]}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
