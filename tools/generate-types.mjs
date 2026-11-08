import { mkdir, writeFile } from 'node:fs/promises';
import { compileFromFile } from 'json-schema-to-typescript';

const outDir = 'packages/circuit-domain/src/generated';
const targets = [
  ['contracts/schemas/circuit-document-1.0.schema.json', 'circuit-document.ts'],
  ['contracts/schemas/component-definition-1.0.schema.json', 'component-definition.ts'],
];

await mkdir(outDir, { recursive: true });
for (const [source, target] of targets) {
  const code = await compileFromFile(source, {
    bannerComment: '/* Generated from ' + source + ' by tools/generate-types.mjs. Do not edit. */',
    additionalProperties: false,
    unreachableDefinitions: false,
    style: { singleQuote: true, printWidth: 100, trailingComma: 'all' },
  });
  await writeFile(`${outDir}/${target}`, code);
  console.log(`generated ${outDir}/${target}`);
}
