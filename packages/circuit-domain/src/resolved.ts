import type { CircuitDocument, ComponentDefinition, ComponentInstance } from './types';

export interface PinTerminal {
  kind: 'PIN';
  instanceId: string;
  pinId: string;
}

export interface PortTerminal {
  kind: 'PORT';
  portId: string;
}

export type NetTerminal = PinTerminal | PortTerminal;

export interface ResolvedInstance {
  instance: ComponentInstance;
  definition: ComponentDefinition;
}

export interface ResolvedNet {
  netId: string;
  width: number;
  driver: NetTerminal;
  sinks: NetTerminal[];
}

export interface ResolvedCircuit {
  document: CircuitDocument;
  instances: Map<string, ResolvedInstance>;
  nets: Map<string, ResolvedNet>;
  pinNets: Map<string, string>;
}

export function pinKey(instanceId: string, pinId: string): string {
  return `${instanceId}.${pinId}`;
}

export function describeTerminal(terminal: NetTerminal): string {
  return terminal.kind === 'PIN'
    ? `${terminal.instanceId}.${terminal.pinId}`
    : `port ${terminal.portId}`;
}
