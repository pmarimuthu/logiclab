import { buildCircuit } from '@logiclab/circuit-domain';
import type { Experiment } from '../types';

export const AND_LOCKER: Experiment = {
  id: 'and-locker',
  title: 'AND gate — Bank locker with two keys',
  gate: 'and',
  story: [
    'In a bank, every locker has two locks.',
    'The bank manager has one key. You, the customer, have the other key.',
    'The locker opens only when both keys are turned.',
    'This is exactly how an AND gate works.',
  ],
  youWillLearn: ['The AND rule', 'How to fill an AND truth table by yourself'],
  circuit: buildCircuit({
    id: 'and-locker',
    name: 'Bank locker',
    sources: [
      { id: 'manager-key', kind: 'input', label: "Manager's key" },
      { id: 'customer-key', kind: 'input', label: "Customer's key" },
    ],
    gates: [{ id: 'and-gate', type: 'and', inputs: ['manager-key', 'customer-key'] }],
    outputs: [{ id: 'locker', from: 'and-gate', label: 'Locker door' }],
  }),
  inputIds: ['manager-key', 'customer-key'],
  outputId: 'locker',
  meanings: {
    'manager-key': { on: 'TURNED', off: 'NOT TURNED', short: 'Manager' },
    'customer-key': { on: 'TURNED', off: 'NOT TURNED', short: 'Customer' },
    locker: { on: 'OPEN', off: 'CLOSED' },
  },
  steps: [
    {
      id: 'meet',
      title: 'Meet the circuit',
      doThis: [
        'Look at the two keys. Both are NOT TURNED (0).',
        'Look at the locker in the picture — it is CLOSED.',
        'No action needed. Click "Next step".',
      ],
      target: { 'manager-key': '0', 'customer-key': '0' },
      expect: { locker: '0' },
      impact: [
        'Both inputs are 0.',
        'AND needs both inputs to be 1.',
        'So the locker stays CLOSED (0).',
      ],
    },
    {
      id: 'manager-only',
      title: "Turn only the manager's key",
      doThis: ['Click "Manager\'s key" to turn it (0 → 1).', "Do not touch the customer's key."],
      target: { 'manager-key': '1', 'customer-key': '0' },
      expect: { locker: '0' },
      impact: [
        'Only one key is turned.',
        'For AND, one input is not enough.',
        'The locker is still CLOSED. The output did not change.',
      ],
    },
    {
      id: 'customer-only',
      title: 'Swap the keys',
      doThis: ["Turn the manager's key back (1 → 0).", "Now turn the customer's key (0 → 1)."],
      target: { 'manager-key': '0', 'customer-key': '1' },
      expect: { locker: '0' },
      impact: [
        'Again only one key is turned.',
        'It does not matter which key — order does not matter for AND.',
        'The locker is still CLOSED.',
      ],
    },
    {
      id: 'both',
      title: 'Guess first, then turn both keys',
      doThis: ['Answer the question first.', 'Then turn both keys (both = 1).'],
      predict: { question: 'If both keys are turned, will the locker open?', outputId: 'locker' },
      target: { 'manager-key': '1', 'customer-key': '1' },
      expect: { locker: '1' },
      impact: [
        'Both inputs are 1 now.',
        'This is the ONLY case where AND gives 1.',
        'The locker is OPEN. The output changed from 0 to 1.',
      ],
    },
    {
      id: 'table',
      title: 'Check your truth table',
      doThis: [
        'Look at "Your observations" — you filled it in each step.',
        'Compare it with the full AND truth table from the simulator.',
      ],
      showTruthTable: true,
      impact: [
        'You tested all 4 situations (2 inputs → 2 × 2 = 4 rows).',
        'Only one row gives 1: when both inputs are 1.',
        'You have learnt the AND rule!',
      ],
    },
  ],
  summary: [
    'AND rule: output is 1 only when all inputs are 1.',
    'Real life: bank locker, mixer grinder lid lock.',
    'Next: try the OR doorbell experiment.',
  ],
};
