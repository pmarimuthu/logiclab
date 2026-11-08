import type { GateGuide } from '@logiclab/learning-content';
import { useState } from 'react';
import { Scene } from '../art/Scene';
import { GateSymbol } from '../diagram/GateSymbol';
import { outputsOf, useSimulation } from '../simulation';
import { MiniTruthTable } from './MiniTruthTable';
import { QuickCheck } from './QuickCheck';

interface GateSlideProps {
  guide: GateGuide;
  onStartExperiment: (id: string) => void;
  onTryInLab: (guide: GateGuide) => void;
}

export function GateSlide({ guide, onStartExperiment, onTryInLab }: GateSlideProps) {
  const [inputs, setInputs] = useState<Record<string, string>>(() =>
    Object.fromEntries(guide.inputIds.map((id) => [id, '0'])),
  );
  const output = outputsOf(useSimulation(guide.circuit, inputs))?.[guide.outputId];
  const outLabel = guide.labels[guide.outputId];
  const toggle = (id: string): void =>
    setInputs((current) => ({ ...current, [id]: current[id] === '1' ? '0' : '1' }));

  return (
    <article className="slide gate-slide" aria-labelledby={`gate-${guide.type}`}>
      <section className="slide-col">
        <p className="stage">① See it in real life</p>
        <h2 id={`gate-${guide.type}`}>
          {guide.name} gate — {guide.example.title}
        </h2>
        <div className="scene-frame" data-testid="gate-scene">
          <Scene gate={guide.type} a={inputs['input-a']} b={inputs['input-b']} y={output} />
        </div>
        <div className="toggle-row">
          {guide.inputIds.map((id) => {
            const label = guide.labels[id];
            const on = inputs[id] === '1';
            return (
              <button
                key={id}
                type="button"
                className={on ? 'switch on' : 'switch'}
                aria-pressed={on}
                data-testid={`slide-input-${id}`}
                onClick={() => toggle(id)}
              >
                <span className="signal-name">{label?.name}</span>
                <span className="signal-meaning">{on ? label?.on : label?.off}</span>
                <span className="signal-value">{inputs[id]}</span>
              </button>
            );
          })}
          <span className="result-pill" data-testid="slide-output">
            {outLabel?.name}: <strong>{output === '1' ? outLabel?.on : outLabel?.off}</strong> (
            {output ?? '…'})
          </span>
        </div>
        <ul className="points small">
          {guide.example.points.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
      </section>
      <section className="slide-col">
        <p className="stage">② Symbol and rule</p>
        <div className="rule-row">
          <GateSymbol type={guide.type} title={`${guide.name} gate symbol`} />
          <div>
            <p className="rule">{guide.rule}</p>
            <ul className="points small">
              {guide.remember.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </div>
        </div>
        <div className="table-check">
          <div>
            <p className="stage">③ Truth table</p>
            <MiniTruthTable guide={guide} current={inputs} />
            <p className="muted tiny">Yellow row = your switches now</p>
          </div>
          <div>
            <p className="stage">④ Check yourself</p>
            <QuickCheck guide={guide} onShowMe={(next) => setInputs({ ...next })} />
          </div>
        </div>
        <div className="nav-row">
          {guide.experimentId !== undefined && (
            <button
              type="button"
              className="button primary"
              onClick={() => onStartExperiment(guide.experimentId ?? '')}
            >
              Start guided experiment
            </button>
          )}
          <button type="button" className="button" onClick={() => onTryInLab(guide)}>
            Try it in Free lab
          </button>
        </div>
      </section>
    </article>
  );
}
