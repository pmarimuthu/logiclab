import type { PointSection } from './types';

export const BASICS: readonly PointSection[] = [
  {
    title: 'What is a logic gate?',
    illustration: 'gate-concept',
    points: [
      'A logic gate is a very small electronic decision-maker.',
      'It looks at its inputs (like switches) and gives one output (like a bulb).',
      'Each gate follows one simple rule. The rule never changes.',
    ],
  },
  {
    title: 'What do 1 and 0 mean?',
    illustration: 'binary',
    points: [
      '1 means ON, YES or TRUE — current flows, the bulb glows.',
      '0 means OFF, NO or FALSE — no current, the bulb is off.',
      'Gates understand only these two values. This is called binary.',
    ],
  },
  {
    title: 'Where are logic gates used?',
    illustration: 'devices',
    points: [
      'Inside mobile phones, computers, ATMs, lifts, washing machines and traffic signals.',
      'One mobile phone chip has billions of tiny gates working together.',
      'Big ideas like adding numbers are built by joining many small gates.',
    ],
  },
  {
    title: 'How to read a truth table',
    illustration: 'truth-table',
    points: [
      'A truth table lists every possible situation, one row each.',
      'Left side: the inputs you choose. Right side: what the gate gives.',
      '2 inputs give 2 × 2 = 4 rows. 3 inputs give 2 × 2 × 2 = 8 rows.',
    ],
  },
];

export const HOW_TO_USE: readonly string[] = [
  'Learn the basics: one idea per screen. Use Next to move on.',
  'Guided experiment: guess, try, then read the Impact panel.',
  'Free lab: play with bigger circuits like adders.',
];
