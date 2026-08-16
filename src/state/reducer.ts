import type { AppAction, AppState, SchemaField } from '../types/domain';
import { createId } from './id';
import { deriveFieldKeyFromTitle, migrateRecordValuesByKey } from './schema';

function toDisplayTitle(title: string): string {
  return title
    .trim()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'ADD_FIELD': {
      const incompleteField = state.schema.find((field) => field.title.trim() === '');
      if (incompleteField) {
        return { ...state, selectedFieldId: incompleteField.id };
      }

      const id = createId('f');
      const field: SchemaField = {
        id,
        key: `field_${state.schema.length + 1}`,
        type: 'text',
        title: '',
        required: false,
      };
      return { ...state, schema: [field, ...state.schema], selectedFieldId: id };
    }
    case 'SELECT_FIELD':
      return { ...state, selectedFieldId: action.id };
    case 'UPDATE_FIELD': {
      const { id, patch } = action;
      let fromKey: string | null = null;
      let toKey: string | null = null;
      const normalizedTitle = patch.title !== undefined ? toDisplayTitle(patch.title) : undefined;

      const schema = state.schema.map((field) => {
        if (field.id !== id) return field;

        const merged = {
          ...field,
          ...patch,
          ...(normalizedTitle !== undefined ? { title: normalizedTitle } : {}),
        };
        if (patch.title !== undefined) {
          const nextKey = deriveFieldKeyFromTitle(normalizedTitle ?? patch.title, state.schema, id);
          if (nextKey !== field.key) {
            fromKey = field.key;
            toKey = nextKey;
            merged.key = nextKey;
          }
        }

        return merged;
      });

      const records = fromKey && toKey
        ? migrateRecordValuesByKey(state.records, fromKey, toKey)
        : state.records;

      return { ...state, schema, records };
    }
    case 'REMOVE_FIELD': {
      const schema = state.schema.filter((field) => field.id !== action.id);
      const selectedFieldId = state.selectedFieldId === action.id ? null : state.selectedFieldId;
      return { ...state, schema, selectedFieldId };
    }
    case 'ADD_RECORD': {
      const record = { id: createId('r'), ...action.values };
      return { ...state, records: [...state.records, record] };
    }
    case 'CLEAR_RECORDS':
      return { ...state, records: [] };
    case 'DELETE_RECORDS': {
      const ids = new Set(action.ids);
      return { ...state, records: state.records.filter((record) => !ids.has(record.id)) };
    }
    default:
      return state;
  }
}
