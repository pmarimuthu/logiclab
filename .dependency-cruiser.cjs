module.exports = {
  forbidden: [
    {
      name: 'not-to-unresolvable',
      severity: 'error',
      from: {},
      to: { couldNotResolve: true },
    },
    {
      name: 'no-circular',
      severity: 'error',
      from: {},
      to: { circular: true },
    },
    {
      name: 'packages-no-react',
      comment:
        'Domain, registry, serialization and simulator packages must not depend on React (LL-002).',
      severity: 'error',
      from: { path: '^packages/' },
      to: { path: 'node_modules/(react|react-dom)/' },
    },
    {
      name: 'packages-not-import-apps',
      severity: 'error',
      from: { path: '^packages/' },
      to: { path: '^apps/' },
    },
    {
      name: 'domain-is-leaf',
      comment: 'circuit-domain depends on no other LogicLab package.',
      severity: 'error',
      from: { path: '^packages/circuit-domain/' },
      to: { path: '^(packages/(?!circuit-domain/)|apps/)' },
    },
    {
      name: 'simulator-core-is-pure',
      comment: 'simulator-core uses only circuit-domain at runtime.',
      severity: 'error',
      from: { path: '^packages/simulator-core/src/' },
      to: { path: '^packages/(?!circuit-domain/|simulator-core/)' },
    },
    {
      name: 'web-main-thread-no-simulator-core',
      comment: 'Simulation runs only in the Web Worker (ADR-006).',
      severity: 'error',
      from: { path: '^apps/web/src/', pathNot: '\\.worker\\.ts$' },
      to: { path: '^packages/simulator-core/' },
    },
    {
      name: 'tests-not-in-src',
      severity: 'error',
      from: { path: '/src/' },
      to: { path: '/test/' },
    },
  ],
  options: {
    doNotFollow: { path: 'node_modules' },
    tsPreCompilationDeps: true,
    tsConfig: { fileName: 'tsconfig.base.json' },
    enhancedResolveOptions: {
      exportsFields: ['exports'],
      conditionNames: ['import', 'default'],
      extensions: ['.ts', '.tsx', '.js', '.json'],
    },
    exclude: { path: '(node_modules|dist|generated)/' },
  },
};
