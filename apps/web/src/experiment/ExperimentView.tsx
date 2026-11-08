import { EXPERIMENTS, type Experiment } from '@logiclab/learning-content';
import { outputsOf, useSimulation } from '../simulation';
import { ImpactPanel } from './ImpactPanel';
import { FullTruthTable, ObservationTable } from './Observations';
import { StepPanel } from './StepPanel';
import { targetReached, useExperiment } from './useExperiment';
import { VisualRow } from './VisualRow';

interface ExperimentViewProps {
  experiment: Experiment;
  onChoose: (id: string) => void;
}

function Picker({ current, onChoose }: { current: string; onChoose: (id: string) => void }) {
  return (
    <label className="picker">
      <span className="stage">Experiment</span>
      <select
        value={current}
        data-testid="experiment-select"
        onChange={(event) => onChoose(event.target.value)}
      >
        {EXPERIMENTS.map((item) => (
          <option key={item.id} value={item.id}>
            {item.title}
          </option>
        ))}
      </select>
    </label>
  );
}

export function ExperimentView({ experiment, onChoose }: ExperimentViewProps) {
  const [state, dispatch] = useExperiment(experiment);
  const live = useSimulation(experiment.circuit, state.inputs);
  const output = outputsOf(live)?.[experiment.outputId];
  const step = experiment.steps[state.stepIndex];
  if (step === undefined) return null;

  const prediction = state.answers[step.id];
  const answered = step.predict === undefined || prediction !== undefined;
  const done =
    answered &&
    targetReached(step, state.inputs) &&
    (step.target === undefined || output !== undefined);
  const last = state.stepIndex === experiment.steps.length - 1;
  const showTables = state.finished || step.showTruthTable === true;
  const others = EXPERIMENTS.filter((item) => item.id !== experiment.id);

  return (
    <div className="view experiment" data-testid="experiment-view">
      <aside className="exp-left">
        <Picker current={experiment.id} onChoose={onChoose} />
        {state.finished ? (
          <section className="summary" data-testid="summary">
            <h2>Well done! Experiment complete ✓</h2>
            <ul className="points">
              {experiment.summary.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
            <div className="nav-row">
              <button
                type="button"
                className="button"
                onClick={() => dispatch({ type: 'RESTART', experiment })}
              >
                Do it again
              </button>
              {others.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="button primary"
                  onClick={() => onChoose(item.id)}
                >
                  Next: {item.gate.toUpperCase()} experiment
                </button>
              ))}
            </div>
          </section>
        ) : (
          <StepPanel
            experiment={experiment}
            step={step}
            stepIndex={state.stepIndex}
            inputs={state.inputs}
            prediction={prediction}
            onToggle={(id) => dispatch({ type: 'TOGGLE', id })}
            onDoItForMe={() => step.target && dispatch({ type: 'SET_INPUTS', inputs: step.target })}
            onAnswer={(value) => dispatch({ type: 'ANSWER', stepId: step.id, value })}
          />
        )}
        {!state.finished && (
          <div className="nav-row sticky-nav">
            <button
              type="button"
              className="button"
              onClick={() => dispatch({ type: 'RESTART', experiment })}
            >
              Restart
            </button>
            <button
              type="button"
              className="button primary"
              disabled={!done}
              data-testid="next-step"
              onClick={() =>
                dispatch({ type: 'NEXT', output, step, inputIds: experiment.inputIds, last })
              }
            >
              {last ? 'Finish ✓' : 'Next step →'}
            </button>
          </div>
        )}
        {!showTables && (
          <ObservationTable experiment={experiment} observations={state.observations} />
        )}
      </aside>
      <section className="exp-right">
        {showTables ? (
          <div className="table-compare">
            <ObservationTable experiment={experiment} observations={state.observations} />
            <FullTruthTable experiment={experiment} />
          </div>
        ) : (
          <VisualRow experiment={experiment} inputs={state.inputs} output={output} />
        )}
        {!state.finished && (
          <ImpactPanel
            experiment={experiment}
            step={step}
            done={done}
            inputs={state.inputs}
            inputsAtStart={state.inputsAtStart}
            output={output}
            outputAtStart={state.outputAtStart}
            prediction={prediction}
          />
        )}
      </section>
    </div>
  );
}
