export const DiagnosticCodes = [
  'DOCUMENT_INVALID_JSON',
  'DOCUMENT_SCHEMA_UNSUPPORTED',
  'DOCUMENT_SCHEMA_INVALID',
  'DOCUMENT_TOO_LARGE',
  'DOCUMENT_TOO_DEEP',
  'CIRCUIT_TOO_LARGE',
  'DEFINITION_NOT_FOUND',
  'DEFINITION_VERSION_NOT_FOUND',
  'INSTANCE_ID_DUPLICATE',
  'PARAMETER_INVALID',
  'NET_ID_DUPLICATE',
  'PORT_ID_DUPLICATE',
  'PORT_NET_NOT_FOUND',
  'PIN_NOT_FOUND',
  'PIN_DIRECTION_UNSUPPORTED',
  'PIN_MULTIPLE_NETS',
  'NET_ENDPOINT_INVALID',
  'NET_WIDTH_MISMATCH',
  'NET_NO_DRIVER',
  'NET_MULTIPLE_DRIVERS',
  'NET_TOO_FEW_ENDPOINTS',
  'LAYOUT_UNKNOWN_INSTANCE',
  'INPUT_NOT_DRIVEN',
  'COMBINATIONAL_CYCLE',
  'HIERARCHY_CYCLE',
  'SIMULATION_MODEL_UNSUPPORTED',
  'SIMULATION_INPUT_INVALID',
  'SIMULATION_LIMIT_REACHED',
] as const;

export type DiagnosticCode = (typeof DiagnosticCodes)[number];
export type Severity = 'ERROR' | 'WARNING' | 'INFO';
export type ValidationStage = 'DOCUMENT' | 'STRUCTURE' | 'READINESS' | 'SIMULATION';
export type EntityType = 'DOCUMENT' | 'CIRCUIT' | 'INSTANCE' | 'NET' | 'PIN' | 'PORT' | 'LAYOUT';

export interface Diagnostic {
  code: DiagnosticCode;
  severity: Severity;
  stage: ValidationStage;
  message: string;
  entityType?: EntityType;
  entityId?: string;
  details?: Record<string, string | number | boolean>;
}

export interface DiagnosticInput {
  code: DiagnosticCode;
  stage: ValidationStage;
  message: string;
  severity?: Severity;
  entityType?: EntityType;
  entityId?: string;
  details?: Record<string, string | number | boolean>;
}

export function diagnostic(input: DiagnosticInput): Diagnostic {
  const result: Diagnostic = {
    code: input.code,
    severity: input.severity ?? 'ERROR',
    stage: input.stage,
    message: input.message,
  };
  if (input.entityType !== undefined) result.entityType = input.entityType;
  if (input.entityId !== undefined) result.entityId = input.entityId;
  if (input.details !== undefined) result.details = input.details;
  return result;
}

export function hasErrors(diagnostics: readonly Diagnostic[], stage?: ValidationStage): boolean {
  return diagnostics.some(
    (item) => item.severity === 'ERROR' && (stage === undefined || item.stage === stage),
  );
}

export function asWarnings(diagnostics: readonly Diagnostic[]): Diagnostic[] {
  return diagnostics.map((item) => ({ ...item, severity: 'WARNING' }));
}
