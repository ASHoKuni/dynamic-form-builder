import { describe, expect, it } from 'vitest';
import type { SchemaField } from '../types/domain';
import { normalizeSchemaForLoad } from './schema';

function createField(id: string, title: string): SchemaField {
  return {
    id,
    key: id,
    type: 'text',
    title,
    required: false,
  };
}

describe('normalizeSchemaForLoad', () => {
  it('keeps all configured fields and only one untitled draft', () => {
    const schema = [
      createField('f_1', 'First Name'),
      createField('f_2', ''),
      createField('f_3', 'Email'),
      createField('f_4', '   '),
      createField('f_5', ''),
    ];

    const normalized = normalizeSchemaForLoad(schema);

    expect(normalized.map((field) => field.id)).toEqual(['f_1', 'f_2', 'f_3']);
  });

  it('returns schema unchanged when there are no duplicate untitled drafts', () => {
    const schema = [
      createField('f_1', 'First Name'),
      createField('f_2', ''),
      createField('f_3', 'Email'),
    ];

    const normalized = normalizeSchemaForLoad(schema);

    expect(normalized).toEqual(schema);
  });

  it('applies legacy behavior metadata for employee_id key', () => {
    const schema = [
      {
        id: 'f_1',
        key: 'employee_id',
        type: 'integer' as const,
        title: 'Employee Id',
        required: true,
      },
    ];

    const normalized = normalizeSchemaForLoad(schema);

    expect(normalized[0].behavior).toEqual({ autoIncrement: true, unique: true });
  });
});
