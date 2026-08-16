import { describe, expect, it } from 'vitest';
import type { SchemaField } from '../types/domain';
import { toApiKey, validateField, validateRecord } from './validation';

function makeField(partial: Partial<SchemaField> = {}): SchemaField {
  return {
    id: partial.id ?? 'f_1',
    key: partial.key ?? 'first_name',
    type: partial.type ?? 'text',
    title: partial.title ?? 'First Name',
    required: partial.required ?? false,
  };
}

describe('toApiKey', () => {
  it('converts human title to snake case style key', () => {
    expect(toApiKey(' First Name ')).toBe('first_name');
  });

  it('collapses repeated separators and trims trailing separator', () => {
    expect(toApiKey('Phone---Number!!!')).toBe('phone_number');
  });

  it('returns fallback key for empty or unsupported input', () => {
    expect(toApiKey('')).toBe('field');
    expect(toApiKey('***')).toBe('field');
  });
});

describe('validateField', () => {
  it('enforces required fields', () => {
    const field = makeField({ required: true });
    expect(validateField(field, '')).toBe('This field is required.');
  });

  it('validates integer values', () => {
    const field = makeField({ type: 'integer' });
    expect(validateField(field, '42')).toBe('');
    expect(validateField(field, '-3')).toBe('Must be a positive whole number.');
    expect(validateField(field, '42.2')).toBe('Must be a positive whole number.');
  });

  it('validates decimal values', () => {
    const field = makeField({ type: 'decimal' });
    expect(validateField(field, '10.5')).toBe('');
    expect(validateField(field, '-10.5')).toBe('Must be a positive number.');
    expect(validateField(field, '12.3.4')).toBe('Must be a positive number.');
  });

  it('validates email format', () => {
    const field = makeField({ type: 'email' });
    expect(validateField(field, 'john@example.com')).toBe('');
    expect(validateField(field, 'john@')).toBe('Enter a valid email address.');
  });

  it('validates http and https urls only', () => {
    const field = makeField({ type: 'url' });
    expect(validateField(field, 'https://example.com/profile')).toBe('');
    expect(validateField(field, 'ftp://example.com')).toBe('Enter a valid URL (include http:// or https://).');
  });

  it('validates phone numbers', () => {
    const field = makeField({ type: 'phone' });
    expect(validateField(field, '+1 (234) 567-8901')).toBe('');
    expect(validateField(field, '1234567890')).toBe('Enter a valid phone number with country code.');
    expect(validateField(field, '12')).toBe('Enter a valid phone number with country code.');
  });
});

describe('validateRecord', () => {
  it('returns map of field errors by api key', () => {
    const schema: SchemaField[] = [
      makeField({ key: 'first_name', title: 'First Name', required: true }),
      makeField({ id: 'f_2', key: 'email', type: 'email', title: 'Email', required: true }),
    ];

    const errors = validateRecord(schema, {
      first_name: '',
      email: 'not-an-email',
    });

    expect(errors).toEqual({
      first_name: 'This field is required.',
      email: 'Enter a valid email address.',
    });
  });

  it('returns empty map when all fields are valid', () => {
    const schema: SchemaField[] = [
      makeField({ key: 'first_name', required: true }),
      makeField({ id: 'f_2', key: 'email', type: 'email', required: true }),
    ];

    const errors = validateRecord(schema, {
      first_name: 'John',
      email: 'john@example.com',
    });

    expect(errors).toEqual({});
  });
});
