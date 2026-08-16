import { useEffect, useMemo, useState } from 'react';
import type { ChangeEvent } from 'react';
import { useApp } from '../../context/useApp';
import { getFieldTypeLabel } from '../../constants/fieldTypes';

export default function FieldList() {
  const { state, dispatch } = useApp();
  const [filter, setFilter] = useState('');
  const [addFieldMessage, setAddFieldMessage] = useState('');

  const fields = useMemo(
    () =>
      state.schema.filter((field) =>
        (field.title || 'Untitled').toLowerCase().includes(filter.toLowerCase())
      ),
    [filter, state.schema]
  );

  const handleFilterChange = (event: ChangeEvent<HTMLInputElement>) => {
    setFilter(event.target.value);
  };

  const handleSelectField = (fieldId: string) => {
    dispatch({ type: 'SELECT_FIELD', id: fieldId });
  };

  useEffect(() => {
    const hasIncompleteField = state.schema.some((field) => field.title.trim() === '');
    if (!hasIncompleteField && addFieldMessage) {
      setAddFieldMessage('');
    }
  }, [addFieldMessage, state.schema]);

  useEffect(() => {
    if (!addFieldMessage) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setAddFieldMessage('');
    }, 2000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [addFieldMessage]);

  const handleAddField = () => {
    const incompleteField = state.schema.find((field) => field.title.trim() === '');
    if (incompleteField) {
      dispatch({ type: 'SELECT_FIELD', id: incompleteField.id });
      if (filter.trim() !== '') {
        setFilter('');
      }
      setAddFieldMessage('Enter a field title before adding the next field.');
      return;
    }

    setAddFieldMessage('');
    dispatch({ type: 'ADD_FIELD' });
  };

  return (
    <div className="field-list">
      <div className="field-list__header">
        <h2>Fields</h2>
        <button
          type="button"
          className="icon-btn"
          title="Add Field"
          onClick={handleAddField}
        >
          +
        </button>
      </div>

      <input
        className="field-list__filter"
        placeholder="Filter Fields"
        value={filter}
        onChange={handleFilterChange}
      />

      <ul className="field-list__items">
        {fields.map((f) => {
          const isSelected = state.selectedFieldId === f.id;

          return (
            <li key={f.id}>
              <button
                type="button"
                className={`field-list__item ${isSelected ? 'is-selected' : ''}`}
                onClick={() => handleSelectField(f.id)}
              >
                <span className="field-list__title">{f.title || '(Untitled)'}</span>
                <span className="field-list__meta">
                  <span className="field-list__type">{getFieldTypeLabel(f.type)}</span>
                  {isSelected && <span className="field-list__arrow" aria-hidden="true">&#8250;</span>}
                </span>
              </button>
            </li>
          );
        })}
        {fields.length === 0 && (
          <li className="field-list__empty">{filter.trim() ? 'No matching fields.' : 'No fields yet.'}</li>
        )}
      </ul>

      <button type="button" className="link-btn" onClick={handleAddField}>
        + Add Field
      </button>

      {addFieldMessage && <p className="field-list__hint">{addFieldMessage}</p>}
    </div>
  );
}
