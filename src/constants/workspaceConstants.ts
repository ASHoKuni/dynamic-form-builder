export type TabId = 'builder' | 'records';

export const EMPLOYEE_WORKSPACE_TABS = [
  { id: 'records', label: 'Employees' },
  { id: 'builder', label: 'Field Builder' },
] as const satisfies ReadonlyArray<{ id: TabId; label: string }>;
