import { BankLocker } from './BankLocker';
import { isOn, type SceneProps } from './scene-types';

export function LockerScene({ a, b, y }: SceneProps) {
  return (
    <svg
      viewBox="436 26 206 182"
      className="scene"
      role="img"
      aria-label={`Bank locker. Manager key ${isOn(a) ? 'turned' : 'not turned'}, customer key ${isOn(b) ? 'turned' : 'not turned'}. Locker ${isOn(y) ? 'open' : 'closed'}.`}
    >
      <rect x={436} y={26} width={206} height={182} className="scene-wall" />
      <BankLocker
        open={isOn(y)}
        keys={[
          { label: 'Manager', turned: isOn(a) },
          { label: 'Customer', turned: isOn(b) },
        ]}
      />
    </svg>
  );
}

export function DoorbellScene({ a, b, y }: SceneProps) {
  const ring = isOn(y);
  return (
    <svg
      viewBox="0 0 320 220"
      className="scene"
      role="img"
      aria-label={`House. Gate button ${isOn(a) ? 'pressed' : 'not pressed'}, door button ${isOn(b) ? 'pressed' : 'not pressed'}. Bell ${ring ? 'ringing' : 'silent'}.`}
    >
      <rect width={320} height={220} className="sky-day" />
      <rect y={192} width={320} height={28} className="ground" />
      {[14, 38, 62, 86].map((x) => (
        <rect key={x} x={x} y={130} width={8} height={62} className="fence" />
      ))}
      <rect x={10} y={146} width={100} height={6} className="fence" />
      <rect x={10} y={172} width={100} height={6} className="fence" />
      <rect x={100} y={110} width={14} height={82} className="post" />
      <circle cx={107} cy={130} r={7} className={isOn(a) ? 'push on' : 'push'} />
      <text x={107} y={104} className="scene-label">
        Gate
      </text>
      <polygon points="130,96 220,40 310,96" className="roof" />
      <rect x={140} y={96} width={160} height={96} className="wall" />
      <rect x={156} y={116} width={30} height={26} className="window" />
      <rect x={200} y={128} width={40} height={64} className="door" />
      <circle cx={232} cy={162} r={3} className="knob" />
      <circle cx={256} cy={148} r={6} className={isOn(b) ? 'push on' : 'push'} />
      <text x={262} y={135} className="scene-label">
        Door
      </text>
      <g className={ring ? 'bell ringing' : 'bell'}>
        <path d="M208,84 Q208,62 220,60 Q232,62 232,84 Z" />
        <circle cx={220} cy={87} r={3} />
      </g>
      {ring && (
        <g className="waves">
          <path d="M200,64 Q194,72 200,80" />
          <path d="M240,64 Q246,72 240,80" />
          <path d="M192,58 Q182,72 192,86" />
          <path d="M248,58 Q258,72 248,86" />
          <text x={220} y={26} className="scene-shout">
            DING DONG!
          </text>
        </g>
      )}
    </svg>
  );
}

export function StreetLightScene({ a, y }: SceneProps) {
  const day = isOn(a);
  const lit = isOn(y);
  return (
    <svg
      viewBox="0 0 320 220"
      className="scene"
      role="img"
      aria-label={`${day ? 'Daytime' : 'Night time'}. Street light ${lit ? 'on' : 'off'}.`}
    >
      <rect width={320} height={220} className={day ? 'sky-day' : 'sky-night'} />
      {day ? (
        <g className="sun">
          <circle cx={58} cy={50} r={20} />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
            <rect
              key={angle}
              x={56}
              y={16}
              width={4}
              height={10}
              transform={`rotate(${angle} 58 50)`}
            />
          ))}
        </g>
      ) : (
        <g className="moon">
          <circle cx={58} cy={48} r={18} />
          <circle cx={66} cy={42} r={16} className="sky-night" />
          {[
            [110, 30],
            [250, 40],
            [290, 22],
            [190, 18],
          ].map(([x, yy]) => (
            <circle key={x} cx={x} cy={yy} r={2} className="star" />
          ))}
        </g>
      )}
      <rect y={190} width={320} height={30} className="road" />
      {lit && <polygon points="138,78 162,78 210,190 90,190" className="beam" />}
      <rect x={200} y={62} width={8} height={130} className="pole" />
      <path d="M204,66 Q204,56 192,56 L150,56" className="arm" />
      <polygon
        points="130,58 170,58 162,78 138,78"
        className={lit ? 'lamp-head on' : 'lamp-head'}
      />
      <rect x={210} y={96} width={18} height={12} rx={2} className="sensor" />
      <circle cx={219} cy={102} r={3} className={day ? 'sensor-eye on' : 'sensor-eye'} />
      <text x={236} y={106} className={day ? 'scene-label start' : 'scene-label start on-dark'}>
        Sensor
      </text>
    </svg>
  );
}
