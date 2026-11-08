# LogicLab

Web-based digital logic laboratory — learn, design and simulate digital circuits in the browser.

**Current stage: R0 — technical proof (Gate B) + Learn preview.** Three tabs, each sized to fit the window (no page scrolling on a 1280×680 laptop view; phone layout included): **Learn the basics** — one idea per screen, each gate taught Concrete → Pictorial → Abstract (live real-life picture → symbol and rule → truth table → quick check); **Guided experiment** — Predict → Observe → Explain, with an Impact panel after every step; **Free lab** — open, import and export circuits. The drag-and-connect circuit editor comes in R1.

Product and design documents are in [`docs/`](docs/). Start with [`docs/11_BUSINESS_REQUIREMENTS_DOCUMENT.md`](docs/11_BUSINESS_REQUIREMENTS_DOCUMENT.md).

## Prerequisites (Windows, macOS or Linux)

| Tool    | Version                            | Notes                                                                                                       |
| ------- | ---------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Node.js | 22 LTS (≥ 22.13), see `.nvmrc`     | Install from nodejs.org or with nvm-windows                                                                 |
| pnpm    | 12.18.0 (pinned in `package.json`) | `npm install -g pnpm@12.18.0` — do not rely on Corepack, newer Node versions no longer ship it              |
| Python  | 3.10+ with `jsonschema>=4.18`      | Only for `pnpm contracts:check`; on Windows the command is `python`, so run the script directly (see below) |
| IDE     | IntelliJ IDEA Ultimate or VS Code  | Enable ESLint and Prettier "run on save"                                                                    |

## First run

```bash
pnpm install
pnpm dev            # http://localhost:5173
```

## Commands

| Command                        | What it does                                                                           |
| ------------------------------ | -------------------------------------------------------------------------------------- |
| `pnpm dev`                     | Start the web app with hot reload                                                      |
| `pnpm test`                    | Unit, domain, registry, serialization, simulator and worker tests (Vitest)             |
| `pnpm typecheck`               | `tsc --noEmit` for every package and app                                               |
| `pnpm lint`                    | ESLint (strict TypeScript, React hooks, no inline comments, files ≤ 200 lines)         |
| `pnpm format` / `format:check` | Prettier                                                                               |
| `pnpm depcruise`               | Module boundary rules (no React in packages, simulator only in the worker, no cycles)  |
| `pnpm gen:types`               | Regenerate TypeScript types from `contracts/schemas` (never edit `generated/` by hand) |
| `pnpm build`                   | Production build of the web app                                                        |
| `pnpm e2e`                     | Playwright browser tests (run `pnpm exec playwright install chromium` once)            |
| `pnpm verify`                  | Format, lint, typecheck, boundaries, tests and build — run before every push           |

Contract check on Windows:

```powershell
python tools/check_contracts.py contracts/schemas/component-definition-1.0.schema.json contracts/schemas/circuit-document-1.0.schema.json contracts/registry/mvp-component-definitions-1.0.json packages/test-fixtures/examples/and-gate.logiclab.json packages/test-fixtures/examples/half-adder.logiclab.json
```

## Repository structure

```text
apps/web/                    React + Vite shell (slice A); simulation runs in simulation.worker.ts
packages/
  circuit-domain/            Types (generated from schemas), diagnostics, structural + readiness validation
  component-registry/        Built-in registry, exact id + version resolution
  circuit-serialization/     Ajv (Draft 2020-12) validation, R1 import limits, import / export
  simulator-core/            Evaluation plan (topological order, cycle detection), evaluator, truth table
  simulator-worker/          Worker protocol, request/revision IDs, stale-result guard, timeout + restart
  learning-content/          Gate guides, basics and guided experiments (AND locker, OR doorbell, XOR staircase)
  test-fixtures/             Reference circuits, invalid cases, expected-output oracles
contracts/                   JSON Schemas (r2), R1 component registry, OpenAPI (for R2.2)
e2e/                         Playwright tests
tools/                       Type generation, typecheck runner, contract checker
docs/                        Blueprint 00–10, BRD, original 1.0 schemas
```

