export type TabId = 'builder' | 'records';

export const EMPLOYEE_WORKSPACE_TABS = [
  { id: 'builder', label: 'Field Builder' },
  { id: 'records', label: 'Employees' },
] as const satisfies ReadonlyArray<{ id: TabId; label: string }>;
