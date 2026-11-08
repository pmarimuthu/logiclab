import type { CircuitDocument, DiagnosticCode } from '@logiclab/circuit-domain';
import { buildCircuit, cloneCircuit } from './build';
import { gateCircuit, halfAdder } from './valid';

export interface InvalidFixture {
  testId: string;
  name: string;
  document: CircuitDocument;
  expectedCode: DiagnosticCode;
  stage: 'STRUCTURE' | 'READINESS';
}

function mutate(base: CircuitDocument, change: (document: CircuitDocument) => void) {
  const document = cloneCircuit(base);
  change(document);
  return document;
}

const danglingInput = (): CircuitDocument =>
  mutate(gateCircuit('and'), (document) => {
    document.model.nets = document.model.nets.filter((net) => net.netId !== 'net-input-b');
    document.model.instances = document.model.instances.filter(
      (item) => item.instanceId !== 'input-b',
    );
    delete document.layout.componentPositions['input-b'];
  });

const multipleDrivers = (): CircuitDocument =>
  mutate(gateCircuit('and'), (document) => {
    const net = document.model.nets.find((item) => item.netId === 'net-input-a');
    net?.endpoints.push({ instanceId: 'input-b', pinId: 'out' });
    document.model.nets = document.model.nets.filter((item) => item.netId !== 'net-input-b');
  });

const combinationalCycle = (): CircuitDocument =>
  buildCircuit({
    id: 'cycle',
    name: 'Feedback loop',
    sources: [{ id: 'input-a', kind: 'input' }],
    gates: [
      { id: 'xor-1', type: 'xor', inputs: ['input-a', 'and-1'] },
      { id: 'and-1', type: 'and', inputs: ['xor-1', 'xor-1'] },
    ],
    outputs: [{ id: 'output-y', from: 'and-1' }],
  });

const widthMismatch = (): CircuitDocument =>
  mutate(gateCircuit('and'), (document) => {
    const net = document.model.nets[0];
    if (net !== undefined) net.width = 2;
  });

const missingDefinition = (): CircuitDocument =>
  mutate(gateCircuit('and'), (document) => {
    const gate = document.model.instances.find((item) => item.instanceId === 'and-1');
    if (gate !== undefined) gate.definition = { definitionId: 'logic.mux', version: '1.0' };
  });

const missingVersion = (): CircuitDocument =>
  mutate(gateCircuit('and'), (document) => {
    const gate = document.model.instances.find((item) => item.instanceId === 'and-1');
    if (gate !== undefined) gate.definition = { definitionId: 'logic.and', version: '9.9' };
  });

const unknownPin = (): CircuitDocument =>
  mutate(halfAdder(), (document) => {
    const endpoint = document.model.nets[0]?.endpoints[2];
    if (endpoint !== undefined) endpoint.pinId = 'q';
  });

export const invalidFixtures = (): InvalidFixture[] => [
  {
    testId: 'TEST-VAL-001',
    name: 'dangling input',
    document: danglingInput(),
    expectedCode: 'INPUT_NOT_DRIVEN',
    stage: 'READINESS',
  },
  {
    testId: 'TEST-VAL-002',
    name: 'multiple drivers',
    document: multipleDrivers(),
    expectedCode: 'NET_MULTIPLE_DRIVERS',
    stage: 'STRUCTURE',
  },
  {
    testId: 'TEST-VAL-003',
    name: 'combinational cycle',
    document: combinationalCycle(),
    expectedCode: 'COMBINATIONAL_CYCLE',
    stage: 'READINESS',
  },
  {
    testId: 'TEST-VAL-004',
    name: 'width mismatch',
    document: widthMismatch(),
    expectedCode: 'NET_WIDTH_MISMATCH',
    stage: 'STRUCTURE',
  },
  {
    testId: 'TEST-VAL-005a',
    name: 'missing definition',
    document: missingDefinition(),
    expectedCode: 'DEFINITION_NOT_FOUND',
    stage: 'STRUCTURE',
  },
  {
    testId: 'TEST-VAL-005b',
    name: 'missing version',
    document: missingVersion(),
    expectedCode: 'DEFINITION_VERSION_NOT_FOUND',
    stage: 'STRUCTURE',
  },
  {
    testId: 'TEST-VAL-006',
    name: 'unknown pin',
    document: unknownPin(),
    expectedCode: 'PIN_NOT_FOUND',
    stage: 'STRUCTURE',
  },
];
