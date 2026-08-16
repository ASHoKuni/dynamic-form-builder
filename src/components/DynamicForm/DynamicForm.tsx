import { useState } from 'react';
import { useApp } from '../../context/useApp';
import { hasDuplicateFieldValue, validateRecord } from '../../utils/validation';
import FormField from './FormField';
import type { AppState, SchemaField } from '../../types/domain';
import './DynamicForm.css';

interface DynamicFormProps {
  readonly onClose: () => void;
}

function getAutoIncrementField(schema: SchemaField[]): SchemaField | undefined {
  return schema.find((field) => field.behavior?.autoIncrement);
}

function getNextEmployeeIdValue(schema: AppState['schema'], records: AppState['records']): string {
  const employeeIdField = getAutoIncrementField(schema);
  if (!employeeIdField) {
    return '';
  }

  let maxId = 0;
  for (const record of records) {
    const rawValue = String(record[employeeIdField.key] ?? '').trim();
    if (!/^\d+$/.test(rawValue)) {
      continue;
    }

    const numericId = Number(rawValue);
    if (numericId > maxId) {
      maxId = numericId;
    }
  }

  return String(maxId + 1);
}

export default function DynamicForm({ onClose }: DynamicFormProps) {
  const { state, dispatch } = useApp();
  const configuredSchema = state.schema.filter((field) => field.title.trim() !== '').reverse();
  const autoIncrementField = getAutoIncrementField(state.schema);
  const uniqueFields = configuredSchema.filter((field) => field.behavior?.unique);

  const [values, setValues] = useState<Partial<Record<string, string>>>(() => {
    const nextEmployeeId = getNextEmployeeIdValue(state.schema, state.records);
    if (!nextEmployeeId || !autoIncrementField) {
      return {};
    }

    return { [autoIncrementField.key]: nextEmployeeId };
  });
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});

  const handleChange = (key: string, value: string) => {
    setValues((v) => ({ ...v, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const handleSave = () => {
    const nextErrors = validateRecord(configuredSchema, values);

    for (const field of uniqueFields) {
      const value = String(values[field.key] ?? '').trim();
      if (value && hasDuplicateFieldValue(state.records, field.key, value)) {
        nextErrors[field.key] = `${field.title} already exists.`;
      }
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    const normalizedValues = configuredSchema.reduce<Record<string, string>>((acc, field) => {
      acc[field.key] = values[field.key] ?? '';
      return acc;
    }, {});

    dispatch({ type: 'ADD_RECORD', values: normalizedValues });
    onClose();
  };

  if (configuredSchema.length === 0) {
    return (
      <div className="dynamic-form">
        <p>No fields have been configured yet. Add fields in the Field Builder first.</p>
        <button type="button" className="btn" onClick={onClose}>Close</button>
      </div>
    );
  }

  return (
    <div className="dynamic-form">
      <div className="dynamic-form__fields">
        {configuredSchema.map((field) => (
          <FormField
            key={field.id}
            field={field}
            value={values[field.key]}
            error={errors[field.key]}
            onChange={handleChange}
          />
        ))}
      </div>
      <div className="dynamic-form__actions">
        <button type="button" className="btn btn--primary" onClick={handleSave}>Save</button>
        <button type="button" className="btn" onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}
