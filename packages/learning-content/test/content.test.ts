import { builtinRegistry } from '@logiclab/component-registry';
import { generateTruthTable, simulate } from '@logiclab/simulator-core';
import { GATE_FORMULAS, combinations } from '@logiclab/test-fixtures';
import { describe, expect, it } from 'vitest';
import { EXPERIMENTS, GATE_GUIDES, findExperiment } from '../src';

const registry = builtinRegistry();

describe('gate guides', () => {
  it('cover all 7 gates once', () => {
    expect(GATE_GUIDES.map((item) => item.type).sort()).toEqual([
      'and',
      'nand',
      'nor',
      'not',
      'or',
      'xnor',
      'xor',
    ]);
  });

  for (const guide of GATE_GUIDES) {
    it(`${guide.name} guide circuit gives the gate's real truth table`, () => {
      const table = generateTruthTable(guide.circuit, registry).table;
      expect(table?.inputs).toEqual(guide.inputIds);
      const expected = combinations(guide.inputIds.length).map((bits) =>
        String(GATE_FORMULAS[guide.type](...bits)),
      );
      expect(table?.rows.map((row) => row.outputs[0])).toEqual(expected);
      if (guide.experimentId !== undefined) {
        expect(findExperiment(guide.experimentId)?.gate).toBe(guide.type);
      }
    });

    it(`${guide.name} quick check answer matches the simulator and labels are complete`, () => {
      for (const id of [...guide.inputIds, guide.outputId])
        expect(guide.labels[id], id).toBeDefined();
      const result = simulate(
        {
          requestId: 'check',
          circuit: guide.circuit,
          mode: 'COMBINATIONAL',
          inputs: guide.quickCheck.inputs,
        },
        registry,
      );
      expect(result.outputs[guide.outputId]).toBe(guide.quickCheck.answer);
    });
  }
});

describe('guided experiments', () => {
  for (const experiment of EXPERIMENTS) {
    describe(experiment.title, () => {
      it('has meanings for every input and the output', () => {
        for (const id of [...experiment.inputIds, experiment.outputId]) {
          expect(experiment.meanings[id], id).toBeDefined();
        }
      });

      for (const step of experiment.steps) {
        it(`step "${step.title}" expectation matches the simulator`, () => {
          if (step.target === undefined) {
            expect(step.showTruthTable).toBe(true);
            return;
          }
          expect(Object.keys(step.target).sort()).toEqual([...experiment.inputIds].sort());
          const result = simulate(
            {
              requestId: step.id,
              circuit: experiment.circuit,
              mode: 'COMBINATIONAL',
              inputs: step.target,
            },
            registry,
          );
          expect(result.status).toBe('COMPLETED');
          expect(result.outputs).toEqual(step.expect);
          if (step.predict !== undefined) {
            expect(step.expect?.[step.predict.outputId]).toBeDefined();
          }
        });
      }

      it('observed steps cover every truth-table row', () => {
        const rows = experiment.steps
          .filter((step) => step.target !== undefined)
          .map((step) => experiment.inputIds.map((id) => step.target?.[id]).join(''));
        expect(new Set(rows).size).toBe(2 ** experiment.inputIds.length);
      });
    });
  }
});