Dependency direction (enforced by `pnpm depcruise`):
`web → simulator-worker → simulator-core → circuit-domain`; `component-registry` and `circuit-serialization` depend on `circuit-domain`. Only `apps/web` may use React. The web main thread cannot import `simulator-core`.

## Gate B — R0 exit evidence

| #   | Gate B check (playbook §5)                                   | Evidence                                                       |
| --- | ------------------------------------------------------------ | -------------------------------------------------------------- |
| 1   | Versioned AND fixture loads and validates                    | `import-export.test.ts` (blueprint example files)              |
| 2   | Correct truth tables for all 7 gates, half and full adder    | `reference.test.ts` — TEST-GATE-001…007, TEST-CIR-001…006      |
| 3   | Unknown pin rejected; feedback loop reported without hanging | TEST-VAL-006, TEST-VAL-003, TEST-SIM-003                       |
| 4   | Worker runs without blocking the UI                          | `client.test.ts` (stale guard, timeout, restart); TEST-E2E-001 |
| 5   | Output states shown in the page                              | TEST-E2E-001, TEST-E2E-002                                     |
| 6   | Export → import changes nothing                              | TEST-SER-001, TEST-E2E-004                                     |
| 7   | CI runs all of the above                                     | `.github/workflows/ci.yml`                                     |

## Decisions taken during R0 build

- **TypeScript 6.0.3, not 7.x.** typescript-eslint supports TypeScript only below 6.1. Move to 7 when it does.
- **Ajv compiles schemas at runtime** (uses `new Function`). Before a strict Content Security Policy (R1, LL-064), switch to Ajv standalone pre-compiled validators.
- **Diagnostic codes follow `05` §8** (`INSTANCE_ID_DUPLICATE`, not `CIRCUIT_DUPLICATE_INSTANCE_ID` from `02` §7). New codes: `DOCUMENT_SCHEMA_INVALID`, `DOCUMENT_TOO_DEEP`, `CIRCUIT_TOO_LARGE`, `PARAMETER_INVALID`, `NET_ID_DUPLICATE`, `PORT_ID_DUPLICATE`, `PORT_NET_NOT_FOUND`, `PIN_DIRECTION_UNSUPPORTED`, `PIN_MULTIPLE_NETS`, `NET_TOO_FEW_ENDPOINTS`, `LAYOUT_UNKNOWN_INSTANCE`, `INPUT_NOT_DRIVEN`, `SIMULATION_INPUT_INVALID`. Add them to `05` §8.
- **Instance parameters are validated** against the definition's `parameterSchema` (the circuit schema alone cannot do this).
- **Two validation stages.** Structure errors block import. Readiness problems (for example an unconnected input) are warnings on import and errors on run, so unfinished circuits can still be opened.
- **Cancellation = terminate and restart the worker** after 5 s (BRL-22). A synchronous evaluation cannot be interrupted from inside the worker.

## Deploy (Vercel → https://logic.kanaksan.com)

- `vercel.json` holds the build settings (pnpm monorepo, output `apps/web/dist`) and the security headers (CSP, HSTS, no framing).
- `pnpm build && pnpm preview:prod` serves the build locally **with the same headers**; run `pnpm e2e` against it before a release.
- CSP keeps `'unsafe-eval'` only because Ajv compiles validators at runtime (Import/Export). Switching to Ajv standalone validators (R1, LL-064) removes it.
- Domain: `logic.kanaksan.com` → CNAME `cname.vercel-dns.com` at name.com.

## Next (R1 slices)

B: persistent worker session and input updates · C: SVG editor (place, connect, delete, undo/redo) and IndexedDB save · D: lessons, Play challenges, truth-table panel · E: import/export UI hardening, accessibility, performance benchmark (TEST-PERF), security tests.
