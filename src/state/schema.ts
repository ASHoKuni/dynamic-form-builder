import { toApiKey } from '../utils/validation';
import type { DataRecord, SchemaField } from '../types/domain';

function applyLegacyBehavior(field: SchemaField): SchemaField {
  if (field.key !== 'employee_id') {
    return field;
  }

  return {
    ...field,
    behavior: {
      ...field.behavior,
      unique: true,
      autoIncrement: true,
    },
  };
}

export function normalizeSchemaForLoad(schema: SchemaField[]): SchemaField[] {
  let hasUntitledDraft = false;

  return schema.reduce<SchemaField[]>((acc, field) => {
    if (field.title.trim() !== '') {
      acc.push(applyLegacyBehavior(field));
      return acc;
    }

    if (hasUntitledDraft) {
      return acc;
    }

    hasUntitledDraft = true;
    acc.push(applyLegacyBehavior(field));
    return acc;
  }, []);
}

export function getUniqueFieldKey(baseKey: string, schema: SchemaField[], ignoreId?: string): string {
  let key = baseKey;
  let n = 2;
  const taken = new Set(schema.filter((f) => f.id !== ignoreId).map((f) => f.key));
  while (taken.has(key)) {
    key = `${baseKey}_${n++}`;
  }
  return key;
}

export function deriveFieldKeyFromTitle(title: string, schema: SchemaField[], ignoreId?: string): string {
  return getUniqueFieldKey(toApiKey(title), schema, ignoreId);
}

export function reconcileRecordsWithSchema(schema: SchemaField[], records: DataRecord[]): DataRecord[] {
  const allowedKeys = new Set(schema.map((field) => field.key));

  return records.map((record) => {
    const normalized: Record<string, string> = { id: String(record.id ?? '') };

    for (const field of schema) {
      const rawValue = record[field.key];
      normalized[field.key] = typeof rawValue === 'string' ? rawValue : '';
    }

    // Keep unknown keys from older schema versions instead of dropping user data.
    for (const [key, rawValue] of Object.entries(record)) {
      if (key === 'id' || allowedKeys.has(key) || typeof rawValue !== 'string') {
        continue;
      }
      normalized[key] = rawValue;
    }

    return normalized as DataRecord;
  });
}

export function migrateRecordValuesByKey(
  records: DataRecord[],
  oldKey: string,
  newKey: string
): DataRecord[] {
  return records.map((record) => {
    if (!(oldKey in record)) return record;

    const movedValue = record[oldKey] ?? '';
    const targetValue = record[newKey];
    const nextRecord = { ...record } as Record<string, string>;
    delete nextRecord[oldKey];
    nextRecord[newKey] = typeof targetValue === 'string' && targetValue.trim() !== '' ? targetValue : movedValue;

    return nextRecord as DataRecord;
  });
}
