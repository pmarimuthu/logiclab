import { defineGuide } from './gate-guide';

export const AND_GUIDE = defineGuide({
  type: 'and',
  rule: 'Output is 1 only when ALL inputs are 1.',
  remember: ['Think: "this AND that — both needed".', 'Even one 0 makes the output 0.'],
  example: {
    title: 'Bank locker with two keys',
    points: [
      'The manager has one key, you have the other key.',
      'The locker opens only when both keys are turned.',
      'Also: a mixer grinder runs only when the lid is locked AND the switch is ON.',
    ],
  },
  a: { name: "Manager's key", short: 'Manager', on: 'TURNED', off: 'NOT TURNED' },
  b: { name: "Customer's key", short: 'Customer', on: 'TURNED', off: 'NOT TURNED' },
  y: { name: 'Locker', on: 'OPEN', off: 'CLOSED' },
  check: {
    question: 'The manager turns his key. The customer does not turn hers. What happens?',
    a: '1',
    b: '0',
    answer: '0',
    explain: 'AND needs BOTH keys. One key is not enough, so the locker stays CLOSED.',
  },
  experimentId: 'and-locker',
});

export const OR_GUIDE = defineGuide({
  type: 'or',
  rule: 'Output is 1 when ANY input is 1.',
  remember: [
    'Think: "this OR that — any one is enough".',
    'Output is 0 only when all inputs are 0.',
  ],
  example: {
    title: 'Doorbell with two buttons',
    points: [
      'One button at the gate, one button at the main door.',
      'Press any one button and the bell rings.',
      'Also: a bus bell rings when any passenger presses it.',
    ],
  },
  a: { name: 'Gate button', short: 'Gate', on: 'PRESSED', off: 'NOT PRESSED' },
  b: { name: 'Door button', short: 'Door', on: 'PRESSED', off: 'NOT PRESSED' },
  y: { name: 'Doorbell', on: 'RINGING', off: 'SILENT' },
  check: {
    question: 'Only the door button is pressed. What does the bell do?',
    a: '0',
    b: '1',
    answer: '1',
    explain: 'OR needs ANY one input. One button is enough, so the bell RINGS.',
  },
  experimentId: 'or-doorbell',
});

export const NOT_GUIDE = defineGuide({
  type: 'not',
  rule: 'Output is the OPPOSITE of the input.',
  remember: ['Only one input.', '1 becomes 0, and 0 becomes 1. Also called an inverter.'],
  example: {
    title: 'Automatic street light',
    points: [
      'A light sensor gives 1 when there is daylight.',
      'Daylight (1) → street light OFF (0).',
      'Dark night (0) → street light ON (1).',
    ],
  },
  a: { name: 'Daylight sensor', short: 'Sensor', on: 'DAY', off: 'NIGHT' },
  y: { name: 'Street light', on: 'ON', off: 'OFF' },
  check: {
    question: 'It is a bright sunny afternoon. What is the street light doing?',
    a: '1',
    answer: '0',
    explain:
      'NOT gives the opposite. Daylight is 1, so the light is 0 — OFF. No need to waste power.',
  },
});
