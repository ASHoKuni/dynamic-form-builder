import { useEffect, useState } from 'react';
import type { ChangeEvent, FocusEvent } from 'react';
import { useApp } from '../../context/useApp';
import { FIELD_TYPES } from '../../constants/fieldTypes';
import { toApiKey } from '../../utils/validation';
import type { FieldType, SchemaField } from '../../types/domain';

type FieldDraft = Pick<SchemaField, 'type' | 'title' | 'required'>;

const EMPTY: FieldDraft = { type: 'text', title: '', required: false };

export default function FieldProperties() {
  const { state, dispatch } = useApp();
  const selected = state.schema.find((f) => f.id === state.selectedFieldId);
  const [draft, setDraft] = useState<FieldDraft>(selected ? { ...selected } : EMPTY);
  const [titleTouched, setTitleTouched] = useState(false);
  const [attemptedApply, setAttemptedApply] = useState(false);

  // Re-sync the draft whenever the selection changes.
  useEffect(() => {
    setDraft(selected ? { type: selected.type, title: selected.title, required: selected.required } : EMPTY);
    setTitleTouched(false);
    setAttemptedApply(false);
  }, [selected]);

  if (!selected) {
    return (
      <div className="field-properties">
        <div className="field-properties__header">
          <h2>Properties</h2>
        </div>
        <p className="field-properties__placeholder">Select a field to edit its properties.</p>
      </div>
    );
  }

  const isDirty =
    draft.type !== selected.type || draft.title !== selected.title || draft.required !== selected.required;
  const normalizedDraftTitle = draft.title.trim().toLowerCase();
  const hasBlankTitle = normalizedDraftTitle === '';
  const hasDuplicateTitle = state.schema.some(
    (field) => field.id !== selected.id && field.title.trim().toLowerCase() === normalizedDraftTitle
  );
  let titleError = '';
  if (hasBlankTitle) {
    titleError = 'Field title is required.';
  } else if (hasDuplicateTitle) {
    titleError = 'Field title must be unique.';
  }
  const showTitleError = hasDuplicateTitle || (hasBlankTitle && (titleTouched || attemptedApply));
  const isApplyDisabled = !isDirty || !!titleError;

  const handleApply = () => {
    setAttemptedApply(true);
    if (titleError) {
      return;
    }

    dispatch({
      type: 'UPDATE_FIELD',
      id: selected.id,
      patch: { type: draft.type, title: draft.title, required: draft.required },
    });
  };

  const handleRevert = () => {
    setDraft({ type: selected.type, title: selected.title, required: selected.required });
  };

  const handleRemove = () => dispatch({ type: 'REMOVE_FIELD', id: selected.id });

  const handleTypeChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setDraft((current) => ({ ...current, type: event.target.value as FieldType }));
  };

  const handleTitleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setTitleTouched(true);
    setDraft((current) => ({ ...current, title: event.target.value }));
  };

  const handleTitleBlur = (event: FocusEvent<HTMLInputElement>) => {
    setTitleTouched(true);

    const nextTarget = event.relatedTarget;
    if (nextTarget instanceof HTMLElement && nextTarget.closest('.field-properties__actions')) {
      return;
    }

    if (titleError || !isDirty) {
      return;
    }

    dispatch({
      type: 'UPDATE_FIELD',
      id: selected.id,
      patch: { type: draft.type, title: draft.title, required: draft.required },
    });
  };

  return (
    <div className="field-properties">
      <div className="field-properties__header">
        <h2>Properties</h2>
        <div className="field-properties__actions">
          <button type="button" className="btn btn--danger" onClick={handleRemove}>Remove</button>
          <button type="button" className="btn" onClick={handleRevert} disabled={!isDirty}>Revert</button>
          <button type="button" className="btn btn--primary" onClick={handleApply} disabled={isApplyDisabled}>
            Apply
          </button>
        </div>
      </div>

      <label className="form-row">
        <span>Field Type</span>
        <select
          value={draft.type}
          onChange={handleTypeChange}
        >
          {FIELD_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </label>

      <label className="form-row">
        <span>Field Title <span className="required-mark">*</span></span>
        <input
          type="text"
          value={draft.title}
          onChange={handleTitleChange}
          onBlur={handleTitleBlur}
          placeholder="e.g. First Name"
        />
      </label>
      {showTitleError && <p className="field-properties__error">{titleError}</p>}
      <p className="field-api-key">Field API Key: <code>{toApiKey(draft.title || 'field')}</code></p>

      <div className="form-row">
        <span>Required</span>
        <div className="radio-group">
          <label>
            <input
              type="radio"
              name="required"
              checked={!draft.required}
              onChange={() => setDraft((d) => ({ ...d, required: false }))}
            />
            <span>Not Required</span>
          </label>
          <label>
            <input
              type="radio"
              name="required"
              checked={!!draft.required}
              onChange={() => setDraft((d) => ({ ...d, required: true }))}
            />
            <span>Required</span>
          </label>
        </div>
      </div>
    </div>
  );
}
