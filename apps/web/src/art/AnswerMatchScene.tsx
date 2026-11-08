import { isOn, type SceneProps } from './scene-types';

function AnswerCard({ x, name, yes }: { x: number; name: string; yes: boolean }) {
  return (
    <g>
      <rect x={x} y={62} width={110} height={86} rx={10} className="card" />
      <text x={x + 55} y={84} className="scene-label">
        {name}
      </text>
      <rect
        x={x + 18}
        y={96}
        width={74}
        height={38}
        rx={8}
        className={yes ? 'answer yes' : 'answer no'}
      />
      <text x={x + 55} y={122} className="answer-text">
        {yes ? 'YES' : 'NO'}
      </text>
    </g>
  );
}

export function AnswerMatchScene({ a, b, y }: SceneProps) {
  const match = isOn(y);
  return (
    <svg
      viewBox="0 0 320 220"
      className="scene"
      role="img"
      aria-label={`Student 1 says ${isOn(a) ? 'yes' : 'no'}, student 2 says ${isOn(b) ? 'yes' : 'no'}. ${match ? 'Answers match, tick shown' : 'Answers differ, no tick'}.`}
    >
      <rect width={320} height={220} className="classroom" />
      <rect x={40} y={12} width={240} height={34} rx={17} className="bubble" />
      <text x={160} y={34} className="scene-label">
        Question: Is the Sun a star?
      </text>
      <AnswerCard x={22} name="Student 1" yes={isOn(a)} />
      <AnswerCard x={188} name="Student 2" yes={isOn(b)} />
      <circle cx={160} cy={180} r={24} className={match ? 'tick on' : 'tick'} />
      {match ? (
        <path d="M148,180 L157,190 L174,170" className="tick-mark" />
      ) : (
        <text x={160} y={185} className="scene-label">
          ≠
        </text>
      )}
      <text x={196} y={185} className="scene-label start">
        {match ? 'Match!' : 'Not the same'}
      </text>
    </svg>
  );
}
