import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import DataGrid from './DataGrid';
import AppContext from '../../context/AppContextInstance';
import type { AppAction, AppContextValue, AppState, DataRecord, SchemaField } from '../../types/domain';

const schema: SchemaField[] = [
  { id: 'f_1', key: 'first_name', type: 'text', title: 'First Name', required: true },
  { id: 'f_2', key: 'email', type: 'email', title: 'Email', required: true },
];

const records: DataRecord[] = [
  { id: 'r_1', first_name: 'Zed', email: 'zed@acme.com' },
  { id: 'r_2', first_name: 'Amy', email: 'amy@acme.com' },
];

const baseState: AppState = {
  schema,
  records,
  selectedFieldId: null,
};

function renderDataGrid(options?: {
  onAddRecord?: () => void;
  state?: AppState;
  dispatch?: (action: AppAction) => void;
}) {
  const onAddRecord = options?.onAddRecord ?? vi.fn();
  const dispatch = options?.dispatch ?? vi.fn();
  const state = options?.state ?? baseState;

  const contextValue: AppContextValue = {
    state,
    dispatch,
  };

  render(
    <AppContext.Provider value={contextValue}>
      <DataGrid onAddRecord={onAddRecord} />
    </AppContext.Provider>
  );
  return { onAddRecord, dispatch };
}

