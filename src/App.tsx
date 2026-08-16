import { AppProvider } from './context/AppContext';
import EmployeesWorkspace from './components/common/EmployeesWorkspace';
import './App.css';

export default function App() {
  return (
    <AppProvider>
      <EmployeesWorkspace />
    </AppProvider>
  );
}
