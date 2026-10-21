import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { NotificationsDrawer } from './components/layout/NotificationsDrawer';
import { DashboardView } from './components/dashboard/DashboardView';
import { DocumentsView } from './components/documents/DocumentsView';
import { DocumentDetailDrawer } from './components/documents/DocumentDetailDrawer';
import { AddDocumentModal } from './components/documents/AddDocumentModal';
import { FinancialView } from './components/financial/FinancialView';
import { EquipmentView } from './components/equipment/EquipmentView';
import { PropertiesView } from './components/properties/PropertiesView';
import { PartiesView } from './components/parties/PartiesView';
import { ReportsView } from './components/reports/ReportsView';
import { SettingsView } from './components/settings/SettingsView';
import { FilePreviewModal } from './components/common/FilePreviewModal';
import { GlobalSearchResultsModal } from './components/search/GlobalSearchResultsModal';
import { CheckCircle2 } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { activeTab, previewFile, setPreviewFile, toastMessage } = useApp();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  return (
    <div className="app-layout">
      {/* Menu Lateral */}
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Conteúdo Principal com Barra Superior */}
      <div className="main-wrapper">
        <Header
          onToggleMobileMenu={() => setMobileOpen(!mobileOpen)}
          onOpenSearch={() => setIsSearchModalOpen(true)}
        />

        <main style={{ flex: 1, minHeight: 'calc(100vh - 72px)' }}>
          {activeTab === 'overview' && <DashboardView />}
          {activeTab === 'documents' && <DocumentsView />}
          {activeTab === 'financial' && <FinancialView />}
          {activeTab === 'properties' && <PropertiesView />}
          {activeTab === 'equipment' && <EquipmentView />}
          {activeTab === 'parties' && <PartiesView />}
          {activeTab === 'reports' && <ReportsView />}
          {activeTab === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Modais e Painéis Globais */}
      <NotificationsDrawer />
      <DocumentDetailDrawer />
      <AddDocumentModal />
      <FilePreviewModal
        document={previewFile}
        onClose={() => setPreviewFile(null)}
      />
      <GlobalSearchResultsModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
      />

      {/* Feedback Toast */}
      {toastMessage && (
        <div className="toast-floating">
          <CheckCircle2 size={18} color="#86EFAC" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
};

export default App;
