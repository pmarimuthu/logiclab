import {
  SUPPORTED_SCHEMA_VERSION,
  asWarnings,
  diagnostic,
  hasErrors,
  validateCircuit,
  type CircuitDocument,
  type DefinitionResolver,
  type Diagnostic,
} from '@logiclab/circuit-domain';
import { R1_LIMITS, exceedsDepth, utf8ByteLength, type ImportLimits } from './limits';
import { validateCircuitSchema } from './schema-validators';

export type ImportResult =
  | { ok: true; document: CircuitDocument; diagnostics: Diagnostic[] }
  | { ok: false; diagnostics: Diagnostic[] };

function fail(code: Diagnostic['code'], message: string): ImportResult {
  return {
    ok: false,
    diagnostics: [diagnostic({ code, stage: 'DOCUMENT', message, entityType: 'DOCUMENT' })],
  };
}

function schemaVersionOf(value: unknown): unknown {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return undefined;
  return (value as Record<string, unknown>)['schemaVersion'];
}

function checkSize(document: CircuitDocument, limits: ImportLimits): ImportResult | undefined {
  const { instances, nets } = document.model;
  if (instances.length <= limits.maxInstances && nets.length <= limits.maxNets) return undefined;
  return fail(
    'CIRCUIT_TOO_LARGE',
    `This circuit has ${instances.length} components and ${nets.length} nets. The limit is ${limits.maxInstances} components and ${limits.maxNets} nets.`,
  );
}

export function importCircuitText(
  text: string,
  resolver: DefinitionResolver,
  limits: ImportLimits = R1_LIMITS,
): ImportResult {
  if (utf8ByteLength(text) > limits.maxBytes) {
    return fail(
      'DOCUMENT_TOO_LARGE',
      `The file is larger than ${Math.round(limits.maxBytes / 1024)} KB. Choose a smaller circuit file.`,
    );
  }
  if (exceedsDepth(text, limits.maxDepth)) {
    return fail(
      'DOCUMENT_TOO_DEEP',
      `The file is nested more than ${limits.maxDepth} levels deep.`,
    );
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return fail(
      'DOCUMENT_INVALID_JSON',
      'The file is not valid JSON. Check that it is a LogicLab circuit file.',
    );
  }
  const version = schemaVersionOf(parsed);
  if (version !== SUPPORTED_SCHEMA_VERSION) {
    return fail(
      'DOCUMENT_SCHEMA_UNSUPPORTED',
      `Schema version "${String(version)}" is not supported. This app reads version ${SUPPORTED_SCHEMA_VERSION}.`,
    );
  }
  const schemaDiagnostics = validateCircuitSchema(parsed);
  if (schemaDiagnostics.length > 0) return { ok: false, diagnostics: schemaDiagnostics };

  const document = parsed as CircuitDocument;
  const sizeFailure = checkSize(document, limits);
  if (sizeFailure !== undefined) return sizeFailure;

  const validation = validateCircuit(document, resolver);
  if (hasErrors(validation.diagnostics, 'STRUCTURE')) {
    return { ok: false, diagnostics: validation.diagnostics };
  }
  const readiness = validation.diagnostics.filter((item) => item.stage === 'READINESS');
  const others = validation.diagnostics.filter((item) => item.stage !== 'READINESS');
  return { ok: true, document, diagnostics: [...others, ...asWarnings(readiness)] };
}
