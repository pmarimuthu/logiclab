"""Check LogicLab contracts: schema validation (Draft 2020-12), registry rules,
semantic circuit rules (MVP) and reference truth tables.
Usage: python3 -I check_contracts.py <component-schema> <circuit-schema> <registry> <fixture>..."""
import itertools
import json
import sys

from jsonschema import Draft202012Validator, FormatChecker

comp_schema_p, circ_schema_p, registry_p, *fixtures = sys.argv[1:]
load = lambda p: json.load(open(p, encoding="utf-8"))
comp_v = Draft202012Validator(load(comp_schema_p), format_checker=FormatChecker())
circ_v = Draft202012Validator(load(circ_schema_p), format_checker=FormatChecker())
for s in (comp_v, circ_v):
    Draft202012Validator.check_schema(s.schema)

problems = 0


def fail(msg):
    global problems
    problems += 1
    print("  FAIL:", msg)


# ---------- registry ----------
reg = load(registry_p)
defs = {}
print(f"Registry {reg['registryId']} {reg['registryVersion']}")
for d in reg["definitions"]:
    for e in comp_v.iter_errors(d):
        fail(f"{d.get('definitionId')}: schema: {e.message}")
    key = (d["definitionId"], d["version"])
    if key in defs:
        fail(f"duplicate definition {key}")
    pin_ids = [p["pinId"] for p in d["pins"]]
    if len(pin_ids) != len(set(pin_ids)):
        fail(f"{key}: duplicate pin IDs")
    layout_pins = set(d.get("visualMetadata", {}).get("pinLayout", {}))
    if layout_pins and layout_pins != set(pin_ids):
        fail(f"{key}: pinLayout keys {layout_pins} != pins {set(pin_ids)}")
    defs[key] = d
print(f"  {len(defs)} definitions checked")

# ---------- reference models (binary MVP) ----------
MODELS = {
    "model.logic.and": lambda i: i["a"] & i["b"],
    "model.logic.or": lambda i: i["a"] | i["b"],
    "model.logic.nand": lambda i: 1 - (i["a"] & i["b"]),
    "model.logic.nor": lambda i: 1 - (i["a"] | i["b"]),
    "model.logic.xor": lambda i: i["a"] ^ i["b"],
    "model.logic.xnor": lambda i: 1 - (i["a"] ^ i["b"]),
    "model.logic.not": lambda i: 1 - i["a"],
}
for d in defs.values():
    if d["category"] == "LOGIC_GATE" and d["simulationModelId"] not in MODELS:
        fail(f"no reference model for {d['simulationModelId']}")


def check_and_simulate(path):
    doc = load(path)
    print(f"Fixture {path.split('/')[-1]}")
    errs = list(circ_v.iter_errors(doc))
    for e in errs:
        fail(f"schema: {e.message}")
    if errs:
        return
    m = doc["model"]
    inst = {}
    for i in m["instances"]:
        if i["instanceId"] in inst:
            fail(f"CIRCUIT_DUPLICATE_INSTANCE_ID {i['instanceId']}")
        key = (i["definition"]["definitionId"], i["definition"]["version"])
        if key not in defs:
            fail(f"DEFINITION_NOT_FOUND {key}")
            continue
        inst[i["instanceId"]] = (i, defs[key])
    pin_net, drivers = {}, {}
    for n in m["nets"]:
        drv = []
        for ep in n["endpoints"]:
            if ep["instanceId"] not in inst:
                fail(f"NET_ENDPOINT_INVALID {n['netId']}: {ep}")
                continue
            d = inst[ep["instanceId"]][1]
            p = next((p for p in d["pins"] if p["pinId"] == ep["pinId"]), None)
            if p is None:
                fail(f"PIN_NOT_FOUND {ep}")
                continue
            if p["width"] != n["width"]:
                fail(f"NET_WIDTH_MISMATCH {n['netId']}")
            k = (ep["instanceId"], ep["pinId"])
            if k in pin_net:
                fail(f"pin {k} on two nets")
            pin_net[k] = n["netId"]
            if p["direction"] == "OUTPUT":
                drv.append(k)
        if len(drv) == 0:
            fail(f"NET_NO_DRIVER {n['netId']}")
        if len(drv) > 1:
            fail(f"NET_MULTIPLE_DRIVERS {n['netId']}")
        drivers[n["netId"]] = drv[0] if drv else None
    for iid, (_, d) in inst.items():
        for p in d["pins"]:
            if p["direction"] == "INPUT" and p["required"] and (iid, p["pinId"]) not in pin_net:
                fail(f"required input not driven: {iid}.{p['pinId']}")
    if set(doc["layout"]["componentPositions"]) != set(inst):
        fail("layout positions do not match instances")

    # topological evaluation for every input combination
    sources = [iid for iid, (_, d) in inst.items() if d["category"] == "INPUT"]
    outputs = [iid for iid, (_, d) in inst.items() if d["category"] == "OUTPUT"]
    gates = [iid for iid, (_, d) in inst.items() if d["category"] == "LOGIC_GATE"]
    deps = {g: {drivers[pin_net[(g, p["pinId"])]][0] for p in inst[g][1]["pins"]
                if p["direction"] == "INPUT"} for g in gates}
    order, done = [], set(sources) | {iid for iid, (_, d) in inst.items() if d["category"] == "CONSTANT"}
    while len(order) < len(gates):
        ready = [g for g in gates if g not in done and deps[g] <= done]
        if not ready:
            fail("COMBINATIONAL_CYCLE")
            return
        for g in sorted(ready):
            order.append(g)
            done.add(g)
    print(f"  valid; eval order: {order}")
    print("  " + " ".join(sources) + " | " + " ".join(outputs))
    table = []
    for combo in itertools.product([0, 1], repeat=len(sources)):
        val = {}
        for s, v in zip(sources, combo):
            val[(s, "out")] = v
        for iid, (i, d) in inst.items():
            if d["category"] == "CONSTANT":
                val[(iid, "out")] = int(i["parameters"]["value"])
        for g in order:
            d = inst[g][1]
            ins = {p["pinId"]: val[drivers[pin_net[(g, p["pinId"])]]]
                   for p in d["pins"] if p["direction"] == "INPUT"}
            val[(g, "y")] = MODELS[d["simulationModelId"]](ins)
        row = [val[drivers[pin_net[(o, "in")]]] for o in outputs]
        table.append((combo, row))
        print("  " + " ".join(map(str, combo)) + " | " + " ".join(map(str, row)))
    return table


tables = {f: check_and_simulate(f) for f in fixtures}

# Expected reference vectors (07_TEST_STRATEGY.md §3)
EXPECT = {
    "and-gate": [[0], [0], [0], [1]],
    "half-adder": [[0, 0], [1, 0], [1, 0], [0, 1]],  # sum, carry
}
for f, t in tables.items():
    for name, exp in EXPECT.items():
        if name in f and t is not None:
            got = [row for _, row in t]
            if got != exp:
                fail(f"{name}: expected {exp}, got {got}")
            else:
                print(f"Reference vectors OK for {name}")

print("RESULT:", "PASS" if problems == 0 else f"{problems} problem(s)")
sys.exit(1 if problems else 0)
