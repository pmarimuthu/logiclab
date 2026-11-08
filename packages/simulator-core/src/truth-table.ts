import {
  diagnostic,
  type Bit,
  type CircuitDocument,
  type DefinitionResolver,
  type Diagnostic,
  type LogicValue,
} from '@logiclab/circuit-domain';
import { evaluatePlan } from './evaluate';
import { prepareCircuit } from './prepare';
import { toLogicValue } from './simulate';

export const DEFAULT_TRUTH_TABLE_MAX_INPUTS = 10;

export interface TruthTableRow {
  inputs: LogicValue[];
  outputs: LogicValue[];
}

export interface TruthTable {
  inputs: string[];
  outputs: string[];
  rows: TruthTableRow[];
}

export interface TruthTableResult {
  status: 'COMPLETED' | 'INVALID' | 'LIMIT_REACHED';
  table?: TruthTable;
  diagnostics: Diagnostic[];
}

export function generateTruthTable(
  document: CircuitDocument,
  resolver: DefinitionResolver,
  maxInputs: number = DEFAULT_TRUTH_TABLE_MAX_INPUTS,
): TruthTableResult {
  const prepared = prepareCircuit(document, resolver);
  if (!prepared.ok) return { status: 'INVALID', diagnostics: prepared.diagnostics };

  const { plan } = prepared;
  const count = plan.inputIds.length;
  if (count > maxInputs) {
    return {
      status: 'LIMIT_REACHED',
      diagnostics: [
        diagnostic({
          code: 'SIMULATION_LIMIT_REACHED',
          stage: 'SIMULATION',
          message: `This circuit has ${count} inputs. A truth table is limited to ${maxInputs} inputs (${2 ** maxInputs} rows).`,
          entityType: 'CIRCUIT',
          entityId: document.model.circuitId,
          details: { inputs: count, maxInputs },
        }),
      ],
    };
  }
  const outputIds = plan.outputs.map((output) => output.instanceId);
  const rows: TruthTableRow[] = [];
  for (let row = 0; row < 2 ** count; row += 1) {
    const values = new Map<string, Bit>();
    const inputBits = plan.inputIds.map((id, column) => {
      const bit: Bit = (row >> (count - 1 - column)) & 1 ? 1 : 0;
      values.set(id, bit);
      return toLogicValue(bit);
    });
    const evaluation = evaluatePlan(plan, values);
    rows.push({
      inputs: inputBits,
      outputs: outputIds.map((id) => toLogicValue(evaluation.outputs.get(id) ?? 0)),
    });
  }
  return {
    status: 'COMPLETED',
    table: { inputs: plan.inputIds, outputs: outputIds, rows },
    diagnostics: prepared.diagnostics,
  };
}
