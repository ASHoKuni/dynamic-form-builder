import type { SchemaField } from '../types/domain';
import { ASCII_LETTERS, DIGITS } from '../constants/validationConstants';

// Turns a human-entered Field Title into a stable API-style key,
// e.g. "First Name" -> "first_name". Used for the read-only "Field API Key" hint.
export function toApiKey(title: string): string {
  const trimmed = title.trim().toLowerCase();
  if (!trimmed) return 'field';

  let result = '';
  let previousWasSeparator = false;

  for (const ch of trimmed) {
    const isAlphaNumeric = ASCII_LETTERS.includes(ch) || DIGITS.includes(ch);
    if (isAlphaNumeric) {
      result += ch;
      previousWasSeparator = false;
      continue;
    }

    if (!previousWasSeparator && result.length > 0) {
      result += '_';
      previousWasSeparator = true;
    }
  }

  while (result.endsWith('_')) {
    result = result.slice(0, -1);
  }

  return result || 'field';
}

function isValidEmail(value: string): boolean {
  if (value.length > 254 || value.includes(' ')) return false;

  const atIndex = value.indexOf('@');
  if (atIndex <= 0 || atIndex !== value.lastIndexOf('@') || atIndex >= value.length - 1) {
    return false;
  }

  const localPart = value.slice(0, atIndex);
  const domainPart = value.slice(atIndex + 1);
  if (!localPart || !domainPart || domainPart.startsWith('.') || domainPart.endsWith('.')) {
    return false;
  }

  return domainPart.includes('.');
}

function isValidHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function isValidPhone(value: string): boolean {
  if (/[a-z]/i.test(value)) return false;

  const compact = value.replace(/[()\-.\s]/g, '');
  if (!/^\+\d{8,15}$/.test(compact)) {
    return false;
  }

  return true;
}

// Validates a single field's value against its type + required flag.
// Returns an error string, or '' when valid.
export function validateField(field: SchemaField, rawValue: string | undefined | null): string {
  const value = typeof rawValue === 'string' ? rawValue.trim() : rawValue;
  const isEmpty = value === undefined || value === null || value === '';

  if (field.required && isEmpty) {
    return 'This field is required.';
  }
  if (isEmpty) return '';

  switch (field.type) {
    case 'integer':
      if (!/^\d+$/.test(String(value))) return 'Must be a positive whole number.';
      break;
    case 'decimal':
      if (!/^\d+(\.\d+)?$/.test(String(value))) return 'Must be a positive number.';
      break;
    case 'email':
      if (!isValidEmail(value)) return 'Enter a valid email address.';
      break;
    case 'url':
      if (!isValidHttpUrl(value)) return 'Enter a valid URL (include http:// or https://).';
      break;
    case 'phone':
      if (!isValidPhone(value)) return 'Enter a valid phone number with country code.';
      break;
    default:
      break;
  }
  return '';
}

export function validateRecord(
  schema: SchemaField[],
  values: Partial<Record<string, string>>
): Record<string, string> {
  const errors: Record<string, string> = {};
  schema.forEach((field) => {
    const err = validateField(field, values[field.key]);
    if (err) errors[field.key] = err;
  });
  return errors;
}

export function hasDuplicateFieldValue(
  records: Array<Record<string, string>>,
  fieldKey: string,
  value: string
): boolean {
  const normalizedValue = value.trim();
  if (!normalizedValue) return false;

  return records.some((record) => String(record[fieldKey] ?? '').trim() === normalizedValue);
}
