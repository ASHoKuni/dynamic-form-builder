import { useEffect, useMemo, useState } from 'react';
import type { ChangeEvent } from 'react';
import { PAGE_SIZE_OPTIONS } from '../../constants/dataGridConstants';
import type { AppAction, DataRecord, SchemaField } from '../../types/domain';

type SortDirection = 'asc' | 'desc';

interface SortState {
  key: string | null;
  dir: SortDirection;
}

function toScalarString(value: unknown): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (value instanceof Date) return value.toISOString();
  return '';
}

function compareAsText(left: unknown, right: unknown): number {
  return toScalarString(left).localeCompare(toScalarString(right), undefined, {
    numeric: true,
    sensitivity: 'base',
  });
}

function compareByFieldType(
  leftValue: unknown,
  rightValue: unknown,
  fieldType: SchemaField['type'] | undefined
): number {
  switch (fieldType) {
    case 'integer':
    case 'decimal': {
      const leftNum = Number(leftValue);
      const rightNum = Number(rightValue);
      if (Number.isFinite(leftNum) && Number.isFinite(rightNum)) {
        return leftNum - rightNum;
      }
      return compareAsText(leftValue, rightValue);
    }
    case 'datetime': {
      const leftDate = Date.parse(toScalarString(leftValue));
      const rightDate = Date.parse(toScalarString(rightValue));
      if (!Number.isNaN(leftDate) && !Number.isNaN(rightDate)) {
        return leftDate - rightDate;
      }
      return compareAsText(leftValue, rightValue);
    }
    default:
      return compareAsText(leftValue, rightValue);
  }
}

export function useDataGridState(params: {
  schema: SchemaField[];
  records: DataRecord[];
  dispatch: React.Dispatch<AppAction>;
}) {
  const { schema, records, dispatch } = params;

  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});
  const [sort, setSort] = useState<SortState>({ key: null, dir: 'asc' });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(30);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    return records.filter((record) =>
      schema.every((field) => {
        const filterVal = (columnFilters[field.key] || '').toLowerCase();
        if (!filterVal) return true;
        const cell = toScalarString(record[field.key]).toLowerCase();
        return cell.includes(filterVal);
      })
    );
  }, [records, schema, columnFilters]);

  useEffect(() => {
    setPage(1);
  }, [columnFilters]);

  const sorted = useMemo(() => {
    const sortKey = sort.key;
    if (!sortKey) return filtered;

    const sortedField = schema.find((field) => field.key === sortKey);
    const copy = [...filtered];

    copy.sort((leftRecord, rightRecord) => {
      const leftValue = leftRecord[sortKey] ?? '';
      const rightValue = rightRecord[sortKey] ?? '';
      const cmp = compareByFieldType(leftValue, rightValue, sortedField?.type);

      if (cmp === 0) return 0;
      return sort.dir === 'asc' ? cmp : -cmp;
    });

    return copy;
  }, [filtered, schema, sort]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageRows = sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const allPageRowsSelected = pageRows.length > 0 && pageRows.every((row) => selected.has(row.id));

  const toggleSort = (key: string) => {
    setSort((current) =>
      current.key === key
        ? { key, dir: current.dir === 'asc' ? 'desc' : 'asc' }
        : { key, dir: 'asc' }
    );
  };

  const toggleSelectAll = (checked: boolean) => {
    setSelected((current) => {
      const next = new Set(current);
      if (checked) {
        pageRows.forEach((row) => next.add(row.id));
      } else {
        pageRows.forEach((row) => next.delete(row.id));
      }
      return next;
    });
  };

  const toggleSelectRow = (id: string) => {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleDeleteSelected = () => {
    dispatch({ type: 'DELETE_RECORDS', ids: [...selected] });
    setSelected(new Set());
  };

  const handleResetRecords = () => {
    dispatch({ type: 'CLEAR_RECORDS' });
    setSelected(new Set());
    setPage(1);
  };

  const handlePageSizeChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setPageSize(Number(event.target.value));
    setPage(1);
  };

  const resetFilters = () => setColumnFilters({});

  return {
    PAGE_SIZE_OPTIONS,
    allPageRowsSelected,
    columnFilters,
    currentPage,
    filtered,
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
  };
}
