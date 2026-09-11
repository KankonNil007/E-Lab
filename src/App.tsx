import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { DashboardPage } from './features/dashboard/DashboardPage';
import { CircuitLabPage } from './features/circuits/CircuitLabPage';
import { SignalsLabPage } from './features/signals/SignalsLabPage';
import { DigitalLabPage } from './features/digital/DigitalLabPage';
import { ControlLabPage } from './features/control/ControlLabPage';
import { ToolsPage } from './features/tools/ToolsPage';
import { ExperimentsPage } from './features/experiments/ExperimentsPage';
import { SettingsPage } from './features/settings/SettingsPage';

export const App: React.FC = () => {
  return (
    <HashRouter>
      <AppShell>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/circuits" element={<CircuitLabPage />} />
          <Route path="/circuits/:subId" element={<CircuitLabPage />} />
          <Route path="/signals" element={<SignalsLabPage />} />
          <Route path="/signals/:subId" element={<SignalsLabPage />} />
          <Route path="/digital" element={<DigitalLabPage />} />
          <Route path="/digital/:subId" element={<DigitalLabPage />} />
          <Route path="/control" element={<ControlLabPage />} />
          <Route path="/control/:subId" element={<ControlLabPage />} />
          <Route path="/tools" element={<ToolsPage />} />
          <Route path="/tools/:subId" element={<ToolsPage />} />
          <Route path="/experiments" element={<ExperimentsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppShell>
    </HashRouter>
  );
};

export default App;
