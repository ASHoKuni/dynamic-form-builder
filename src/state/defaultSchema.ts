import type { SchemaField } from '../types/domain';

export const DEFAULT_SCHEMA = [
//   { id: 'f_first_name', key: 'first_name', type: 'text', title: 'First Name', required: true },
//   { id: 'f_last_name', key: 'last_name', type: 'text', title: 'Last Name', required: true },
//   { id: 'f_email', key: 'email', type: 'email', title: 'Email', required: true },
] as const satisfies ReadonlyArray<SchemaField>;
