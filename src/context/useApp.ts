import { useContext } from 'react';
import AppContext from './AppContextInstance';
import type { AppContextValue } from '../types/domain';

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}