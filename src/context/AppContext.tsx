import { useEffect, useMemo, useReducer } from 'react';
import type { ReactNode } from 'react';
import { saveRecords, saveSchema } from '../utils/storage';
import AppContext from './AppContextInstance';
import { createInitialState } from '../state/initialState';
import { appReducer } from '../state/reducer';

export function AppProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [state, dispatch] = useReducer(
    appReducer,
    null,
    createInitialState
  );
  const value = useMemo(() => ({ state, dispatch }), [state, dispatch]);

  useEffect(() => saveSchema(state.schema), [state.schema]);
  useEffect(() => saveRecords(state.records), [state.records]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
