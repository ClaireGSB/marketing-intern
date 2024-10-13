import crypto from 'crypto';

export function stableStringify(obj: any): string {
  if (typeof obj !== 'object' || obj === null) {
    return JSON.stringify(obj);
  }

  if (Array.isArray(obj)) {
    return '[' + obj.map(stableStringify).join(',') + ']';
  }

  const sortedKeys = Object.keys(obj).sort();
  const result = sortedKeys.map(key => {
    const value = obj[key];
    return JSON.stringify(key) + ':' + stableStringify(value);
  });

  return '{' + result.join(',') + '}';
}

export function hashObject<T extends object>(obj: T): string {
  const stableJson = stableStringify(obj);
  return crypto.createHash('sha256').update(stableJson).digest('hex');
}