/* Generated from contracts/schemas/circuit-document-1.0.schema.json by tools/generate-types.mjs. Do not edit. */

export type Id = string;
export type ParameterValue = string | number | boolean;

/**
 * Portable LogicLab circuit document. Semantic validation (unique IDs, pin direction, driver count, graph cycles, component resolution, and the rule that endpoints plus attached circuit ports must be at least 2 per net) is performed by the application in addition to this structural schema. Revision 1.0-r2 (BRD v1.1, gap G-09): net endpoints minItems lowered from 2 to 1 so that a net fed by a circuit INPUT port can have a single instance endpoint.
 */
export interface LogicLabCircuitDocument10 {
  schemaVersion: '1.0';
  metadata: Metadata;
  model: CircuitModel;
  layout: Layout;
}
export interface Metadata {
  documentId: Id;
  name: string;
  description?: string;
  createdAt?: string;
  modifiedAt?: string;
  /**
   * @maxItems 30
   */
  tags?: string[];
}
export interface CircuitModel {
  circuitId: Id;
  name: string;
  description?: string;
  /**
   * @maxItems 10000
   */
  instances: Instance[];
  /**
   * @maxItems 20000
   */
  nets: Net[];
  /**
   * @maxItems 2048
   */
  ports: Port[];
  /**
   * @maxItems 1000
   */
  dependencies?: Dependency[];
}
export interface Instance {
  instanceId: Id;
  definition: DefinitionRef;
  label?: string;
  parameters: {
    [k: string]: ParameterValue;
  };
}
export interface DefinitionRef {
  definitionId: Id;
  version: string;
}
export interface Net {
  netId: Id;
  name?: string;
  width: number;
  /**
   * @minItems 1
   */
  endpoints: [Endpoint, ...Endpoint[]];
}
/**
 * A component instance pin. Circuit boundary ports are NOT endpoints; a port refers to its net through port.netId.
 */
export interface Endpoint {
  instanceId: Id;
  pinId: Id;
}
/**
 * Public interface of the circuit. An INPUT port drives its net; an OUTPUT port observes its net.
 */
export interface Port {
  portId: Id;
  name: string;
  direction: 'INPUT' | 'OUTPUT';
  width: number;
  netId: Id;
}
export interface Dependency {
  circuitId: Id;
  version: string;
}
export interface Layout {
  componentPositions: {
    [k: string]: Position;
  };
  netRoutes: {
    /**
     * @maxItems 1000
     */
    [k: string]: Point[];
  };
  viewport?: {
    x?: number;
    y?: number;
    zoom?: number;
  };
}
export interface Position {
  x: number;
  y: number;
  rotation?: number;
}
export interface Point {
  x: number;
  y: number;
}
