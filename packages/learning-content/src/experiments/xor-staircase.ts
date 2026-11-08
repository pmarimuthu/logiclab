import { buildCircuit } from '@logiclab/circuit-domain';
import type { Experiment } from '../types';

export const XOR_STAIRCASE: Experiment = {
  id: 'xor-staircase',
  title: 'XOR gate — Staircase light with two switches',
  gate: 'xor',
  story: [
    'A staircase has one switch at the bottom and one at the top.',
    'You switch the light ON at the bottom, climb up, and switch it OFF at the top.',
    'Flipping any one switch always changes the light.',
    'This is how an XOR gate works.',
  ],
  youWillLearn: ['The XOR rule', 'Why "different inputs" gives 1'],
  circuit: buildCircuit({
    id: 'xor-staircase',
    name: 'Staircase light',
    sources: [
      { id: 'bottom-switch', kind: 'input', label: 'Bottom switch' },
      { id: 'top-switch', kind: 'input', label: 'Top switch' },
    ],
    gates: [{ id: 'xor-gate', type: 'xor', inputs: ['bottom-switch', 'top-switch'] }],
    outputs: [{ id: 'light', from: 'xor-gate', label: 'Staircase light' }],
  }),
  inputIds: ['bottom-switch', 'top-switch'],
  outputId: 'light',
  meanings: {
    'bottom-switch': { on: 'UP', off: 'DOWN' },
    'top-switch': { on: 'UP', off: 'DOWN' },
    light: { on: 'ON', off: 'OFF' },
  },
  steps: [
    {
      id: 'meet',
      title: 'Night time — light is off',
      doThis: ['Both switches are DOWN (0).', 'No action needed. Click "Next step".'],
      target: { 'bottom-switch': '0', 'top-switch': '0' },
      expect: { light: '0' },
      impact: [
        'Both switches are the same (0 and 0).',
        'XOR gives 1 only when inputs are different.',
        'The light is OFF (0).',
      ],
    },
    {
      id: 'bottom-up',
      title: 'Switch ON at the bottom',
      doThis: ['You are at the bottom of the stairs.', 'Flip the bottom switch UP (0 → 1).'],
      target: { 'bottom-switch': '1', 'top-switch': '0' },
      expect: { light: '1' },
      impact: [
        'Now the switches are different (1 and 0).',
        'XOR gives 1.',
        'The light is ON. You can climb the stairs safely.',
      ],
    },
    {
      id: 'top-up',
      title: 'Switch OFF at the top',
      doThis: ['You reached the top.', 'Flip the top switch UP (0 → 1).'],
      target: { 'bottom-switch': '1', 'top-switch': '1' },
      expect: { light: '0' },
      impact: [
        'Both switches are UP (1 and 1) — the same again.',
        'XOR gives 0 when inputs are the same.',
        'The light is OFF, even though both switches are UP! This is where XOR differs from OR.',
      ],
    },
    {
      id: 'morning',
      title: 'Guess first — next morning',
      doThis: [
        'Someone at the bottom flips the bottom switch DOWN (1 → 0).',
        'Answer the question first, then do it.',
      ],
      predict: { question: 'Will the light come ON?', outputId: 'light' },
      target: { 'bottom-switch': '0', 'top-switch': '1' },
      expect: { light: '1' },
      impact: [
        'The switches are different again (0 and 1).',
        'XOR gives 1.',
        'The light is ON. Any one flip always changes the light.',
      ],
    },
    {
      id: 'table',
      title: 'Check your truth table',
      doThis: ['Compare "Your observations" with the full XOR truth table.'],
      showTruthTable: true,
      impact: [
        'Rows with different inputs (0-1, 1-0) give 1.',
        'Rows with same inputs (0-0, 1-1) give 0.',
        'You have learnt the XOR rule!',
      ],
    },
  ],
  summary: [
    'XOR rule: output is 1 when the inputs are different.',
    'Real life: staircase and corridor two-way switches.',
    'Fun fact: XOR is used inside computers to add binary numbers.',
  ],
};
