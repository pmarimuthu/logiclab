import type { LogicValue } from '@logiclab/circuit-domain';
import type { GateGuide } from '@logiclab/learning-content';
import { useState } from 'react';

interface QuickCheckProps {
  guide: GateGuide;
  onShowMe: (inputs: Record<string, string>) => void;
}

export function QuickCheck({ guide, onShowMe }: QuickCheckProps) {
  const [answer, setAnswer] = useState<LogicValue>();
  const { quickCheck } = guide;
  const output = guide.labels[guide.outputId];
  const correct = answer === quickCheck.answer;
  return (
    <div className="quick-check" data-testid="quick-check">
      <p className="question">{quickCheck.question}</p>
      <div className="option-row">
        {(['1', '0'] as const).map((value) => (
          <button
            key={value}
            type="button"
            className={answer === value ? 'button chosen' : 'button'}
            aria-pressed={answer === value}
            data-testid={`check-${value}`}
            onClick={() => setAnswer(value)}
          >
            {value === '1' ? output?.on : output?.off} ({value})
          </button>
        ))}
      </div>
      {answer !== undefined && (
        <div className={correct ? 'feedback good' : 'feedback try'} role="status">
          <strong>{correct ? 'Correct! ✓' : 'Not quite — try to think again.'}</strong>{' '}
          {quickCheck.explain}{' '}
          <button type="button" className="link-button" onClick={() => onShowMe(quickCheck.inputs)}>
            Show me in the picture
          </button>
        </div>
      )}
    </div>
  );
}
