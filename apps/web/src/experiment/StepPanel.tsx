import type { LogicValue } from '@logiclab/circuit-domain';
import type { Experiment, ExperimentStep } from '@logiclab/learning-content';
import { labelOf, meaningOf } from './labels';

interface StepPanelProps {
  experiment: Experiment;
  step: ExperimentStep;
  stepIndex: number;
  inputs: Record<string, string>;
  prediction: LogicValue | undefined;
  onToggle: (id: string) => void;
  onDoItForMe: () => void;
  onAnswer: (value: LogicValue) => void;
}

export function StepPanel(props: StepPanelProps) {
  const { experiment, step, stepIndex, inputs, prediction } = props;
  const locked = step.predict !== undefined && prediction === undefined;
  const outputMeaning = experiment.meanings[experiment.outputId];

  return (
    <section className="step-panel" aria-labelledby="step-title">
      <div className="progress" aria-label={`Step ${stepIndex + 1} of ${experiment.steps.length}`}>
        {experiment.steps.map((item, index) => (
          <span
            key={item.id}
            className={index === stepIndex ? 'dot active' : index < stepIndex ? 'dot done' : 'dot'}
          />
        ))}
        <span className="muted tiny">
          Step {stepIndex + 1} of {experiment.steps.length}
        </span>
      </div>
      <h2 id="step-title" data-testid="step-title">
        {step.title}
      </h2>
      {stepIndex === 0 && (
        <ul className="points small story">
          {experiment.story.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
      )}
      <p className="stage">Do this</p>
      <ul className="points">
        {step.doThis.map((point) => (
          <li key={point}>{point}</li>
        ))}
      </ul>
      {step.predict !== undefined && (
        <div className="predict" data-testid="predict">
          <p>
            <span className="badge">Predict</span> {step.predict.question}
          </p>
          {(['1', '0'] as const).map((value) => (
            <button
              key={value}
              type="button"
              className={prediction === value ? 'button chosen' : 'button'}
              aria-pressed={prediction === value}
              data-testid={`guess-${value}`}
              onClick={() => props.onAnswer(value)}
            >
              {value === '1' ? outputMeaning?.on : outputMeaning?.off} ({value})
            </button>
          ))}
        </div>
      )}
      {step.target !== undefined && (
        <div className="controls">
          {experiment.inputIds.map((id) => {
            const on = inputs[id] === '1';
            return (
              <button
                key={id}
                type="button"
                className={on ? 'switch on' : 'switch'}
                aria-pressed={on}
                disabled={locked}
                data-testid={`exp-input-${id}`}
                onClick={() => props.onToggle(id)}
              >
                <span className="signal-name">{labelOf(experiment, id)}</span>
                <span className="signal-meaning">{meaningOf(experiment, id, inputs[id])}</span>
                <span className="signal-value">{inputs[id]}</span>
              </button>
            );
          })}
          <button
            type="button"
            className="link-button"
            disabled={locked}
            onClick={props.onDoItForMe}
          >
            Do it for me
          </button>
        </div>
      )}
    </section>
  );
}
