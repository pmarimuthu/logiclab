import type { Experiment, ExperimentStep } from '@logiclab/learning-content';
import { describeValue, labelOf } from './labels';

interface ImpactPanelProps {
  experiment: Experiment;
  step: ExperimentStep;
  done: boolean;
  inputs: Record<string, string>;
  inputsAtStart: Record<string, string>;
  output: string | undefined;
  outputAtStart: string | undefined;
  prediction: string | undefined;
}

function missingActions(
  experiment: Experiment,
  step: ExperimentStep,
  inputs: Record<string, string>,
) {
  return Object.entries(step.target ?? {})
    .filter(([id, value]) => inputs[id] !== value)
    .map(
      ([id, value]) => `Set ${labelOf(experiment, id)} to ${describeValue(experiment, id, value)}`,
    );
}

export function ImpactPanel(props: ImpactPanelProps) {
  const { experiment, step, done, inputs, inputsAtStart, output, outputAtStart, prediction } =
    props;
  const outputId = experiment.outputId;
  const outputName = labelOf(experiment, outputId);

  if (!done) {
    const pending = missingActions(experiment, step, inputs);
    return (
      <section className="impact waiting" aria-live="polite" data-testid="impact-panel">
        <h3>Impact of this step</h3>
        <ul>
          {step.predict !== undefined && prediction === undefined && (
            <li>First, answer the question above.</li>
          )}
          {pending.map((item) => (
            <li key={item}>{item}.</li>
          ))}
          <li>
            {outputName} right now: {describeValue(experiment, outputId, output)}
          </li>
        </ul>
      </section>
    );
  }

  const changed = experiment.inputIds.filter((id) => inputs[id] !== inputsAtStart[id]);
  const outputChanged = outputAtStart !== undefined && outputAtStart !== output;
  const correctGuess =
    step.predict !== undefined ? step.expect?.[step.predict.outputId] : undefined;

  return (
    <section className="impact done" aria-live="polite" data-testid="impact-panel">
      <h3>Impact of this step</h3>
      <div className="impact-grid">
        <div>
          <h4>What you did</h4>
          <ul>
            {changed.length === 0 && <li>No switch was changed.</li>}
            {changed.map((id) => (
              <li key={id}>
                {labelOf(experiment, id)}: {describeValue(experiment, id, inputsAtStart[id])} →{' '}
                {describeValue(experiment, id, inputs[id])}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4>
            <span className="badge">Observe</span> What happened
          </h4>
          <ul>
            <li data-testid="impact-output">
              {outputName}: <strong>{describeValue(experiment, outputId, output)}</strong>
            </li>
            <li>
              {outputAtStart === undefined
                ? 'This is the starting state.'
                : outputChanged
                  ? `Changed from ${describeValue(experiment, outputId, outputAtStart)}.`
                  : 'No change in the output.'}
            </li>
            {correctGuess !== undefined && prediction !== undefined && (
              <li data-testid="prediction-result">
                {prediction === correctGuess
                  ? 'Your guess was correct ✓'
                  : 'Your guess was not correct — that is okay, now you know!'}
              </li>
            )}
          </ul>
        </div>
        <div>
          <h4>
            <span className="badge">Explain</span> Why
          </h4>
          <ul>
            {step.impact.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
