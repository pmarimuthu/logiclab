import {
  BASICS,
  GATE_GUIDES,
  HOW_TO_USE,
  type GateGuide,
  type PointSection,
} from '@logiclab/learning-content';
import { useState } from 'react';
import { IntroArt } from '../art/IntroArt';
import { GateSlide } from './GateSlide';

interface BasicsViewProps {
  onStartExperiment: (id: string) => void;
  onTryInLab: (guide: GateGuide) => void;
}

type Slide =
  | { kind: 'intro'; key: string; chip: string; section: PointSection; first: boolean }
  | { kind: 'gate'; key: string; chip: string; guide: GateGuide };

const INTRO_CHIPS = ['What is a gate?', '1 and 0', 'Where used', 'Truth table'];

const SLIDES: readonly Slide[] = [
  ...BASICS.map((section, index) => ({
    kind: 'intro' as const,
    key: `intro-${index}`,
    chip: INTRO_CHIPS[index] ?? section.title,
    section,
    first: index === 0,
  })),
  ...GATE_GUIDES.map((guide) => ({
    kind: 'gate' as const,
    key: `gate-${guide.type}`,
    chip: guide.name,
    guide,
  })),
];

function IntroSlide({ section, first }: { section: PointSection; first: boolean }) {
  return (
    <article className="slide intro-slide">
      <div className="scene-frame">
        {section.illustration !== undefined && <IntroArt kind={section.illustration} />}
      </div>
      <section className="slide-col">
        <h2>{section.title}</h2>
        <ul className="points big">
          {section.points.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
        {first && (
          <div className="how-to">
            <p className="stage">How to use this app</p>
            <ol className="points small">
              {HOW_TO_USE.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ol>
          </div>
        )}
      </section>
    </article>
  );
}

export function BasicsView({ onStartExperiment, onTryInLab }: BasicsViewProps) {
  const [index, setIndex] = useState(0);
  const slide = SLIDES[index] ?? SLIDES[0];
  if (slide === undefined) return null;
  const go = (next: number): void => setIndex(Math.max(0, Math.min(SLIDES.length - 1, next)));

  return (
    <div className="view slides">
      <nav className="chip-row" aria-label="Lessons">
        {SLIDES.map((item, position) => (
          <button
            key={item.key}
            type="button"
            className={position === index ? 'chip active' : position < index ? 'chip done' : 'chip'}
            aria-current={position === index ? 'step' : undefined}
            data-testid={`chip-${item.key}`}
            onClick={() => go(position)}
          >
            {item.chip}
          </button>
        ))}
      </nav>
      <div className="slide-body" data-testid="slide-body">
        {slide.kind === 'intro' ? (
          <IntroSlide key={slide.key} section={slide.section} first={slide.first} />
        ) : (
          <GateSlide
            key={slide.key}
            guide={slide.guide}
            onStartExperiment={onStartExperiment}
            onTryInLab={onTryInLab}
          />
        )}
      </div>
      <div className="slide-nav">
        <button
          type="button"
          className="button"
          disabled={index === 0}
          onClick={() => go(index - 1)}
        >
          ← Back
        </button>
        <span className="muted" data-testid="slide-count">
          {index + 1} / {SLIDES.length}
        </span>
        <button
          type="button"
          className="button primary"
          disabled={index === SLIDES.length - 1}
          data-testid="slide-next"
          onClick={() => go(index + 1)}
        >
          Next →
        </button>
      </div>
    </div>
  );
}
