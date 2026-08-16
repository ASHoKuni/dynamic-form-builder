import { FIELD_TYPE_MAP } from '../../constants/fieldTypes';
import { PHONE_COUNTRY_CODES } from '../../constants/dynamicFormConstants';
import type { ChangeEvent, FocusEvent, MouseEvent, ReactNode } from 'react';
import type { SchemaField } from '../../types/domain';

type PhoneCountryCode = (typeof PHONE_COUNTRY_CODES)[number]['code'];

function isPhoneCountryCode(value: string): value is PhoneCountryCode {
  return PHONE_COUNTRY_CODES.some((item) => item.code === value);
}

const PHONE_COUNTRY_CODE_SET = new Set(PHONE_COUNTRY_CODES.map((item) => item.code));

function splitPhoneValue(value: string): { code: string; number: string } {
  const trimmedValue = value.trim();
  if (!trimmedValue) {
    return { code: '+1', number: '' };
  }

  const [head, ...rest] = trimmedValue.split(' ');
  if (isPhoneCountryCode(head) && PHONE_COUNTRY_CODE_SET.has(head)) {
    return { code: head, number: rest.join(' ') };
  }

  return { code: '+1', number: trimmedValue };
}

interface FormFieldProps {
  readonly field: SchemaField;
  readonly value: string | undefined;
  readonly error: string | undefined;
  readonly onChange: (key: string, value: string) => void;
}

export default function FormField(props: Readonly<FormFieldProps>) {
  const { field, value, error, onChange } = props;
  const meta = FIELD_TYPE_MAP[field.type] ?? FIELD_TYPE_MAP.text;

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onChange(field.key, event.target.value);
  };

  const inputClassName = error ? 'has-error' : '';
  const labelClassName = error ? 'form-field__label is-error' : 'form-field__label';
  const currentValue = value ?? '';
  const phoneParts = splitPhoneValue(currentValue);

  const handlePhoneCodeChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const numberValue = phoneParts.number.trim();
    if (!numberValue) {
      onChange(field.key, '');
      return;
    }

    onChange(field.key, `${event.target.value} ${numberValue}`.trim());
  };

  const handlePhoneNumberChange = (event: ChangeEvent<HTMLInputElement>) => {
    const numberValue = event.target.value;
    if (!numberValue.trim()) {
      onChange(field.key, '');
      return;
    }

    onChange(field.key, `${phoneParts.code} ${numberValue}`.trim());
  };

  const openDatePicker = (input: HTMLInputElement) => {
    const nextInput = input as HTMLInputElement & { showPicker?: () => void };
    if (typeof nextInput.showPicker === 'function') {
      nextInput.showPicker();
    }
  };

  const handleDateInputClick = (event: MouseEvent<HTMLInputElement>) => {
    openDatePicker(event.currentTarget);
  };

  const handleDateInputFocus = (event: FocusEvent<HTMLInputElement>) => {
    openDatePicker(event.currentTarget);
  };

  const minValue = field.type === 'integer' || field.type === 'decimal' ? '0' : undefined;
  let stepValue: string | undefined;
  if (field.type === 'decimal') {
    stepValue = 'any';
  } else if (field.type === 'integer') {
    stepValue = '1';
  }

  let control: ReactNode;
  if (meta.inputType === 'textarea') {
    control = (
      <textarea
        id={field.id}
        rows={3}
        value={currentValue}
        onChange={handleChange}
        className={inputClassName}
      />
    );
  } else if (field.type === 'phone') {
    control = (
      <div className="form-field__phone">
        <select
          className={`form-field__phone-code ${inputClassName}`}
          value={phoneParts.code}
          onChange={handlePhoneCodeChange}
          aria-label={`${field.title} country code`}
        >
          {PHONE_COUNTRY_CODES.map((country) => (
            <option key={country.code} value={country.code}>{country.label}</option>
          ))}
        </select>
        <input
          id={field.id}
          type="tel"
          value={phoneParts.number}
          onChange={handlePhoneNumberChange}
          className={inputClassName}
          placeholder="Enter phone number"
        />
      </div>
    );
  } else {
    control = (
      <input
        id={field.id}
        type={meta.inputType}
        min={minValue}
        step={stepValue}
        value={currentValue}
        onChange={handleChange}
        onClick={field.type === 'datetime' ? handleDateInputClick : undefined}
        onFocus={field.type === 'datetime' ? handleDateInputFocus : undefined}
        className={inputClassName}
      />
    );
  }

  return (
    <div className="form-field">
      <label htmlFor={field.id} className={labelClassName}>
        {field.title}
        {field.required && <span className="required-mark">*</span>}
      </label>

      {control}

      {error && <p className="field-error">{error}</p>}
    </div>
  );
}
