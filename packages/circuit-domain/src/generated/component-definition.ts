/* Generated from contracts/schemas/component-definition-1.0.schema.json by tools/generate-types.mjs. Do not edit. */

export type Id = string;
/**
 * MAJOR.MINOR or MAJOR.MINOR.PATCH. A behaviour change needs a new MAJOR or MINOR version.
 */
export type Version = string;
export type Scalar = string | number | boolean;

/**
 * Registry-managed component definition. Revision 1.0-r2 (BRD v1.1, gap G-12): parameterSchema and visualMetadata are restricted to safe, declarative shapes. No SVG, HTML, script or free-form objects. Pin ID uniqueness, simulation model registration and version immutability are checked by the registry, not by this schema.
 */
export interface LogicLabComponentDefinition10 {
  definitionId: Id;
  version: Version;
  name: string;
  category:
    | 'LOGIC_GATE'
    | 'INPUT'
    | 'OUTPUT'
    | 'CONSTANT'
    | 'ARITHMETIC'
    | 'COMBINATIONAL'
    | 'SEQUENTIAL'
    | 'MEMORY'
    | 'TIMING'
    | 'CUSTOM'
    | 'HIERARCHICAL';
  description?: string;
  /**
   * @minItems 1
   * @maxItems 256
   */
  pins: [Pin, ...Pin[]];
  simulationModelId: Id;
  simulationModelVersion: Version;
  parameterSchema?: ParameterSchema;
  visualMetadata?: VisualMetadata;
  status?: 'ACTIVE' | 'DEPRECATED';
}
export interface Pin {
  pinId: Id;
  name: string;
  direction: 'INPUT' | 'OUTPUT' | 'BIDIRECTIONAL';
  width: number;
  required: boolean;
  description?: string;
}
/**
 * Safe subset of JSON Schema describing instance parameters. Always a closed object.
 */
export interface ParameterSchema {
  type: 'object';
  additionalProperties: false;
  /**
   * @maxItems 32
   */
  required?: Id[];
  properties: {
    [k: string]: ParameterSpec;
  };
}
export interface ParameterSpec {
  type: 'string' | 'integer' | 'number' | 'boolean';
  /**
   * @minItems 1
   * @maxItems 64
   */
  enum?: [Scalar, ...Scalar[]];
  default?: Scalar;
  minimum?: number;
  maximum?: number;
  maxLength?: number;
  description?: string;
}
/**
 * Refers to a built-in symbol by ID. Symbol artwork lives in the trusted application bundle, never in data.
 */
export interface VisualMetadata {
  symbolId: Id;
  width?: number;
  height?: number;
  pinLayout?: {
    [k: string]: {
      side: 'LEFT' | 'RIGHT' | 'TOP' | 'BOTTOM';
      offset: number;
    };
  };
}
