import type { CircuitDocument, Diagnostic } from '@logiclab/circuit-domain';
import {
  exportCircuitText,
  importCircuitText,
  suggestedFileName,
} from '@logiclab/circuit-serialization';
import { builtinRegistry } from '@logiclab/component-registry';
import type { ChangeEvent } from 'react';

interface FileActionsProps {
  circuit: CircuitDocument;
  onImported: (document: CircuitDocument, warnings: Diagnostic[]) => void;
  onFailed: (diagnostics: Diagnostic[]) => void;
}

function download(name: string, text: string): void {
  const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function FileActions({ circuit, onImported, onFailed }: FileActionsProps) {
  const handleExport = (): void => {
    const result = exportCircuitText(circuit);
    if (result.ok) download(suggestedFileName(circuit), result.text);
    else onFailed(result.diagnostics);
  };

  const handleImport = async (event: ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (file === undefined) return;
    const result = importCircuitText(await file.text(), builtinRegistry());
    if (result.ok) onImported(result.document, result.diagnostics);
    else onFailed(result.diagnostics);
  };

  return (
    <div className="file-actions">
      <label className="button">
        Import
        <input
          type="file"
          accept=".json,application/json"
          className="visually-hidden"
          data-testid="import-input"
          onChange={(event) => void handleImport(event)}
        />
      </label>
      <button type="button" className="button" onClick={handleExport}>
        Export
      </button>
    </div>
  );
}
