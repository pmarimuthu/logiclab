import { buildCircuit } from '@logiclab/circuit-domain';
import type { Experiment } from '../types';

export const OR_DOORBELL: Experiment = {
  id: 'or-doorbell',
  title: 'OR gate — Doorbell with two buttons',
  gate: 'or',
  story: [
    'Your house has a doorbell button at the gate and another at the main door.',
    'A visitor can press any one of them.',
    'The bell must ring if any button is pressed.',
    'This is exactly how an OR gate works.',
  ],
  youWillLearn: ['The OR rule', 'How OR is different from AND'],
  circuit: buildCircuit({
    id: 'or-doorbell',
    name: 'Doorbell',
    sources: [
      { id: 'gate-button', kind: 'input', label: 'Gate button' },
      { id: 'door-button', kind: 'input', label: 'Main door button' },
    ],
    gates: [{ id: 'or-gate', type: 'or', inputs: ['gate-button', 'door-button'] }],
    outputs: [{ id: 'bell', from: 'or-gate', label: 'Doorbell' }],
  }),
  inputIds: ['gate-button', 'door-button'],
  outputId: 'bell',
  meanings: {
    'gate-button': { on: 'PRESSED', off: 'NOT PRESSED' },
    'door-button': { on: 'PRESSED', off: 'NOT PRESSED' },
    bell: { on: 'RINGING', off: 'SILENT' },
  },
  steps: [
    {
      id: 'meet',
      title: 'Meet the circuit',
      doThis: ['Both buttons are NOT PRESSED (0).', 'No action needed. Click "Next step".'],
      target: { 'gate-button': '0', 'door-button': '0' },
      expect: { bell: '0' },
      impact: [
        'No button is pressed.',
        'OR needs at least one input to be 1.',
        'The bell is SILENT (0).',
      ],
    },
    {
      id: 'gate-only',
      title: 'Press the gate button',
      doThis: ['Click "Gate button" (0 → 1).'],
      target: { 'gate-button': '1', 'door-button': '0' },
      expect: { bell: '1' },
      impact: [
        'One button is pressed.',
        'For OR, one input at 1 is enough.',
        'The bell is RINGING. The output changed from 0 to 1.',
      ],
    },
    {
      id: 'door-only',
      title: 'Use the other button',
      doThis: ['Release the gate button (1 → 0).', 'Press the main door button (0 → 1).'],
      target: { 'gate-button': '0', 'door-button': '1' },
      expect: { bell: '1' },
      impact: ['Again one button is pressed.', 'Any button works.', 'The bell is still RINGING.'],
    },
    {
      id: 'both',
      title: 'Guess first, then press both',
      doThis: ['Answer the question first.', 'Then press both buttons.'],
      predict: { question: 'If both buttons are pressed, will the bell ring?', outputId: 'bell' },
      target: { 'gate-button': '1', 'door-button': '1' },
      expect: { bell: '1' },
      impact: [
        'Both inputs are 1.',
        'OR gives 1 when one or more inputs are 1.',
        'The bell is RINGING. Here OR and AND give the same answer.',
      ],
    },
    {
      id: 'table',
      title: 'Check your truth table',
      doThis: ['Compare "Your observations" with the full OR truth table.'],
      showTruthTable: true,
      impact: [
        'Three rows give 1. Only the row with both 0 gives 0.',
        'AND had only one row with 1. OR has three.',
        'You have learnt the OR rule!',
      ],
    },
  ],
  summary: [
    'OR rule: output is 1 when any input is 1.',
    'Real life: doorbell with two buttons, bus bell.',
    'Next: try the XOR staircase light experiment.',
  ],
};