describe('DataGrid component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders rows and invokes add callback', async () => {
    const user = userEvent.setup();
    const { onAddRecord } = renderDataGrid();

    expect(screen.getByText('2 Items')).toBeTruthy();
    expect(screen.getByText('Zed')).toBeTruthy();
    expect(screen.getByText('Amy')).toBeTruthy();

    await user.click(screen.getByRole('button', { name: '+ Add' }));
    expect(onAddRecord).toHaveBeenCalledTimes(1);
  });

  it('filters records by column search input', async () => {
    const user = userEvent.setup();
    renderDataGrid();

    const searchInputs = screen.getAllByPlaceholderText('Search');
    await user.type(searchInputs[0], 'Amy');

    expect(screen.getByText('Amy')).toBeTruthy();
    expect(screen.queryByText('Zed')).toBeNull();
    expect(screen.getByText('1 Items')).toBeTruthy();

    await user.click(screen.getByRole('button', { name: /Clear Email filter/i }));

    expect(screen.getByText('Amy')).toBeTruthy();
    expect(screen.getByText('Zed')).toBeTruthy();
    expect(screen.getByText('2 Items')).toBeTruthy();
  });

  it('sorts records when clicking a sortable header', async () => {
    const user = userEvent.setup();
    renderDataGrid();

    await user.click(screen.getByRole('columnheader', { name: /First Name/i }));

    const table = screen.getByRole('table');
    const rows = within(table).getAllByRole('row');
    const bodyRows = rows.slice(2);

    expect(within(bodyRows[0]).getByText('Amy')).toBeTruthy();
    expect(within(bodyRows[1]).getByText('Zed')).toBeTruthy();
  });

  it('deletes selected row from the grid and persisted records', async () => {
    const user = userEvent.setup();
    const { dispatch } = renderDataGrid();

    const checkboxes = screen.getAllByRole('checkbox');
    await user.click(checkboxes[1]);
    await user.click(screen.getByRole('button', { name: 'Delete (1)' }));

    await waitFor(() => {
      expect(dispatch).toHaveBeenCalledWith({
        type: 'DELETE_RECORDS',
        ids: ['r_1'],
      });
    });
  });

  it('resets all records when user confirms reset action', async () => {
    const user = userEvent.setup();
    const { dispatch } = renderDataGrid();
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

    await user.click(screen.getByRole('button', { name: 'Reset Records' }));

    expect(confirmSpy).toHaveBeenCalledWith('Remove all employee records? This action cannot be undone.');
    expect(dispatch).toHaveBeenCalledWith({ type: 'CLEAR_RECORDS' });

    confirmSpy.mockRestore();
  });

  it('does not reset records when user cancels confirmation', async () => {
    const user = userEvent.setup();
    const { dispatch } = renderDataGrid();
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);

    await user.click(screen.getByRole('button', { name: 'Reset Records' }));

    expect(dispatch).not.toHaveBeenCalledWith({ type: 'CLEAR_RECORDS' });

    confirmSpy.mockRestore();
  });

  it('renders columns in field add order', () => {
    const state: AppState = {
      schema: [
        { id: 'f_4', key: 'birth_date', type: 'datetime', title: 'Birth Date', required: false },
        { id: 'f_5', key: 'experience', type: 'decimal', title: 'Experience', required: false },
        { id: 'f_1', key: 'first_name', type: 'text', title: 'First Name', required: true },
        { id: 'f_6', key: 'phone_number', type: 'phone', title: 'Phone Number', required: false },
        { id: 'f_2', key: 'last_name', type: 'text', title: 'Last Name', required: true },
        { id: 'f_3', key: 'email', type: 'email', title: 'Email', required: true },
      ],
      records: [],
      selectedFieldId: null,
    };

    renderDataGrid({ state });

    const table = screen.getByRole('table');
    const headerRows = within(table).getAllByRole('row').slice(0, 2);
    const headers = within(headerRows[0]).getAllByRole('columnheader').slice(1).map((header) => header.textContent?.trim() ?? '');

    expect(headers).toEqual([
      'Email',
      'Last Name',
      'Phone Number',
      'First Name',
      'Experience',
      'Birth Date',
    ]);
  });

  it('shows decimal field values rounded to 2 decimal places', () => {
    renderDataGrid({
      state: {
        schema: [
          { id: 'f_1', key: 'experience', type: 'decimal', title: 'Experience', required: false },
        ],
        records: [
          { id: 'r_1', experience: '8' },
          { id: 'r_2', experience: '8.126' },
        ],
        selectedFieldId: null,
      },
    });

    expect(screen.getByText('8.00')).toBeTruthy();
    expect(screen.getByText('8.13')).toBeTruthy();
  });

  it('shows datetime field value in DD/MM/YYYY hh.mm AM/PM format', () => {
    renderDataGrid({
      state: {
        schema: [
          { id: 'f_1', key: 'birth_date', type: 'datetime', title: 'Birth Date', required: false },
        ],
        records: [
          { id: 'r_1', birth_date: '1993-01-01T15:11' },
        ],
        selectedFieldId: null,
      },
    });

    expect(screen.getByText('01/01/1993 03.11 PM')).toBeTruthy();
  });

  it('shows N/A for empty or missing values in grid rows', () => {
    renderDataGrid({
      state: {
        schema: [
          { id: 'f_1', key: 'first_name', type: 'text', title: 'First Name', required: false },
          { id: 'f_2', key: 'email', type: 'email', title: 'Email', required: false },
        ],
        records: [
          { id: 'r_1', first_name: '', email: 'john@example.com' },
          { id: 'r_2', email: '' },
        ],
        selectedFieldId: null,
      },
    });

    expect(screen.getAllByText('N/A').length).toBeGreaterThanOrEqual(2);
  });

  it('uses date filter input for datetime field type', () => {
    renderDataGrid({
      state: {
        schema: [
          { id: 'f_1', key: 'birth_date', type: 'datetime', title: 'Birth Date', required: false },
        ],
        records: [
          { id: 'r_1', birth_date: '1993-01-01T15:11' },
        ],
        selectedFieldId: null,
      },
    });

    const dateFilter = document.querySelector('input[type="date"]');
    expect(dateFilter).toBeTruthy();
  });

  it('shows guided empty state and hides add action when no fields are configured', () => {
    const onConfigureFields = vi.fn();

    renderDataGrid({
      state: {
        schema: [],
        records: [],
        selectedFieldId: null,
      },
    });

    expect(screen.getByText('No fields configured yet.')).toBeTruthy();
    expect(screen.getByText(/Go to Field Builder and create at least one field/i)).toBeTruthy();
    expect(screen.queryByText('0 Items')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Refresh' })).toBeNull();
    expect(screen.queryByRole('button', { name: '+ Add' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Go to Field Builder' })).toBeNull();

    render(
      <AppContext.Provider
        value={{
          state: { schema: [], records: [], selectedFieldId: null },
          dispatch: vi.fn(),
        }}
      >
        <DataGrid onAddRecord={vi.fn()} onConfigureFields={onConfigureFields} />
      </AppContext.Provider>
    );

    expect(screen.getAllByRole('button', { name: 'Go to Field Builder' })[0]).toBeTruthy();
  });
});
