import { diagnostic, type Diagnostic } from '@logiclab/circuit-domain';
import circuitSchema from '@logiclab/contracts/schemas/circuit-document-1.0.schema.json';
import componentSchema from '@logiclab/contracts/schemas/component-definition-1.0.schema.json';
import { Ajv2020, type ErrorObject, type ValidateFunction } from 'ajv/dist/2020.js';
import addFormatsModule from 'ajv-formats';

const addFormats = addFormatsModule as unknown as (ajv: Ajv2020) => Ajv2020;

let compiled: { circuit: ValidateFunction; component: ValidateFunction } | undefined;

function validators(): { circuit: ValidateFunction; component: ValidateFunction } {
  if (compiled === undefined) {
    const ajv = new Ajv2020({ strict: true, allErrors: true, allowUnionTypes: true });
    addFormats(ajv);
    compiled = {
      circuit: ajv.compile(circuitSchema),
      component: ajv.compile(componentSchema),
    };
  }
  return compiled;
}

function toDiagnostics(errors: ErrorObject[] | null | undefined, limit: number): Diagnostic[] {
  return (errors ?? []).slice(0, limit).map((error) =>
    diagnostic({
      code: 'DOCUMENT_SCHEMA_INVALID',
      stage: 'DOCUMENT',
      message: `${error.instancePath || '(document)'} ${error.message ?? 'is invalid'}.`,
      entityType: 'DOCUMENT',
      details: { path: error.instancePath, keyword: error.keyword },
    }),
  );
}

export function validateCircuitSchema(value: unknown, limit = 20): Diagnostic[] {
  const validate = validators().circuit;
  return validate(value) ? [] : toDiagnostics(validate.errors, limit);
}

export function validateComponentDefinitionSchema(value: unknown, limit = 20): Diagnostic[] {
  const validate = validators().component;
  return validate(value) ? [] : toDiagnostics(validate.errors, limit);
}
