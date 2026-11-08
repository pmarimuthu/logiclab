import type { Experiment } from '@logiclab/learning-content';
import { Scene } from '../art/Scene';
import { GateDiagram } from '../diagram/GateDiagram';
import { labelOf, meaningOf } from './labels';

interface VisualRowProps {
  experiment: Experiment;
  inputs: Record<string, string>;
  output: string | undefined;
}

export function VisualRow({ experiment, inputs, output }: VisualRowProps) {
  const [first, second] = experiment.inputIds;
  return (
    <div className="visual-row">
      <figure className="visual-card">
        <figcaption className="stage">In real life</figcaption>
        <div className="scene-frame" data-testid="experiment-scene">
          <Scene
            gate={experiment.gate}
            a={first === undefined ? undefined : inputs[first]}
            b={second === undefined ? undefined : inputs[second]}
            y={output}
          />
        </div>
      </figure>
      <figure className="visual-card">
        <figcaption className="stage">As a logic circuit</figcaption>
        <GateDiagram
          gate={experiment.gate}
          inputs={experiment.inputIds.map((id) => ({
            id,
            label: labelOf(experiment, id),
            value: inputs[id],
            meaning: meaningOf(experiment, id, inputs[id]),
          }))}
          output={{
            id: experiment.outputId,
            label: labelOf(experiment, experiment.outputId),
            value: output,
            meaning: meaningOf(experiment, experiment.outputId, output),
          }}
        />
      </figure>
    </div>
  );
}
