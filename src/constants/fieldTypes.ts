import type { FieldType, FieldTypeMeta } from '../types/domain';

export const FIELD_TYPES: FieldTypeMeta[] = [
  { value: 'text', label: 'Text Field', inputType: 'text' },
  { value: 'integer', label: 'Integer Field', inputType: 'number' },
  { value: 'decimal', label: 'Decimal Field', inputType: 'number' },
  { value: 'textarea', label: 'Text Area', inputType: 'textarea' },
  { value: 'datetime', label: 'Date Time', inputType: 'datetime-local' },
  { value: 'email', label: 'Email', inputType: 'email' },
  { value: 'phone', label: 'Phone', inputType: 'tel' },
  { value: 'url', label: 'URL', inputType: 'url' },
];

export const FIELD_TYPE_MAP: Record<FieldType, FieldTypeMeta> = FIELD_TYPES.reduce(
  (acc, typeMeta) => {
    acc[typeMeta.value] = typeMeta;
    return acc;
  },
  {} as Record<FieldType, FieldTypeMeta>
);

export const getFieldTypeLabel = (value: string): string =>
  value in FIELD_TYPE_MAP ? FIELD_TYPE_MAP[value as FieldType].label : value;
