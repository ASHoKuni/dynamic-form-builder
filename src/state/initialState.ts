import { loadRecords, loadSchema } from '../utils/storage';
import type { AppState } from '../types/domain';
import { DEFAULT_SCHEMA } from './defaultSchema';
import { normalizeSchemaForLoad, reconcileRecordsWithSchema } from './schema';

export function createInitialState(): AppState {
  const storedSchema = loadSchema();
  const schema = normalizeSchemaForLoad(storedSchema ?? [...DEFAULT_SCHEMA]);
  const records = reconcileRecordsWithSchema(schema, loadRecords());

  return {
    schema,
    records,
    selectedFieldId: null,
  };
}
