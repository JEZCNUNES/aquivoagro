import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { NotificationsDrawer } from './components/layout/NotificationsDrawer';
import { DashboardView } from './components/dashboard/DashboardView';
import { InboxView } from './components/inbox/InboxView';
import { PendenciesView } from './components/inbox/PendenciesView';
import { DeadlinesView } from './components/inbox/DeadlinesView';
import { TasksView } from './components/inbox/TasksView';
import { DocumentsView } from './components/documents/DocumentsView';
import { DocumentDetailDrawer } from './components/documents/DocumentDetailDrawer';
import { AddDocumentModal } from './components/documents/AddDocumentModal';
import { ContractsCentralView } from './components/contracts/ContractsCentralView';
import { PurchasesView } from './components/purchases/PurchasesView';
import { InventoryView } from './components/inventory/InventoryView';
import { CommercialView } from './components/commercial/CommercialView';
import { FinancialView } from './components/financial/FinancialView';
import { FiscalView } from './components/fiscal/FiscalView';
import { InsuranceView } from './components/insurance/InsuranceView';
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
      {/* Menu Lateral Estruturado (LSA Mapa Macro V0.1 / V1.0) */}
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

        <main style={{ flex: 1, minHeight: 'calc(100vh - 70px)' }}>
          {/* VISÃO E TRABALHO */}
          {activeTab === 'overview' && <DashboardView />}
          {activeTab === 'inbox' && <InboxView />}
          {activeTab === 'pendencies' && <PendenciesView />}
          {activeTab === 'deadlines' && <DeadlinesView />}
          {activeTab === 'tasks' && <TasksView />}

          {/* ESTRUTURA DO CLIENTE */}
          {activeTab === 'parties' && <PartiesView />}
          {activeTab === 'properties' && <PropertiesView />}
          {activeTab === 'equipment' && <EquipmentView />}

          {/* NEGÓCIOS & OPERAÇÕES */}
          {activeTab === 'purchases' && <PurchasesView />}
          {activeTab === 'inventory' && <InventoryView />}
          {activeTab === 'commercial' && <CommercialView />}

          {/* FINANÇAS & CONFORMIDADE */}
          {activeTab === 'financial' && <FinancialView />}
          {activeTab === 'fiscal' && <FiscalView />}
          {activeTab === 'insurance' && <InsuranceView />}

          {/* DOCUMENTOS & ANÁLISE */}
          {activeTab === 'documents' && <DocumentsView />}
          {activeTab === 'contracts' && <ContractsCentralView />}
          {activeTab === 'reports' && <ReportsView />}

          {/* SISTEMA */}
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
