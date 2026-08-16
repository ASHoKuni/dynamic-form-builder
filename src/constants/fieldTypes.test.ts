import { describe, expect, it } from 'vitest';
import { FIELD_TYPES, FIELD_TYPE_MAP, getFieldTypeLabel } from './fieldTypes';

describe('fieldTypes constants', () => {
  it('contains all required supported field types', () => {
    const keys = FIELD_TYPES.map((item) => item.value);
    expect(keys).toEqual([
      'text',
      'integer',
      'decimal',
      'textarea',
      'datetime',
      'email',
      'phone',
      'url',
    ]);
  });

  it('maps type keys to metadata used by form renderer', () => {
    expect(FIELD_TYPE_MAP.decimal.inputType).toBe('number');
    expect(FIELD_TYPE_MAP.datetime.inputType).toBe('datetime-local');
    expect(FIELD_TYPE_MAP.phone.inputType).toBe('tel');
  });

  it('returns human label for known keys and falls back for unknown key', () => {
    expect(getFieldTypeLabel('email')).toBe('Email');
    expect(getFieldTypeLabel('custom')).toBe('custom');
  });
});
