import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Invoices from './pages/Invoices';
import PORegister from './pages/PORegister';
import Settlements from './pages/Settlements';
import AgentLogs from './pages/AgentLogs';

const App: React.FC = () => (
  <BrowserRouter>
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-page)' }}>
      <Sidebar />
      <main style={{ marginLeft: 220, flex: 1, padding: '32px 36px', maxWidth: 1200 }}>
        <Routes>
          <Route path="/"            element={<Dashboard />} />
          <Route path="/invoices"    element={<Invoices />} />
          <Route path="/pos"         element={<PORegister />} />
          <Route path="/settlements" element={<Settlements />} />
          <Route path="/agent"       element={<AgentLogs />} />
        </Routes>
      </main>
    </div>
  </BrowserRouter>
);

export default App;
