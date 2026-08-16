import { describe, expect, it } from 'vitest';
import { appReducer } from './reducer';
import type { AppState } from '../types/domain';

function createState(schema: AppState['schema']): AppState {
  return {
    schema,
    records: [],
    selectedFieldId: null,
  };
}

describe('appReducer ADD_FIELD behavior', () => {
  it('selects existing untitled field instead of adding a new one', () => {
    const state = createState([
      { id: 'f_1', key: 'first_name', type: 'text', title: 'First Name', required: true },
      { id: 'f_2', key: 'field_2', type: 'text', title: '', required: false },
    ]);

    const next = appReducer(state, { type: 'ADD_FIELD' });

    expect(next.schema).toHaveLength(2);
    expect(next.selectedFieldId).toBe('f_2');
  });

  it('adds next field only when all existing fields have title', () => {
    const state = createState([
      { id: 'f_1', key: 'first_name', type: 'text', title: 'First Name', required: true },
      { id: 'f_2', key: 'last_name', type: 'text', title: 'Last Name', required: false },
    ]);

    const next = appReducer(state, { type: 'ADD_FIELD' });

    expect(next.schema).toHaveLength(3);
    expect(next.schema[0]).toMatchObject({
      key: 'field_3',
      type: 'text',
      title: '',
      required: false,
    });
    expect(next.selectedFieldId).toBe(next.schema[0].id);
  });
});

describe('appReducer UPDATE_FIELD behavior', () => {
  it('normalizes field title to title case for consistent display', () => {
    const state = createState([
      { id: 'f_1', key: 'field_1', type: 'text', title: '', required: false },
    ]);

    const next = appReducer(state, {
      type: 'UPDATE_FIELD',
      id: 'f_1',
      patch: { title: '  phone   number  ' },
    });

    expect(next.schema[0].title).toBe('Phone Number');
    expect(next.schema[0].key).toBe('phone_number');
  });
});
