let idCounter = 0;

export function createId(prefix: 'f' | 'r'): string {
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return `${prefix}_${globalThis.crypto.randomUUID()}`;
  }

  idCounter += 1;
  return `${prefix}_${Date.now()}_${idCounter}`;
}
