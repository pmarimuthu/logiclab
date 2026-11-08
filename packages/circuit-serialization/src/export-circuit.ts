import type { CircuitDocument, Diagnostic } from '@logiclab/circuit-domain';
import { validateCircuitSchema } from './schema-validators';

export type ExportResult = { ok: true; text: string } | { ok: false; diagnostics: Diagnostic[] };

export function exportCircuitText(document: CircuitDocument): ExportResult {
  const copy = JSON.parse(JSON.stringify(document)) as unknown;
  const diagnostics = validateCircuitSchema(copy);
  if (diagnostics.length > 0) return { ok: false, diagnostics };
  return { ok: true, text: `${JSON.stringify(copy, null, 2)}\n` };
}

export function suggestedFileName(document: CircuitDocument): string {
  const base = document.metadata.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `${base || 'circuit'}.logiclab.json`;
}
