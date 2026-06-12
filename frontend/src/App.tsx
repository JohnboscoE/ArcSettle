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
    <div className="flex min-h-screen bg-page overflow-x-hidden">
      <Sidebar />
      {/* Offset for desktop sidebar, bottom nav padding for mobile */}
      <main className="flex-1 md:ml-56 pb-20 md:pb-0 min-w-0">
        <div className="px-4 py-6 md:px-8 md:py-8 max-w-6xl mx-auto w-full">
          <Routes>
            <Route path="/"            element={<Dashboard />} />
            <Route path="/invoices"    element={<Invoices />} />
            <Route path="/pos"         element={<PORegister />} />
            <Route path="/settlements" element={<Settlements />} />
            <Route path="/agent"       element={<AgentLogs />} />
          </Routes>
        </div>
      </main>
    </div>
  </BrowserRouter>
);

export default App;
