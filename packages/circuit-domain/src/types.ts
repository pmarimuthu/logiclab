import type {
  CircuitModel as GeneratedCircuitModel,
  DefinitionRef as GeneratedDefinitionRef,
  Endpoint as GeneratedEndpoint,
  Instance as GeneratedInstance,
  Layout as GeneratedLayout,
  LogicLabCircuitDocument10,
  Metadata as GeneratedMetadata,
  Net as GeneratedNet,
  Port as GeneratedPort,
} from './generated/circuit-document';
import type {
  LogicLabComponentDefinition10,
  ParameterSchema as GeneratedParameterSchema,
  ParameterSpec as GeneratedParameterSpec,
  Pin as GeneratedPin,
} from './generated/component-definition';

export type CircuitDocument = LogicLabCircuitDocument10;
export type CircuitMetadata = GeneratedMetadata;
export type CircuitModel = GeneratedCircuitModel;
export type CircuitLayout = GeneratedLayout;
export type ComponentInstance = GeneratedInstance;
export type DefinitionRef = GeneratedDefinitionRef;
export type Net = GeneratedNet;
export type NetEndpoint = GeneratedEndpoint;
export type CircuitPort = GeneratedPort;
export type ComponentDefinition = LogicLabComponentDefinition10;
export type PinDefinition = GeneratedPin;
export type ParameterSchema = GeneratedParameterSchema;
export type ParameterSpec = GeneratedParameterSpec;

export type LogicValue = '0' | '1';
export type Bit = 0 | 1;

export const SUPPORTED_SCHEMA_VERSION = '1.0';

export interface DefinitionResolver {
  resolve(definitionId: string, version: string): ComponentDefinition | undefined;
  hasDefinition(definitionId: string): boolean;
}
