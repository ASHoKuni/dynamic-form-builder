import type { DataRecord, SchemaField } from '../types/domain';
import { RECORDS_STORAGE_KEY, SCHEMA_STORAGE_KEY } from '../constants/storageConstants';

// Thin wrapper around localStorage so the rest of the app never
// touches window.localStorage directly (easy to swap for a real API later).

export function loadSchema(): SchemaField[] | null {
  try {
    const raw = localStorage.getItem(SCHEMA_STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as SchemaField[]) : null;
  } catch (error) {
    if (import.meta.env.DEV) {
      // Helps diagnose localStorage corruption during development.
      console.warn('Failed to parse schema from localStorage.', error);
    }
    return null;
  }
}

export function saveSchema(schema: SchemaField[]): void {
  localStorage.setItem(SCHEMA_STORAGE_KEY, JSON.stringify(schema));
}

export function loadRecords(): DataRecord[] {
  try {
    const raw = localStorage.getItem(RECORDS_STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as DataRecord[]) : [];
  } catch (error) {
    if (import.meta.env.DEV) {
      // Helps diagnose localStorage corruption during development.
      console.warn('Failed to parse records from localStorage.', error);
    }
    return [];
  }
}

export function saveRecords(records: DataRecord[]): void {
  localStorage.setItem(RECORDS_STORAGE_KEY, JSON.stringify(records));
}
