import React from 'react';
import { useApp } from '../../context/AppContext';
import { ViewTab } from '../../types';
import {
  LayoutDashboard,
  FileText,
  DollarSign,
  MapPin,
  Tractor,
  Users,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Leaf,
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (c: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (m: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
}) => {
  const { activeTab, setActiveTab, notifications, documents, transactions } =
    useApp();

  const unclassifiedCount = documents.filter((d) => d.status === 'pending').length;
  const overdueCount = transactions.filter(
    (t) => t.status === 'open' && t.type === 'expense' && t.dueDate < new Date().toISOString().split('T')[0]
  ).length;

  const navItems: {
    id: ViewTab;
    label: string;
    icon: React.ReactNode;
    badgeCount?: number;
    badgeColor?: string;
  }[] = [
    {
      id: 'overview',
      label: 'Visão geral',
      icon: <LayoutDashboard size={20} />,
    },
    {
      id: 'documents',
      label: 'Documentos',
      icon: <FileText size={20} />,
      badgeCount: unclassifiedCount > 0 ? unclassifiedCount : undefined,
      badgeColor: '#D97706',
    },
    {
      id: 'financial',
      label: 'Financeiro',
      icon: <DollarSign size={20} />,
      badgeCount: overdueCount > 0 ? overdueCount : undefined,
      badgeColor: '#DC2626',
    },
    {
      id: 'properties',
      label: 'Propriedades',
      icon: <MapPin size={20} />,
    },
    {
      id: 'equipment',
      label: 'Veículos e máquinas',
      icon: <Tractor size={20} />,
    },
    {
      id: 'parties',
      label: 'Fornecedores e clientes',
      icon: <Users size={20} />,
    },
    {
      id: 'reports',
      label: 'Relatórios',
      icon: <BarChart3 size={20} />,
    },
    {
      id: 'settings',
      label: 'Configurações',
      icon: <Settings size={20} />,
    },
  ];

  const handleSelectTab = (tab: ViewTab) => {
    setActiveTab(tab);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Overlay para fechar no celular */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 55,
          }}
        />
      )}

      <aside
        className={`sidebar ${collapsed ? 'collapsed' : ''} ${
          mobileOpen ? 'mobile-open' : ''
        }`}
      >
        <div className="sidebar-header">
          <div className="brand-wrapper">
            <div className="brand-logo-icon">
              <Leaf size={22} />
            </div>
            {!collapsed && (
              <div>
                <div className="brand-title">AgroArquivo</div>
                <div className="brand-subtitle">Gestão do Produtor</div>
              </div>
            )}
          </div>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="btn-icon-round"
            style={{
              width: '28px',
              height: '28px',
              backgroundColor: 'rgba(255,255,255,0.1)',
              borderColor: 'transparent',
              color: '#FFFFFF',
            }}
            title={collapsed ? 'Expandir menu' : 'Recolher menu'}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelectTab(item.id)}
                className={`nav-item ${isActive ? 'active' : ''}`}
                title={collapsed ? item.label : undefined}
              >
                <div style={{ flexShrink: 0 }}>{item.icon}</div>
                {!collapsed && (
                  <>
                    <span style={{ flex: 1 }}>{item.label}</span>
                    {item.badgeCount !== undefined && (
                      <span
                        className="nav-badge"
                        style={{
                          backgroundColor: item.badgeColor || 'rgba(255,255,255,0.2)',
                        }}
                      >
                        {item.badgeCount}
                      </span>
                    )}
                  </>
                )}
              </button>
            );
          })}
        </nav>

        {!collapsed && (
          <div className="sidebar-footer">
            <div className="demo-chip">
              <ShieldCheck size={16} style={{ flexShrink: 0, color: '#34D399' }} />
              <div>
                <div style={{ fontWeight: 600, color: '#FFFFFF' }}>Modo Demonstração</div>
                <div style={{ fontSize: '10.5px', color: '#9CA3AF' }}>Dados salvos em memória local</div>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};
