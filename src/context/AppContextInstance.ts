import { createContext } from 'react';
import type { AppContextValue } from '../types/domain';

const AppContext = createContext<AppContextValue | null>(null);

export default AppContext;