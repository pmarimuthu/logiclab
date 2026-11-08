import { AND_GUIDE, NOT_GUIDE, OR_GUIDE } from './gates-basic';
import { NAND_GUIDE, NOR_GUIDE, XNOR_GUIDE, XOR_GUIDE } from './gates-more';
import type { GateGuide } from './types';

export const GATE_GUIDES: readonly GateGuide[] = [
  AND_GUIDE,
  OR_GUIDE,
  NOT_GUIDE,
  NAND_GUIDE,
  NOR_GUIDE,
  XOR_GUIDE,
  XNOR_GUIDE,
];
