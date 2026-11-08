import type { CircuitDocument } from '@logiclab/circuit-domain';
import { EXPERIMENTS, findExperiment, type Experiment } from '@logiclab/learning-content';
import { useState } from 'react';
import { STARTER_CIRCUITS, type StarterCircuit } from './circuits';
import { ExperimentView } from './experiment/ExperimentView';
import { LabView } from './lab/LabView';
import { BasicsView } from './learn/BasicsView';

type Tab = 'basics' | 'experiment' | 'lab';

const TABS: readonly { id: Tab; icon: string; label: string; short: string }[] = [
  { id: 'basics', icon: '📘', label: '1. Learn the basics', short: 'Learn' },
  { id: 'experiment', icon: '🧪', label: '2. Guided experiment', short: 'Experiment' },
  { id: 'lab', icon: '🔧', label: '3. Free lab', short: 'Lab' },
];

function first<T>(items: readonly T[]): T {
  const item = items[0];
  if (item === undefined) throw new Error('Empty list');
  return item;
}

const FIRST_STARTER: StarterCircuit = first(STARTER_CIRCUITS);
const FIRST_EXPERIMENT: Experiment = first(EXPERIMENTS);

function Logo() {
  return (
    <svg viewBox="0 0 40 28" className="logo" aria-hidden="true">
      <path d="M8,2 H20 A12,12 0 0 1 20,26 H8 Z" />
      <line x1={0} y1={9} x2={8} y2={9} />
      <line x1={0} y1={19} x2={8} y2={19} />
      <line x1={32} y1={14} x2={40} y2={14} />
    </svg>
  );
}

export function App() {
  const [tab, setTab] = useState<Tab>('basics');
  const [experiment, setExperiment] = useState<Experiment>(FIRST_EXPERIMENT);
  const [lab, setLab] = useState<{ circuit: CircuitDocument; key: number }>({
    circuit: FIRST_STARTER.document,
    key: 0,
  });

  const startExperiment = (id: string): void => {
    setExperiment(findExperiment(id) ?? FIRST_EXPERIMENT);
    setTab('experiment');
  };
  const openInLab = (circuit: CircuitDocument): void => {
    setLab((current) => ({ circuit, key: current.key + 1 }));
    setTab('lab');
  };

  return (
    <div className="app">
      <header className="app-header">
        <Logo />
        <h1>LogicLab</h1>
        <span className="tag">Learn digital logic by doing</span>
      </header>
      <div className="tab-container">
        <div className="tab-strip" role="tablist" aria-label="Sections">
          {TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              id={`tab-${item.id}`}
              aria-selected={tab === item.id}
              aria-controls="tab-body"
              className={tab === item.id ? 'tab active' : 'tab'}
              data-testid={`tab-${item.id}`}
              onClick={() => setTab(item.id)}
            >
              <span aria-hidden="true">{item.icon}</span>
              <span className="tab-long">{item.label}</span>
              <span className="tab-short">{item.short}</span>
            </button>
          ))}
        </div>
        <div className="tab-body" id="tab-body" role="tabpanel" aria-labelledby={`tab-${tab}`}>
          {tab === 'basics' && (
            <BasicsView
              onStartExperiment={startExperiment}
              onTryInLab={(guide) => openInLab(guide.circuit)}
            />
          )}
          {tab === 'experiment' && (
            <ExperimentView
              key={experiment.id}
              experiment={experiment}
              onChoose={startExperiment}
            />
          )}
          {tab === 'lab' && <LabView key={lab.key} initialCircuit={lab.circuit} />}
        </div>
      </div>
    </div>
  );
}
