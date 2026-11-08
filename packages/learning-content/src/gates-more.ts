import { defineGuide } from './gate-guide';

export const NAND_GUIDE = defineGuide({
  type: 'nand',
  rule: 'Opposite of AND. Output is 0 only when ALL inputs are 1.',
  remember: ['NAND = NOT + AND.', 'Engineers can build every other gate using only NAND gates.'],
  example: {
    title: 'Car seat-belt warning light',
    points: [
      'Input A: driver belt fastened. Input B: front passenger belt fastened.',
      'The warning light stays ON until BOTH belts are fastened.',
      'Both fastened (1, 1) → warning light OFF (0).',
    ],
  },
  a: { name: 'Driver belt', short: 'Driver', on: 'FASTENED', off: 'OPEN' },
  b: { name: 'Passenger belt', short: 'Passenger', on: 'FASTENED', off: 'OPEN' },
  y: { name: 'Warning light', on: 'ON', off: 'OFF' },
  check: {
    question:
      'Both the driver and the passenger have fastened their belts. What is the warning light doing?',
    a: '1',
    b: '1',
    answer: '0',
    explain:
      'NAND gives 0 only when ALL inputs are 1. Both belts are fastened, so the warning goes OFF.',
  },
});

export const NOR_GUIDE = defineGuide({
  type: 'nor',
  rule: 'Opposite of OR. Output is 1 only when ALL inputs are 0.',
  remember: ['NOR = NOT + OR.', 'Any one input at 1 makes the output 0.'],
  example: {
    title: 'Exam hall "all quiet" green light',
    points: [
      'Each of two students has a help button.',
      'The green light is ON only when nobody is pressing a help button.',
      'Any one press (1) → green light OFF (0).',
    ],
  },
  a: { name: 'Student 1 help button', short: 'Student 1', on: 'PRESSED', off: 'NOT PRESSED' },
  b: { name: 'Student 2 help button', short: 'Student 2', on: 'PRESSED', off: 'NOT PRESSED' },
  y: { name: '"All quiet" light', on: 'ON', off: 'OFF' },
  check: {
    question: 'Nobody presses a help button. What is the green light doing?',
    a: '0',
    b: '0',
    answer: '1',
    explain: 'NOR gives 1 only when ALL inputs are 0. Nobody pressed, so the light is ON.',
  },
});

export const XOR_GUIDE = defineGuide({
  type: 'xor',
  rule: 'Output is 1 when the inputs are DIFFERENT.',
  remember: ['XOR = "exclusive OR" — one or the other, but not both.', 'Same inputs → 0.'],
  example: {
    title: 'Staircase light with two switches',
    points: [
      'One switch at the bottom of the stairs, one at the top.',
      'Flip any one switch and the light changes (ON ↔ OFF).',
      'Common in Indian homes for staircases and long corridors.',
    ],
  },
  a: { name: 'Bottom switch', short: 'Bottom', on: 'UP', off: 'DOWN' },
  b: { name: 'Top switch', short: 'Top', on: 'UP', off: 'DOWN' },
  y: { name: 'Stair light', on: 'ON', off: 'OFF' },
  check: {
    question: 'Both stair switches are UP. What is the light doing?',
    a: '1',
    b: '1',
    answer: '0',
    explain: 'XOR gives 1 only when inputs are DIFFERENT. Both are UP (same), so the light is OFF.',
  },
  experimentId: 'xor-staircase',
});

export const XNOR_GUIDE = defineGuide({
  type: 'xnor',
  rule: 'Output is 1 when the inputs are the SAME.',
  remember: ['XNOR = NOT + XOR.', 'It is an "equal or not?" checker.'],
  example: {
    title: 'Answer match checker',
    points: [
      'Two students answer the same Yes/No question.',
      'A green tick shows when both answers match.',
      'Yes-Yes (1, 1) or No-No (0, 0) → tick ON (1).',
    ],
  },
  a: { name: 'Student 1 answer', short: 'Student 1', on: 'YES', off: 'NO' },
  b: { name: 'Student 2 answer', short: 'Student 2', on: 'YES', off: 'NO' },
  y: { name: 'Match tick', on: 'SHOWN', off: 'HIDDEN' },
  check: {
    question: 'Both students answer NO. What happens to the tick?',
    a: '0',
    b: '0',
    answer: '1',
    explain: 'XNOR gives 1 when inputs are the SAME. NO and NO match, so the tick is SHOWN.',
  },
});
