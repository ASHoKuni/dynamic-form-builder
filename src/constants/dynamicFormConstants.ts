export const PHONE_COUNTRY_CODES = [
  { code: '+1', label: 'US(+1)' },
  { code: '+44', label: 'UK(+44)' },
  { code: '+61', label: 'AU(+61)' },
  { code: '+91', label: 'IN(+91)' },
  { code: '+971', label: 'AE(+971)' },
] as const;

export type PhoneCountryCode = (typeof PHONE_COUNTRY_CODES)[number]['code'];
