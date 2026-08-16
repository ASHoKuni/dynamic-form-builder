import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import DynamicForm from './DynamicForm';
import AppContext from '../../context/AppContextInstance';
import type { AppAction, AppContextValue, AppState } from '../../types/domain';

const defaultState: AppState = {
  schema: [
    { id: 'f_1', key: 'first_name', type: 'text', title: 'First Name', required: true },
    { id: 'f_2', key: 'last_name', type: 'text', title: 'Last Name', required: true },
    { id: 'f_3', key: 'email', type: 'email', title: 'Email', required: true },
  ],
  records: [],
  selectedFieldId: null,
};

function renderDynamicForm(options?: {
  onClose?: () => void;
  state?: AppState;
  dispatch?: (action: AppAction) => void;
}) {
  const onClose = options?.onClose ?? vi.fn();
  const dispatch = options?.dispatch ?? vi.fn();
  const state = options?.state ?? defaultState;

  const contextValue: AppContextValue = {
    state,
    dispatch,
  };

  render(
    <AppContext.Provider value={contextValue}>
      <DynamicForm onClose={onClose} />
    </AppContext.Provider>
  );
  return { onClose, dispatch };
}

describe('DynamicForm component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows required errors when saving empty default schema form', async () => {
    const user = userEvent.setup();
    renderDynamicForm();

    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(screen.getAllByText('This field is required.')).toHaveLength(3);
  });

  it('submits valid record, persists to localStorage, and closes modal', async () => {
    const user = userEvent.setup();
    const { onClose, dispatch } = renderDynamicForm();

    await user.type(screen.getByLabelText('First Name*'), 'John');
    await user.type(screen.getByLabelText('Last Name*'), 'Doe');
    await user.type(screen.getByLabelText('Email*'), 'john@acme.com');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(onClose).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledWith({
        type: 'ADD_RECORD',
        values: {
          first_name: 'John',
          last_name: 'Doe',
          email: 'john@acme.com',
        },
      });
    });
  });

  it('shows empty-schema state when no fields are configured', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    renderDynamicForm({
      onClose,
      state: { ...defaultState, schema: [] },
    });

    expect(
      screen.getByText('No fields have been configured yet. Add fields in the Field Builder first.')
    ).toBeTruthy();

    const closeButton = screen.getByRole('button', { name: 'Close' });
    expect(closeButton).toBeTruthy();

    await user.click(closeButton);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('auto-generates next Employee Id when field exists', () => {
    renderDynamicForm({
      state: {
        schema: [
          {
            id: 'f_1',
            key: 'employee_id',
            type: 'integer',
            title: 'Employee Id',
            required: true,
            behavior: { autoIncrement: true, unique: true },
          },
          { id: 'f_2', key: 'first_name', type: 'text', title: 'First Name', required: true },
        ],
        records: [
          { id: 'r_1', employee_id: '1', first_name: 'Jane' },
          { id: 'r_2', employee_id: '7', first_name: 'John' },
        ],
        selectedFieldId: null,
      },
    });

    const employeeIdInput = screen.getByLabelText('Employee Id*') as HTMLInputElement;
    expect(employeeIdInput.value).toBe('8');
  });

  it('blocks saving when Employee Id already exists', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const dispatch = vi.fn();

    renderDynamicForm({
      onClose,
      dispatch,
      state: {
        schema: [
          {
            id: 'f_1',
            key: 'employee_id',
            type: 'integer',
            title: 'Employee Id',
            required: true,
            behavior: { autoIncrement: true, unique: true },
          },
          { id: 'f_2', key: 'first_name', type: 'text', title: 'First Name', required: true },
        ],
        records: [{ id: 'r_1', employee_id: '2', first_name: 'Jane' }],
        selectedFieldId: null,
      },
    });

    const employeeIdInput = screen.getByLabelText('Employee Id*');
    await user.clear(employeeIdInput);
    await user.type(employeeIdInput, '2');
    await user.type(screen.getByLabelText('First Name*'), 'John');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(screen.getByText('Employee Id already exists.')).toBeTruthy();
    expect(dispatch).not.toHaveBeenCalledWith(expect.objectContaining({ type: 'ADD_RECORD' }));
    expect(onClose).not.toHaveBeenCalled();
  });
});
