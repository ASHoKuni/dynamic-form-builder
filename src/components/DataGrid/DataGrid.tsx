import { useApp } from '../../context/useApp';
import { LOCAL_DATE_TIME_RE } from '../../constants/dataGridConstants';
import { useDataGridState } from './useDataGridState';
import './DataGrid.css';

interface DataGridProps {
  readonly onAddRecord: () => void;
  readonly onConfigureFields?: () => void;
}

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

function formatDateTimeValue(value: string): string {
  const localDateTime = LOCAL_DATE_TIME_RE.exec(value);
  if (localDateTime) {
    const [, year, month, day, hourStr, minuteStr] = localDateTime;
    const hour24 = Number(hourStr);
    const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
    const meridiem = hour24 >= 12 ? 'PM' : 'AM';
    return `${day}/${month}/${year} ${pad2(hour12)}.${minuteStr} ${meridiem}`;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  const day = pad2(parsed.getDate());
  const month = pad2(parsed.getMonth() + 1);
  const year = String(parsed.getFullYear());
  const hour24 = parsed.getHours();
  const minute = pad2(parsed.getMinutes());
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  const meridiem = hour24 >= 12 ? 'PM' : 'AM';

  return `${day}/${month}/${year} ${pad2(hour12)}.${minute} ${meridiem}`;
}

function normalizeCellValue(rawValue: unknown): string {
  if (typeof rawValue === 'string') return rawValue.trim();
  if (typeof rawValue === 'number' || typeof rawValue === 'boolean') return String(rawValue);
  if (rawValue instanceof Date) return rawValue.toISOString();
  return '';
}

function formatCellValue(rawValue: unknown, fieldType: string): string {
  const value = normalizeCellValue(rawValue);
  if (!value) return '';

  if (fieldType === 'decimal') {
    if (!/^\d+(\.\d+)?$/.test(value)) {
      return value;
    }

    const parsed = Number(value);
    if (!Number.isFinite(parsed)) {
      return value;
    }

    return parsed.toFixed(2);
  }

  if (fieldType === 'datetime') {
    return formatDateTimeValue(value);
  }

  return value;
}

export default function DataGrid({ onAddRecord, onConfigureFields }: DataGridProps) {
  const { state, dispatch } = useApp();
  const { schema, records } = state;
  const visibleFields = schema.filter((field) => field.title.trim() !== '');
  const configuredSchema = [...visibleFields].reverse();
  const hasConfiguredFields = configuredSchema.length > 0;
  const {
    PAGE_SIZE_OPTIONS,
    allPageRowsSelected,
    columnFilters,
    currentPage,
    handleDeleteSelected,
    handleResetRecords,
    handlePageSizeChange,
    pageRows,
    pageSize,
    resetFilters,
    selected,
    setColumnFilters,
    setPage,
    sorted,
    sort,
    toggleSelectAll,
    toggleSelectRow,
    toggleSort,
    totalPages,
  } = useDataGridState({ schema: configuredSchema, records, dispatch });

  const handleResetAllRecords = () => {
    if (!window.confirm('Remove all employee records? This action cannot be undone.')) {
      return;
    }
    handleResetRecords();
  };

  return (
    <div className="data-grid">
      <div className="data-grid__toolbar">
        <div className="data-grid__toolbar-left">
          {hasConfiguredFields ? <span className="data-grid__count">{sorted.length} Items</span> : <span />}
          {hasConfiguredFields && <button type="button" className="icon-btn" title="Refresh" onClick={resetFilters}>⟳</button>}
          {hasConfiguredFields && (
            <button type="button" className="btn btn--primary" onClick={onAddRecord}>+ Add</button>
          )}
        </div>
        <div className="data-grid__toolbar-actions data-grid__toolbar-actions--secondary">
          {selected.size > 0 && (
            <button type="button" className="btn btn--danger" onClick={handleDeleteSelected}>
              Delete ({selected.size})
            </button>
          )}
          {hasConfiguredFields && records.length > 0 && (
            <button type="button" className="btn" onClick={handleResetAllRecords}>Reset Records</button>
          )}
        </div>
      </div>

      {!hasConfiguredFields ? (
        <div className="data-grid__empty-state">
          <p className="data-grid__empty">No fields configured yet.</p>
          <p className="data-grid__empty-note">Go to Field Builder and create at least one field to start collecting employee records.</p>
          {onConfigureFields && (
            <button type="button" className="btn btn--primary" onClick={onConfigureFields}>
              Go to Field Builder
            </button>
          )}
        </div>
      ) : (
        <div className="data-grid__table-wrap">
          <table className="data-grid__table">
            <thead>
              <tr>
                <th className="col-check">
                  <input
                    type="checkbox"
                    checked={allPageRowsSelected}
                    onChange={(e) => toggleSelectAll(e.target.checked)}
                  />
                </th>
                {configuredSchema.map((f) => (
                  <th key={f.id} onClick={() => toggleSort(f.key)} className="sortable">
                    {f.title || '(Untitled)'}
                    {sort.key === f.key && <span className="sort-arrow">{sort.dir === 'asc' ? ' ▲' : ' ▼'}</span>}
                  </th>
                ))}
              </tr>
              <tr className="data-grid__filter-row">
                <th className="col-check" />
                {configuredSchema.map((f) => (
                  <th key={f.id}>
                    <input
                      type={f.type === 'datetime' ? 'date' : 'text'}
                      placeholder={f.type === 'datetime' ? '' : 'Search'}
                      value={columnFilters[f.key] || ''}
                      onChange={(e) =>
                        setColumnFilters((c) => ({ ...c, [f.key]: e.target.value }))
                      }
                    />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pageRows.map((r) => (
                <tr key={r.id}>
                  <td className="col-check">
                    <input
                      type="checkbox"
                      checked={selected.has(r.id)}
                      onChange={() => toggleSelectRow(r.id)}
                    />
                  </td>
                  {configuredSchema.map((f) => (
                    <td key={f.id}>{formatCellValue(r[f.key], f.type)}</td>
                  ))}
                </tr>
              ))}
              {pageRows.length === 0 && (
                <tr>
                  <td className="data-grid__empty-row" colSpan={configuredSchema.length + 1}>No records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {hasConfiguredFields && (
        <div className="data-grid__pagination">
          <button type="button" onClick={() => setPage(1)} disabled={currentPage === 1}>«</button>
          <button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}>‹</button>
          <span>{currentPage} of {totalPages}</span>
          <button type="button" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>›</button>
          <button type="button" onClick={() => setPage(totalPages)} disabled={currentPage === totalPages}>»</button>

          <label className="data-grid__page-size">
            <span>Items Per Page</span>
            <select value={pageSize} onChange={handlePageSizeChange}>
              {PAGE_SIZE_OPTIONS.map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </label>
        </div>
      )}
    </div>
  );
}
