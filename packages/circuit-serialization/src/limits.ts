export interface ImportLimits {
  maxBytes: number;
  maxDepth: number;
  maxInstances: number;
  maxNets: number;
}

export const R1_LIMITS: Readonly<ImportLimits> = Object.freeze({
  maxBytes: 2 * 1024 * 1024,
  maxDepth: 32,
  maxInstances: 500,
  maxNets: 1000,
});

export function utf8ByteLength(text: string): number {
  let bytes = 0;
  for (let index = 0; index < text.length; index += 1) {
    const code = text.charCodeAt(index);
    if (code < 0x80) bytes += 1;
    else if (code < 0x800) bytes += 2;
    else if (code >= 0xd800 && code <= 0xdbff) {
      bytes += 4;
      index += 1;
    } else bytes += 3;
  }
  return bytes;
}

export function exceedsDepth(text: string, maxDepth: number): boolean {
  let depth = 0;
  let inString = false;
  let escaped = false;
  for (const char of text) {
    if (inString) {
      if (escaped) escaped = false;
      else if (char === '\\') escaped = true;
      else if (char === '"') inString = false;
      continue;
    }
    if (char === '"') inString = true;
    else if (char === '{' || char === '[') {
      depth += 1;
      if (depth > maxDepth) return true;
    } else if (char === '}' || char === ']') depth -= 1;
  }
  return false;
}
