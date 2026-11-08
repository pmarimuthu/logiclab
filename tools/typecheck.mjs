import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const roots = ['packages', 'apps'];
const projects = roots
  .flatMap((root) => readdirSync(root).map((name) => join(root, name)))
  .concat(['e2e'])
  .filter((dir) => existsSync(join(dir, 'tsconfig.json')));

const tsc = join('node_modules', 'typescript', 'bin', 'tsc');
let failed = 0;
for (const project of projects) {
  const result = spawnSync(process.execPath, [tsc, '--noEmit', '-p', project], {
    stdio: 'inherit',
  });
  const status = result.status === 0 ? 'ok' : 'FAILED';
  console.log(`typecheck ${project}: ${status}`);
  if (result.status !== 0) failed += 1;
}
process.exit(failed === 0 ? 0 : 1);
