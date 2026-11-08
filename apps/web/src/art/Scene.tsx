import type { GateType } from '@logiclab/circuit-domain';
import type { ComponentType } from 'react';
import { AnswerMatchScene } from './AnswerMatchScene';
import { ExamHallScene, SeatbeltScene, StaircaseScene } from './DailyScenes';
import { DoorbellScene, LockerScene, StreetLightScene } from './HomeScenes';
import type { SceneProps } from './scene-types';

const SCENES: Record<GateType, ComponentType<SceneProps>> = {
  and: LockerScene,
  or: DoorbellScene,
  not: StreetLightScene,
  nand: SeatbeltScene,
  nor: ExamHallScene,
  xor: StaircaseScene,
  xnor: AnswerMatchScene,
};

export function Scene({ gate, ...values }: SceneProps & { gate: GateType }) {
  const Component = SCENES[gate];
  return <Component {...values} />;
}
