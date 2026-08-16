import { useState } from 'react';
import FieldBuilder from '../FieldBuilder/FieldBuilder';
import DataGrid from '../DataGrid/DataGrid';
import DynamicForm from '../DynamicForm/DynamicForm';
import Modal from './Modal';
import { EMPLOYEE_WORKSPACE_TABS, type TabId } from '../../constants/workspaceConstants';

export default function EmployeesWorkspace() {
  const [activeTab, setActiveTab] = useState<TabId>('records');
  const [showRecordForm, setShowRecordForm] = useState(false);

  return (
    <div className="app">
      <header className="app__header">
        <h1>Employees</h1>
        <nav className="app__tabs">
          {EMPLOYEE_WORKSPACE_TABS.map((tab) => (
            <button
              type="button"
              key={tab.id}
              className={`app__tab ${activeTab === tab.id ? 'is-active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="app__main">
        {activeTab === 'builder' && <FieldBuilder />}
        {activeTab === 'records' && (
          <DataGrid
            onAddRecord={() => setShowRecordForm(true)}
            onConfigureFields={() => setActiveTab('builder')}
          />
        )}
      </main>

      {showRecordForm && (
        <Modal title="Create New Employee" onClose={() => setShowRecordForm(false)}>
          <DynamicForm onClose={() => setShowRecordForm(false)} />
        </Modal>
      )}
    </div>
  );
}
