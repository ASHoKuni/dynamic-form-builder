import { beforeEach, describe, expect, it } from 'vitest';
import type { DataRecord, SchemaField } from '../types/domain';
import { RECORDS_STORAGE_KEY, SCHEMA_STORAGE_KEY } from '../constants/storageConstants';
import { loadRecords, loadSchema, saveRecords, saveSchema } from './storage';

describe('storage utils', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('saves and loads schema from localStorage', () => {
    const schema: SchemaField[] = [
      { id: 'f_1', key: 'first_name', type: 'text', title: 'First Name', required: true },
    ];

    saveSchema(schema);
    expect(loadSchema()).toEqual(schema);
  });

  it('returns null for invalid schema JSON', () => {
    localStorage.setItem(SCHEMA_STORAGE_KEY, '{invalid json');
    expect(loadSchema()).toBeNull();
  });

  it('saves and loads records from localStorage', () => {
    const records: DataRecord[] = [
      { id: 'r_1', first_name: 'Jane', email: 'jane@example.com' },
    ];

    saveRecords(records);
    expect(loadRecords()).toEqual(records);
  });

  it('returns empty array for invalid records JSON', () => {
    localStorage.setItem(RECORDS_STORAGE_KEY, '{invalid json');
    expect(loadRecords()).toEqual([]);
  });
});
