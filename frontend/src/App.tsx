import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Invoices from './pages/Invoices';
import PORegister from './pages/PORegister';
import Settlements from './pages/Settlements';
import AgentLogs from './pages/AgentLogs';

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex min-h-screen bg-page overflow-x-hidden">
    <Sidebar />
    <main className="flex-1 md:ml-56 pb-20 md:pb-0 min-w-0">
      <div className="px-4 py-6 md:px-8 md:py-8 max-w-6xl mx-auto w-full">
        {children}
      </div>
    </main>
  </div>
);

const App: React.FC = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/dashboard" element={<AppLayout><Dashboard /></AppLayout>} />
      <Route path="/invoices" element={<AppLayout><Invoices /></AppLayout>} />
      <Route path="/pos" element={<AppLayout><PORegister /></AppLayout>} />
      <Route path="/settlements" element={<AppLayout><Settlements /></AppLayout>} />
      <Route path="/agent" element={<AppLayout><AgentLogs /></AppLayout>} />
    </Routes>
  </BrowserRouter>
);

export default App;
