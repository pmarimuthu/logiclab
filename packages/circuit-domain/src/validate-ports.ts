import { diagnostic, type Diagnostic } from './diagnostics';
import type { PortTerminal } from './resolved';
import type { CircuitDocument } from './types';

export interface PortAttachment {
  terminal: PortTerminal;
  direction: 'INPUT' | 'OUTPUT';
}

export interface PortValidation {
  diagnostics: Diagnostic[];
  portsByNet: Map<string, PortAttachment[]>;
}

export function validatePorts(document: CircuitDocument): PortValidation {
  const diagnostics: Diagnostic[] = [];
  const portsByNet = new Map<string, PortAttachment[]>();
  const netWidths = new Map(document.model.nets.map((net) => [net.netId, net.width]));
  const seen = new Set<string>();

  for (const port of document.model.ports) {
    if (seen.has(port.portId)) {
      diagnostics.push(
        diagnostic({
          code: 'PORT_ID_DUPLICATE',
          stage: 'STRUCTURE',
          message: `Port ID "${port.portId}" is used more than once. Give each port a unique ID.`,
          entityType: 'PORT',
          entityId: port.portId,
        }),
      );
      continue;
    }
    seen.add(port.portId);
    const netWidth = netWidths.get(port.netId);
    if (netWidth === undefined) {
      diagnostics.push(
        diagnostic({
          code: 'PORT_NET_NOT_FOUND',
          stage: 'STRUCTURE',
          message: `Port "${port.name}" points to net "${port.netId}", which does not exist. Connect the port to a net.`,
          entityType: 'PORT',
          entityId: port.portId,
        }),
      );
      continue;
    }
    if (netWidth !== port.width) {
      diagnostics.push(
        diagnostic({
          code: 'NET_WIDTH_MISMATCH',
          stage: 'STRUCTURE',
          message: `Port "${port.name}" is ${port.width} bit(s) wide but net "${port.netId}" is ${netWidth}. Make the widths match.`,
          entityType: 'PORT',
          entityId: port.portId,
          details: { expected: netWidth, actual: port.width },
        }),
      );
      continue;
    }
    const list = portsByNet.get(port.netId) ?? [];
    list.push({ terminal: { kind: 'PORT', portId: port.portId }, direction: port.direction });
    portsByNet.set(port.netId, list);
  }
  return { diagnostics, portsByNet };
}
