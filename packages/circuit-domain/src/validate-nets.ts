import { diagnostic, type Diagnostic } from './diagnostics';
import {
  pinKey,
  type NetTerminal,
  type PinTerminal,
  type ResolvedInstance,
  type ResolvedNet,
} from './resolved';
import type { CircuitDocument, Net } from './types';
import type { PortAttachment } from './validate-ports';

export interface NetValidation {
  diagnostics: Diagnostic[];
  nets: Map<string, ResolvedNet>;
  pinNets: Map<string, string>;
}

interface Collected {
  drivers: NetTerminal[];
  sinks: NetTerminal[];
  complete: boolean;
}

function netDiagnostic(
  code: Diagnostic['code'],
  net: Net,
  message: string,
  details?: Diagnostic['details'],
): Diagnostic {
  const input = { code, stage: 'STRUCTURE' as const, message, entityType: 'NET' as const };
  return diagnostic(
    details === undefined
      ? { ...input, entityId: net.netId }
      : { ...input, entityId: net.netId, details },
  );
}

function collectEndpoints(
  net: Net,
  instances: Map<string, ResolvedInstance>,
  pinNets: Map<string, string>,
  diagnostics: Diagnostic[],
): Collected {
  const result: Collected = { drivers: [], sinks: [], complete: true };
  const local = new Set<string>();
  for (const endpoint of net.endpoints) {
    const key = pinKey(endpoint.instanceId, endpoint.pinId);
    const resolved = instances.get(endpoint.instanceId);
    if (resolved === undefined) {
      diagnostics.push(
        netDiagnostic(
          'NET_ENDPOINT_INVALID',
          net,
          `Net "${net.netId}" connects to "${endpoint.instanceId}", which is not a valid component. Remove this connection.`,
        ),
      );
      result.complete = false;
      continue;
    }
    const pin = resolved.definition.pins.find((item) => item.pinId === endpoint.pinId);
    if (pin === undefined) {
      diagnostics.push(
        netDiagnostic(
          'PIN_NOT_FOUND',
          net,
          `${endpoint.instanceId} (${resolved.definition.name}) has no pin "${endpoint.pinId}". Connect to one of: ${resolved.definition.pins.map((item) => item.pinId).join(', ')}.`,
        ),
      );
      result.complete = false;
      continue;
    }
    if (local.has(key)) {
      diagnostics.push(
        netDiagnostic(
          'NET_ENDPOINT_INVALID',
          net,
          `Pin ${key} is listed twice on net "${net.netId}".`,
        ),
      );
      continue;
    }
    local.add(key);
    const other = pinNets.get(key);
    if (other !== undefined) {
      diagnostics.push(
        netDiagnostic(
          'PIN_MULTIPLE_NETS',
          net,
          `Pin ${key} is on nets "${other}" and "${net.netId}". A pin can be on only one net.`,
        ),
      );
      result.complete = false;
      continue;
    }
    pinNets.set(key, net.netId);
    if (pin.width !== net.width) {
      diagnostics.push(
        netDiagnostic(
          'NET_WIDTH_MISMATCH',
          net,
          `Pin ${key} is ${pin.width} bit(s) wide but net "${net.netId}" is ${net.width}. Connected widths must match.`,
          { expected: pin.width, actual: net.width },
        ),
      );
      result.complete = false;
    }
    const terminal: PinTerminal = {
      kind: 'PIN',
      instanceId: endpoint.instanceId,
      pinId: pin.pinId,
    };
    if (pin.direction === 'OUTPUT') result.drivers.push(terminal);
    else if (pin.direction === 'INPUT') result.sinks.push(terminal);
    else {
      diagnostics.push(
        netDiagnostic(
          'PIN_DIRECTION_UNSUPPORTED',
          net,
          `Pin ${key} is bidirectional, which is not supported in this version.`,
        ),
      );
      result.complete = false;
    }
  }
  return result;
}

export function validateNets(
  document: CircuitDocument,
  instances: Map<string, ResolvedInstance>,
  portsByNet: Map<string, PortAttachment[]>,
): NetValidation {
  const diagnostics: Diagnostic[] = [];
  const nets = new Map<string, ResolvedNet>();
  const pinNets = new Map<string, string>();
  const seen = new Set<string>();

  for (const net of document.model.nets) {
    if (seen.has(net.netId)) {
      diagnostics.push(
        netDiagnostic('NET_ID_DUPLICATE', net, `Net ID "${net.netId}" is used more than once.`),
      );
      continue;
    }
    seen.add(net.netId);
    const collected = collectEndpoints(net, instances, pinNets, diagnostics);
    for (const port of portsByNet.get(net.netId) ?? []) {
      if (port.direction === 'INPUT') collected.drivers.push(port.terminal);
      else collected.sinks.push(port.terminal);
    }
    const terminals = collected.drivers.length + collected.sinks.length;
    if (collected.complete && terminals < 2) {
      diagnostics.push(
        netDiagnostic(
          'NET_TOO_FEW_ENDPOINTS',
          net,
          `Net "${net.netId}" has only one connection. Connect it to another pin or remove it.`,
        ),
      );
      continue;
    }
    if (collected.drivers.length === 0) {
      diagnostics.push(
        netDiagnostic(
          'NET_NO_DRIVER',
          net,
          `Net "${net.netId}" has no source. Connect it to one output, input switch or constant.`,
        ),
      );
      continue;
    }
    if (collected.drivers.length > 1) {
      diagnostics.push(
        netDiagnostic(
          'NET_MULTIPLE_DRIVERS',
          net,
          `Net "${net.netId}" is driven by ${collected.drivers.length} outputs. Keep only one output on a net.`,
          { drivers: collected.drivers.length },
        ),
      );
      continue;
    }
    const [driver] = collected.drivers;
    if (collected.complete && driver !== undefined) {
      nets.set(net.netId, { netId: net.netId, width: net.width, driver, sinks: collected.sinks });
    }
  }
  return { diagnostics, nets, pinNets };
}
