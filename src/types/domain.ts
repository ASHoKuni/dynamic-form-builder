import type { Dispatch } from 'react';

export type FieldType =
  | 'text'
  | 'integer'
  | 'decimal'
  | 'textarea'
  | 'datetime'
  | 'email'
  | 'phone'
  | 'url';

export type FieldInputType =
  | 'text'
  | 'number'
  | 'textarea'
  | 'datetime-local'
  | 'email'
  | 'tel'
  | 'url';

export interface FieldTypeMeta {
  value: FieldType;
  label: string;
  inputType: FieldInputType;
}

export interface FieldBehavior {
  unique?: boolean;
  autoIncrement?: boolean;
}

export interface SchemaField {
  id: string;
  key: string;
  type: FieldType;
  title: string;
  required: boolean;
  behavior?: FieldBehavior;
}

export type RecordValues = Record<string, string>;

export interface DataRecord extends RecordValues {
  id: string;
}

export interface AppState {
  schema: SchemaField[];
  records: DataRecord[];
  selectedFieldId: string | null;
}

export type FieldPatch = Partial<Pick<SchemaField, 'type' | 'title' | 'required'>>;

export type AppAction =
  | { type: 'ADD_FIELD' }
  | { type: 'SELECT_FIELD'; id: string | null }
  | { type: 'UPDATE_FIELD'; id: string; patch: FieldPatch }
  | { type: 'REMOVE_FIELD'; id: string }
  | { type: 'ADD_RECORD'; values: RecordValues }
  | { type: 'CLEAR_RECORDS' }
  | { type: 'DELETE_RECORDS'; ids: string[] };

export interface AppContextValue {
  state: AppState;
  dispatch: Dispatch<AppAction>;
}
