import type { Diagnostic } from '@logiclab/circuit-domain';

interface DiagnosticsPanelProps {
  title: string;
  diagnostics: readonly Diagnostic[];
}

export function DiagnosticsPanel({ title, diagnostics }: DiagnosticsPanelProps) {
  return (
    <section aria-labelledby="diag-title" className="panel">
      <h2 id="diag-title">{title}</h2>
      {diagnostics.length === 0 ? (
        <p className="muted" data-testid="diagnostics-empty">
          0 issues
        </p>
      ) : (
        <ul className="diagnostics" data-testid="diagnostics">
          {diagnostics.map((item, index) => (
            <li key={`${item.code}-${index}`} className={`diag ${item.severity.toLowerCase()}`}>
              <strong>{item.severity}</strong> <code>{item.code}</code> — {item.message}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
