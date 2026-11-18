import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';

// Pages
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { MinesPage } from './pages/MinesPage';
import { CompliancePage } from './pages/CompliancePage';
import { InspectionsPage } from './pages/InspectionsPage';
import { ViolationsPage } from './pages/ViolationsPage';
import { CorrectiveActionsPage } from './pages/CorrectiveActionsPage';
import { AIInsightsPage } from './pages/AIInsightsPage';
import { GISMapPage } from './pages/GISMapPage';
import { DocumentsPage } from './pages/DocumentsPage';
import { ContractorsPage } from './pages/ContractorsPage';
import { GrievancesPage } from './pages/GrievancesPage';
import { ReportsPage } from './pages/ReportsPage';
import { AuditTrailPage } from './pages/AuditTrailPage';
import { UsersPage } from './pages/UsersPage';
import { SettingsPage } from './pages/SettingsPage';

// Protected App Layout
const MainLayout: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-xs">
        Initializing MineGuard AI Security & Audit Verification...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const getPageTitle = (path: string) => {
    switch (path) {
      case '/':
        return t('nav.dashboard');
      case '/mines':
        return t('nav.mines');
      case '/compliance':
        return t('nav.compliance');
      case '/inspections':
        return t('nav.inspections');
      case '/violations':
        return t('nav.violations');
      case '/corrective-actions':
        return t('nav.capa');
      case '/ai-insights':
        return t('nav.ai_insights');
      case '/gis-map':
        return t('nav.gis_map');
      case '/documents':
        return t('nav.documents');
      case '/contractors':
        return t('nav.contractors');
      case '/grievances':
        return t('nav.grievances');
      case '/reports':
        return t('nav.reports');
      case '/audit':
        return t('nav.audit');
      case '/users':
        return t('nav.users');
      case '/settings':
        return t('nav.settings');
      default:
        return 'MineGuard AI';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <Navbar pageTitle={getPageTitle(location.pathname)} />
        <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/mines" element={<MinesPage />} />
            <Route path="/compliance" element={<CompliancePage />} />
            <Route path="/inspections" element={<InspectionsPage />} />
            <Route path="/violations" element={<ViolationsPage />} />
            <Route path="/corrective-actions" element={<CorrectiveActionsPage />} />
            <Route path="/ai-insights" element={<AIInsightsPage />} />
            <Route path="/gis-map" element={<GISMapPage />} />
            <Route path="/documents" element={<DocumentsPage />} />
            <Route path="/contractors" element={<ContractorsPage />} />
            <Route path="/grievances" element={<GrievancesPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/audit" element={<AuditTrailPage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <LanguageProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/*" element={<MainLayout />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </LanguageProvider>
  );
};

export default App;
